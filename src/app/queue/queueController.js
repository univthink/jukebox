(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('QueueController', function($scope, $routeParams, $uibModal, backendAPI, sharedRoomData) {

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
        backendAPI.getSongQueue({
          room_id: sharedRoomData.roomId,
          password: sharedRoomData.password,
        }).success(function(data) {
          if (data.status === 'OK') {
            sharedRoomData.roomName = data.room_name;
            $scope.queueData = data.data;
          } else {
            console.log(data);
          }
        }).error(function(error) {
          event.source.itemScope.element[0].dataset.uuid
        });
      }

      getSongQueue();


         // * data = {
         // *   room_id: String,       (required)
         // *   user_id: String,       (required)
         // *   password: String,      (optional)
         // *   song_id: String,       (required) // this is the backend uuid (source independent)
         // *   new_pos: String,       (required) // new position in the queue
         // * }

      function changeSongPosition(songId, newPos) {
        backendAPI.reorderSong({
          room_id: sharedRoomData.roomId,
          user_id: sharedRoomData.userId,
          password: sharedRoomData.password,
          song_id: songId,
          new_pos: newPos,
        }).success(function(data) {
          console.log(data);
        }).error(function(data) {
          console.log(error);
        });
      }

      // TODO: only allow if admin
      $scope.dragControlListeners = {
        accept: function (sourceItemHandleScope, destSortableScope) {
          return true; //override to determine drag is allowed or not. default is true.
        },
        itemMoved: function (event) {},
        orderChanged: function(event) {
          var songId = event.source.itemScope.element[0].dataset.uuid;
          var newPos = event.dest.index;
          changeSongPosition(songId, newPos);
        },
        //containment: '#board', //optional param.
        //clone: true, //optional param for clone feature.
        //allowDuplicates: false, //optional param allows duplicates to be dropped.
      };

      // $scope.dragControlListeners1 = {
      //   //containment: '#board', //optional param.
      //   allowDuplicates: true, //optional param allows duplicates to be dropped.
      // };

  });

})();