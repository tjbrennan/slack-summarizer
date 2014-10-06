'use strict'; // don't be a dummy

var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var summary = require('/lib/summary');


var app = express();
var port = process.env.PORT || 3000;

var args = process.argv;
var team = args[2];
var token = args[3];
var apiToken = args[4];
var apiCache = {};

var command = '/summary';


app.use(bodyParser.urlencoded({
  extended : true
}));


// authorize
app.use(function (req, res, next) {
  if (req.body.command !== command) {
    return res.status(400).end();
  }

  next();
});


app.post('/summarize', summary);


// error handler
app.use(function (err, req, res, next) {
  console.error(err);

  if (typeof err === 'string') {
    return res.status(200).send(err);
  } else {
    return res.status(400).send(err);
  }
});



app.listen(port, function () {
  console.log('Summarizer listening on port ' + port);
});
