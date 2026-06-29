require('dotenv').config();
const { Telegraf, Markup, Scenes, session } = require('telegraf');
const fs = require('fs');
const path = require('path');
 
const bot = new Telegraf(process.env.BOT_TOKEN);
 
// Admin Telegram ID raqami
const ADMIN_ID = '8041853599';
 
const ORDERS_FILE = path.join(__dirname, 'orders.json');
 
// ============ ORDERS.JSON BILAN ISHLASH ============
 
function loadOrders() {
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
  }
  const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
  return JSON.parse(data);
}
 
function saveOrder(order) {
  const orders = loadOrders();
  orders.push(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}
 
// ============ FAQ MA'LUMOTLARI ============
 
const faqData = {
  'narx': `💰 Bizning xizmatlar narxi:
 
🤖 Telegram bot — 200$ dan
📱 Android/iOS ilova — 800$ dan
🌐 Veb-sayt — 250$ dan
 
⚠️ Narx loyihaning dizayni va murakkabligiga qarab belgilanadi.
Aniq narx uchun murojaat qiling!`,
 
  'manzil': '📍 Bizning manzil: Navoiy shahri',
  'ish_vaqti': '🕐 Ish vaqtimiz: 09:00 - 22:00',
 
  'xizmatlar': `⚠️ Biz nima qila olamiz:
 
🤖 Telegram bot yaratish
📱 Android va iOS ilova yaratish
🌐 Veb-sayt yaratish
🎨 Dizayn xizmatlari
 
Loyihangiz haqida yozing — maslahat beramiz!`,
};
 
// ============ BUYURTMA SCENE (QADAM-BAQADAM SAVOLLAR) ============
 
const orderScene = new Scenes.WizardScene(
  'ORDER_SCENE',
  // 1-qadam: xizmat turini tanlash
  (ctx) => {
    ctx.reply(
      'Qaysi xizmat kerak? 👇',
      Markup.keyboard([
        ['🤖 Telegram bot', '📱 Mobil ilova'],
        ['🌐 Veb-sayt', '🎨 Dizayn'],
        ['❌ Bekor qilish']
      ]).resize()
    );
    return ctx.wizard.next();
  },
  // 2-qadam: xizmat turini saqlash, tafsilot so'rash
  (ctx) => {
    if (ctx.message.text === '❌ Bekor qilish') {
      ctx.reply('Buyurtma bekor qilindi.', Markup.removeKeyboard());
      return ctx.scene.leave();
    }
    ctx.wizard.state.service = ctx.message.text;
    ctx.reply(
      'Loyihangiz haqida qisqacha yozing (nima kerak, qanday bo\'lishini xohlaysiz):',
      Markup.removeKeyboard()
    );
    return ctx.wizard.next();
  },
  // 3-qadam: tafsilotni saqlash, telefon so'rash
  (ctx) => {
    ctx.wizard.state.details = ctx.message.text;
    ctx.reply(
      'Telefon raqamingizni yuboring (masalan: +998901234567):',
      Markup.keyboard([
        [Markup.button.contactRequest('📞 Raqamni yuborish')]
      ]).resize()
    );
    return ctx.wizard.next();
  },
  // 4-qadam: telefonni saqlash, buyurtmani yakunlash
  (ctx) => {
    const phone = ctx.message.contact
      ? ctx.message.contact.phone_number
      : ctx.message.text;
 
    const order = {
      id: Date.now(),
      date: new Date().toLocaleString('uz-UZ'),
      userId: ctx.from.id,
      username: ctx.from.username || 'mavjud emas',
      firstName: ctx.from.first_name,
      service: ctx.wizard.state.service,
      details: ctx.wizard.state.details,
      phone: phone,
    };
 
    saveOrder(order);
 
    // Foydalanuvchiga tasdiq
    ctx.reply(
      `✅ Buyurtmangiz qabul qilindi!\n\n` +
      `🛒 Xizmat: ${order.service}\n` +
      `📝 Tafsilot: ${order.details}\n` +
      `📞 Telefon: ${order.phone}\n\n` +
      `Tez orada siz bilan bog'lanamiz!`,
      Markup.removeKeyboard()
    );
 
    // Adminga xabar
    ctx.telegram.sendMessage(
      ADMIN_ID,
      `🆕 YANGI BUYURTMA!\n\n` +
      `👤 Mijoz: ${order.firstName} (@${order.username})\n` +
      `🆔 ID: ${order.userId}\n` +
      `🛒 Xizmat: ${order.service}\n` +
      `📝 Tafsilot: ${order.details}\n` +
      `📞 Telefon: ${order.phone}\n` +
      `🕐 Vaqt: ${order.date}`
    ).catch((err) => console.error('Admin xabar yuborishda xato:', err.message));
 
    return ctx.scene.leave();
  }
);
 
const stage = new Scenes.Stage([orderScene]);
 
bot.use(session());
bot.use(stage.middleware());
 
// ============ ASOSIY BUYRUQLAR ============
 
bot.start((ctx) => {
  ctx.reply(
    `Salom, ${ctx.from.first_name}! 👋\n\nAmriddin IT xizmatlariga xush kelibsiz!\nQuyidagi tugmalardan birini tanlang:`,
    Markup.keyboard([
      ['💰 Narxlar', '⚠️ Xizmatlar'],
      ['📍 Manzil', '🕐 Ish vaqti'],
      ['🛒 Buyurtma berish'],
      ['ℹ️ Yordam']
    ]).resize()
  );
});
 
bot.hears('💰 Narxlar', (ctx) => ctx.reply(faqData['narx']));
bot.hears('⚠️ Xizmatlar', (ctx) => ctx.reply(faqData['xizmatlar']));
bot.hears('📍 Manzil', (ctx) => ctx.reply(faqData['manzil']));
bot.hears('🕐 Ish vaqti', (ctx) => ctx.reply(faqData['ish_vaqti']));
bot.hears('ℹ️ Yordam', (ctx) => ctx.reply("Savolingiz bo'lsa, shunchaki yozing!"));
 
// Buyurtma berish tugmasi scene'ni ishga tushiradi
bot.hears('🛒 Buyurtma berish', (ctx) => ctx.scene.enter('ORDER_SCENE'));
 
// Admin uchun: barcha buyurtmalarni ko'rish
bot.command('orders', (ctx) => {
  if (String(ctx.from.id) !== String(ADMIN_ID)) {
    return; // admin bo'lmasa javob bermaydi
  }
  const orders = loadOrders();
  if (orders.length === 0) {
    return ctx.reply('Hozircha buyurtmalar yo\'q.');
  }
  const last10 = orders.slice(-10).reverse();
  let text = `📋 Oxirgi ${last10.length} ta buyurtma:\n\n`;
  last10.forEach((o) => {
    text += `🆔 ${o.id}\n👤 ${o.firstName} (@${o.username})\n🛒 ${o.service}\n📝 ${o.details}\n📞 ${o.phone}\n🕐 ${o.date}\n\n`;
  });
  ctx.reply(text);
});
 
bot.on('text', (ctx) => {
  ctx.reply(
    "Kechirasiz, tushunmadim. Tugmalardan foydalaning!",
    Markup.inlineKeyboard([
      Markup.button.url('💬 Menga yozish', 'https://t.me/AmriddinXUC1')
    ])
  );
});
 
bot.launch();
console.log('✅ Bot ishga tushdi!');
 
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));