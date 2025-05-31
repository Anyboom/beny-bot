import { Action, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Injectable } from '@nestjs/common';
import { RbacService } from '@/modules/rbac/rbac.service';
import { TelegrafContext } from '@/modules/bot/interfaces/telegraf-context.type';
import { PostsRepository } from '@/modules/posts/posts.repository';
import { PostType } from '@/modules/posts/types/post.type';
import { ConfigService } from '@nestjs/config';

@Update()
@Injectable()
export class BotUpdate {
  constructor(
    private readonly rbacService: RbacService,
    private readonly postsRepository: PostsRepository,
    private readonly configService: ConfigService,
  ) {}

  @Start()
  async start(@Ctx() context: TelegrafContext) {
    if (context.from?.id === undefined) {
      return;
    }

    const userId = String(context.from.id);

    const isModerator = this.rbacService.isModerator(userId);
    const isAdmin = this.rbacService.isAdmin(userId);
    const isGuest = this.rbacService.isGuest(userId);

    if (isGuest) {
      return context.reply('⛔ У вас нет доступа к этому боту');
    }

    if (isAdmin) {
      return context.reply('👋 Привет, Администратор!');
    }

    if (isModerator) {
      return context.reply('👋 Привет, Модератор!');
    }
  }

  @On(['text', 'photo', 'video', 'document'])
  async message(@Ctx() context: TelegrafContext) {
    try {
      const groupChatId =
        this.configService.getOrThrow<string>('GROUP_CHAT_ID');
      const userId = String(context?.from?.id);

      if (this.rbacService.isGuest(userId)) {
        return context.reply('⛔ У вас нет прав для отправки постов');
      }

      const postId = Date.now().toString();

      const post: PostType = {
        userId: userId,
        id: postId,
        content: context.message,
      };

      this.postsRepository.create(post);

      await context.copyMessage(groupChatId);
      await context.telegram.sendMessage(
        groupChatId,
        `📩 Пост от @${context?.from?.username || context?.from?.first_name}\nОдобрить?`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Одобрить', callback_data: `approve_${postId}` },
                { text: '❌ Отклонить', callback_data: `reject_${postId}` },
              ],
            ],
          },
        },
      );

      await context.reply('✅ Пост отправлен на модерацию!');
    } catch (err) {
      console.error('Ошибка при отправке поста:', err);
      await context.reply('❌ Ошибка. Попробуйте позже.');
    }
  }

  @Action(/^(approve|reject)_(.+)$/)
  async callback(@Ctx() context: TelegrafContext) {
    const userId = String(context.from.id);
    const isAdmin = this.rbacService.isAdmin(userId);

    if (!isAdmin) {
      return context.answerCbQuery(
        '❌ Только администратор может модерировать посты!',
      );
    }

    const CHANNEL_ID = this.configService.getOrThrow<string>('CHANNEL_ID');
    const action = String(context.match[1]);
    const postId = String(context.match[2]);

    if (action === 'approve') {
      try {
        const post = this.postsRepository.findFirst(postId);

        if (post && post.content) {
          await context.telegram.sendCopy(CHANNEL_ID, post.content);
        } else {
          console.error(
            'Оригинальное сообщение не найдено для postId:',
            postId,
          );
          await context.telegram.sendMessage(
            CHANNEL_ID,
            `📢 Новый пост (оригинал недоступен)`,
          );
        }
      } catch (sendError) {
        console.error('Ошибка при публикации в канал:', sendError);
        throw sendError;
      }
    }

    await context.deleteMessage();
    await context.answerCbQuery(
      action === 'approve' ? '✅ Одобрено!' : '❌ Отклонено.',
    );
  }
}
