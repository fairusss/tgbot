from flask import Flask, render_template, request, jsonify
import telebot

TOKEN = "YOUR_BOT_TOKEN"
bot = telebot.TeleBot(TOKEN)

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/submit", methods=["POST"])
def submit():
    data = request.json
    name = data.get("name")
    user = data.get("user") or {}
    chat_id = user.get("id")

    if chat_id:
        bot.send_message(chat_id, f"✅ Отримав ім'я: {name}")
    else:
        print("⚠️ Нема chat_id у запиті")

    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
