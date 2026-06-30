const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

document.getElementById('whatCan').addEventListener('click', () => {
  tg.showPopup({ title: "🤖 Imkoniyatlar", message: "Telegram Bot → 100$\nWeb Sayt → 200$\nMobil Ilova → 800$ dan", buttons: [{type:"close"}] });
});

document.getElementById('narxlar').addEventListener('click', () => {
  tg.showPopup({ title: "💰 Narxlar", message: "• Telegram Bot: 100$\n• Web Sayt: 200$\n• Mobil Ilova: 800$ dan", buttons: [{type:"close"}] });
});

document.getElementById('ishvaqti').addEventListener('click', () => {
  tg.showPopup({ title: "🕒 Ish vaqti", message: "Dushanba-Juma: 09:00-18:00\nShanba: 10:00-15:00\nYakshanba: Dam olish", buttons: [{type:"close"}] });
});

document.getElementById('yordam').addEventListener('click', () => {
  tg.showPopup({ title: "🆘 Yordam", message: "Yordam kerakmi?\n\n@SizningUsername ga yozing!", buttons: [{type:"close"}] });
});