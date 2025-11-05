import os
import json
import requests
from flask import Flask, request, jsonify, send_from_directory
from telebot import types

# === Configuration ===
BOT_TOKEN = os.environ.get("BOT_TOKEN") or "YOUR_BOT_TOKEN_HERE"
TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"
WEBAPP_URL = "https://fairusss.github.io/tgbot/"  # your hosted front-end

# === Flask Setup ===
app = Flask(__name__, static_folder="assets", template_folder="template")

# === Telegram Webhook ===
@app.route("/webhook", methods=["POST"])
def webhook():
    update = request.get_json(force=True, silent=True)
    print("🔹 Telegram update:", json.dumps(update, indent=2, ensure_ascii=False), flush=True)

    if not update or "message" not in update:
        return jsonify({"ok": True})

    message = update["message"]
    chat_id = message["chat"]["id"]
    text = message.get("text", "")

    # /start command
    if text == "/start":
        keyboard = {
            "inline_keyboard": [[{
                "text": "🌐 Відкрити WebApp",
                "web_app": {"url": WEBAPP_URL}
            }]]
        }

        requests.post(f"{TELEGRAM_API}/sendMessage", json={
            "chat_id": chat_id,
            "text": "Привіт! Натисни, щоб відкрити Quest Market:",
            "reply_markup": keyboard
        })

    elif text == "/getpass":
        try:
            with open("temp_passcode.txt", "r") as f:
                saved = f.read()
            msg = f"📄 Збережений код: {saved}"
        except FileNotFoundError:
            msg = "❌ Немає збереженого коду."
        requests.post(f"{TELEGRAM_API}/sendMessage", json={
            "chat_id": chat_id,
            "text": msg
        })

    return jsonify({"ok": True})


# === WebApp backend endpoint for AJAX data ===
@app.route("/submit_data", methods=["POST"])
def submit_data():
    data = request.get_json()
    print("📨 Received from WebApp:", data, flush=True)

    user_id = data.get("user_id")
    action = data.get("action")
    value = data.get("value")

    if not user_id:
        return jsonify({"ok": False, "error": "Missing user_id"}), 400

    # Example: store passcode
    if action == "passcode":
        with open("temp_passcode.txt", "w") as f:
            f.write(value or "")
        print(f"[SERVER] Saved passcode: {value}")

    # Notify user in Telegram
    requests.post(f"{TELEGRAM_API}/sendMessage", json={
        "chat_id": user_id,
        "text": f"✅ Отримано {action}: {value}"
    })

    return jsonify({"ok": True})


# === Static and Template File Serving ===
@app.route("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory("assets", filename)

@app.route("/scripts/<path:filename>")
def serve_scripts(filename):
    return send_from_directory("scripts", filename)

@app.route("/styles/<path:filename>")
def serve_styles(filename):
    return send_from_directory("styles", filename)

@app.route("/template/<path:filename>")
def serve_templates(filename):
    return send_from_directory("template", filename)


# === Health Check ===
@app.route("/")
def index():
    return "✅ Telegram bot and WebApp backend running fine."


# === Main Entrypoint ===
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
