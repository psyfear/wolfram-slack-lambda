'use strict';

const fs = require('fs');
const handler = require('../handler');

if (process.argv.length < 3) {
  console.error('Please specify event file');
  process.exit(1);
}

const eventContent = fs.readFileSync(process.argv[2]);
const event = JSON.parse(eventContent);

handler.wolfram(event, {}, (err, result) => {
  if (err) {
    console.error(err);
  } else {
    console.dir(result);
  }
});
