var schema = new mongoose.Schema({ 
    time: {
        type: String,
        default: Date.now
    }, 
    aq: {
        type: [Number]
    } 
});
module.exports = mongoose.model('IAQData', schema);