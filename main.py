from flask import Flask, render_template, jsonify, request, session, redirect, make_response
from threading import Thread
from replit import db
import datetime as dt
import config as conf
import telebot
import os

app = Flask('app')
bot = telebot.TeleBot(os.environ['BOT_KEY'])
app.secret_key = os.environ['SESSION_KEY']
app.permanent_session_lifetime = dt.timedelta(days=365)
bot_log = {}


@app.route('/map')
def base():
    return jsonify(list(map(lambda x: list(map(lambda i: dict(i), x)), db["map"])))


@app.route("/login", methods=['POST', 'GET'])
def login():
    login = session.get("username")
    if login is not None:
        return redirect("/")
    answer = ""
    if request.method == 'POST':
        login = request.form.get('username')
        password = request.form.get('pass')
        if login and password:
            user = db["users"].get(login, "")
            if not user:
                answer = "Not such user"
            elif user["password"] != password:
                answer = "wrong password"
            else:
                session["username"] = login
                resp = make_response(redirect("/"))
                resp.set_cookie('username', login, max_age=60 * 60 * 24 * 365 * 2)
                resp.set_cookie('password', password, max_age=60 * 60 * 24 * 365 * 2)
                return resp
        else:
            answer = "empty password or login"

    return render_template("login.html", answer=answer)


@app.route('/click', methods=['POST', 'GET'])
def click():
    if request.method == 'POST':
        id = session.get("username", -1)
        if id == -1:
            return redirect("/login")
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


@app.route("/logout")
def logout():
    session["username"] = None
    return redirect("/login")


@app.route('/')
def index():
    login = request.cookies.get('username')
    password = request.cookies.get('password')
    if login and password:
        user = db["users"].get(login)
        if user and user["password"]:
            session["username"] = login
    login = session.get("username")
    if login is None:
        return redirect("/login")
    return render_template("index.html")


@bot.message_handler(commands=["start", "help", "h"])
def start(message: telebot.types.Message):
    key = telebot.types.InlineKeyboardMarkup()
    button1 = telebot.types.InlineKeyboardButton(text="регистрация", callback_data="регистрация")
    button2 = telebot.types.InlineKeyboardButton(text="help", callback_data="help")
    button3 = telebot.types.InlineKeyboardButton(text="забыл пароль", callback_data="забыл пароль")
    key.add(button1, button2, button3)
    bot.send_message(message.chat.id, "Бот артёмка для регистрации или замены пароля в игре Pixel Battle", reply_markup=key)


@bot.message_handler(content_types=["text"])
def text(message: telebot.types.Message):
    user_log = bot_log.get(message.chat.id)
    if user_log is None:
        start(message)
    bot.send_message(message.chat.id, "Бот артёмка для регистрации или замены пароля в игре Pixel Battle")


@bot.callback_query_handler(func=lambda call: True)
def callback_inline(call: telebot.types.CallbackQuery):
    if call.data == 'регистрация':
        bot.send_message(call.message.chat.id, "пришлите ваш логин")
        bot_log["call.message.chat.id"] = "WAIT_LOGIN"
    elif call.data == 'menu':
        print('"press button menu"')


bot.polling()
app.run(debug=False, threaded=True)
