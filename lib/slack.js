'use strict';

var request = require('request');

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

    return callback(null, response.statusCode);
  });
}


function channelInfo (options, callback) {
  var uri = 'https://slack.com/api/channels.info';

  request({
    uri : uri,
    qs : options,
    json : true
  }, function (error, response, body) {
      if (error) {
        return next(error);
      }

      if (res.statusCode === 200 && body.ok) {
        callback(null, body);
      } else {
        callback('Error: channels.info: ' + body);
      }
  });

}

function channelHistory (options, callback) {
  var uri = 'https://slack.com/api/channels.history';

  request({
    uri : uri,
    qs : options,
    json : true
  }, function (error, response, body) {
      if (error) {
        return next(error);
      }

      if (res.statusCode === 200 && body.ok) {
        callback(null, body);

      } else {
        callback('Error: channels.history: ' + body);
      }
  });
}

function timeStamp (jsTime) {
  return (jsTime / 1000).toPrecision(16);
}


module.exports = {
  channels : {
    info : channelInfo,
    history : channeHistory
  },
  timeStamp : timestamp
}
