const express = require('express');
const app = express();
const User = require('./models/user');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session')

mongoose.connect('mongodb://localhost:27017/authDemo', {useNewUrlParser: true, 
useUnifiedTopology: true, useCreateIndex:true,useFindAndModify: false});

//get notified if we connect succesffulu or if a connection error occurs
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("Database Connected");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
const requireLogin = (req, res, next ) =>{
    if(!req.session.user_id){
        return res.redirect('/login')
    }
    next();
}
const sessionConfig = {
    secret: 'thisshoudbeabettersecret',
    // resave: false,
    // saveUninitialized: true,
    // cookie: {
    //     httpOnly: true, 
    //     expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    //     maxAge:1000 * 60 * 60 * 24 * 7, 
    // }
}

app.use(session(sessionConfig))
app.get('/', (req, res) => {
    res.send('This is the home page')
})
app.get('/register', (req, res) => {

    res.render('register');
})

app.post('/register', async (req, res) => {
    const {username, password} = req.body;
    const user = await new User({username, password});
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')
})

app.get('/login', (req,res) => {
    res.render('login')
})

app.post('/login', async (req,res) =>{
    const {username, password} = req.body;
    const foundUser =  await User.findAndValidate(username, password);
    if(foundUser){
        req.session.user_id = foundUser._id;
        res.redirect('/secret');
    }else{
        res.redirect('/login');
    }
    
})

app.post('/logout', (req, res) =>{
    // req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login');

})

app.get('/secret', requireLogin, (req, res) => {
   
    res.render('secret');
})

app.get('/topsecret', requireLogin, (req, res) => {
   
    res.send("top secret!");
})

app.listen(8080, () => {
    console.log("serving your app!")
})