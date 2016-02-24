(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('YoutubeController', function($scope, $http, $sce) {

      $scope.yt_id = '';
      console.log($scope.currentlyPlaying);

      var yt_api_key = 'AIzaSyALGbklexv5u7P3zjV4xJCYfEYLwwukfkE';
      console.log("youtube loaded.");

      getMusicVideos()
        .success(function(data) {
          console.log(data);
          if (data.items.length >= 1) {
            $scope.yt_id = data.items[0].id.videoId;
          }
        })
        .error(function(error) {
          console.log(error);
        })

      function getMusicVideos() {
        return $http({
          url: 'https://www.googleapis.com/youtube/v3/search',
          method: 'GET',
          params: {
            part: 'snippet',
            key: yt_api_key,
            q: 'Kanye,West,Blood,on,the,leaves',
            type: 'video',
            videoEmbeddable: 'true',
          }
        });
      }

      function youtubeEmbedUrl(youtubeVideoId) {
        return $sce.trustAsResourceUrl('http://www.youtube.com/embed/' + youtubeVideoId + '?autoplay=1&origin=http://letsjukebox.com/');
      }

    });

})();