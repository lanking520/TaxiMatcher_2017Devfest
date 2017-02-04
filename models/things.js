var mongoose = require('mongoose');

// create Stock schema
var ThingsSchema = new mongoose.Schema({
    tpep_pickup_datetime:{
    	type : Number,
    	required : true
    },
    tpep_dropoff_datetime:{
    	type : Number,
    	required : true
    },
    passenger_count:{
        type: Number,
        required : true
    },
   trip_distance:{
        type: Number,
        required:true
    },
    pickup_longitude:{
    	type : Number,
    	required : true
    },
    pickup_latitudee:{
    	type : Number,
    	required : true
    },
    dropoff_longitude:{
    	type : Number,
    	required : true
    },
    dropoff_latitude:{
    	type : Number,
    	required : true
    },
    total_amount:{
    	type : Number,
    	required : true
    }
});

// Export the model schema
module.exports = ThingsSchema;
