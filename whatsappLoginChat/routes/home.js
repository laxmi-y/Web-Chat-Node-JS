const express = require("express")
const { auth } = require("../middleware/guest")
const User = require("../models/User")
const router = express.Router()

router.get("/", auth, async(req,res)=>{
    const users = await User.find({ _id: { $ne: req.user.id } })
    res.render("pages/home", {users : users})
})

module.exports = router