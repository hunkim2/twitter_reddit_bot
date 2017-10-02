var Twit = require('twit');
var config = require('./config.js');
var T = new Twit(config);

function gotData(err,data,response){
  if(err){
    console.log('there was an error!');
  }
  else{
    console.log('It Worked!');
  }
}
function tweetIt(){
  console.log('the bot is starting!');
  var number;
  for(var i = 0 ; i < 20; i++){
    number = Math.floor(Math.random()*100);
    var params = {
      status: 'this is a random number tweet: ' + number
    }
    T.post('statuses/update', params, gotData);
  }
}
// tweetIt();
// setInterval(tweetIt, 1000*20);
