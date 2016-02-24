(function () {

  'use strict';

  angular
    .module('jukebox')
    .directive('youtube', youtube)
    .filter('youtubeEmbedUrl', function($sce) {
      return function(youtubeVideoId) {
        return $sce.trustAsResourceUrl('http://www.youtube.com/embed/' + youtubeVideoId + '?autoplay=1&origin=http://letsjukebox.com/');
      };
    });

  function youtube() {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        currentlyPlaying: '='
      },
      templateUrl: 'common/youtube/youtube.html',
      controller: 'YoutubeController'
    };
  }

})();