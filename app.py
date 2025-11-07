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
    print("Received from webapp:", data, flush=True)

    chat_id = data.get("chat_id")
    text = data.get("data")

    if chat_id and text:
        requests.post(f"{TELEGRAM_API}/sendMessage", json={
            "chat_id": chat_id,
            "text": f"💬 You said: {text}"
        })

    return jsonify({"ok": True})


@app.route("/status")
def index():
    return "✅ Telegram bot server running fine."

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))
