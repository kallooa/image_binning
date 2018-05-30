var express = require('express');
var router = express.Router();
var passport = require('passport');
var stormpath = require('stormpath');
var uploadManager = require('./uploadManager')(router);

// Render the home page.
router.get('/', function(req, res) {
  res.render('index', { title: 'Home', user: req.user });
});

router.get('/api/1a2f164967f55325', function(req, res) {
    if (req.user === undefined) {
        // The user is not logged in
        res.json({});
    } else {
        res.json({
            username: req.user.email
        });
    }
});

// Render the registration page.
router.get('/register', function(req, res) {
  res.render('register', { title: 'Register', error: req.flash('error')[0] });
});

// Register a new user to Stormpath.
router.post('/register', function(req, res) {

  var username = req.body.username;
  var password = req.body.password;

  // Grab user fields.
  if (!username || !password) {
    return res.render('register', { title: 'Register', error: 'Email and password required.' });
  }

  // Initialize our Stormpath client.
  var apiKey = new stormpath.ApiKey(
    process.env['STORMPATH_API_KEY_ID'],
    process.env['STORMPATH_API_KEY_SECRET']
  );
  var spClient = new stormpath.Client({ apiKey: apiKey });

  // Grab our app, then attempt to create this user's account.
  var app = spClient.getApplication(process.env['STORMPATH_APP_HREF'], function(err, app) {
    if (err) throw err;

    app.createAccount({
      givenName: req.body.givenName,
      surname: req.body.surname,
      institution: req.body.institution,
      username: username,
      email: username,
      password: password,
    }, function (err, createdAccount) {
      if (err) {
        return res.render('register', {'title': 'Register', error: err.userMessage });
      } else {
        passport.authenticate('stormpath')(req, res, function () {
          return res.redirect('/licensing');
        });
      }
    });

  });

});

// Render the login page.
router.get('/login', function(req, res) {
  res.render('login', { title: 'Login', error: req.flash('error')[0] });
});


// Logout the user, then redirect to the home page.
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// Authenticate a user.
router.post(
  '/login',
  passport.authenticate(
    'stormpath',
    {
      successRedirect: '/easyapp',
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.',
    }
  )
);

// Render the dashboard page.
router.get('/dashboard', function (req, res) {
  if (!req.user || req.user.status !== 'ENABLED') {
    return res.redirect('/login');
  }

  res.render('dashboard', {
    title: 'Dashboard',
    user: req.user,
    }
  );
});

// Render the dashboard page.
router.get('/licensing', function (req, res) {
  if (!req.user || req.user.status !== 'ENABLED') {
    return res.redirect('/login');
  }
  
  res.render('contributor_agreement', {
    title: 'User Contributor Agreement',
    user: req.user,
    }
  );
});

// Render the dashboard page.
router.get('/easyapp', function (req, res) {
  if (!req.user || req.user.status !== 'ENABLED') {
    return res.redirect('/login');
  }

  res.render('app', {
    title: 'App',
    user: req.user,
    }
  );
});

module.exports = router;
