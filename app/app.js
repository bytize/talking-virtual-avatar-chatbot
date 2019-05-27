const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    logger = require('morgan'),
    session = require('express-session'),
    redisStore = require('connect-redis')(session),
    env = process.env.NODE_ENV,
    config = require('./config/index')(),
    pugFunctions = require('./helpers/pug_functions'),
    path = require('path');

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true  }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
    store: new redisStore({
        host: config.redis.host,
        port: config.redis.port,
        db: config.redis.db,
        ttl: 3600
    }),
    secret: '1234567890abcdefghijk',
    resave: true,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    
    if(req.session.user){
        res.locals.user = req.session.user;
    }
    res.locals.config = config;
    res.locals.pugFunctions = pugFunctions;
    res.locals.env = env;
    next();
});

const routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// no stacktraces leaked to user unless in development environment
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: (app.get('env') === 'development') ? err : {}
  });
});

module.exports = app;