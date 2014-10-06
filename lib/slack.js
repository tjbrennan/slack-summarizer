'use strict';

var request = require('request');


function channelInfo (token, channelId, callback) {
  var uri = 'https://slack.com/api/channels.info';
  var query = {
    token : token,
    channel : channelId
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
        callback(null, body);
        // console.log(body.channel.unread_count);
        //
        // if (body.channel.unread_count) {
        //   res.bot.api.channel = {
        //     unread : body.channel.unread_count,
        //     lastRead : body.channel.last_read
        //   }
        //   next();
        // } else {
        //   res.send('No unread messages');
        // }
      } else {
        callback('Error: channels.info: ' + body);
      }
  });

}

function channelHistory (token, channelId, latest, oldest, count, callback) {
  var uri = 'https://slack.com/api/channels.history';
  var query = {
    token : token,
    channel : channelId,
    oldest : oldest,
    count : count
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
        callback(null, body);
        //res.bot.api.messages = body.messages;

      } else {
        callback('Error: channels.history: ' + body);
      }
  });

}


module.exports = {
  channels : {
    info : channelInfo,
    history : channeHistory
  }
}
