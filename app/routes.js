// app/routes.js
var idu_token;
var Cookies = require("cookies");
var cookies = new Cookies();
var fs = require('fs');
var path = require('path');
var y;

module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	app.get('/api/1a2f164967f55325', function(req, res) {
        if (req.user === undefined) {
            // The user is not logged in
            res.json({});
        } else {
            res.json({
                username: req.user.local.email
            });
        }
    });

	app.post('/upload', function(req, res) {
		console.log(req.files);
		fs.readFile(req.files.file.path, function (err, data) {
		  // ...
		  var newPath = __dirname + "/uploads/"+req.files.file.name;
		  console.log(newPath);
		  fs.writeFile(newPath, data, function (err) {
		    res.redirect("back");
		  });
		});

	});



	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	app.get('/anatomySurvey', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('anatomysurvey.ejs', { message: req.flash('surveyMessage') });
	});

	app.get('/anatomysurvey', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('anatomysurvey.ejs', { message: req.flash('surveyMessage') });
	});

	app.get('/presurvey', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('anatomy_presurvey.ejs', { message: req.flash('surveyMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/easyapp', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/licensing', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	app.get('/imageBinning1', function(req, res) {
		res.render('imageBinning.ejs');
	});

	app.get('/imgs', function(req, res) {
			fs.readdir('./public/imgs', function(err, items) {
				console.log(items);
				res.json(items);
			});
	});
	// =====================================
	// APP SECTION =========================
	// =====================================
	app.get('/easyapp', isLoggedIn, function(req, res) {
		res.render('easyapp.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LICENSING SECTION =========================
	// =====================================
	app.get('/licensing', isLoggedIn, function(req, res) {
		res.render('contributor_agreement.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

function assignVar(arr) {
	y = arr;
}

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
