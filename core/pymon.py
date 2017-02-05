from pymongo import MongoClient
import pprint

try:
	client = MongoClient('localhost',27017)
	print "Connected to Database at 27017"
except pymongo.errors.ConnectionFailure, e:
	print "Could not connect to MongoDB: %s" % e

taxidb = client['taxi']
things = taxidb.things


print things.count()

print things.find_one()
