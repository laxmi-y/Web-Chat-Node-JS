function dbConnect(){
    const mongoose = require("mongoose")
    const url = "mongodb://localhost/chatting-room"
    mongoose.connect(url).then(
    () => console.log("DB connection success...!!")).catch((err) => {
        console.log(err)
    });
}
module.exports = dbConnect