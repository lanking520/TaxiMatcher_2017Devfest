var mongoose = require('mongoose');

// create Stock schema
var TaxiSchema = new mongoose.Schema({
    Balance:{
    	type : Number,
        min : 0,
    	required : true
    },
    Time:{
    	type : Date,
    	required : true
    },
    UserID:{
        type: String,
        required : true
    },
    Type:{
        type: String,
        required:true
    }
});

// Export the model schema
module.exports = TaxiSchema;
