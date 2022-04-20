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


def getUserbyTel(id):
    users = db.get("users")
    for i in users:
        if users[i]['telegramm'] == id:
            return i


def addToBan(id):
	db['ban'].append(id)


@app.route('/map')
def base():
    return jsonify(
        list(map(lambda x: list(map(lambda i: dict(i), x)), db["map"])))


@app.route("/login", methods=['POST', 'GET'])
def login():
    login = session.get("username")
    if login:
        return redirect("/")
    answer = "регистрация в тг @art_gamebot"
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
                resp.set_cookie('username',
                                login,
                                max_age=60 * 60 * 24 * 365 * 2)
                resp.set_cookie('password',
                                password,
                                max_age=60 * 60 * 24 * 365 * 2)
                return resp
        else:
            answer = "empty password or login"
    return render_template("login.html", answer=answer)


@app.route('/click', methods=['POST'])
def click():
    if request.method == 'POST':
        id = session.get("username", -1)
        if id == -1:
            return "не не фигня какаета, перезайдите"
        if id in db["ban"]:
            return 'вы забанены'
        last_time = dt.datetime.strptime(
            db["time"].get(id, "23/04/2003 00:00:00"), "%d/%m/%Y %H:%M:%S")
        x = int(request.form.get('x'))
        y = int(request.form.get('y'))
        color = request.form.get('color')
        answer = "SUCCESS"
        delta = dt.datetime.now() - last_time
        if (delta >= conf.waiting):
            print(f"{id} - {x}:{y}")
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
    return render_template("index.html", colors=conf.colors)


@bot.message_handler(commands=["start", "help", "h"])
def start(message: telebot.types.Message):
    key = telebot.types.InlineKeyboardMarkup()
    button1 = telebot.types.InlineKeyboardButton(text="регистрация",
                                                 callback_data="регистрация")
    button2 = telebot.types.InlineKeyboardButton(text="help",
                                                 callback_data="help")
    button3 = telebot.types.InlineKeyboardButton(text="забыл пароль",
                                                 callback_data="забыл пароль")
    key.add(button1, button2, button3)
    bot.send_message(
        message.chat.id,
        "Бот артёмка для регистрации или замены пароля в игре Pixel Battle \n если вам нужна какаета помощь то обращаться к @art_kis_2077",
        reply_markup=key)


@bot.message_handler(content_types=["text"])
def text(message: telebot.types.Message):
    user = getUserbyTel(message.chat.id)
    user_log = bot_log.get(message.chat.id)
    if message.chat.id == 1025814391:
        addToBan(message.text)
    if user_log is None:
        bot.send_message(message.chat.id, "что за фигня у меня ошибка")
    elif user_log["log"] == "WAIT_LOGIN":
        if message.text not in db["users"]:
            bot_log[message.chat.id]["log"] = "WAIT_PASSWORD"
            bot_log[message.chat.id]["login"] = message.text
            bot.send_message(message.chat.id, "придумайте пароль")
        else:
            bot.send_message(
                message.chat.id,
                "такой пользователь уже существует, придумайте новый логин")
    elif user_log["log"] == "WAIT_NEW_PASSWORD":
        bot_log[message.chat.id]["log"] = "WAIT_NEW_PASSWORD_2"
        bot_log[message.chat.id]["new_password"] = message.text
        bot.send_message(message.chat.id,
                         "подтвердите пароль (ещё раз введите этот пароль)")
    elif user_log["log"] == "WAIT_NEW_PASSWORD_2":
        if bot_log[message.chat.id]["new_password"] == message.text:
            bot_log[message.chat.id]["password"] = message.text
            db["users"][user]['password'] = message.text
            bot.send_message(message.chat.id, "у вас новый пароль")
            user_log["log"] = None
        else:
            bot.send_message(
                message.chat.id,
                "пароли не совпадают, введите заново новый пароль")
            bot_log[message.chat.id] = {"log": "WAIT_NEW_PASSWORD"}
    elif user_log["log"] == "WAIT_PASSWORD":
        bot_log[message.chat.id]["log"] = "SUCCESS"
        bot_log[message.chat.id]["password"] = message.text
        db["users"][bot_log[message.chat.id]["login"]] = {
            "password": message.text,
            "telegramm": message.chat.id
        }
        bot.send_message(
            message.chat.id,
            "вы зарегестрированны, игра по ссылке: https://SchoolWar.maxar2005.repl.co"
        )


@bot.callback_query_handler(func=lambda call: True)
def callback_inline(call: telebot.types.CallbackQuery):
    user = getUserbyTel(call.message.chat.id)
    if call.data == 'регистрация':
        if not user and (call.message.chat.id not in bot_log
                         or bot_log[call.message.chat.id]['log'] != "SUCCESS"):
            bot.send_message(call.message.chat.id, "придумайте ваш логин")
            bot_log[call.message.chat.id] = {"log": "WAIT_LOGIN"}
        else:
            bot.send_message(call.message.chat.id, "вы уже зарегистрированы")
    elif call.data == 'забыл пароль':
        if (call.message.chat.id in bot_log
                and bot_log[call.message.chat.id]['log'] == "SUCCESS") or user:
            bot.send_message(call.message.chat.id, "пришлите новый пароль")
            bot_log[call.message.chat.id] = {"log": "WAIT_NEW_PASSWORD"}
        else:
            bot.send_message(call.message.chat.id, "сначала зарегистрируйтесь")
    else:
        start(call.message)


def start_bot():
    bot.polling(non_stop=True)


if __name__ == "__main__":
    th = Thread(target=start_bot, args=())
    th.start()
    app.run("0.0.0.0", debug=False, threaded=True)
