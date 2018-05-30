//constant inializing
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bodyParser = require('body-parser');

//app initialize
const app = express();

//models
const User = require('./models/user');
const Owner = require('./models/owner');
const Centre = require('./models/centre');
const Operator = require('./models/operator');
const City = require('./models/city');
const Doctor = require('./models/doctor');
const Schedule = require('./models/schedule');

//routes
const ownerRoutes = require('./routes/owner');
const centreRoutes = require('./routes/centre');

//database connectivity
mongoose.connect('mongodb://user:user@ds119080.mlab.com:19080/easychanneling');

//passport configuration
app.use(require('express-session')({
  secret: 'Your Best Echannelling Platform.',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//view engine and assets
app.set('view engine', 'ejs');
app.use(express.static('public'));

//body-parser
app.use(bodyParser.urlencoded({
  extended: false,
}));

//respond local variables
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

//routes setup
app.use('/owner',ownerRoutes);
app.use('/centre',centreRoutes);

//usertypes
const usertypes = {'Owner': Owner, 'Doctor': Doctor};

//Index page
app.get('/', (req, res) => {
  res.render('index')
});

//Register Page
app.get('/register', (req, res) => {
  res.render('register');
});

//Register Post Request
app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const usertype = req.body.usertype;
  console.log(username);
  User.register({username: username, usertype: usertype, name: req.body.name}, password, (err, user) => {
    if(err) {
      console.log(err);
      res.redirect('/register');
    }
    else {
      console.log(user);
      let specUser = new usertypes[usertype]();
      specUser.user = user._id;
      specUser.name = user.name;
      specUser.gender = req.body.gender;
      specUser.contact = req.body.contact;
      specUser.birthday = req.body.birthday;
      specUser.address = req.body.address;
      specUser.city = req.body.city;
      if(usertype === 'Doctor') {
        specUser.slmcreg = req.body.slmcreg;
      }
      specUser.save();
      passport.authenticate('local')(req, res, () => {
        res.redirect('/secret');
      });
    }
  });
});

//login page
app.get('/login', (req,res) => {
  res.render('login');
});

//login post request
app.post('/login', passport.authenticate('local', { 
  successRedirect: '/secret',
  failureRedirect: '/login', 
}));

//secret test route
app.get('/secret', (req, res) => {
  const usertype = req.user.usertype;
  if(usertype === 'Owner') {
    return res.redirect('/owner/home');
  }
  if(usertype === 'Doctor') {
    return res.send('You are a doctor now!');
  }
});

//logout
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// App will be served in localhost:3000
app.listen(process.env.PORT || 3000, () => console.log('App listening on port 3000!'));