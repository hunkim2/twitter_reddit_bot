var Snooper = require('reddit-snooper');
var Twit = require('twit');
var request = require('request');
var fs = require('fs');
var reddit_config = require('./reddit_config');
var config = require('./config.js');
var T = new Twit(config);
var snooper = new Snooper(reddit_config);


//Setting up a user stream
var stream = T.stream('user');

//Anytime someone follows me
stream.on('follow', followed);


function followed(eventMsg){
    const streamName = eventMsg.source.screen_name;
    const name = eventMsg.source.name;
    const msg = '@' + streamName + ' ooooooeeeee thank you for the follow ' + name + '. Here\'s the Top Post on r/ProgrammerHumor!! ';
    const errorMessage = `@${streamName} Oooooeeee it looks like my developer didn\'t account for this error, shame on him!`
    dlGifs(msg, errorMessage);
}

function dlGifs(msg, errorMessage){
  snooper.watcher.getListingWatcher('programmerhumor', {
    listing: 'top_day',
    limit: 1
  }).on('item' , function(post){
    let urlmatch = post.data.url.match('\.([a-zA-Z]+$)');
    if(post.kind === 't3' && urlmatch){
      var file_dir = "./funny/"+post.data.title;
      request(post.data.thumbnail).pipe(fs.createWriteStream(file_dir)
    ).on('finish', function(){
      try{
        upLoadMediaTwitter(file_dir, msg);                
      }
      catch (err){
        errorMediaTwitterUpload(errorMessage);        
      }
    });
    }
  });
}

function upLoadMediaTwitter(file_dir, msg){
  //sets the media upload to a variable
  var media_upload = fs.readFileSync(file_dir, {encoding: 'base64'});
  //deletes the file after its initial use
  fs.unlinkSync(file_dir, (err)=>{
    if(err) throw err;
  });
  //starts posting to twitter
  T.post('media/upload', {media_data: media_upload}, function(err ,data, response){
    if(err) throw err;
    var mediaIdStr = data.media_id_string;
    var altText = "Twitter Bot Response";
    var meta_params = { media_id: mediaIdStr, alt_text: {text: altText} }
    T.post('media/metadata/create', meta_params, function(err, data, response){
        if(err) throw err;
        var params = {status: msg, media_ids: [mediaIdStr]}
        T.post('statuses/update', params, function(err, data, response){
          if(err) throw err;
          console.log('this was a success!');
        });
    });
  });
}

function errorMediaTwitterUpload(errorMessage){
  console.log('this is the errormessage!');
  T.post('statuses/update', { status: errorMessage }, function(err, data, response) {
    console.log('success!!');
  })
}
// tweetIt();
// setInterval(tweetIt, 1000*20);
