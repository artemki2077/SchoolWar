from flask import Flask, render_template, jsonify, request, session, redirect
import os
from replit import db
import datetime as dt
import config as conf
app = Flask('app')
app.secret_key = os.environ['SESSION_KEY']
app.permanent_session_lifetime = dt.timedelta(days=365)


@app.route('/map')
def base():
	return jsonify(list(map(lambda x: list(map(lambda i: dict(i), x)), db["map"])))

@app.route("/login", methods=['POST', 'GET'])
def login():
	answer = ""
	if request.method == 'POST':
		login = request.form.get('username')
		password = request.form.get('pass')
		user = db["users"].get(login, "")
		if not user:
			answer = "Not such user"
		elif user["password"] != password:
			answer = "wrong password"
		else:
			session["username"] = login
			print("SUCCESS")
		
	return render_template("login.html", answer=answer)

@app.route('/click', methods=['POST', 'GET'])
def click():
	if request.method == 'POST':
		id = session.get("id", "1")
		# if id == -1:
		# 	redirect("/login")
		last_time = dt.datetime.strptime(db["time"].get(id, "23/04/2003 00:00:00"), "%d/%m/%Y %H:%M:%S")
		x = int(request.form.get('x'))
		y = int(request.form.get('y'))
		color = request.form.get('color')
		answer = "SUCCESS"
		delta = dt.datetime.now() - last_time
		if delta > conf.waiting:
			db["map"][x][y] = {"team": color}
			db['time'][id] = dt.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
		else:
			tt = conf.waiting - delta
			hour, remainder = divmod(tt.seconds, 3600)
			minute, seconds = divmod(remainder, 60)
			answer = f"вам осталось {hour} часов {minute} минут" if hour > 0 else f"вам осталось {minute} минут {seconds} секунд"
	return answer


@app.route('/')
def index():
	return render_template("index.html")
	

app.run(host='0.0.0.0', port=8080)