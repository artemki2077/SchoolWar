from replit import db


# db["map"] = [[{"team": None} for j in range(100)]for i in range(100)]
# map = db["map"]
# for i in map:
# 	for j in i:
# 		if j["team"] == "8b00ff":
# 			j["team"] = "#8b00ff"
# db["map"] = map
# db["bot_log"] = {}

users = db["users"]
for n, user in enumerate(users, 1):
	print(f"{n}: {user} - {users[user]}")

# db["map"][0][0] = {"team": None}
# print(db["map"])
# for i in db["time"]:
# 	if i not in db["users"]:
# 		del db["time"][i]
# db["users"]["artem2"] = {'password': 'stasloh100', 'telegramm': 111}
db["ban"] = ['lmao', 'lol', 'vasilij2009', chr(39) + '";', "artem", "misha"]