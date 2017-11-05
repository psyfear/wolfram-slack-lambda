'use strict';

require('dotenv').config();

const queryString = require('query-string');
const fetch = require('node-fetch');
const get = require('lodash.get');
const transformer = require('./lib/transformer');

const PREFIX = '/wolfram';

function callWolframAlphaApiFromQuery(query) {
  const input = encodeURIComponent(query);
  const podtitle = encodeURIComponent('Result*');
  const appid = encodeURIComponent(process.env.WOLFRAM_APP_ID);
  const url = `https://api.wolframalpha.com/v2/query?input=${input}&podtitle=${podtitle}&appid=${appid}`;
  console.log(url);
  return fetch(url);
}

module.exports.wolfram = (event, context, cb) => {
  console.log(event);
  const message = queryString.parse(event.body);
  console.log(message);
  const messageText = message.text

  if (!message || !messageText) {
    console.log(JSON.stringify(event));
    return cb(new Error('Invalid event'));
  }

  function reply(notification) {
    const reply = {
      'response_type': 'in_channel',
      'text': notification,
    }
    return cb(null, reply);
  }

  const query = messageText.trim();

  callWolframAlphaApiFromQuery(query)
    .then(result => result.text())
    .then(body => transformer.transform(body, query))
    .then(notification => reply(notification))
    .catch(err => cb(err));
};
