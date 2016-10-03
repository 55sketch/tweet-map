// Require
var express = require('express');
var api = require('./api');
var path = require('path');

// Set app
var app = express();

// Environment
var port = process.env.PORT || 5000;
process.env.TWITTER_CONSUMER_KEY = 'TC4xhEJper1xBbB9s67ZrK2I0';
process.env.TWITTER_CONSUMER_SECRET = 'hBNvp7rm56PdAZNhXtSkidhuReYVa4YamPiMVHVV2BO89h0eHf';

// Front end
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) { 
    res.status(200).sendFile('index.html'); 
});

// API
app.get('/api', api.createAPI);

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});

app.listen(port, function () {
  console.log('Twitter Map listening on port ' + port);
});