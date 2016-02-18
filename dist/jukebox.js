(function () {
  'use strict';

  angular
    .module('jukebox', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'as.sortable', 'ngTouch', 'ngCookies'])
    .config(routeProvider);

  function routeProvider($routeProvider) {
    $routeProvider
      .when('/:roomId/s', {
        controller: 'SearchController',
        templateUrl: 'search/search.html'
      })
      .when('/:roomId', {
        controller: 'QueueController',
        templateUrl: 'queue/queue.html'
      })
      .when('/', {
        controller: 'HomeController',
        templateUrl: 'home/home.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  }

})();
// angular.module('jukebox', [
//   'ngRoute',
//   'jukebox.todo'
// ])
// .config(function ($routeProvider) {
//   'use strict';
//   $routeProvider
//     .when('/todo', {
//       controller: 'TodoCtrl',
//       templateUrl: '/jukebox/todo/todo.html'
//     })
//     .otherwise({
//       redirectTo: '/todo'
//     });
// });

(function () {

    'use strict';

    angular
        .module('jukebox')
        .factory('sharedRoomData', function() {
            var data = {
                roomId: '',
                roomName: '',
                passwordProtected: false,
                roomPassword: '',
                userId: '',
                userName: '',
                queue: {},
            }
            return data;
        });

})();
(function () {

  'use strict';

  angular
    .module('jukebox')
    .directive('plusButton', plusButton);

  function plusButton() {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        roomId: '='
      },
      templateUrl: 'common/plusButton/plusButton.html',
      controller: ['$scope', function($scope) {
        // TODO(justin): Update this to get roomId from sharedRoomData instead of scope
      }]
    };
  }

})();
(function () {

  'use strict';

  angular
    .module('jukebox')
    .directive('header', header);

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
(function () {

  'use strict';

  angular
    .module('jukebox')
    .directive('footer', footer);

  function footer() {
    return {
      restrict: 'A',
      replace: true,
      scope: {

      },
      templateUrl: 'common/footer/footer.html'
    };
  }

})();
(function () {

    'use strict';

    angular
        .module('jukebox')
        .factory('backendAPI', ['$http', function($http) {

        var urlBase = '/api';
        var backendAPI = {};

        // The application/json to application/x-www-form-urlencoded workaround is from here:
        // http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/

        // Use x-www-form-urlencoded Content-Type
        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        // $http.defaults.headers.get = { 'Content-Type' : 'application/x-www-form-urlencoded;charset=utf-8' };

        /**
        * The workhorse; converts an object to x-www-form-urlencoded serialization.
        * @param {Object} obj
        * @return {String}
        */
        var param = function(obj) {
            var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

            for(name in obj) {
              value = obj[name];

              if(value instanceof Array) {
                for(i=0; i<value.length; ++i) {
                  subValue = value[i];
                  fullSubName = name + '[' + i + ']';
                  innerObj = {};
                  innerObj[fullSubName] = subValue;
                  query += param(innerObj) + '&';
                }
              }
              else if(value instanceof Object) {
                for(subName in value) {
                  subValue = value[subName];
                  fullSubName = name + '[' + subName + ']';
                  innerObj = {};
                  innerObj[fullSubName] = subValue;
                  query += param(innerObj) + '&';
                }
              }
              else if(value !== undefined && value !== null) {
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
              }
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        // Override $http service's default transformRequest
        // Transforms the response body data
        $http.defaults.transformRequest = [function(data) {
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        }];

        /* Register a user
         *
         * data = {
         *   username: String,      (required)
         * }
         *
         */
        backendAPI.registerUser = function(data) {
            return $http.post(urlBase + '/register_user', data);
        };

        /* Change username
         *
         * data = {
         *   user_id: String,       (required)
         *   name: String,          (required) // new user name
         * }
         *
         */
        backendAPI.changeUsername = function(data) {
            return $http.post(urlBase + '/change_username', data);
        };

        /* Join a room
         *
         * data = {
         *   room_id: String,       (required)
         *   user_id: String,       (required)
         *   password: String,      (optional)
         * }
         *
         */
        backendAPI.joinRoom = function(data) {
            return $http.post(urlBase + '/join_room', data);
        };

        /* Get a song queue
         *
         * data = {
         *   room_id: String,       (required)
         *   password: String,      (optional)
         * }
         *
         */
        backendAPI.getSongQueue = function(data) {
            return $http({
                method: 'GET',
                url: urlBase + '/get_song_queue',
                params: data, // params =/= data
            });
        };

        /* Add a song to the queue
         *
         * data = {
         *   room_id: String,       (required)
         *   user_id: String,       (required)
         *   password: String,      (optional)
         *   url: String,           (required) // for Spotify, this must be the uri
         *   track: String,         (required) // name of the song
         *   artist: String,        (required)
         *   album: String,         (required) // name of the album
         *   album_art_url: String, (required) // link to an image (png or jpg) of the album art
         * }
         *
         */
        backendAPI.addSong = function(data) {
            return $http.post(urlBase + '/submit_song', data);
        };

        /* Reorder a song in the queue
         *
         * data = {
         *   room_id: String,       (required)
         *   user_id: String,       (required)
         *   password: String,      (optional)
         *   song_id: String,       (required) // this is the backend uuid (source independent)
         *   new_pos: String,       (required) // new position in the queue
         * }
         *
         */
        backendAPI.reorderSong = function(data) {
            return $http.post(urlBase + '/reorder_song', data);
        };

        /* Delete a song from the queue
         *
         * data = {
         *   room_id: String,       (required)
         *   user_id: String,       (required)
         *   password: String,      (optional)
         *   song_id: String,       (required)
         * }
         *
         */
        backendAPI.deleteSong = function(data) {
            return $http.post(urlBase + '/delete_song', data);
        };

        return backendAPI;
    }]);

})();
(function () {

  'use strict';

  angular
    .module('jukebox')
    .directive('search', search);

  function search() {
    return {
      restrict: 'A',
      replace: true,
      scope: {

      },
      templateUrl: 'search/search.html',
      controller: ['$scope', function($scope) {

      }]
    };
  }

})();
(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('SearchController', searchController);

  function searchController($scope, $routeParams, $http, backendAPI, sharedRoomData) {
    $scope.pageClass = 'search-page';

    $scope.roomId = $routeParams.roomId;

    $scope.myData = {};
    $scope.myData.spotify = {};
    // $scope.myData.soundcloud = {};

    $scope.myData.sendQuery = function() {
      //spotify API
      var spotifyResponsePromise = $http.get('https://api.spotify.com/v1/search', {
        'params' : {
          'q' : $scope.searchText,
          'type' : 'track'
        }
      });
      spotifyResponsePromise.success(function(data) {
        $scope.myData.spotify.results = data.tracks.items;
      });
      spotifyResponsePromise.error(function() {
        $scope.myData.spotify = {};
        console.log('ERROR returning results from spotify');
      });

      // // soundcloud API
      // var clientId = '09ae0464d724195b755f6205f2753390';
      // var soundcloudResponsePromise = $http.get('http://api.soundcloud.com/tracks/', {
      //   'params' : {
      //     'q' : $scope.searchText,
      //     'client_id' : clientId
      //   }
      // });
      // soundcloudResponsePromise.success(function(data) {
      //   $scope.myData.soundcloud.results = data;
      // });
      // soundcloudResponsePromise.error(function() {
      //   $scope.myData.soundcloud = {};
      //   console.log('AJAX failed!');
      // });
    };

    // TODO: this is duplicate code from queueController, it should be made into a service
    function getSongQueue() {
      backendAPI.getSongQueue({
        room_id: sharedRoomData.roomId,
        password: sharedRoomData.password,
      }).success(function(data) {
        if (data.status === 'OK') {
          sharedRoomData.roomName = data.room_name;
          sharedRoomData.queue = data.data;
          console.log('OK backendAPI.getSongQueue', data);
        } else {
          console.log('NOT OK backendAPI.getSongQueue', data);
        }
      }).error(function(error) {
        console.log('ERROR backendAPI.getSongQueue', error);
      });
    }

    $scope.addSong = function(url, name, artist, album, album_art_url) {

        backendAPI.addSong({
          room_id: sharedRoomData.roomId,
          user_id: sharedRoomData.userId,
          password: sharedRoomData.password,
          url: url,
          track: name,
          artist: artist,
          album: album,
          album_art_url: album_art_url
        }).success(function(data) {
          if (data.status === 'OK') {
            $('#slide-bottom-popup').modal('hide'); // TODO: Don't do this
            // refresh song queue, call getSongQueue() from queueController
            getSongQueue(); // TODO: make this a service
            console.log('OK backendAPI.addSong', data);
          } else {
            console.log('NOT OK backendAPI.addSong', data);
          }
        }).error(function(error) {
          console.log('ERROR backendAPI.addSong', error);
        });

    }
  }

})();
(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('QueueController', function($scope, $routeParams, $cookies, backendAPI, sharedRoomData) {
      $scope.pageClass = 'queue-page';

      $scope.room = sharedRoomData;
      sharedRoomData.roomId = $routeParams.roomId;
      $scope.roomId = sharedRoomData.roomId; //TODO(kyle): Remove this after plusButton.directive.js has been updated by justin

      // TODO: move this elsewhere
      var POTENTIAL_USERNAMES = ['banana', 'apple', 'peach', 'mango', 'cherry', 'grape', 'pear', 'plum', 'pineapple', 'kiwi'];

      sharedRoomData.userId = $cookies.get('jb_user_id'); // TODO: think about moving this to sharedRoomData factory initialization
      sharedRoomData.userName = $cookies.get('jb_user_name');
      sharedRoomData.password = $cookies.get(sharedRoomData.roomId) ? $cookies.get(sharedRoomData.roomId) : '';

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
          if (data.status === 'OK') {
            sharedRoomData.userId = data.data;
            $cookies.put('jb_user_name', sharedRoomData.userName);
            $cookies.put('jb_user_id', sharedRoomData.userId);
            joinRoom();
            console.log('OK backendAPI.registerUser', data);
          } else {
            console.log('NOT OK backendAPI.registerUser', data);
          }
        }).error(function(error) {
          console.log('ERROR backendAPI.registerUser', error);
        })
      }

      // TODO: All of these should probably be moved to a separate service...
      function joinRoom() {
        backendAPI.joinRoom({
          room_id: sharedRoomData.roomId,
          user_id: sharedRoomData.userId,
          password: sharedRoomData.password,
        }).success(function(data) {
          if (data.status === 'OK') {
            console.log('OK backendAPI.joinRoom', data);
            getSongQueue();
          } else {
            if (data.message == "The correct password was not provided.") { // TODO: reuse this code below?
              sharedRoomData.passwordProtected = true;
              sharedRoomData.password = window.prompt("Enter the password:");
              $cookies.put(sharedRoomData.roomId, sharedRoomData.password);
              joinRoom();
            }
            console.log('NOT OK backendAPI.joinRoom', data);
          }
        }).error(function(error) {
          console.log('ERROR backendAPI.joinRoom', error);
        });
      }

      function getSongQueue() {
        backendAPI.getSongQueue({
          room_id: sharedRoomData.roomId,
          password: sharedRoomData.password,
        }).success(function(data) {
          if (data.status === 'OK') {
            sharedRoomData.roomName = data.room_name;
            sharedRoomData.queue = data.data;
            console.log('OK backendAPI.getSongQueue', data);
          } else {
            if (data.message == "The correct password was not provided.") {
              sharedRoomData.passwordProtected = true;
              sharedRoomData.password = window.prompt("Enter the password:");
              $cookies.put(sharedRoomData.roomId, sharedRoomData.password);
              getSongQueue();
            }
            console.log('NOT OK backendAPI.getSongQueue', data);
          }
        }).error(function(error) {
          console.log('ERROR backendAPI.getSongQueue', error);
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
          if (data.status === 'OK') {
            console.log('OK backendAPI.reorderSong', data);
            getSongQueue();
          } else {
            console.log('NOT OK backendAPI.reorderSong', data);
          }
        }).error(function(data) {
          console.log('ERROR backendAPI.reorderSong', error);
        });
      }

      function deleteSong(songId) {
        backendAPI.deleteSong({
          room_id: sharedRoomData.roomId,
          user_id: sharedRoomData.userId,
          password: sharedRoomData.password,
          song_id: songId,
        }).success(function(data) {
          if (data.status === 'OK') {
            console.log('OK backendAPI.deleteSong', data);
            getSongQueue();
          } else {
            console.log('NOT OK backendAPI.deleteSong', data);
          }
        }).error(function(data) {
          console.log('ERROR backendAPI.deleteSong', error);
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
(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('HomeController', homeController);

  function homeController($scope) {
    $scope.pageClass = 'home-page';
  }

})();
(function(module) {
try {
  module = angular.module('jukebox');
} catch (e) {
  module = angular.module('jukebox', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/jukebox/home/home.html',
    '<div class="home-page"><div class="jb-icon"><svg><use xlink:href="#plus-icon"></use></svg></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('jukebox');
} catch (e) {
  module = angular.module('jukebox', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/jukebox/queue/queue.html',
    '<div class="container"><div header currently-playing="room.queue[0]"></div><div ng-if="queueData.length > 0"><span>Your Song Queue</span></div><div class="song-queue" data-as-sortable="dragControlListeners" data-ng-model="room.queue"><div ng-repeat="song in room.queue"><div class="song-queue-item noselect" data-uuid="{{ song.unique_id }}" data-as-sortable-item ng-swipe-left="showDeleteButton = true" ng-swipe-right="showDeleteButton = false"><img src="{{ song.image_url }}" class="song-image"><div class="song-info"><div class="song-title">{{ song.track }}</div><div class="song-artist">{{ song.artist }}</div><div class="song-user">@{{ song.submitter }}</div></div><i class="fa fa-th-list drag-button" ng-show="!showDeleteButton" data-as-sortable-item-handle></i> <i class="fa fa-trash fa-lg delete-button" ng-show="showDeleteButton" ng-click="deleteSong($event)"></i></div></div></div></div><div plus-button room-id="roomId"></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('jukebox');
} catch (e) {
  module = angular.module('jukebox', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/jukebox/search/search.html',
    '<div class="search-wrapper"><div class="search-header-items"><div class="search-header-item close"><a href="#/{{ roomId }}"><span>Cancel</span></a></div><div class="search-header-item search"><input id="song-search-box" type="search" ng-model="searchText" ng-model-options="{ debounce: 500 }" ng-change="myData.sendQuery()" autofocus></div></div><div class="song-search-results"><div ng-if="myData.spotify.results.length > 0"><span>Spotify Results</span></div><div ng-repeat="result in myData.spotify.results"><div ng-click="addSong(result.uri, result.name, result.artists[0].name, result.album.name, result.album.images[0].url)" class="song-search-result"><img src="{{ result.album.images[0].url }}" class="song-image"><div class="song-info"><div class="song-title">{{ result.name }}</div><div class="song-artist">{{ result.artists[0].name }}</div></div></div></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('jukebox');
} catch (e) {
  module = angular.module('jukebox', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/jukebox/common/footer/footer.html',
    '<div class="footer"><div class="footer-label"><span>Jukebox App</span></div><div class="footer-copyright"><span>&copy; 2016, All rights reserved.</span></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('jukebox');
} catch (e) {
  module = angular.module('jukebox', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/jukebox/common/header/header.html',
    '<div class="header"><div class="header-info"><div class="header-label song"><span>{{ currentlyPlaying.track }}</span></div><div class="header-label artist"><span>{{ currentlyPlaying.artist }}</span></div></div><div class="record-player"><div class="record" ng-if="currentlyPlaying"><img src="{{ currentlyPlaying.image_url }}"></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('jukebox');
} catch (e) {
  module = angular.module('jukebox', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/jukebox/common/plusButton/plusButton.html',
    '<a href="#/{{ roomId }}/s" class="plus-button"><div class="plus-icon"><svg><use xlink:href="#plus-icon"></use></svg></div></a>');
}]);
})();
