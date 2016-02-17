(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('QueueController', function($scope, $routeParams, $cookies, backendAPI, sharedRoomData) {
      $scope.pageClass = 'queue-page';

      $scope.status = '';
      $scope.room = sharedRoomData;
      $scope.roomId = $routeParams.roomId;

      sharedRoomData.roomId = $routeParams.roomId;

      // TODO: move this elsewhere
      var POTENTIAL_USERNAMES = ['banana', 'apple', 'peach', 'mango', 'cherry', 'grape', 'pear', 'plum', 'pineapple', 'kiwi'];

      sharedRoomData.userId = $cookies.get('jb_user_id');
      sharedRoomData.userName = $cookies.get('jb_user_name');
      if (!sharedRoomData.userId || !sharedRoomData.userName) {
        sharedRoomData.userName = POTENTIAL_USERNAMES[Math.floor(Math.random()*POTENTIAL_USERNAMES.length)];
        console.log("Your username will be", sharedRoomData.userName);
        createUser(sharedRoomData.userName);
      } else {
        console.log("You already have a username! It is", sharedRoomData.userName);
        joinRoom(); // join room if you haven't already
      }

      function createUser(name) {
        backendAPI.registerUser({
          username: name,
        }).success(function(data) {
          sharedRoomData.userId = data.data;
          $cookies.put('jb_user_name', sharedRoomData.userName);
          $cookies.put('jb_user_id', sharedRoomData.userId);
          joinRoom();
          console.log('createUser ->', data);
        }).error(function(error) {
          console.log(error);
        })
      }

      // Example usage of backendAPI factory
      // TODO: All of these should probably be moved to a separate service...
      function joinRoom() {
        backendAPI.joinRoom({
          room_id: sharedRoomData.roomId,
          user_id: sharedRoomData.userId,
          password: $cookies.get(sharedRoomData.roomId) ? $cookies.get(sharedRoomData.roomId) : sharedRoomData.password,
        }).success(function(data) {
          console.log(data);
          if (data.status === 'OK') {
            console.log('SUCCESS joinRoom ->', data);
            getSongQueue();
          } else {
            if (data.message == "The correct password was not provided.") { // TODO: reuse this code below?
              sharedRoomData.passwordProtected = true;
              sharedRoomData.password = window.prompt("Enter the password:");
              $cookies.put(sharedRoomData.roomId, sharedRoomData.password);
              joinRoom();
            } else {
              console.log('FAIL joinRoom ->', data);
            }
          }
        }).error(function(error) {
          $scope.status = error.message;
        });
      }

      function getSongQueue() {
        backendAPI.getSongQueue({
          room_id: sharedRoomData.roomId,
          password: $cookies.get(sharedRoomData.roomId) ? $cookies.get(sharedRoomData.roomId) : sharedRoomData.password,
        }).success(function(data) {
          if (data.status === 'OK') {
            sharedRoomData.roomName = data.room_name;
            sharedRoomData.queue = data.data;
            console.log('SUCCESS getSongQueue ->', data);
          } else {
            if (data.message == "The correct password was not provided.") {
              sharedRoomData.passwordProtected = true;
              sharedRoomData.password = window.prompt("Enter the password:");
              $cookies.put(sharedRoomData.roomId, sharedRoomData.password);
              getSongQueue();
            } else {
              console.log('FAIL getSongQueue ->', data);
            }
          }
        }).error(function(error) {
          console.log(error);
        });
      }

      function changeSongPosition(songId, newPos) {
        backendAPI.reorderSong({
          room_id: sharedRoomData.roomId,
          user_id: sharedRoomData.userId,
          password: sharedRoomData.password,
          song_id: songId,
          new_pos: newPos,
        }).success(function(data) {
          console.log('changeSongPosition ->',data);
          getSongQueue();
        }).error(function(data) {
          console.log(error);
        });
      }

      function deleteSong(songId) {
        backendAPI.deleteSong({
          room_id: sharedRoomData.roomId,
          user_id: sharedRoomData.userId,
          password: sharedRoomData.password,
          song_id: songId,
        }).success(function(data) {
          console.log('deleteSong ->', data);
          getSongQueue();
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

      $scope.deleteSong = function($event) {
        var songId = $event.target.parentElement.dataset.uuid; // another, slower, way: angular.element($event.target).parent()
        deleteSong(songId);
      }

  });

})();