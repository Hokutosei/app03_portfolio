var express = require('express')
    , app = express()
    , passport = require('passport')
    , util = require('util')
    , LocalStrategy = require('passport-local').Strategy
    , port = process.env.PORT || 3000
    , users = 'users';





app.use(express.logger())
app.use(express.static(__dirname + '/public'));

// configure Express
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'keyboard cat' }));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(__dirname + '/../../public'));
});

var globalIp = '60.148.89.178' || '10.0.1.2';
var redis = require('redis');
client = redis.createClient(6379, globalIp, {no_ready_check: true}, function(err, reply) {
    if(err) { console.log('could not connect to redis server') }
});

function findById(user, fn) {
    client.lrange(query(users, 'id'), 0, -1, function(err, lrangeReply) {
        if (lrangeReply.indexOf(user['id']) > -1) { fn(null, user) }
        else { fn(new Error('User ' + user['id'] + ' does not exist')) }
    })
}

function findByUsername(username, fn) {
    client.hgetall(query('users', username), function(err, hgetAllReply) {
        if(hgetAllReply != null && hgetAllReply['username'] === username) {
            return fn(null, hgetAllReply)
        } else {
            return fn(null, null)
        }
    })
}


passport.serializeUser(function(user, done) {
    console.log('user')
    console.log(user)
    console.log('serializing')
    console.log(user)
    done(null, user);
});

passport.deserializeUser(function(id, done) {
    findById(id, function(err, user) {
        done(err, user)
    })
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // Find the user by username.  If there is no user with the given
            // username, or the password is not correct, set the user to `false` to
            // indicate failure and set a flash message.  Otherwise, return the
            // authenticated `user`.
            var startTime = new Date()
            findByUsername(username, function(err, user) {
                console.log('============')
                console.log(user)
                if (user === null) {
                    console.log('is not user');
                    return done(null, false, { message: 'Unknown user ' + username });
                }
                if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
                return done(null, user);
            })
        });
    }
));


app.post('/login',
    passport.authenticate('local', { failureRedirect: '/404.html' }),
    function(req, res) {
        console.log(req.user)
        res.json({data: req.user});
});

app.get('/get_current_user', function(req, res) {
    if(req.user == undefined) {
        res.json({data: 'not logged in'})
    } else { res.json({data: req.user}) }
})

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/')
}

function query() {
    var arr = [];
    for(var i = 0; i < arguments.length; i++) { arr.push(arguments[i]) }
    return arguments.length == 1 ? arr[0] : arr.join(':');
}










app.listen(port)
console.log('Server is listening to.. ' + port);