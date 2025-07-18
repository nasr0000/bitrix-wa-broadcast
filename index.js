const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const ZAPI_ENDPOINT = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`;
const BITRIX_WEBHOOK = process.env.BITRIX_WEBHOOK;
const WHATSAPP_FIELD = "UF_CRM_1729359889"; // Поле WhatsApp в сделке

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

app.get("/send-wa", async (req, res) => {
  const dealId = req.query.deal_id;
  if (!dealId) return res.status(400).send("❌ Не передан deal_id");

  try {
    // Получаем сделку из Bitrix24
    const dealRes = await axios.post(`${BITRIX_WEBHOOK}crm.deal.get`, {
      id: dealId,
    });

    const deal = dealRes.data?.result;
    if (!deal) return res.status(404).send("❌ Сделка не найдена");

    const waField = deal[WHATSAPP_FIELD];
    if (!waField) return res.status(400).send("❌ Поле WhatsApp пустое");

    // Извлекаем номер из ссылки https://wa.me/77081234567
    const match = waField.match(/(\d{11,12})/);
    if (!match) return res.status(400).send("❌ Не удалось извлечь номер");

    const phone = match[1];

    // Отправляем сообщение через Z-API
    const sendRes = await axios.post(ZAPI_ENDPOINT, {
      phone: phone,
      message: MESSAGE,
    });

    if (sendRes.data?.sent) {
      res.send(`✅ Сообщение отправлено на ${phone}`);
    } else {
      res.status(500).send("❌ Ошибка при отправке сообщения");
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("❌ Ошибка сервера");
  }
});

app.listen(PORT, () => {
  console.log(`📡 Сервер запущен на порту ${PORT}`);
});
