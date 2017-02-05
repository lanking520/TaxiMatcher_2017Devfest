from pymongo import MongoClient

try:
	client = MongoClient('localhost',27017)
	print "Connected to Database at 27017"
except pymongo.errors.ConnectionFailure, e:
	print "Could not connect to MongoDB: %s" % e

taxidb = client['taxi']
things = taxidb.things


print things.count()

print things.find_one()

print things.find({'pickup_longitude':{'$lt' : -73.983360, '$gt': -74.0}, 
	'pickup_latitude':{'$gt' : 40.7609367, '$lt': 40.8009367}, 
	'tpep_pickup_datetime': {'$gt' : '2016-06-09 21:13:08', '$lt': '2016-06-09 21:23:08'} }).count()


