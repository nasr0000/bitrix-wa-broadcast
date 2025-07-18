const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const BITRIX_WEBHOOK = process.env.BITRIX_WEBHOOK;
const ZAPI_INSTANCE_ID = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;
const WHATSAPP_FIELD = "UF_CRM_1729359889";

const MESSAGE = `Здравствуйте! 👋

Ранее вы обращались в ITnasr.kz по вопросам автоматизации бизнеса — спасибо за интерес! 🙏

📌 Подскажите, ваш запрос ещё актуален?

Мы подбираем решения под ключ для:
🍽 кафе, ☕ кофейни, 🛒 магазинов, 🏪 минимаркетов и других сфер.

Что предлагаем:
✅ Онлайн-кассы, оборудование, терминалы
✅ Программы учёта и аналитики
✅ Установка и настройка
✅ Обучение и техподдержка

📞 Будем рады помочь вам — просто напишите в ответ!

С уважением,  
команда ITnasr.kz  
📱 +7 708 750 91-03  
🌐 www.itnasr.kz`;

const ZAPI_ENDPOINT = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`;

// Проверка сервера
app.get("/", (req, res) => {
  res.send("✅ Сервер работает");
});

// Отправка сообщения в WhatsApp
app.get("/send-wa", async (req, res) => {
  const dealId = req.query.deal_id;
  if (!dealId) return res.status(400).send("❌ Не передан deal_id");

  try {
    console.log("TOKEN:", ZAPI_TOKEN);
    console.log("INSTANCE:", ZAPI_INSTANCE_ID);

    const dealRes = await axios.post(`${BITRIX_WEBHOOK}crm.deal.get`, { id: dealId });
    const deal = dealRes.data?.result;
    if (!deal) return res.status(404).send("❌ Сделка не найдена");

    const waField = deal[WHATSAPP_FIELD];
    if (!waField) return res.status(400).send("❌ Поле WhatsApp пустое");

    const match = waField.match(/(\d{11,12})/);
    if (!match) return res.status(400).send("❌ Не удалось извлечь номер");

    const phone = match[1];
    console.log("📞 Отправляем на номер:", phone);

    const zapiRes = await axios.post(
  `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`,
  {
    phone: phone,
    message: MESSAGE,
  }
);


    if (zapiRes.data?.sent) {
      res.send(`✅ Сообщение отправлено на WhatsApp: ${phone}`);
    } else {
      console.error("❌ Ответ от Z-API:", zapiRes.data);
      res.status(500).send("❌ Ошибка при отправке через Z-API");
    }
  } catch (err) {
    console.error("❌ Ошибка:", err.response?.data || err.message);
    res.status(500).send("❌ Ошибка сервера");
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`📡 Сервер запущен на порту ${PORT}`);
});
