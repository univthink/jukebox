(function () {
  'use strict';

  angular
    .module('jukebox.queue', [])
    .directive('queue', queue);

    function queue() {
      var directive = {
        templateUrl: 'queue/queue.html'
      }
      return directive;
    }
})();