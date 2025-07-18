const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Главная страница для проверки
app.get("/", (req, res) => {
  res.send("✅ Сервер работает");
});

// Тестовый маршрут для отправки сообщения
app.get("/send-wa", (req, res) => {
  const dealId = req.query.deal_id;
  if (!dealId) {
    return res.status(400).send("❌ Не передан deal_id");
  }

  res.send("✅ Запрос получен. ID сделки: " + dealId);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log("📡 Сервер запущен на порту", PORT);
});
