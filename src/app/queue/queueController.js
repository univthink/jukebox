(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('QueueController',
      function($scope, $routeParams, $uibModal, backendAPI, sharedRoomData) {

        $scope.status = '';
        $scope.queueData = {};

        sharedRoomData.roomId = $routeParams.roomId;
        $scope.roomId = sharedRoomData.roomId;

        sharedRoomData.password = ''; // TODO: update when we ask user
        sharedRoomData.userId = '5629499534213120';
        sharedRoomData.userName = 'kyle';

        // Example usage of backendAPI factory
        function joinRoom() {
          backendAPI.joinRoom({
            room_id: sharedRoomData.roomId,
            user_id: sharedRoomData.userId,
            password: sharedRoomData.password,
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

        // joinRoom();

        function getSongQueue() {
          console.log(sharedRoomData.roomId);
          backendAPI.getSongQueue({
            room_id: '5066549580791808',
            password: sharedRoomData.password,
          }).success(function(data) {
            if (data.status === 'OK') {
              sharedRoomData.roomName = data.room_name;
              $scope.queueData = data.data;
              console.log(data.data);
            } else {
              console.log('Error', data);
            }
          }).error(function(error) {
            console.log(error);
          });
        }

        getSongQueue();

  });

})();