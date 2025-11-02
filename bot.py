import telebot
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
            text=":globe_with_meridians: Відкрити WebApp",
            web_app=types.WebAppInfo(url=WEBAPP_URL)
        )
    )
    bot.send_message(
        message.chat.id,
        ":wave: Привіт! Натисни, щоб відкрити WebApp:",
        reply_markup=markup
    )

# Отримання номера телефону з WebApp
@bot.message_handler(content_types=['web_app_data'])
def handle_webapp_data(message):
    data = message.web_app_data.data
    if data.startswith("+"):
        bot.send_message(message.chat.id, f":telephone_receiver: Отримано номер: {data}")
    else:
        bot.send_message(message.chat.id, f":information_source: Отримано дані: {data}")

print(":white_check_mark: Бот запущено! Очікуємо дані...")
bot.infinity_polling()