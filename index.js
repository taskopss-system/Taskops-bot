import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

console.log("WorkOpsBot running...");

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // ===== INPUT HARIAN =====
  if (text.startsWith('/input')) {
    const parts = text.split(' ');

    if (parts.length !== 4) {
      bot.sendMessage(chatId, 'Format salah.\nContoh: /input 7500000 120 62500');
      return;
    }

    const sales = parseInt(parts[1]);
    const struk = parseInt(parts[2]);
    const apc = parseInt(parts[3]);

    if (isNaN(sales) || isNaN(struk) || isNaN(apc)) {
      bot.sendMessage(chatId, 'Semua input harus angka.');
      return;
    }

    const spd = Math.round(sales / struk);
    const data = loadData();
    const today = new Date().toISOString().split('T')[0];

    data.push({
      date: today,
      sales,
      struk,
      apc,
      spd
    });

    saveData(data);

    bot.sendMessage(
      chatId,
      `📊 Monitoring Hari Ini\n\n` +
      `Sales: Rp ${sales.toLocaleString()}\n` +
      `Struk: ${struk}\n` +
      `APC: Rp ${apc.toLocaleString()}\n` +
      `SPD (auto): Rp ${spd.toLocaleString()}`
    );
  }

  // ===== REKAP BULAN =====
  else if (text === '/rekap') {
    const data = loadData();

    if (data.length === 0) {
      bot.sendMessage(chatId, 'Belum ada data.');
      return;
    }

    const totalSales = data.reduce((sum, d) => sum + d.sales, 0);
    const totalStruk = data.reduce((sum, d) => sum + d.struk, 0);
    const avgSPD = Math.round(totalSales / totalStruk);
    const achievement = ((totalSales / TARGET_BULANAN) * 100).toFixed(2);
    const kekurangan = TARGET_BULANAN - totalSales;

    bot.sendMessage(
      chatId,
      `📊 Rekap Bulan Ini\n\n` +
      `Target: Rp ${TARGET_BULANAN.toLocaleString()}\n` +
      `Total Sales: Rp ${totalSales.toLocaleString()}\n` +
      `Total Struk: ${totalStruk}\n` +
      `SPD Rata-rata: Rp ${avgSPD.toLocaleString()}\n\n` +
      `Achievement: ${achievement}%\n` +
      `Kurang: Rp ${kekurangan.toLocaleString()}`
    );
  }

  // ===== START =====
  else if (text === '/start') {
    bot.sendMessage(chatId, 'Gunakan /input SALES STRUK APC\nGunakan /rekap untuk lihat rekap');
  }

});
