let express = require('express');
let router = express.Router();
let passport = require('../routes/local_passport').passport;
let checkAuthentication = require('../routes/local_passport').checkAuthentication;
let request = require('request');

let user_tracks = require('../models/user_tracks.shema');
let User = require('../models/user.schema');

let SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId : '71e49b60be2a48e8b1a76601aeb2fa4f',
  clientSecret : '89b012a523e34993a1d6d21fa5a70a53'
});

let spotifyToken;

const _ = require('lodash');

spotifyApi.clientCredentialsGrant().then(function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  spotifyToken = data.body['access_token'];
  }, function(err) {
    console.log('Something went wrong when retrieving an access token', err);
  });


router.get('/searchTrackByName',checkAuthentication, function(req,res) {
  spotifyApi.searchTracks(req.query.name).then(function(data) {
    res.json({status:200,tracks:data.body});
  }, function(err) {
    res.json({status:404,error:err});
  });
});

router.get('/searchTrackByArtistName',checkAuthentication, function(req,res) {
  spotifyApi.searchTracks(req.query.name).then(function(data) {
    res.json({status:200,tracks:data.body});
  }, function(err) {
    res.json({status:404,error:err});
  });
});

router.get('/searchPlayList',checkAuthentication, function(req,res) {
  spotifyApi.searchPlaylists(req.query.name).then(function(data) {
    res.json({status:200,tracks:data.body});
  }, function(err) {
    res.json({status:404,error:err});
  });
});

router.get('/getAlbumTracks',checkAuthentication, function(req,res) {
  spotifyApi.getAlbumTracks(req.query.albumName, { limit : req.query.limit, offset : 1 })
    .then(function(data) {
      res.json({status:200,tracks:data.body});
    }, function(err) {
      res.json({status:404,error:err});
    });
});

router.get('/getArtistAlbums',checkAuthentication, function(req,res) {
  spotifyApi.getArtistAlbums(req.query.artistAlbum)
    .then(function(data) {
      res.json({status:200,tracks:data.body});
    }, function(err) {
      res.json({status:404,error:err});
    });
});

router.get('/getNewReleases', checkAuthentication, function(req, res){
  spotifyApi.getNewReleases({ limit : req.query.limit, offset: 0, country: req.query.country}) ///"AD","AR","AT","AU","BE","BG","BO","BR","CA","CH","CL","CO","CR",
  // "CY","CZ","DE","DK","DO","EC","EE","ES","FI","FR","GB","GR","GT",
  // "HK","HN","HU","ID","IE","IL","IS","IT","JP","LI","LT","LU","LV","MC","MT","MX","MY","NI","NL","NO","NZ",
  // "PA","PE","PH","PL","PT","PY","RO","SE","SG","SK","SV","TH","TR","TW","US","UY","VN","ZA"
    .then(function(data) {
      res.json({status:200,tracks: data.body});
    }, function(err) {
      res.json({status:400,error: err});
    });
});

// Get Playlists for a Category (Party in Brazil)
router.get('/getPlaylistForCategory', checkAuthentication, function(req, res){
  spotifyApi.getPlaylistsForCategory(req.query.сategory, {
    country: req.query.country,
    limit : req.query.limit,
    offset : 0
  }).then(function(data) {
    res.json({status:200,tracks: data.body});
  }, function(err) {
    res.json({status:400,error: err});
  });
});

router.post('/createPlaylist', checkAuthentication, function(req, res){
  user_tracks.findOne({id: req.decoded._id}, function (err, playlist) {
   if(!playlist){
     res.json({status:404,error:"not found"});
   }else {
     playlist.update({$push:{playlist:{playlistName:req.body.playlistName}}},{safe: true, new: true},function(err){
       if(err){
         res.json({status:404,error:err});
       }
       res.json({status:200,inf:playlist});
     });
   }
  });
});

router.post('/addTrackToPlaylist', checkAuthentication, function(req, res){
  user_tracks.findOne({id: req.decoded._id}, function (err, data) {
    if((req.body.playlistName)&&(req.body.tracksName)&&(req.body.artistName)&&(req.body.albumName)&&(req.body.duration_ms)&&(req.body.preview_url)){
      let playlist = _.find(data.playlist, {playlistName: req.body.playlistName});
      if(playlist === undefined){
        res.json({status:404,error:'playlist not defined'});
      }else {
        playlist.tracks.push({'trackName':req.body.tracksName,'artistName':req.body.artistName,'albumName':req.body.albumName,'duration_ms':req.body.duration_ms,'preview_url':req.body.preview_url});
        data.save(function (err) {
          if(err){res.send(err)}
          res.json({status:200,});
        });
      }
    }else{
      res.json({status:404,error:'please add all information'});
    }

  });
});

router.post('/removeTrackFromPlaylist', checkAuthentication, function(req, res){
  user_tracks.findOne({id: req.decoded._id}, function (err, data) {
    let playlist = _.find(data.playlist, {playlistName: req.body.playlistName});

    playlist.tracks.forEach(function (element, index) {
        if(element.trackName === req.body.trackName){
          playlist.tracks.splice(index,1);
        }
    });

    data.save(function (err) {
      if(err){res.send(err)}
        res.json(data);
    });
  });
});

router.get('/home', checkAuthentication, function(req, res){
  res.json({status:200,user:req.decoded});
});

router.post('/changePassword', checkAuthentication, function(req, res){
  User.findOne({ _id: req.decoded._id }, function (err, user) {
    user.setPassword(req.body.password);
    user.save();
    res.json({status:200,user:'you changed you password'});
  });
});

router.post('/changeNameAndEmail', checkAuthentication, function(req, res){
  if((req.body.name) && (req.body.email)){
    User.findOneAndUpdate({_id: req.decoded._id},{name:req.body.name,email:req.body.email}, { safe: true, new: true },function(err,user){
      if(err){
        res.json({status:404,error:err});
      }
      res.json({status:200,user:user});
    });
  }else if(req.body.name){
    User.findOneAndUpdate({_id: req.decoded._id},{name:req.body.name}, { safe: true, new: true },function(err,user){
      if(err){
        res.json({status:404,error:err});
      }
      res.json({status:200,user:user});
    });
  }else if(req.body.email){
    User.findOneAndUpdate({_id: req.decoded._id},{email:req.body.email}, { safe: true, new: true },function(err,user){
      if(err){
        res.json({status:404,error:err});
      }
      res.json({status:200,user:user});
    });
  }else{
    res.json({status:404,error:'please write information'});
  }
});

router.get('/deleteUser', checkAuthentication, function(req, res){
  User.remove({ _id: req.decoded._id }, function (err) {
    if (!err) {
      res.clearCookie('token');
      req.logout();
      res.json({status:200,user:'user deleted'});
    }else{
      res.json({status:500,error:err});
    }
  });
});

module.exports = router;