import os
import threading
import json
from flask import Flask, Blueprint, request, jsonify
import telebot
from telebot import types

# ===================== CONFIG =====================
TOKEN = "8506299686:AAGY84tLNYv6Q3IgoR5ZXtB5jYnNMl-WWiA"
WEBAPP_URL = "https://fairusss.github.io/tgbot/"  # your webapp URL

# ===================== FLASK APP =====================
app = Flask(__name__)

@app.route('/')
def index():
    return "✅ Flask server is running!"

# ------------------ AJAX: Receive Passcode ------------------
@app.route("/send-passcode", methods=["POST"])
def send_passcode():
    try:
        data = request.get_json()
        passcode = data.get("passcode")
        user_id = data.get("user_id")

        if not passcode:
            return jsonify(success=False, message="No passcode provided"), 400

        print(f"[SERVER] Received passcode: {passcode}")

        # Send to Telegram user if ID is available
        if user_id:
            bot.send_message(user_id, f"🔐 Ваш код підтвердження: {passcode}")
        else:
            print("[SERVER] No user_id provided — skipping Telegram send")

        return jsonify(success=True, message="Passcode received"), 200

    except Exception as e:
        print("Error in /send-passcode:", e)
        return jsonify(success=False, message=str(e)), 400


# ------------------ OPTIONAL: Retrieve Saved Code ------------------
@app.route('/api/data', methods=['GET', 'POST'])
def receive_data():
    data = request.get_json()
    passcode = data.get("passcode")

    if not passcode:
        return jsonify({"error": "no passcode"}), 400

    with open("temp_passcode.txt", "w") as f:
        f.write(passcode)

    return jsonify({"status": "ok", "saved": passcode})

# ===================== TELEGRAM BOT =====================
bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start'])
def start(message):
    markup = types.InlineKeyboardMarkup()
    markup.add(
        types.InlineKeyboardButton(
            text="🔓 Відкрити WebApp",
            web_app=types.WebAppInfo(url=WEBAPP_URL)
        )
    )
    bot.send_message(
        message.chat.id,
        "Привіт! Натисни, щоб відкрити WebApp 👇",
        reply_markup=markup
    )

@bot.message_handler(content_types=['web_app_data'])
def handle_webapp_data(message):
    try:
        data = message.web_app_data.data
        bot.send_message(message.chat.id, f"Отримано дані: {data}")
    except Exception as e:
        print(f"Error processing WebApp data: {e}")
        bot.send_message(message.chat.id, "Помилка при обробці даних.")


# ===================== RUN BOTH =====================
def run_flask():
    app.run(host="0.0.0.0", port=12345)

if __name__ == "__main__":
    threading.Thread(target=run_flask).start()
    print("✅ Flask running on port 12345")
    print("🤖 Telegram bot started...")
    bot.infinity_polling()
