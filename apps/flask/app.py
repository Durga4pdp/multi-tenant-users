from flask import Flask, jsonify
import os

app = Flask(__name__)
USER_NAME = os.environ.get('USER_NAME', 'unknown')

@app.route('/')
def index():
    return f'<h1>Hello from {USER_NAME} Flask site!</h1><p>Pod: {os.environ.get("HOSTNAME")}</p>'

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'user': USER_NAME})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
