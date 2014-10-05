'use strict'; // don't be a dummy

var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var SummaryTool = require('node-summary');

var app = express();
var port = process.env.PORT || 3000;

var args = process.argv;
var team = args[2];
var token = args[3];
var apiCache = {};

var command = '/summary';

function parseCommand (req, res, next) {
  var input = req.body.text;
  var channel = req.body.channel_name;
  var channelId = req.body.channel_id;
  var user = req.body.user_id;
  var apiToken;
  var bot = {};


  if (input) {
    apiToken = input;
    apiCache[user] = input;
  } else if (apiCache[user]) {
    apiToken = apiCache[user];
  } else {
    next('API token needed!');
  }

  console.log(req.body);

  // set bot name, message, channel
  bot.username = 'sumbot';
  bot.channel = '#' + channel;
  bot.icon_emoji = ':scroll:';
  bot.api = {
    token : apiToken,
    channel : {
      channelId : channelId
    }
  };

  // stash bot
  res.bot = bot;
  next();
}

function getChannel (req, res, next) {
  var uri = 'https://slack.com/api/channels.info';
  var query = {
    token : res.bot.api.token,
    channel : req.body.channel_id
  }

  request({
    uri : uri,
    qs : query,
    json : true
  }, function (error, response, body) {
      if (error) {
        return next(error);
      }

      if (res.statusCode === 200 && body.ok) {
        console.log(body.channel.unread_count);

        if (body.channel.unread_count) {
          res.bot.api.channel = {
            unread : body.channel.unread_count,
            lastRead : body.channel.last_read
          }
          next();
        } else {
          res.send('No unread messages');
        }
      } else {
        next('Error: channels.info: ' + body);
      }
  });

}

function getMessages (req, res, next) {
  var uri = 'https://slack.com/api/channels.history';
  var query = {
    token : res.bot.api.token,
    channel : req.body.channel_id,
    oldest : res.bot.api.channel.lastRead,
    count : res.bot.api.channel.unread
  }

  request({
    uri : uri,
    qs : query,
    json : true
  }, function (error, response, body) {
      if (error) {
        return next(error);
      }

      if (res.statusCode === 200 && body.ok) {
        //console.log(JSON.stringify(body));
        res.bot.api.messages = body.messages;
        next();
      } else {
        next('Error: channels.history: ' + body);
      }
  });

}

function summarize (req, res, next) {
  var content = '';
  res.bot.api.messages.forEach(function (message) {
      content += message.text + '.\n';
  });

  console.log(content);
  SummaryTool.summarize('', content, function (error, summary) {
    if (error) {
      return next(error);
    }

    res.bot.text = summary;
    delete res.bot.api;

    next();
  });


}

function sendBot (req, res, next) {
  var uri = 'https://' + team + '.slack.com/services/hooks/incoming-webhook';

  // bot must be POSTed as stringified JSON
  request({
    uri : uri,
    method : 'POST',
    form : {
      payload : JSON.stringify(res.bot)
    },
    qs : {
      token : token
    }
  }, function (error, response, body) {
    if (error) {
      return next(error);
    } else if (response.statusCode !== 200) {
      return next(body);
    }

    return res.status(200).end();
  });
}


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


app.post('/summarize', parseCommand, getChannel, getMessages, summarize, sendBot);


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
