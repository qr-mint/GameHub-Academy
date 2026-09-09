import { Composer, CommandContext, InlineKeyboard } from "grammy";

import { BotContext } from "../context";

export const commands = new Composer();

commands.command("start", async (ctx: CommandContext<BotContext>) => {
  return await ctx.Menu();
});

commands.command("test_url", async (ctx: CommandContext<BotContext>) => {
  const url = ctx.match;
  if (!url.includes("https://")) {
    return await ctx.reply("https is must", {
      parse_mode: "HTML",
    });
  }
  const inlineKeyboard = new InlineKeyboard().row({
    text: "Teste",
    web_app: { url: url },
  });

  return await ctx.reply("Params", {
    reply_markup: inlineKeyboard,
    parse_mode: "HTML",
  });
});


commands.command("appss_verify", async (ctx: CommandContext<BotContext>) => {
  return await ctx.reply("appss_c290cc");
});