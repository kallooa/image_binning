// server.js

// set up ======================================================================
// get all the tools we need
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var hash = require('object-hash');
var serveStatic = require('serve-static');

//var fileUpload = require('express-fileupload');
//app.use(fileUpload());

var configDB = require('./config/database.js');

var mongodb = require('mongodb');
var databaseUrl = "mongodb://easydb:o75WhGq3nsdlCr0eIyMobx2qPvd8sL9drD9SvHLxdMscNXXgzgSanoPoH3Ou9Qqvg9GECZ2gnAtYy461aH1MZg==@easydb.documents.azure.com:10250/?ssl=true";
var db = require("mongojs")(databaseUrl);
var json2csv = require('json2csv');
var nodeArr = '';
var user_data = '';
var result = '';
var thefilename = '';
var requestedLesionNum = '';
var easyStorage = db.collection('easyData');
var licenseStorage = db.collection('userLicense');
var userdb = db.collection('user_management');
var surveyStorage = db.collection('anatomy_survey');
var imageBinningData = db.collection('imageBinningData');
var anatomy_users = db.collection('anatomy_users');
var anatomy_presurvey = db.collection('anatomy_presurvey');
var dx_survey = db.collection('dx_survey');
var jsonexport = require('jsonexport');
var datasetinfo = db.collection('datasetInfo');
var path = require('path');
var fs = require('fs');

app.set('port', port); //PORT IS HERE
//app.use(express.static(path.join(__dirname, 'public')));
app.use(serveStatic(path.join(__dirname, 'public')));


//app.use(express.directory('public/imgs'));
//app.use(express.static('public/imgs'));

//app.use('/imgs', serveIndex(path.join(__dirname, 'public/imgs')));
//app.use(express.static(path.join(__dirname, 'public/')));
//console.log(path.join(__dirname, 'public/imgs'));
//app.use('/files', express.static(__dirname + '/files'));

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});

var io = require('socket.io').listen(server); //app //app2

function _getMsg(st, callback) { //return data for particular requested lesion number
    db.collection('easyData').find({
        'user': st.user,
        'dataset_name': st.dataset_name
    }).toArray(function(err, docs) {
        callback(docs);
    });
}

function _getUniquePreviousUsers(st, callback) { //return data for particular requested lesion number
    db.collection('anatomy_users').find({
        "user_email": {
            $exists: true
        }
    }).toArray(function(err, docs) {
        callback(docs);
    });
}

function _getUserProgress(st, callback) { //return data for particular requested lesion number
    db.collection('anatomy_survey').find(
    {"user_email": st},
    {'anatomic':1, '_id':0}
    ).toArray(function(err, docs) {
        callback(docs);
    });
}

function _getUserProgressDx(st, callback) { //return data for particular requested lesion number
    dx_survey.find({"user":st}).sort({boxNum:-1}).limit(1).toArray(function(err, docs) {
        callback(docs);
    });
}

function writecsv(csv, username) {
    //username = username.substring(0, username.indexOf('@'));
    thefilename = 'csvs/' + username + '-' + Date.now().toString() + '-file.csv';
    fs.writeFile(thefilename, csv, function(err) {
        if (err) throw err;
        console.log('file saved');
    });
}

io.on("connection", function(socket) {
    socket.on("requestJSON1", function(data) {
        console.log('user sends: ', data);
        contents = fs.readFileSync("public/libs/AnatomySurvey/anatomy_json2.json")
        the_data = JSON.stringify(JSON.parse(contents));
        socket.emit("returnJSON1", the_data);
    });

    socket.on("requestJSON2", function(data) {
        console.log('user sends: ', data);
        contents = fs.readFileSync("public/libs/AnatomySurvey/anatomy_levels.json")
        the_data = JSON.stringify(JSON.parse(contents));
        socket.emit("returnJSON2", the_data);
    });
    
    socket.on("imageBinningData", function(data) {
        the_data = JSON.parse(data);
        console.log(data);
        imageBinningData.insert(the_data);
    });

    socket.on("requestPreviousUsers", function(data) {
        console.log('user sends: ', data);
        _getUniquePreviousUsers(data, function(res) {
            user_data = res;
            var uniqueNames = [];
            var hashedNames = [];
            for (i = 0; i < user_data.length; i++) {
                if (uniqueNames.indexOf(user_data[i].user_email) === -1) {
                    uniqueNames.push(user_data[i].user_email);
                }
            }
            for (i = 0; i < uniqueNames.length; i++) {
                hashedNames.push(hash.sha1(uniqueNames[i]));
            }
            socket.emit('returnUserList', hashedNames);

        });
    });

    socket.on("requestUserProgress", function(user_email) {
        console.log('requesting progress for user: ', user_email);
        _getUserProgress(user_email, function(res) {
            user_data = res;
            console.log(user_data);
            socket.emit('returnUserProgress', user_data);
        });
    });

    socket.on("requestUserProgressDx", function(user_email) {
        console.log('requesting progress for user: ', user_email);
        _getUserProgressDx(user_email, function(res) {
            user_data = res;
            console.log(user_data);
            socket.emit('returnUserProgressDx', user_data);
        });
    });

    socket.on("dataFromUser", function(data) {
        console.log('user requests JSON');
        easyStorage.insert(data);
    });

    socket.on("SurveyDataFromUser", function(data) {
        console.log('user sends: ', data);
        parsed = JSON.parse(data);
        surveyStorage.insert(parsed);
    });

    socket.on("SendAnatomyUserData", function(data) {
        console.log('user sends: ', data);
        anatomy_users.insert(data);
    });

    socket.on("saveDxSurveyData", function(data) {
        data = JSON.parse(data);
        console.log('user sends: ', data);
        dx_survey.insert(data);
    });

    socket.on("SendAnatomyPreSurveyData", function(data) {
        console.log('user sends: ', data);
        anatomy_presurvey.insert(data);
    });

    socket.on("user_sig", function(data) {
        console.log('user signed:', data);
        licenseStorage.insert(data);
    });

    socket.on("dataset_info", function(data) {
        console.log('dataset:', data);
        datasetinfo.insert(data);
    });

    socket.on("csv_request", function(user_data) {
        console.log('requesting csv');
        _getMsg(user_data, function(res) {
            nodeArr = res; // just moved the nodeArr declaration to function scope
            var inputDataFrame = dataForge.fromJSON(JSON.stringify(nodeArr));
            console.log(inputDataFrame.toString());
            socket.emit("csvdata", inputDataFrame);
            jsonexport(nodeArr, function(err, csv) {
                if (err) return console.log(err);
                result = csv;
                console.log(typeof(result));
                writecsv(result, user_data);
            });
        });
        console.log(result);
    });
});

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

    // set up our express application
    app.use(express.logger('dev')); // log every request to the console
    app.use(express.cookieParser()); // read cookies (needed for auth)
    app.use(express.bodyParser()); // get information from html forms

    app.set('view engine', 'ejs'); // set up ejs for templating

    // required for passport
    app.use(express.session({
        secret: 'ilovescotchscotchyscotchscotch'
    })); // session secret
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session

});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
//app.listen(port);
//console.log('The magic happens on port ' + port);