import telebot
from telebot import types

TOKEN = "your-telegram-bot-token"
bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start'])
def start(message):
    # Проверяем, есть ли переданные данные в URL
    if message.text.startswith('/start '):
        # Извлекаем данные после команды /start
        user_message = message.text.split(' ', 1)[1]
        bot.send_message(message.chat.id, f"Получено сообщение от WebApp: {user_message}")
    else:
        # Если данных нет, отправляем стандартное сообщение
        bot.send_message(message.chat.id, "Привет! Это WebApp-бот. Пожалуйста, отправьте данные через WebApp.")

bot.infinity_polling()