var Twit = require('twit');
var config = require('./config.js');

var T = new Twit(config);
T.post('statuses/update', {status: 'johns'}, function(err, data, response){
  console.log(data);
})
