(function () {
  /*jslint node: true */
  'use strict';

  var SpotifyWebApi = require("spotify-web-api-node");

  var spotifyApi = new SpotifyWebApi({
    clientId : '39903cb10e0a4f6da882d6c53db62776',
    clientSecret : '96193ae482b04d1c882b80b0091a8666',
    redirectUri: 'https://letsjukebox.com/'
  });

  module.exports = function(app) {
    app.get('/browse', function(req, res) {
      // Retrieve an access token
      spotifyApi.clientCredentialsGrant()
        .then(function(data) {
          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body['access_token']);
          spotifyApi.getFeaturedPlaylists()
            .then(function(data) {
              var topPlaylist = data.body.playlists.items[0];
              spotifyApi.getPlaylistTracks(topPlaylist.owner.id, topPlaylist.id)
                .then(function(data) {
                  res.send(data.body.items);
                }), function(err) {
                  console.log('something went wrong');
                }
            }), function (err) {
              console.log('something went wrong');
            }
        }, function(err) {
          console.log('Something went wrong when retrieving an access token', err.message);
        });
      
    });
  };
})();
