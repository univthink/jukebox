(function () {

  'use strict';

  angular
    .module('jukebox')
    .directive('header', header)
    .filter('spotifyEmbedUrl', function($sce) {
      return function(spotifyUri) {
        return $sce.trustAsResourceUrl('https://embed.spotify.com/?uri=' + spotifyUri);
      };
    });

  function header() {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        currentlyPlaying: '='
      },
      templateUrl: 'common/header/header.html'
    };
  }

})();