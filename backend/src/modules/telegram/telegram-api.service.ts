import { Inject, Injectable, Logger } from '@nestjs/common';

import { ENV_CONFIG, EnvConfig } from '../../common/config/env.config';

interface TelegramApiResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  web_app?: { url: string };
  callback_data?: string;
}

export interface SendMessageOptions {
  parse_mode?: 'HTML' | 'MarkdownV2';
  reply_markup?: { inline_keyboard: InlineKeyboardButton[][] };
  disable_notification?: boolean;
}

/**
 * Telegram Bot API bilan ishlaydigan yupqa mijoz.
 *
 * Qo'shimcha kutubxonasiz — Node'ning o'rnatilgan `fetch` i yetarli.
 * Xatoliklar hech qachon chaqiruvchini yiqitmaydi: bildirishnoma yuborilmasligi
 * buyurtma yaratilishini to'xtatmasligi kerak.
 */
@Injectable()
export class TelegramApiService {
  private readonly logger = new Logger(TelegramApiService.name);
  private readonly baseUrl: string | null;

  constructor(@Inject(ENV_CONFIG) private readonly config: EnvConfig) {
    this.baseUrl = config.TELEGRAM_BOT_TOKEN
      ? `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}`
      : null;
  }

  get isConfigured(): boolean {
    return this.baseUrl !== null;
  }

  /**
   * Xabar yuboradi. Muvaffaqiyatli bo'lsa true.
   * Foydalanuvchi botni bloklagan bo'lsa (403) — bu kutilgan holat, xato emas.
   */
  async sendMessage(
    chatId: number | string,
    text: string,
    options: SendMessageOptions = {},
  ): Promise<boolean> {
    const response = await this.call<{ message_id: number }>('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: options.parse_mode ?? 'HTML',
      disable_notification: options.disable_notification ?? false,
      ...(options.reply_markup ? { reply_markup: options.reply_markup } : {}),
    });

    return response !== null;
  }

  async setWebhook(url: string, secretToken: string): Promise<boolean> {
    const result = await this.call<boolean>('setWebhook', {
      url,
      secret_token: secretToken,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: true,
    });
    return result === true;
  }

  async deleteWebhook(): Promise<boolean> {
    return (await this.call<boolean>('deleteWebhook', {})) === true;
  }

  async getMe(): Promise<{ id: number; username: string } | null> {
    return this.call<{ id: number; username: string }>('getMe', {});
  }

  async getUpdates(offset: number): Promise<Array<{ update_id: number; message?: { chat: { id: number }; from?: { id: number; first_name?: string }; text?: string } }>> {
    const result = await this.call<Array<{ update_id: number; message?: { chat: { id: number }; from?: { id: number; first_name?: string }; text?: string } }>>('getUpdates', {
      offset,
      timeout: 5,
      allowed_updates: ['message'],
    });
    return result ?? [];
  }

  /** Chat menyusidagi tugmani WebApp'ni ochadigan qilib sozlaydi. */
  async setChatMenuButton(webAppUrl: string, label: string): Promise<boolean> {
    return (
      (await this.call<boolean>('setChatMenuButton', {
        menu_button: { type: 'web_app', text: label, web_app: { url: webAppUrl } },
      })) === true
    );
  }

  private async call<T>(method: string, payload: unknown): Promise<T | null> {
    if (!this.baseUrl) {
      this.logger.warn(`Telegram sozlanmagan — "${method}" o'tkazib yuborildi`);
      return null;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);

      const response = await fetch(`${this.baseUrl}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const body = (await response.json()) as TelegramApiResponse<T>;

      if (!body.ok) {
        // 403 — foydalanuvchi botni bloklagan yoki hech qachon boshlamagan.
        const level = body.error_code === 403 ? 'debug' : 'warn';
        this.logger[level](
          `Telegram "${method}" rad etdi: ${body.error_code} ${body.description}`,
        );
        return null;
      }

      return body.result ?? null;
    } catch (error) {
      this.logger.error(
        `Telegram "${method}" chaqiruvi muvaffaqiyatsiz: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }
}
