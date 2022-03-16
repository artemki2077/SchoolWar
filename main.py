from flask import Flask, render_template, jsonify
from replit import db
app = Flask('app')

@app.route('/map')
def base():
	return jsonify(list(map(lambda x: list(map(lambda i: dict(i), x)), db["map"])))

@app.route('/')
def hello_world():
  return render_template("index.html")

app.run(host='0.0.0.0', port=8080)