//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require("xss-clean");
const encrypt = require("mongoose-encryption");

const app = express();
app.use(mongoSanitize({replaceWith:'_'}));
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true}, function(err){
    if (err){
        console.log(err);
    }else{
        console.log("successful database connection");
    }
});

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(xssClean());

const Schema = mongoose.Schema;
const userSchema = new Schema({
    password: String,
    email: String
});

userSchema.plugin(encrypt, {secret:process.env.SECRET, excludeFromEncryption: ['email']});
const User = mongoose.model("User", userSchema);

app.get("/home", function(req,res){
    res.render("home");
});
app.get("/register", function(req,res){
    res.render("register");
});
app.get("/login", function(req,res){
    res.render("login");
});

app.post("/register", function(req,res){
    const userName = req.body.username;
    const password = req.body.password;
    User.create({password: password, email: userName});
    res.render("secrets");
});

app.post("/login", function(req, res){
    const userName = req.body.username;
    const password = req.body.password;
    User.findOne({"email":userName}, function(err, user){
        console.log(user);
        if (user){
                if (password === user.password){
                res.render("secrets");
                }else{
                console.log("please enter a valid username and password");
                res.redirect("/login");
                }
        }else{
            console.log("please enter a valid username");
            res.redirect("login");
        }
    })
});

app.listen(3000, function(){
    console.log("listening on 3000");
});
