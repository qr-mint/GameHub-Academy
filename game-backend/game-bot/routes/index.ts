import { Composer, CallbackQueryContext } from "grammy";

import { commands } from "./commands";
import { BotContext } from "../context";

export const app = new Composer();

app.use(commands);

app.callbackQuery("menu", async (ctx: CallbackQueryContext<BotContext>) => {
  return await ctx.Menu();
});