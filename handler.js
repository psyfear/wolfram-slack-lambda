'use strict';

require('dotenv').config();

const queryString = require('query-string');
const fetch = require('node-fetch');
const get = require('lodash.get');
const transformer = require('./lib/transformer');
const axios = require('axios');

function callWolframAlphaApiFromQuery(query) {
  const input = encodeURIComponent(query);
  const podtitle = encodeURIComponent('Result*');
  const appid = encodeURIComponent(process.env.WOLFRAM_APP_ID);
  const url = `https://api.wolframalpha.com/v2/query?input=${input}&podtitle=${podtitle}&appid=${appid}`;
  return fetch(url);
}

function buildReplyObject(notification) {
  const tags = notification.tags[0];
  const text = notification.title + ': ' + tags._text;
  var attachments;
  if (tags._image) {
    attachments = [
      {
        'image_url': tags._image['url']
      }
    ]
  }
  
  const reply = {
    'response_type': 'in_channel',
    'text': text,
    'attachments': attachments
  }
  return reply;
}

module.exports.wolfram = (event, context, cb) => {
  console.log(event);
  const message = queryString.parse(event.body);
  console.log(message);
  const messageText = message.text
  const responseUrl = message.response_url
  if (!message || !messageText) {
    console.log(JSON.stringify(event));
    return cb(new Error('Invalid event'));
  }

  function delayedResponse(notification) {
    console.log('responseUrl:' + responseUrl);
    console.log(notification);
    const reply = buildReplyObject(notification);
    
    if (responseUrl) {
      axios.post(responseUrl, reply)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      return cb(null, reply);
    }
  }

  const query = messageText.trim();

  callWolframAlphaApiFromQuery(query)
    .then(result => result.text())
    .then(body => transformer.transform(body, query))
    .then(notification => delayedResponse(notification))
    .catch(err => cb(err));
  
  return cb(null, { 'response_type': 'ephemeral', 'text': 'Executing..'});
};
