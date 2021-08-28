const mongoose = require('mongoose');
var schema = new mongoose.Schema({ 
    time: {
        index: true,
        type: Date,
        default: Date.now
    }, 
    aq: {
        type: [Number]
    } 
});
module.exports = mongoose.model('IAQData', schema);