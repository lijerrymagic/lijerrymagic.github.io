var crypto = require('crypto');
var path = require('path');
var express = require('express')
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static('frontend'));

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
    
var Datastore = require('nedb');
var images = new Datastore({ filename: 'db/images.db', autoload: true, timestampData : true});
var comments = new Datastore({ filename: 'db/comments.db', autoload: true });
var users = new Datastore({ filename: 'db/users.db', autoload: true });

var session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, sameSite: true }
}));

var checkPassword = function(user, password){
        var hash = crypto.createHmac('sha512', user.salt);
        hash.update(password);
        var value = hash.digest('base64');
        return (user.saltedHash === value);
};

// constructor
var Image = (function(){
    var id = 0;
    images.find({}).sort({ id: -1 }).exec(function (err, docs) {
        if(docs.length != 0){
            id = docs[0].id + 1;
        }
        else{
            id = 0;
        }
    });
    return function Image(image){
            this.url = image.url;
            this.title = image.title;
            this.username = null;
            this.id = id++;
    }
}());

var Comment = (function(){
    var comment_id = 0;
    comments.find({}).sort({ id: -1 }).exec(function (err, docs) {
        if(docs.length != 0){
            comment_id = docs[0].comment_id + 1;
        }
        else{
            comment_id = 0;
        }
    });
    return function Comment(comment){
        this.url = comment.url;
        this.date = comment.date;
        this.username = null;
        this.author = null;
        this.content = comment.content;
        this.id = parseInt(comment.id);
        this.comment_id = comment_id++;
    }
}());

var User = function(user){
    var salt = crypto.randomBytes(16).toString('base64');
    var hash = crypto.createHmac('sha512', salt);
    hash.update(user.password);
    this.username = user.username;
    this.salt = salt;
    this.saltedHash = hash.digest('base64');
};

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    return next();
});

// Create

app.post('/api/images/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");	
    var image = new Image(req.body);
    image.username = req.session.user.username;
    image.author = req.session.user.username;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
    images.insert(image, function (err, data) {
        if (err){
            res.status(404).end("Image " + req.body.name + " already exists");
            return next();
        }
        res.json(data);
        return next();
    });
});

app.post('/api/comments/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var comment = new Comment(req.body);
    comment.username = req.session.user.username;
    comment.author	 = req.session.user.username;
    comments.insert(comment, function (err, data) {
        if (err){
            res.status(404).end("Username " + req.body.username + " already exists");
            return next();
        }
        res.json(data);
        return next();
    });
});

app.post('/api/signin/', function (req, res, next) {
    if (!req.body.username || ! req.body.password) return res.status(400).send("Bad Request");
    users.findOne({username: req.body.username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user || !checkPassword(user, req.body.password)) return res.status(401).end("Unauthorized");
        req.session.user = user;
        res.cookie('username', user.username, {secure: true, sameSite: true});
        return res.json(user);
    });
});

app.put('/api/users/', function (req, res, next) {
    var data = new User(req.body);
    users.findOne({username: req.body.username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (user) return res.status(409).end("Username " + req.body.username + " already exists");
        users.insert(data, function (err, user) {
            if (err) return res.status(500).end(err);
            return res.json(user);
        });
    });
});

// Read

app.get('/api/images/:author/:id/next',function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var username = req.params.author;
    var search_id;
    var new_id;
    var url;
    search_id = parseInt(req.params.id);
    images.findOne({id:search_id}).exec(function (err, doc) {
        images.find({username:username, id:{$gt:search_id}}).sort({id:1}).exec(function (err, docs) {
            if (err){
                res.status(404).end("ID" + req.params.id + " does not exist");
                return next();
            }
            else if (docs.length != 0){
                res.json(docs[0]);
                return next();
            }
            else{
                res.json(doc);
                return next();
            }
        });
    });
});

app.get('/api/signin',function (req, res, next) {
	if (!req.session.user) return res.json(false);
	res.json(true);
    return next();
});

app.get('/api/signout/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    req.session.destroy(function(err) {
        if (err) return res.status(500).end(err);
        return res.end();
    });
});

app.get('/api/images/:author/:id/previous',function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var username = req.params.author;
    var search_id;
    var new_id;
    var url;
    search_id = parseInt(req.params.id);
    images.findOne({id:search_id}).exec(function (err, doc) {
        images.find({username:username, id:{$lt:search_id}}).sort({id:-1}).exec(function (err, docs) {
            if (err){
                res.status(404).end("ID" + req.params.id + " does not exist");
                return next();
            }
            else if (docs.length != 0){
                res.json(docs[0]);
                return next();
            }
            else{
                res.json(doc);
                return next();
            }
        });
    });
});

app.get('/api/images/',function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    images.find({username: req.session.user.username}).sort({id:1}).exec(function (err, docs) {
        if (err){
            res.status(404).end("ID" + req.params.id + " does not exist");
            return next();
        }
        else if (docs.length != 0){
            res.json(docs[0]);
            return next();
        }
        else{
            res.json("");
            return next();
        }
    });
});

app.get('/api/images/:username',function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var username = req.params.username;
    images.find({username: username}).sort({id:1}).exec(function (err, docs) {
        if (err){
            res.status(404).end("ID" + req.params.id + " does not exist");
            return next();
        }
        else if (docs.length != 0){
            res.json(docs[0]);
            return next();
        }
        else{
            res.json("");
            return next();
        }
    });
});

app.get('/api/comments/',function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var empty = [];
    var new_id;
    new_id = "";
        images.find({username: req.session.user.username}).sort({id:1}).exec(function (err, docs) {
            if (docs.length != 0){
                new_id = docs[0].id;
            }
            comments.find({id:new_id}).exec(function (err, docs2){
                if (err){
                    res.status(404).end("ID" + req.params.id + " does not exist");
                    return next();
                }
                else if (docs.length != 0){
                    res.json(docs2);
                    return next();
                }
                else{
                    res.json(empty);
                    return next();
                }
            });
        });
});

app.get('/api/comments/:username',function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var username = req.params.username;
    var empty = [];
    var new_id;
    new_id = "";
        images.find({username: username}).sort({id:1}).exec(function (err, docs) {
            if (docs.length != 0){
                new_id = docs[0].id;
            }
            comments.find({id:new_id}).exec(function (err, docs2){
                if (err){
                    res.status(404).end("ID" + req.params.id + " does not exist");
                    return next();
                }
                else if (docs.length != 0){
                    res.json(docs2);
                    return next();
                }
                else{
                    res.json(empty);
                    return next();
                }
            });
        });
});

app.get('/api/users/',function (req, res, next) {
    users.find({}).sort({id:1}).exec(function (err, docs) {
        if (err){
            res.status(404).end("Check users failed!");
            return next();
        }
        else{
            res.json(docs);
            return next();
        }
    });
});

app.get('/api/comments/:author/:id/next', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var username = req.params.author;
    var search_id;
    var new_id;
    search_id = parseInt(req.params.id);
    new_id = search_id;
        images.find({username: username, id:{$gt:search_id}}).sort({id:1}).exec(function (err, docs) {
            if (docs.length != 0){
                new_id = docs[0].id;
            }
            comments.find({id:new_id}).exec(function (err, docs2){
                if (err){
                    res.status(404).end("ID" + req.params.id + " does not exist");
                    return next();
                }
                else{
                    res.json(docs2);
                    return next();
                }
            });
        });
    });

app.get('/api/comments/:author/:id/previous', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var username = req.params.author;
    var search_id;
    var new_id;
    search_id = parseInt(req.params.id);
    new_id = search_id;
        images.find({username: username, id:{$lt:search_id}}).sort({id:-1}).exec(function (err, docs) {
            if (docs.length != 0){
                new_id = docs[0].id;
            }
            comments.find({id:new_id}).exec(function (err, docs2){
                if (err){
                    res.status(404).end("ID" + req.params.id + " does not exist");
                    return next();
                }
                else{
                    res.json(docs2);
                    return next();
                }
            });
        });
    });

app.get('/api/session/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var user = req.session.user;
    res.json(user)
    });
// Delete

app.delete('/api/images/:author/:id/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var username = req.params.author;
    var search_id;
    var new_id;
    var url;
    search_id = parseInt(req.params.id);
    images.remove({id: search_id}, function (err, numRemoved) {
            images.find({username:username}).sort({id:1}).exec(function (err, docs) {
                if (err){
                    res.status(404).end("ID" + req.params.id + " does not exist");
                    return next();
                }
                else if (docs.length != 0){
                    res.json(docs[0]);
                    return next();
                }
                else{
                    res.json("");
                    return next();
                }
            });
    });
});

app.delete('/api/comments/:author/:id/', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var username = req.params.author;
    var search_id;
    var new_id;
    var url;
    search_id = parseInt(req.params.id);
    new_id = search_id;
    comments.remove({id: search_id}, function (err, numRemoved) {
        images.find({username:username}).sort({id:1}).exec(function (err, docs) {
            if (docs.length != 0){
                new_id = parseInt(docs[0].id);
            }
            comments.find({id : new_id}).exec(function (err, docs2){
                if (err){
                    res.status(404).end("ID" + req.params.id + " does not exist");
                    return next();
                }
                else if (docs.length != 0){
                    res.json(docs2);
                    return next();
                }
                else{
                    res.json([]);
                    return next();
                }
            });
        });
    });
});

app.delete('/api/comments/:author/:id/:comment_id', function (req, res, next) {
    if (!req.session.user) return res.status(403).end("Forbidden");
    var username = req.params.author;
    var search_id;
    var new_id;
    var url;
    var comment_id;
    search_id = parseInt(req.params.id);
    comment_id = parseInt(req.params.comment_id);
    comments.remove({comment_id: comment_id}, function (err, numRemoved) {
            comments.find({id : search_id}).exec(function (err, docs){
                if (err){
                    res.status(404).end("ID" + req.params.id + " does not exist");
                    return next();
                }
                else if (docs.length != 0){
                    res.json(docs);
                    return next();
                }
                else{
                    res.json([]);
                    return next();
                }
            });
        });
    });

app.delete('/api/signout/', function (req, res, next) {
    req.session.destroy(function(err) {
        if (err) return res.status(500).end(err);
        return res.end();
    });
});

app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
});


var fs = require('fs');
var https = require('https');
var privateKey = fs.readFileSync( 'server.key' );
var certificate = fs.readFileSync( 'server.crt' );
var config = {
        key: privateKey,
        cert: certificate
};
https.createServer(config, app).listen(3000, function () {
    console.log('HTTPS on port 3000');
});