import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from '@/modules/bot/bot.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BotModule,
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        token: config.getOrThrow('TELEGRAM_BOT_TOKEN'),
        include: [BotModule],
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
