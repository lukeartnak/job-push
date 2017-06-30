const axios = require('axios');
const express = require('express');
const { JSDOM } = require('jsdom');

let app = express();

app.get('/', (req, res) => {
  getDocument('https://www.youneedabudget.com/jobs/')
    .then(document => {
      let nodes = document.querySelectorAll('.jobOpeningIndWrap h3');
      let jobs = Array.from(nodes).map(node => node.innerHTML);
      res.send(`There are ${jobs.length} jobs waiting for you at YNAB! ${jobs.join(',')}`);
    });
});

app.listen(process.env.PORT);

setInterval(() => {
  getDocument('https://www.youneedabudget.com/jobs/')
    .then(document => {
      let nodes = document.querySelectorAll('.jobOpeningIndWrap h3');
      let jobs = Array.from(nodes).map(node => node.innerHTML);
      pushNote(jobs);
    });
}, 60*60*1000);

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
