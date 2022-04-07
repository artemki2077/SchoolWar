from flask import Flask, render_template, jsonify, request
from replit import db
import datetime as dt
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
		last_time = dt.datetime.strptime(db["time"].get(id, "23/04/2003 00:00:00"), "%d/%m/%Y %H:%M:%S")
		x = int(request.form.get('x'))
		y = int(request.form.get('y'))
		answer = "SUCCESS"
		for i in conf.teams:
			if id in conf.teams[i]:
				delta = dt.datetime.now() - last_time
				if delta > conf.waiting:
					db["map"][x][y] = {"team": conf.colors[i]}
					db['time'][id] = dt.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
				else:
					tt = conf.waiting - delta
					hour, remainder = divmod(tt.seconds, 3600)
					minute, seconds = divmod(remainder, 60)
					answer = f"вам осталось {hour} часов {minute} минут" if hour > 0 else f"вам осталось {minute} минут {seconds} секунд"
				break
	return answer


@app.route('/')
def hello_world():
	return render_template("index.html")

app.run(host='0.0.0.0', port=8080)