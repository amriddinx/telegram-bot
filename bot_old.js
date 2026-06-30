require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

const faqData = {
  'narx': '💰 Ilova narxi 200$ dan boshlanadi.\n\nNarx ilovaning murakkabligi, funksiyalari va dizayniga qarab belgilanadi.',
  'manzil': '📍 Bizning manzil: Navoiy shahri',
  'ish_vaqti': '🕐 Ish vaqtimiz: 09:00 - 22:00',
};

bot.start((ctx) => {
  ctx.reply(
    `Salom, ${ctx.from.first_name}! 👋\n\nQuyidagi tugmalardan birini tanlang:`,
    Markup.keyboard([
      ['💰 Narxlar', '📍 Manzil'],
      ['🕐 Ish vaqti', 'ℹ️ Yordam']
    ]).resize()
  );
});

bot.hears('💰 Narxlar', (ctx) => ctx.reply(faqData['narx']));
bot.hears('📍 Manzil', (ctx) => ctx.reply(faqData['manzil']));
bot.hears('🕐 Ish vaqti', (ctx) => ctx.reply(faqData['ish_vaqti']));
bot.hears('ℹ️ Yordam', (ctx) => ctx.reply("Savolingiz bo'lsa, shunchaki yozing!"));

bot.on('text', (ctx) => {
  ctx.reply(
    "Kechirasiz, tushunmadim. /help ni bosing!",
    Markup.inlineKeyboard([
      Markup.button.url('💬 Menga yozish', 'https://t.me/AmriddinXUC1')
    ])
  );
});

bot.launch();
console.log('✅ Bot ishga tushdi!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));