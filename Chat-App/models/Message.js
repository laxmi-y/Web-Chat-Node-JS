const mongoose = require("mongoose");
const Schema = mongoose.Schema
const messageSchema = new Schema({
    user : {type : String, require : true},
    message : {type : String, require : true},
    room : {type : String, require : true}
}, {timestamps : true})

const Message = mongoose.model('Message', messageSchema)
module.exports = Message
