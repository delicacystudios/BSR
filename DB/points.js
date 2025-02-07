const { Schema, model } = require("mongoose");

const points = new Schema({
    UserID: { 
        type: String, 
        required: true 
    },
    Point: { 
        type: Number, 
        default: 0 
    },
    lastVoted: { 
        type: Date, 
        default: Date.now 
    },
})

module.exports = model("points", points);