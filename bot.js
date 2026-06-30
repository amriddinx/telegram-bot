require('dotenv').config();
const { Telegraf, session, Scenes } = require('telegraf');
const { ADMIN_ID, loadOrders, faqData, mainMenu, orderScene } = require('./script.js');

const bot = new Telegraf(process.env.BOT_TOKEN);
const stage = new Scenes.Stage([orderScene]);

bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => {
  ctx.reply(
    `Salom, ${ctx.from.first_name}! 👋\n\nAmriddinX IT xizmatlariga xush kelibsiz!\nQuyidagi tugmalardan birini tanlang:`,
    mainMenu
  );
});

bot.hears('🤖 Bu BOT nima qila oladi', (ctx) => ctx.reply(faqData['xizmatlar']));
bot.hears('📍 Manzil', (ctx) => ctx.reply(faqData['manzil']));
bot.hears('🕐 Ish vaqti', (ctx) => ctx.reply(faqData['ish_vaqti']));

bot.hears('💰 Narxlar', (ctx) =>
  ctx.reply(faqData['narx'], {
    reply_markup: {
      inline_keyboard: [[{ text: '💬 Menga yozish', url: 'https://t.me/AmriddinXUC1' }]]
    }
  })
);

bot.hears('ℹ️ Yordam', (ctx) =>
  ctx.reply("Savolingiz bo'lsa, shunchaki yozing!", {
    reply_markup: {
      inline_keyboard: [[{ text: '💬 Menga yozish', url: 'https://t.me/AmriddinXUC1' }]]
    }
  })
);

bot.hears('🛒 Buyurtma berish', (ctx) => ctx.scene.enter('ORDER_SCENE'));

bot.command('orders', (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) return;
  const orders = loadOrders();
  if (orders.length === 0) return ctx.reply("Hozircha buyurtmalar yo'q.");
  const last10 = orders.slice(-10).reverse();
  let text = `📋 Oxirgi ${last10.length} ta buyurtma:\n\n`;
  last10.forEach((o) => {
    text += `🆔 ${o.id}\n👤 ${o.firstName}${o.username ? ' (@' + o.username + ')' : ''}\n🛒 ${o.service}\n📝 ${o.details}\n📞 ${o.phone}\n🕐 ${o.date}\n\n`;
  });
  ctx.reply(text);
});

bot.on('text', (ctx) => {
  ctx.reply("Kechirasiz, tushunmadim. Tugmalardan foydalaning!");
});

bot.launch();
console.log('✅ Bot ishga tushdi!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
