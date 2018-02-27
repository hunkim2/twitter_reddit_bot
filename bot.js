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

function dlGifs(msg){
  snooper.watcher.getListingWatcher('programmerhumor', {
    listing: 'top_day',
    limit: 1
  }).on('item' , function(post){
    let urlmatch = post.data.url.match('\.([a-zA-Z]+$)');
    if(post.kind === 't3' && urlmatch){
      var file_dir = "./funny/"+post.data.title;
      request(post.data.thumbnail).pipe(fs.createWriteStream(file_dir)
    ).on('finish', function(){
      upLoadMediaTwitter(file_dir, msg);
    });
    }
  });
}

function followed(eventMsg){
    var streamName = eventMsg.source.screen_name;
    var name = eventMsg.source.name;
    var msg = '@' + streamName + ' ooooooeeeee thank you for the follow ' + name + '. Here\'s the Top Post on r/ProgrammerHumor!! ';
    dlGifs(msg);
}

function upLoadMediaTwitter(file_dir, msg){
  //sets the media upload to a variable
  var media_upload = fs.readFileSync(file_dir, {encoding: 'base64'});
  //deletes the file after its initial use
  // fs.unlinkSync(file_dir, (err)=>{
  //   if(err) throw err;
  //   console.log('successfully deleted!');
  // });
  //starts posting to twitter
  T.post('media/upload', {media_data: media_upload}, function(err ,data, response){
    if(err){
      console.log('There was an error!', err);
    }else{
      var mediaIdStr = data.media_id_string;
      var altText = "Twitter Bot Response";
      var meta_params = { media_id: mediaIdStr, alt_text: {text: altText} }
      T.post('media/metadata/create', meta_params, function(err, data, response){
        if(!err){
          var params = {status: msg, media_ids: [mediaIdStr]}
          T.post('statuses/update', params, function(err, data, response){
            if(err){
              console.log('this was the error: ', err);
            }
            console.log('this was a success!');
          });
        }
        else if(err){
          console.log('this is the error: ', err);
        }
      });
    }
  });
}

// tweetIt();
// setInterval(tweetIt, 1000*20);
