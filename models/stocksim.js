var mongoose = require('mongoose');

// create Stock schema
var StocksimSchema = new mongoose.Schema({
    Symbol:{
        type: String,
        required : true
    },
    Name:{
    	type: String,
    	required : true
    },
    Buy:{
    	type : Number,
    	required : true
    },
    Buyprice:{
        type : Number,
        required : true
    },
    Time:{
    	type : Date,
    	required : true
    },
    UserID:{
        type: String,
        required : true
    }
});

// Export the model schema
module.exports = StocksimSchema;
