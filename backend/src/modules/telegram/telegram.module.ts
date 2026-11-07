import { Module, OnApplicationBootstrap, OnApplicationShutdown, Logger, Inject } from '@nestjs/common';

import { ENV_CONFIG, EnvConfig } from '../../common/config/env.config';
import { TelegramApiService } from './telegram-api.service';
import { TelegramAuthService } from './telegram-auth.service';

@Module({
  providers: [TelegramApiService, TelegramAuthService],
  exports: [TelegramApiService, TelegramAuthService],
})
export class TelegramModule implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(TelegramModule.name);
  private running = false;
  private offset = 0;

  constructor(
    private readonly api: TelegramApiService,
    @Inject(ENV_CONFIG) private readonly config: EnvConfig,
  ) {}

  async onApplicationBootstrap() {
    if (!this.config.TELEGRAM_BOT_TOKEN) {
      this.logger.warn('TELEGRAM_BOT_TOKEN yo\'q — bot ishlamaydi');
      return;
    }
    await this.api.deleteWebhook();
    this.running = true;
    this.logger.log('Telegram bot polling ishga tushdi');
    void this.loop();
  }

  onApplicationShutdown() {
    this.running = false;
  }

  private async loop() {
    while (this.running) {
      try {
        const updates = await this.api.getUpdates(this.offset);
        for (const u of updates) {
          this.offset = u.update_id + 1;
          const chatId = u.message?.chat.id;
          const text = u.message?.text?.trim();
          if (chatId && text === '/start') {
            await this.onStart(chatId, u.message?.from?.first_name);
          }
        }
      } catch (err) {
        this.logger.error('Polling xato: ' + String(err));
        await this.sleep(3000);
      }
      await this.sleep(1000);
    }
  }

  private async onStart(chatId: number, firstName?: string) {
    const name = firstName ?? 'Mehmon';
    const webAppUrl = this.config.TELEGRAM_WEBAPP_URL;
    const isPublic = !!webAppUrl && webAppUrl.startsWith('https://') && !webAppUrl.includes('localhost');

    const text =
      `Assalomu alaykum, <b>${name}</b>! 👋\n\n` +
      `Hush kelibsiz <b>Zahabi Parfüm</b> do'koniga! 🌟\n\n` +
      `✨ Premium atirlar va beauty mahsulotlari\n` +
      `🚚 Butun O'zbekiston bo'ylab yetkazib berish\n` +
      `🎁 Chiroyli qadoqlash har bir buyurtmaga`;

    await this.api.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      ...(isPublic && {
        reply_markup: {
          inline_keyboard: [[{ text: "🛍 Do'konni ochish", web_app: { url: webAppUrl! } }]],
        },
      }),
    });

    this.logger.log(`/start → chat ${chatId} (${name})`);
  }

  private sleep(ms: number) {
    return new Promise<void>(r => setTimeout(r, ms));
  }
}
