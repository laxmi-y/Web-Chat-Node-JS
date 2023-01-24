const express = require("express")
const User = require("../models/User")
const bcrypt = require("bcrypt")
const passport = require("passport")
const {guest} = require("../middleware/guest")
const router = express.Router()


router.get("/register", guest, (req,res)=>{
    res.render("pages/register")   
})

router.get("/login", guest, (req,res)=>{
    res.render("pages/login")
})

router.post("/register", async(req,res)=>{
    const {name, email, password, phone} = req.body
    // validation error
    if(!name || !email || !password || !phone){
        req.flash('error', 'All fields are required...!!')
        req.flash('name', name)
        req.flash('email', email)
        req.flash('email', phone)
        return res.redirect("/register")
    }

    // check if email exists
    User.exists({email : email}, (err, result)=>{
        if(result){
            req.flash('error', 'Email already exists')
            req.flash('name', name)
            req.flash('email', email)
            req.flash('email', phone)
            return res.redirect("/register")
        }
    })

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    //create user
    const user = new User({
        name : name,
        email : email,
        phone : phone,
        password : hashedPassword
    })

    user.save().then((user)=>{
        //login
        return res.redirect("/")
    }).catch(err=>{
        req.flash('error', 'Something went wrong')
        return res.redirect("/register")
    })
    
})

router.post("/login", (req,res,next)=>{
    passport.authenticate('local', (err, user, info)=>{
        if(err){
            req.flash("error", info.message)
            return next(err)
        }
        if(!user){
            req.flash("error", info.message)
            return res.redirect("/login")
        }
        req.logIn(user, (err)=>{
            if(err)
            {
                req.flash("error", info.message)
                return next(err)
            }
            return res.redirect("/")
        })
    })(req, res, next)
})

router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
});


module.exports = router