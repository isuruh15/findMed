//constant inializing
const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');

//models
const User = require('../models/user');
const Owner = require('../models/owner');
const Centre = require('../models/centre');
const Operator = require('../models/operator');
const City = require('../models/city');
const Doctor = require('../models/doctor');
const Schedule = require('../models/schedule');

//passport configuration
router.use(require('express-session')({
  secret: 'Your Best Echannelling Platform.',
  resave: true,
  saveUninitialized: true
}));
router.use(passport.initialize());
router.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//owner homepage
router.get('/home', (req, res) => {
  Owner.findOne({ user: req.user._id }).populate('centres').exec((err, owner) => {
    if (err) {
      console.log(err);
      return res.redirect('/');
    }
    const centres = owner.centres;
    return res.render('ownerHome', { name: req.user.name, centres: centres });
  });
});

//owner's centre view page
router.get('/centre/:id', (req, res) => {
  const id = req.params.id;
  //doctors and operators
  Centre.findById(id).populate('doctors', 'name').populate('operators').exec((err, centre) => {
    if (err) {
      consloe.log(err);
    }
    else {
      //pending schedules
      Schedule.find({ centre: id, pending: true }).populate('doctor').exec((err, pendings) => {
        if (err) {
          console.log(err);
        }
        else {
          //schedules
          Schedule.find({ centre: id, pending: false }).populate('doctor').exec((err, schedules) => {
            if (err) {
              console.log(err);
            }
            else {
              res.render('ownerCentre', { name: centre.name, doctors: centre.doctors, operators: centre.operators, 
                schedules: schedules, id: id });
            }
          });
        }
      });
    }
  });
});

//schedule setup
router.get('/centre/:id/doctor/:docId/apointment', (req, res) => {
  const id = req.params.id;
  const docId = req.params.docId;
  Centre.findById(id, (err, centre) => {
    if(err) {
      console.log(err);
    }
    else {
      if(centre.doctors.indexOf(docId) !== -1) {
        Doctor.findById(docId, (err, doctor) => {
          console.log(doctor.name);
          if(err) {
            console.log(err);
          }
          else {
            return res.render('addApointment', {centre: centre.name, doctor: doctor.name, id: id, docId: docId});
          }
        });
      }
      else {
        res.redirect('/secret');
      }
    }
  });
});

module.exports = router;