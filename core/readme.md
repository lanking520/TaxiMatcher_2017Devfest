# Data Analysis Section

## Create a Database that can query faster
Considering the dead speed on querying using pandas, we can use mongoDB to optimize the query speed.
Adding index on Database can increase the speed 10 times more!

## Consider using DynamoDB
However, local storage is strongly limited by the hardware, using a dynamoDB would probably accelerate the speed when doing queries. It created cluster-formatted Database, storing all of the information in different server which provides incredibly speed in searching.

## Configuration
[Install MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)

### Check data
```bash
cat file.csv | head
```
### Keep the field you like 
```bash
cat yellow_tripdata_2016-06.csv | cut -f 2,3,4,5,6,7,10,11,19 -d ',' >result.csv
```

### Import data to MongoDB
```bash
mongoimport -d yourdbname -c yourdbcollection --type csv --file file.csv --headerline
```
### Add index on it
1. Open a terminal
```bash
mongod
```
2. Open another terminal
```bash
mongo
use yourdbname
db.yourcollection.createIndex({ "item1": 1, "stock2": 1 })
```
Just a remind, 1 and -1 means sorting in Ascending Speed and Descending speed
