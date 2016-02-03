(function () {
  'use strict';

  angular
    .module('jukebox.jbFooter', [])
    .directive('jbFooter', jbFooter);

  function jbFooter() {
    var directive = {
      templateUrl: '/footer/jbFooter.html'
    }
    return directive;
  }

})();