from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return "WebApp працює!"

@app.route('/api/data', methods=['GET','POST']) 
def receive_data():
    data = request.get_json()
    print("Отримано JSON:", data)
    print("Passcode:", data.get('passcode'))
    return "OK"

if __name__ == '__main__':
    port = 12345
    app.run(host='0.0.0.0', port=port, debug=True)