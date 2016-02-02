(function () {
  'use strict';

  angular
    .module('jukebox.jb-footer', [])
    .directive('jbFooter', jbFooter);

  function jbFooter() {
    console.log('footer!');
  }

})();