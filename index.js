const axios = require('axios');
const { JSDOM } = require('jsdom');
const { CronJob } = require('cron');

const config = require('./config');

let job = new CronJob('0 8-22 * * *', () => {

  getDocument('https://www.youneedabudget.com/jobs/')
    .then(document => {
      let nodes = document.querySelectorAll('.jobOpeningIndWrap h3');
      let jobs = Array.from(nodes).map(node => node.innerHTML);
      pushNote(jobs);
    });

}, null, true, 'America/Los_Angeles');

function getDocument(url) {
  return axios.get(url)
    .then(response => new JSDOM(response.data).window.document);
}

function pushNote(jobs) {
  axios({
    method: 'post',
    url: 'https://api.pushbullet.com/v2/pushes',
    headers: {
      'Access-Token': process.env.API_KEY
    },
    data: {
      device_iden: process.env.DEVICE_ID,
      type: 'note',
      body: `There are ${jobs.length} jobs waiting for you at YNAB! ${jobs.join(',')}`
    }
  });
}
