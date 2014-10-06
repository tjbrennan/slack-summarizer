'use strict';

var SummaryTool = require('node-summary');


module.exports = function summarize (req, res, next) {
  var content = '';
  var messages = res.bot.api.messages.reverse();

  messages.forEach(function (message) {
      // deleted messages will be undefined
      if (message.text) {
        // format messages for sentence matching regex
        content += message.text + '.\n';
      }
  });

  SummaryTool.summarize('', content, function (error, summary) {
    if (error) {
      return next(error);
    }

    res.bot.text = summary;
    delete res.bot.api;

    next();
  });


}
