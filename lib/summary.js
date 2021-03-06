'use strict';

//var SummaryTool = require('node-summary');
var slack = require('./slack');


module.exports = function (req, res, next) {
  var input = req.body.text;
  var channelId = req.body.channel_id;
  var hours = parseInt(req.body.text, 10);

  if (!hours || hours > 24 || hours < 1) {
    hours = 12;
  }
  var hoursMs = hours * 3600000
  var oldest = slack.timeStamp(+(Date.now()) - hoursMs);

  var messages;
  var summary;
  var bot = {};

  slack.channels.history({
    token : res.locals.apiToken,
    channel : channelId,
    oldest : oldest,
    count : 400
  }, function (error, body) {
    if (error) {
      return next(error);
    }

    messages = body.messages.reverse();
    summary = summarize(messages);

    bot = makeBot({
      name : 'summbot',
      emoji : ':scroll:',
      channel : channelId,
      text : summary
    });

    slack.hooks.incoming(res.locals.team, res.locals.token, bot, function (error, statusCode) {
      if (error) {
        return next(error);
      } else {
        next();
      }
    });
  });

}


function summarize (messages) {
  var content = '';
  var i = 0;
  var l = messages.length;
  var percentage = 15;
  var total = Math.floor(l * (percentage / 100));
  var every = Math.floor(l / total);

  messages.forEach(function (message) {
      if (message.text && i++ % every === 0) {
        content += message.text + '\n';
      }
  });

  content = '```' + content + '```';

  return content;
}


function makeBot (options) {

  var bot = {};

  // set bot name, message, channel
  bot.username = options.name;
  bot.channel = options.channel;
  bot.text = options.text;

  if (options.emoji) {
    bot.icon_emoji = options.emoji;
  } else if (options.url) {
    bot.icon_url = options.url;
  }

  return bot;
}
