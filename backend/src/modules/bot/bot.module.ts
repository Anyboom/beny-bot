import { Module } from '@nestjs/common';
import { BotUpdate } from '@/modules/bot/bot.update';
import { RbacModule } from '@/modules/rbac/rbac.module';
import { RbacService } from '@/modules/rbac/rbac.service';
import { PostsRepository } from '@/modules/posts/posts.repository';

@Module({
  imports: [RbacModule],
  providers: [BotUpdate, RbacService, PostsRepository],
})
export class BotModule {}
