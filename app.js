var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , expressValidator = require('express-validator'); 

var session = require('express-session');
var fs = require("fs");
var app = express();
var csrf = require('csurf');

app.configure(function(){
  app.use(session({
	  secret: 'My super session secret',
	  cookie: {
		httpOnly: true,
		secure: true
	  }
	}));
 // app.use(csrf());
 // app.use(function(req, res, next) {
//	  res.locals.csrfToken = req.csrfToken();
//	  next();
//	});
  app.set('port', process.env.PORT || 4000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: false});
  app.use('/public', express.static(__dirname + '/public'));  
  app.use(express.static(__dirname + '/public')); 
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(expressValidator); 
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

// configuring error handler
app.configure('development', function(){
  app.use(express.errorHandler());
});

//get form 
app.get('/contactus', function(req,res){
    res.render('index', { 
        title: 'Express Form Validation with Jade template engine!',
        message: '',
        errors: {}        
    });            
});

//Post
app.post('/contactus', function(req,res){
    req.assert('fname', 'Please enter first name! First name is required!!!').notEmpty();  //First Name is empty validation
    req.assert('lname', 'Please enter last name! Last name is required!!!').notEmpty();  //Last Name is empty validation
    req.assert('type', 'Please enter type! Type is required!!!').notEmpty();  //Type is empty validation
    req.assert('message', 'Please enter message! Message is required!!!').notEmpty();  //Message is empty validation

    var errors = req.validationErrors();  
    if( !errors){   //If validates 
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var filePath = __dirname + '\\public\\data.txt';
		var valueString = req.param('fname') + '  ' + req.param('lname')+ '  ' + (req.param('type')== 1 ? 'Suggestion' : 'Complaint') +  '  ' + req.param('message') + ' ' + ip;
		fs.appendFile(filePath, valueString, "UTF-8",function (err) {
			if (err) {
				return console.log("Error writing file: " + err);
			}
		});
		
		req.session.valid = true;
		var stringValue = encodeURIComponent(req.param('fname') + '  ' + req.param('lname'));
		res.redirect('/thankyou?valid=' + stringValue);
       
    }
    else {   // Display error messages
        res.render('index', { 
            title: 'Express Form Validation with Jade template engine!',
            message: '',
            errors: errors
        });
    }
 });
 
 app.get('/thankyou', function(req,res){
	 var passedVariable = req.query.valid;
	 res.render('thankyou', { 
            title: 'Express Form Validation with Jade template engine!',
            message: 'thank you ' + passedVariable
        });
});
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
