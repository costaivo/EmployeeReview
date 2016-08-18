//Employee review app

//Declaring variables
var express = require('express'),
	app = express(),
	MongoClient = require('mongodb').MongoClient,
	assert = require('assert'),	
	bodyParser = require('body-parser');	
	

	//Setting up the app
	app.set('view engine','ejs');	//setting view engine as ejs
	app.use(express.static('public'));	//setting up middleware to serve static files
	app.use(bodyParser.urlencoded({extended:true}));
	
	//setting up mongo client to connect to local databse(port 27017  db-> myapp)

	MongoClient.connect('mongodb://localhost:27017/myapp',function(err,db){
		assert.equal(null,err);		//in case of error
		console.log('Sucessfully connected to mongodb server');
		
		//configuring express app for various incoming requests	and rendering proper pages

		app.get('/',function(req,res){
			res.render(__dirname+'/views/home',{});
		});
		app.get('/home.html',function(req,res){
			res.render(__dirname+'/views/home',{});
			
		});
		app.get('/login.html',function(req,res){
			res.render(__dirname+'/views/login',{errorMessage:"",user:""});
			
		});
		app.get('/registration.html',function(req,res){
			res.render(__dirname+'/views/registration',{errorMessage:"",user:""});
		});
 		
		app.post('/incomingUser',function(req,res){
			var userName = req.body.email;
			var password = req.body.password;

			//User validation
			
			db.collection('employee').findOne({"username":userName},function(err,data){
			 	if(data)
			 	{	if(password == data.password)
						{	res.render(__dirname+'/views/profilePage',{user:userName,firstName:data.firstName,middleName:data.middleName,lastName:data.lastName,dateOfBirth:data.dateOfBirth,dateOfJoining:data.dateOfJoining,designation:data.designation,team:data.team,skills:data.skills,message:null});				////////////////////////////////////
						}
					else
						{	res.render(__dirname+'/views/login',{errorMessage:"Invalid password",user:userName});
						}
			 		
			 	}
			 	else
			 	{
			 		res.render(__dirname+'/views/login',{errorMessage:"Invalid Username & password",user:""})
			 	}
			 });								
		});
		
		//new registration password check and if sucessfull saving it in database

		app.post('/registrationdetails',function(req,res){
			var userName = req.body.email;
			var password = req.body.password;
			var confirmpassword = req.body.confirmpassword;
			db.collection('employee').findOne({"username":userName},function(err,data){
				if(data)
				{
					if(userName==data.username)
					{	res.render(__dirname+'/views/registration',{errorMessage:"Username not available",user:""});
					}
					
				}
				else if(password!=confirmpassword)	
					{	res.render(__dirname+'/views/registration',{errorMessage:"Passwords dosent match",user:userName});

					}		
					else
					{	db.collection('employee').insertOne({'username':userName,'password':password},function(err,r){
							assert.equal(null,err);
							console.log('Entry saved with _ID '+r.insertedId);
						});
						res.render(__dirname+'/views/login',{user:userName,errorMessage:""});
					}
			});			
		});

		//Updating details once a user has sucessfully logged in

		app.post('/update',function(req,res){
			var userName = req.body.email;
			var firstName = req.body.firstName;
			var middleName = req.body.middleName;
			var lastName = req.body.lastName;
			var dateOfBirth = req.body.dateOfBirth;
			var dateOfJoining = req.body.dateOfJoining;
			var designation = req.body.designation;
			var team = req.body.teamName;
			var skills = req.body.skills;
			var ratings = req.body.rating;
			var message = "Profile updated";

			if (ratings==undefined)
			{	db.collection('employee').findOne({"username":userName},function(err,data){
					ratings=data.rating;
					db.collection('employee').updateOne({'username':userName},{$set:{'firstName':firstName,'middleName':middleName,'lastName':lastName,'dateOfBirth':dateOfBirth,'dateOfJoining':dateOfJoining,'designation':designation,'team':team,'skills':skills,'rating':ratings}},function(err,r){
						assert.equal(null,err);				
					});
				});	
			}				
			else
			{	db.collection('employee').updateOne({'username':userName},{$set:{'firstName':firstName,'middleName':middleName,'lastName':lastName,'dateOfBirth':dateOfBirth,'dateOfJoining':dateOfJoining,'designation':designation,'team':team,'skills':skills,'rating':ratings}},function(err,r){
					assert.equal(null,err);				
				});
			}

			res.render(__dirname+'/views/profilePage',{user:userName,firstName:firstName,middleName:middleName,lastName:lastName,dateOfBirth:dateOfBirth,dateOfJoining:dateOfJoining,designation:designation,team:team,skills:skills,message:message});				////////////////////////////////////
		});
		
		// express app listening to specified port

		var server = app.listen(8001,function(){
			var port = server.address().port;
			console.log('express app running on port %s',port);
		});
	});