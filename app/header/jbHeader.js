(function () {
  'use strict';

  angular
    .module('jukebox.jbHeader', [])
    .directive('jbHeader', jbHeader);

  function jbHeader() {
    var directive = {
      templateUrl: 'header/jbHeader.html'
    }
    return directive;
  }

})();