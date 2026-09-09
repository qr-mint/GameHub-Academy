import { InlineKeyboard, Context, Api } from "grammy";
import type { Update, UserFromGetMe } from "grammy/types";

const introMessage = `🎮 Welcome to my game`;

export class BotContext extends Context {
  constructor(update: Update, api: Api, me: UserFromGetMe) {
    super(update, api, me);
  }

  public async Menu() {
    const inlineKeyboard = new InlineKeyboard()
      .row({
        text: "Open",
        web_app: { url: process.env.GAME_APP_URL },
      })
      .row({
        text: "Open WEB",
        url: process.env.GAME_APP_URL,
      })
      .row({
        text: "Channel (EN)",
        url: "https://t.me/hardcore_arena_en",
      })
      .row({
        text: "Channel (RU)",
        url: "https://t.me/hardcore_arena_ru",
      })
      .row({
        text: "Group",
        url: "https://t.me/twh_group",
      });

    return await this.reply(
      introMessage,
      {
        reply_markup: inlineKeyboard,
        parse_mode: "HTML",
      }
    );
  }
}
