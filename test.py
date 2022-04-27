from replit import db

# db["map_copy"] = db['map']


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
# db['users']['artemkrut'] = {'password': 'artem.kisel2005', 'telegramm': 1025814391}
# print(db["ban"])
# print(db["map"])
# db["map"][0][0] = {"team": None}
# print(db["map"])
# for i in db["time"]:
# 	if i not in db["users"]:
# 		del db["time"][i]
# db["users"]["artem2"] = {'password': 'stasloh100', 'telegramm': 111}
# with open("map.json", "r") as f:
# 	d = json.load(f)
# map = [[{"team": None} for j in range(100)]for i in range(100)]
# for xn, x in enumerate(d):
# 	for yn, y in enumerate(x):
# 		map[xn][yn] = y


# db["map"] = map
db["ban"] = ['lmao', 'lol', 'vasilij2009', chr(39) + '";', "artem2", 'kalash', 'MAMON', 'K1RuXa']