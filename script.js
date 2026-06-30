const fs = require('fs');
const path = require('path');
const { Markup, Scenes } = require('telegraf');

const ADMIN_ID = '8041853599';
const ORDERS_FILE = path.join(__dirname, 'orders.json');

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

const faqData = {
  'narx': `💰 Bizning xizmatlar narxi:\n\n🤖 Telegram bot yaratib berish — 100$ dan\n🌐 Veb-sayt yaratib berish — 200$ dan\n📱 Mobil ilova yaratib berish (Android va iOS) — 800$ dan\n🎨 Ilova dizayni (UI/UX) — 50$ dan\n\n⚠️ Narx loyihaning dizayni va murakkabligiga qarab belgilanadi.\n\nShu narsalar kerak bo'lsa, menga yozing!`,
  'manzil': '📍 Bizning manzil: Navoiy shahri',
  'ish_vaqti': '🕐 Ish vaqtimiz: 09:00 - 22:00',
  'xizmatlar': `🤖 Bu BOT nima qila oladi:\n\n✅ Telegram bot yaratib berish\n✅ Veb-sayt yaratib berish\n✅ Mobil ilova yaratib berish (Android va iOS)\n✅ Ilova dizayni (UI/UX) tayyorlab berish\n✅ App Store va Play Market'ga joylashtirib berish xizmati\n\nLoyihangiz haqida yozing — maslahat beramiz!`,
};

const mainMenu = Markup.keyboard([
  ['🤖 Bu BOT nima qila oladi'],
  ['💰 Narxlar'],
  ['📍 Manzil', '🕐 Ish vaqti'],
  ['🛒 Buyurtma berish'],
  ['ℹ️ Yordam']
]).resize();

const orderScene = new Scenes.WizardScene(
  'ORDER_SCENE',
  (ctx) => {
    ctx.reply('Qaysi xizmat kerak? 👇', Markup.keyboard([
      ['🤖 Telegram bot', '📱 Mobil ilova'],
      ['🌐 Veb-sayt', '🎨 Ilova dizayni'],
      ['❌ Bekor qilish']
    ]).resize());
    return ctx.wizard.next();
  },
  (ctx) => {
    if (ctx.message.text === '❌ Bekor qilish') {
      ctx.reply('Buyurtma bekor qilindi.', mainMenu);
      return ctx.scene.leave();
    }
    ctx.wizard.state.service = ctx.message.text;
    ctx.reply("Loyihangiz haqida qisqacha yozing (nima kerak, qanday bo'lishini xohlaysiz):", Markup.removeKeyboard());
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.details = ctx.message.text;
    ctx.reply('Telefon raqamingizni yuboring (masalan: +998901234567):', Markup.keyboard([[Markup.button.contactRequest('📞 Raqamni yuborish')]]).resize());
    return ctx.wizard.next();
  },
  (ctx) => {
    const phone = ctx.message.contact ? ctx.message.contact.phone_number : ctx.message.text;
    const order = {
      id: Date.now(),
      date: new Date().toLocaleString('uz-UZ'),
      userId: ctx.from.id,
      username: ctx.from.username || '',
      firstName: ctx.from.first_name,
      service: ctx.wizard.state.service,
      details: ctx.wizard.state.details,
      phone: phone,
    };
    saveOrder(order);
    ctx.reply(`✅ Buyurtmangiz qabul qilindi!\n\n🛒 Xizmat: ${order.service}\n📝 Tafsilot: ${order.details}\n📞 Telefon: ${order.phone}\n\nTez orada siz bilan bog'lanamiz!`, mainMenu);
    ctx.telegram.sendMessage(ADMIN_ID, `🆕 YANGI BUYURTMA!\n\n👤 Mijoz: ${order.firstName}${order.username ? ' (@' + order.username + ')' : ''}\n🆔 ID: ${order.userId}\n🛒 Xizmat: ${order.service}\n📝 Tafsilot: ${order.details}\n📞 Telefon: ${order.phone}\n🕐 Vaqt: ${order.date}`).catch((err) => console.error('Admin xabar yuborishda xato:', err.message));
    return ctx.scene.leave();
  }
);

module.exports = { ADMIN_ID, loadOrders, saveOrder, faqData, mainMenu, orderScene };
