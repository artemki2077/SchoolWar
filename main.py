from flask import Flask, render_template, jsonify, request
from replit import db
import config as conf
app = Flask('app')

def cords(x, y):
	return x - 1, 20 - y

@app.route('/map')
def base():
	return jsonify(list(map(lambda x: list(map(lambda i: dict(i), x)), db["map"])))

@app.route('/click', methods=['POST', 'GET'])
def click():
	if request.method == 'POST':
		id = request.form.get('id')
		db["time"].get(id, )
		x = int(request.form.get('x'))
		y = int(request.form.get('y'))
		for i in conf.teams:
			if id in conf.teams[i]:
				
				db["map"][x][y] = {"team": conf.colors[i]}
				break
	return "SUCCESS"


@app.route('/')
def hello_world():
  return render_template("index.html")

app.run(host='0.0.0.0', port=8080)