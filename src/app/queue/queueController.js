(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('QueueController', function($scope, $routeParams, $http, backendAPI) { // TODO: Remove $http when song search is moved to a separate factory

      $scope.status = '';
      $scope.roomId = $routeParams.roomId;

      var test_uid = '5629499534213120';
      // var test_password = 'pickplay';

      // Example usage of backendAPI factory
      function joinRoom() {
        backendAPI.joinRoom({
          room_id: $scope.roomId,
          user_id: test_uid //'5838406743490560', // TODO: Update this
          //password: '', TODO: Update this
        }).success(function(data) {
          console.log(data);
          if (data.status === 'NOT OK') {
            $scope.status = data.message;
          } else {
            console.log('Join room was a success!');
            console.log(data);
          }
        }).error(function(error) {
          $scope.status = error.message;
        });
      }

      joinRoom();
  });

})();