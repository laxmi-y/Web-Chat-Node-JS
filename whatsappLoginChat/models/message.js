const mongoose = require("mongoose");
const Schema = mongoose.Schema
const messageSchema = new Schema({
    user : {type : Schema.Types.ObjectId, ref: 'User', require : true},
    message : {type : String, require : true},
    room : {type : String, require : true},
    sender : {type : String, require : true},
    receiver : {type : String, require : true},
    senderName : {type : String, require : true},
    receiverName : {type : String, require : true},
}, {timestamps : true})

const Message = mongoose.model('Message', messageSchema)
module.exports = Message
