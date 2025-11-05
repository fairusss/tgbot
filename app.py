import telebot
from telebot import types

TOKEN = "8506299686:AAEXWBNmuRrVIIKiwXtRKwJrG8AaXdSwH64"
WEBAPP_URL = "https://fairusss.github.io/tgbot/"

bot = telebot.TeleBot(TOKEN)

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

bot.infinity_polling()