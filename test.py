from replit import db


# db["map"] = [[{"team": None} for j in range(20)]for i in range(20)]
db["map"][0][0] = {"team": "#282828"}
print(db["map"])