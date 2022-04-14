from replit import db


# db["map"] = [[{"team": None} for j in range(100)]for i in range(100)]
map = db["map"]
for i in map:
	for j in i:
		if j["team"] == "8b00ff":
			j["team"] = "#8b00ff"
db["map"] = map
# db["map"][0][0] = {"team": None}
# print(db["map"])
# print(db["time"])