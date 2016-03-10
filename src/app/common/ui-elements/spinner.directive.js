(function () {

  'use strict';

  angular
    .module('jukebox')
    .directive('spinner', spinner);

  function spinner() {
    return {
      restrict: 'A',
      replace: true,
      template: '<div class="spinner"> <!-- kudos to Tobias Ahlin! [http://tobiasahlin.com/spinkit/] --> <div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>'
    };
  }

})();