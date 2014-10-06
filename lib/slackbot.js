'use strict';

var request = require('request');


function parseCommand (body) {
  var input = body.text;
  var channel = body.channel_name;
  var channelId = body.channel_id;
  var user = body.user_id;
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


function sendBot (team, token, payload, callback) {
  var uri = 'https://' + team + '.slack.com/services/hooks/incoming-webhook';

  // bot must be POSTed as stringified JSON
  request({
    uri : uri,
    method : 'POST',
    form : {
      payload : JSON.stringify(payload)
    },
    qs : {
      token : token
    }
  }, function (error, response, body) {
    if (error) {
      return callback(error);
    } else if (response.statusCode !== 200) {
      return callback(body);
    }

    return res.status(200).end();
  });
}
