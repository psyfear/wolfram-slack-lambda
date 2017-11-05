'use strict';

const util = require('util');
const get = require('lodash.get');
const escape = require('escape-html');
const parseString = require('xml2js').parseString;

const IMAGE_THRESHOLD = 36;

class Tag {

  title(title) {
    this._title = title;
    return this;
  }

  text(text) {
    this._text = text;
    return this;
  }

  image(url, width, height) {
    this._image = {url, width, height};
    return this;
  }

  format() {
    const parts = [];
    if (this._title) {
      parts.push(`<p>${escape(this._title)}</p>`);
    }
    if (this._text) {
      parts.push(`<p>${escape(this._text)}</p>`);
    }
    if (this._image) {
      parts.push(`<p><img src=${this._image.url} width=${this._image.width} height=${this._image.height}></p>`);
    }
    return parts.join('\n');
  }
}

function parseXML(wolframResult) {
  return new Promise((resolve, reject) => {
    parseString(wolframResult, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

/*
 * Assumes one pod in the result (determined by the query)
 *
 * Heuristic:
 *   For every subpod:
 *   - Use title
 *   - Use image if its height indicates relevant context (> IMAGE_THRESHOLD)
 *   - Use plain text otherwise, unless it's empty
 */
function extractRelevantTags(result) {
  //console.log(util.inspect(result, false, null));

  let tags = [];
  const success = get(result, 'queryresult.$.success');
  const subPods = get(result, 'queryresult.pod[0].subpod');

  if (success === 'true' && subPods) {
    tags = subPods.map(subPod => {
      const img = get(subPod, 'img[0][$]');
      const imgUrl = get(img, 'src');
      const imgWidth = parseInt(get(img, 'width', '0'), 10);
      const imgHeight = parseInt(get(img, 'height', '0'), 10);

      const plainText = get(subPod, 'plaintext[0]');

      const tag = new Tag();
      tag.title(get(subPod, '$.title'));

      tag.image(imgUrl, imgWidth, imgHeight);
      tag.text(plainText);
      return tag;
    });
  }

  if (tags.length === 0) {
    tags.push(new Tag().text('No results found'));
  }

  return tags;
}

function format(tags, query) {
  return { title: query, tags: tags }
}

module.exports.transform = (wolframResult, query) => {
  return parseXML(wolframResult)
    .then(result => extractRelevantTags(result))
    .then(tags => format(tags, query));
};
