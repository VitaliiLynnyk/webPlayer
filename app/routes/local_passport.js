let passport = require('passport');
let localStrategy = require('passport-local').Strategy;
let User = require('../models/user.schema');
let jwt = require('jsonwebtoken');

passport.use('signIn',new localStrategy({usernameField: 'email', passReqToCallback: true,session:false},function(req,email, password, done) {
  User.findOne({ email: email }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.validPassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));

passport.use('signUp',new localStrategy({ usernameField: 'email', passReqToCallback: true , session: false},function(req,email, password, done) {
  User.findOne({ email: email }, function (err, user) {
    if (err) { return done(err); }
    if(!req.body.name){return done(null,false);}
    if (user) { return done(null, false); }else{
      let newUser = new User({email: email, name: req.body.name});
      newUser.setPassword(password);
      newUser.save();
      return done(null, newUser);
    }
  });
  }
));

passport.serializeUser(function(user, done) {
  done(null,user);
});

passport.deserializeUser(function(user, done) {
  User.findOne({ email: user.email }, function (err, user) {
    done(err, user);
  });
});

function checkAuthentication(req,res,next){
  var token = req.cookies['token'];
  if (token) {
    jwt.verify(token,'secret', function(err, decoded) {
      if (err) {
        return res.json({ status: 401, error: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  }else{
    res.json({status:401,error:'you are not authorized'});
  }
}

module.exports.passport = passport;
module.exports.checkAuthentication = checkAuthentication;

