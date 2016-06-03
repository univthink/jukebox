'use strict';

(function () {
  'use strict';

  angular.module('jukebox', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'as.sortable', 'ngTouch', 'ngCookies', 'matchMedia', 'spotify']).directive('compile', function ($compile, $timeout) {
    return {
      restrict: 'A',
      link: function link(scope, elem, attrs) {
        $timeout(function () {
          $compile(elem.contents())(scope);
        });
      }
    };
  }).config(['$compileProvider', '$routeProvider', '$locationProvider', 'SpotifyProvider', function ($compileProvider, $routeProvider, $locationProvider, SpotifyProvider) {

    $compileProvider.debugInfoEnabled(false);

    $routeProvider.when('/dataviz', {
      controller: 'DatavizController',
      templateUrl: 'dataviz/dataviz.html'
    }).when('/spotify_login', {
      templateUrl: 'dataviz/spotify_login.html'
    }).when('/:roomId', {
      controller: 'QueueController',
      templateUrl: 'queue/queue.html'
    }).when('/', {
      controller: 'HomeController',
      templateUrl: 'home/home.html'
    }).otherwise({
      redirectTo: '/'
    });

    // use the HTML5 History API
    $locationProvider.html5Mode(true);

    SpotifyProvider.setClientId('39903cb10e0a4f6da882d6c53db62776');
    //SpotifyProvider.setRedirectUri('http://127.0.0.1:8080/spotify_login/');
    SpotifyProvider.setRedirectUri('http://localhost:8080/spotify_login/');
    SpotifyProvider.setScope('user-library-read user-top-read');
    // If you already have an auth token
    // SpotifyProvider.setAuthToken('zoasliu1248sdfuiknuha7882iu4rnuwehifskmkiuwhjg23');
  }]);
})();
'use strict';

(function () {

  'use strict';

  angular.module('jukebox').controller('GraphControlsController', graphControlsController);

  function graphControlsController($scope) {
    $scope.changeXAxisCategory = function () {
      console.log($scope.xAxisCategory);
    };
    $scope.changeYAxisCategory = function () {
      for (var i = 0; i < $scope.musicTracks.length; i++) {
        $scope.musicTracks[i]["y_category"] = $scope.musicTracks[i]["audio_features"][$scope.yAxisCategory];
      }
      $scope.updateGraph();
    };
    $scope.changeTopTimePeriod = function () {
      document.getElementById("mygraph").classList = [];
      document.getElementById("mygraph").classList.add($scope.selectedTimePeriod);
      $scope.toggleHiddenNonTopTracks();
    };
    $scope.toggleHiddenNonTopTracks = function () {
      if ($scope.nonTopTracksHidden) document.getElementById("mygraph").classList.add("hide-non-top");else {
        document.getElementById("mygraph").classList.remove("hide-non-top");
      }
    };
  }
})();
'use strict';

(function () {

  'use strict';

  angular.module('jukebox').controller('GraphController', graphController);

  function graphController($scope) {
    $scope.selectedTimePeriod = "long_term";
    $scope.xAxisCategory = "time";
    $scope.yAxisCategory = "energy";
    // Adopted from here: https://github.com/bhargavavn/Scatterplot_zoom/blob/master/scatter.html

    // Set the dimensions of the svg / graph
    var margin = {
      top: 50,
      right: 20,
      bottom: 30,
      left: 60
    };
    var padding = 50;
    var width = 1000 - margin.left - margin.right;
    var height = 450 - margin.top - margin.bottom;

    // Parse the date / time
    // e.g. "2016-03-02T07:22:01Z"
    var parseDate = d3.time.format.iso.parse;

    // Set the ranges
    var x = d3.time.scale().range([padding, width]);
    var y = d3.scale.linear().range([padding / 2, height]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x).orient("top").ticks(5).tickSize(8);
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5).tickSize(8);

    // Adds the svg svg
    var svg = d3.select(".mydiv").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var div = d3.select(".mydiv").append("div").attr("class", "tooltip").style("opacity", 0);

    // Get the data
    var data = $scope.musicTracks;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var d = _step.value;

        d["date"] = parseDate(d["added_at"]);
        d["y_category"] = d["audio_features"][$scope.yAxisCategory];
      }

      // Scale the range of the data
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    x.domain(d3.extent(data, function (d) {
      return d.date;
    }));
    y.domain([0, d3.max(data, function (d) {
      return d["y_category"];
    }) + 0.1]);
    //y.domain([0, 1]);
    //y.domain([0, d3.max(data, function(d) { return d.close; })]);

    // Zoom selection
    svg.append("rect").attr("width", width + margin.left + margin.right + padding).attr("height", height + margin.top + margin.bottom + padding);

    svg.selectAll("dot").data(data).enter().append("circle").attr("class", "dot").attr("class", function (d) {
      if (d["is_top"].length > 0) {
        return "top " + d["is_top"].join(" ");
      }
    }).attr("r", 8).style("opacity", 0.6).attr("cx", function (d) {
      return x(d.date);
    }).attr("cy", function (d) {
      return y(d["y_category"]);
    }).on("mouseover", function (d) {
      d3.select(this)
      //.attr("r", (2 * d3.select(this).attr("r")))
      .attr("r", 16).classed("selected", true);
      div.transition().duration(200).style("opacity", .7).attr("r", 30);
      div.html(d.name + '<br>' + d.artists[0].name)
      // TODO: Fix the tooltip placement
      // .style("left", d3.select(this).attr("cx") + "px")
      // .style("top", (d3.select(this).attr("cy") - parseInt(div.node().getBoundingClientRect()["height"]) + "px"));
      .style("left", d3.event.pageX + 10 + "px").style("top", d3.event.pageY - parseInt(div.node().getBoundingClientRect()["height"] + 10) + "px");
      //.style("top", (d3.event.pageY - parseInt(getComputedStyle(div).getPropertyValue("height")) + "px"));
      //.style("top", (d3.event.pageY - parseInt(div.style("height"))) + "px");
    }).on("mouseout", function (d) {
      d3.select(this)
      //.attr("r", (d3.select(this).attr("r") / 2))
      .attr("r", 8).classed("selected", false);
      // TODO: IDEA: Expand to be the album art!
      div.transition().duration(500).style("opacity", 0);
    }).on("click", function (d) {
      $scope.playSelectedSong(d.name, d.artists[0].name);
    });

    // Add the X Axis
    svg.append("g").attr("class", "x axis").call(xAxis);

    // Add the Y Axis
    svg.append("g").attr("class", "y axis").call(yAxis);

    // Call funtion zoom
    svg.call(d3.behavior.zoom().x(x).y(y).on("zoom", zoom));

    // Zoom into data (.dot)
    function zoom() {
      // console.log(d3.event.scale);
      svg.selectAll("circle")
      //.attr("r", (8 * d3.event.scale))
      .classed("animate", false).attr("cx", function (d) {
        return x(d.date);
      }).attr("cy", function (d) {
        return y(d["y_category"]);
      });
      d3.select('.x.axis').call(xAxis);
      d3.select('.y.axis').call(yAxis);
    }

    $scope.updateGraph = function () {
      // x.domain(d3.extent(data, function(d) { return d.date; }));
      // y.domain([0, d3.max(data, function(d) { return d["y_category"]; }) + 0.1]);
      // d3.select('.x.axis').call(xAxis);
      // d3.select('.y.axis').call(yAxis);
      svg.selectAll("circle").classed("animate", true).attr("cx", function (d) {
        return x(d.date);
      }).attr("cy", function (d) {
        return y(d["y_category"]);
      });
      d3.select('.x.axis').call(xAxis);
      d3.select('.y.axis').call(yAxis);
    };
  }
})();
'use strict';

(function () {

  'use strict';

  angular.module('jukebox').controller('YoutubeController', YoutubeController).filter('youtubeEmbedUrl', function ($sce) {
    return function (youtubeVideoId) {
      return $sce.trustAsResourceUrl('http://www.youtube.com/embed/' + youtubeVideoId + '?autoplay=1&iv_load_policy=3&origin=http://letsjukebox.com/');
    };
  });

  function YoutubeController($scope, $rootScope, $http, $sce, sharedRoomData) {

    var yt_api_key = 'AIzaSyALGbklexv5u7P3zjV4xJCYfEYLwwukfkE';

    $scope.room = sharedRoomData;
    $scope.yt_video_id = '';
    var firstTrackUUID = '';

    // TODO: Reimplement these!

    // $rootScope.$watch('responsiveVersion', function() {
    //   updateVideoToCurrentTopTrack();
    // });

    // $scope.$watch('room.queue', function() {
    //   updateVideoToCurrentTopTrack();
    // });

    $scope.$on('updateVideoEvent', function (event, track_name, artist_name) {
      updateCurrentVideo(track_name, artist_name);
    });

    function updateCurrentVideo(track_name, artist_name) {
      getMusicVideos(track_name, artist_name).success(function (data) {
        // console.log('OK YoutubeController.updateCurrentVideo', data);
        if (data.items.length >= 1) {
          $scope.yt_video_id = data.items[0].id.videoId;
        }
      }).error(function (error) {
        console.log('ERROR YoutubeController.updateCurrentVideo', error);
      });
    }

    function updateVideoToCurrentTopTrack() {
      if ($rootScope.responsiveVersion == 'mobile' && $scope.yt_video_id === '') return; // don't query on mobile
      if ($scope.room.queue[0].unique_id == firstTrackUUID) return; // no need to requery youtube if the query hasn't changed
      firstTrackUUID = sharedRoomData.queue[0].unique_id;
      getMusicVideos($scope.room.queue[0].track, $scope.room.queue[0].artist).success(function (data) {
        console.log('OK YoutubeController.updateVideoToCurrentTopTrack', data);
        if (data.items.length >= 1) {
          $scope.yt_video_id = data.items[0].id.videoId;
        }
      }).error(function (error) {
        console.log('ERROR YoutubeController.updateVideoToCurrentTopTrack', error);
      });
    }

    function getMusicVideos(track_name, artist_name) {
      return $http({
        url: 'https://www.googleapis.com/youtube/v3/search',
        method: 'GET',
        params: {
          part: 'snippet',
          key: yt_api_key,
          q: track_name + ' ' + artist_name,
          type: 'video',
          videoEmbeddable: 'true'
        }
      });
    }
  }
})();
'use strict';

(function () {

  'use strict';

  angular.module('jukebox').directive('spinner', spinner);

  function spinner() {
    return {
      restrict: 'A',
      replace: true,
      template: '<div class="spinner"> <!-- kudos to Tobias Ahlin! [http://tobiasahlin.com/spinkit/] --> <div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>'
    };
  }
})();
'use strict';

(function () {

    'use strict';

    angular.module('jukebox').factory('sharedRoomData', function () {
        var data = {
            roomId: '',
            roomName: '',
            allAdmin: false,
            passwordProtected: false,
            roomPassword: '',
            userId: '',
            userName: '',
            loaded: false,
            queue: {},
            trending: []
        };
        return data;
    });
})();
'use strict';

(function () {

  'use strict';

  angular.module('jukebox').directive('plusButton', plusButton);

  function plusButton() {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'common/plusButton/plusButton.html',
      controller: ['$scope', '$uibModal', function ($scope, $uibModal) {
        $scope.showSearch = function () {
          $uibModal.open({
            templateUrl: 'search/search.html',
            controller: 'SearchController',
            windowClass: 'search-page',
            keyboard: false
          });
        };
      }]
    };
  }
})();
'use strict';

(function () {

  'use strict';

  angular.module('jukebox').directive('header', header).filter('spotifyEmbedUrl', function ($sce) {
    return function (spotifyUri) {
      return $sce.trustAsResourceUrl('https://embed.spotify.com/?uri=' + spotifyUri);
    };
  });

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
'use strict';

(function () {

  'use strict';

  angular.module('jukebox').directive('footer', footer);

  function footer() {
    return {
      restrict: 'A',
      replace: true,
      scope: {},
      templateUrl: 'common/footer/footer.html'
    };
  }
})();
'use strict';

(function () {

    'use strict';

    angular.module('jukebox').factory('backendAPI', ['$http', function ($http) {

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
        var param = function param(obj) {
            var query = '',
                name,
                value,
                fullSubName,
                subName,
                subValue,
                innerObj,
                i;

            for (name in obj) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value !== undefined && value !== null) {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        // Override $http service's default transformRequest
        // Transforms the response body data
        $http.defaults.transformRequest = [function (data) {
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        }];

        /* Register a user
         *
         * data = {
         *   username: String,      (required)
         * }
         *
         */
        backendAPI.registerUser = function (data) {
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
        backendAPI.changeUsername = function (data) {
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
        backendAPI.joinRoom = function (data) {
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
        backendAPI.getSongQueue = function (data) {
            return $http({
                method: 'GET',
                url: urlBase + '/get_song_queue',
                params: data });
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
        // params =/= data
        backendAPI.addSong = function (data) {
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
        backendAPI.reorderSong = function (data) {
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
        backendAPI.deleteSong = function (data) {
            return $http.post(urlBase + '/delete_song', data);
        };

        /* Search for rooms
         *
         * data = {
         *   coordinates: String,   (optional)  // e.g. '37.4243622,-122.1472004'
         *   distance: String,      (optional)  // defaults to '1000'
         *   member_id: String,     (optional)
         *   name: String,          (optional)
         *   creator_id: String,    (optional)
         * }
         *
         */
        backendAPI.searchRooms = function (data) {
            return $http.post(urlBase + '/search_room', data);
        };

        backendAPI.getTrendingSongs = function () {
            return $http.get(urlBase + '/get_trending_songs');
        };

        return backendAPI;
    }]);
})();
'use strict';

(function () {

  'use strict';

  angular.module('jukebox').directive('search', search);

  function search() {
    return {
      restrict: 'A',
      replace: true,
      scope: {},
      templateUrl: 'search/search.html',
      controller: ['$scope', function ($scope) {}]
    };
  }
})();
'use strict';

(function () {

  'use strict';

  angular.module('jukebox').controller('SearchController', searchController);

  function searchController($scope, $routeParams, $http, backendAPI, sharedRoomData, $uibModalInstance) {
    $scope.roomId = $routeParams.roomId;

    $scope.querying = true;
    $scope.myData = {};
    $scope.myData.spotify = {};
    // $scope.myData.soundcloud = {};

    $scope.myData.spotify.suggestions = sharedRoomData.trending;

    $scope.myData.sendQuery = function () {
      //spotify API
      $scope.querying = true;
      var spotifyResponsePromise = $http.get('https://api.spotify.com/v1/search', {
        'params': {
          'q': $scope.searchText,
          'type': 'track'
        }
      });
      spotifyResponsePromise.success(function (data) {
        $scope.querying = false;
        console.log('OK SearchController.sendQuery', data);
        //$scope.myData.spotify.query = data.tracks.href.split("?")[1].split("&")[0].split("=")[1];
        $scope.myData.spotify.results = data.tracks.items;
      });
      spotifyResponsePromise.error(function () {
        $scope.querying = false;
        $scope.myData.spotify.results = null;
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
        password: sharedRoomData.password
      }).success(function (data) {
        if (data.status === 'OK') {
          sharedRoomData.roomName = data.room_name;
          sharedRoomData.queue = data.data;
          console.log('OK backendAPI.getSongQueue', data);
        } else {
          console.log('NOT OK backendAPI.getSongQueue', data);
        }
      }).error(function (error) {
        console.log('ERROR backendAPI.getSongQueue', error);
      });
    }

    $scope.closeSearch = function () {
      $uibModalInstance.close();
    };

    $scope.addSong = function (url, name, artist, album, album_art_url) {
      backendAPI.addSong({
        room_id: sharedRoomData.roomId,
        user_id: sharedRoomData.userId,
        password: sharedRoomData.password,
        url: url,
        track: name,
        artist: artist,
        album: album,
        album_art_url: album_art_url
      }).success(function (data) {
        if (data.status === 'OK') {
          getSongQueue(); // TODO: make this a service
          console.log('OK backendAPI.addSong', data);
        } else {
          console.log('NOT OK backendAPI.addSong', data);
        }
        $scope.closeSearch();
      }).error(function (error) {
        console.log('ERROR backendAPI.addSong', error);
      });
    };
  }
})();
'use strict';

(function () {

  'use strict';

  angular.module('jukebox').controller('QueueController', function ($scope, $rootScope, $interval, $routeParams, $cookies, $uibModal, backendAPI, sharedRoomData, screenSize) {

    $scope.pageClass = 'queue-page';
    var inEditMode = false;
    var autoRefreshQueue = undefined;
    var QUEUE_REFRESH_RATE = 3000; // in ms

    $rootScope.responsiveVersion = screenSize.is('xs, sm') ? 'mobile' : 'desktop';
    // angular-match-media: updates the variable on window resize
    $scope.mobile = screenSize.on('xs, sm', function (match) {
      $scope.mobile = match;
      $rootScope.responsiveVersion = match ? 'mobile' : 'desktop';
    });

    $scope.room = sharedRoomData;
    sharedRoomData.roomId = $routeParams.roomId;
    $scope.roomId = sharedRoomData.roomId; //TODO(kyle): Remove this after plusButton.directive.js has been updated by justin

    // TODO: move this elsewhere
    var POTENTIAL_USERNAMES = ['BlueTrout', 'YellowDuck', 'RedHerring', 'BoredMoose', 'SillyWhale', 'OrangeEagle', 'VelvetMouse', 'GreenMonkey', 'VioletLobster', 'ConfusedTucan', 'WileySloth'];

    sharedRoomData.userId = $cookies.get('jb_user_id'); // TODO: think about moving this to sharedRoomData factory initialization
    sharedRoomData.userName = $cookies.get('jb_user_name');
    sharedRoomData.password = $cookies.get(sharedRoomData.roomId) ? $cookies.get(sharedRoomData.roomId) : '';

    if (!sharedRoomData.userId || !sharedRoomData.userName) {
      var autoGeneratedUsername = POTENTIAL_USERNAMES[Math.floor(Math.random() * POTENTIAL_USERNAMES.length)];
      promptForUsername(autoGeneratedUsername);
    } else {
      console.log("You already have a username! It is " + sharedRoomData.userName);
      joinRoom(); // join room if you haven't already
    }

    backendAPI.getTrendingSongs().success(function (data) {
      if (data.status === 'OK') {
        console.log('OK backendAPI.getTrendingSongs', data);
        sharedRoomData.trending = data.data.map(function (e) {
          return e.track;
        });
      } else {
        console.log('NOT OK backendAPI.getTrendingSongs', data);
      }
    }).error(function (error) {
      console.log('ERROR backendAPI.getTrendingSongs', error);
    });

    function promptForUsername(placeholder) {
      var modalInstance = $uibModal.open({
        templateUrl: 'common/ui-elements/defaultModal.html',
        controller: ['$scope', '$sce', '$uibModalInstance', 'sharedRoomData', function ($scope, $sce, $uibModalInstance, sharedRoomData) {
          //$scope.aliasInput = placeholder;
          $scope.modal_title = 'Enter Your Alias';
          $scope.modal_body_html = $sce.trustAsHtml('<span>@</span><input type="text" ng-model="aliasInput" class="form-control" autofocus required />');
          $scope.primary_btn_text = 'CONTINUE';
          $scope.ok = function () {
            if (!$scope.aliasInput || /[^a-zA-Z0-9]/.test($scope.aliasInput)) return; // check if alphanumeric
            $uibModalInstance.close();
            sharedRoomData.userName = $scope.aliasInput;
            createUser(sharedRoomData.userName);
          };
        }],
        backdrop: 'static',
        windowClass: 'default',
        keyboard: false // prevent closing the modal with the escape key
      });
    }

    function createUser(name) {
      backendAPI.registerUser({
        username: name
      }).success(function (data) {
        if (data.status === 'OK') {
          sharedRoomData.userId = data.data;
          $cookies.put('jb_user_name', sharedRoomData.userName);
          $cookies.put('jb_user_id', sharedRoomData.userId);
          joinRoom();
          console.log('OK backendAPI.registerUser', data);
        } else {
          console.log('NOT OK backendAPI.registerUser', data);
        }
      }).error(function (error) {
        console.log('ERROR backendAPI.registerUser', error);
      });
    }

    // TODO: All of these should probably be moved to a separate service...
    function joinRoom() {
      backendAPI.joinRoom({
        room_id: sharedRoomData.roomId,
        user_id: sharedRoomData.userId,
        password: sharedRoomData.password
      }).success(function (data) {
        if (data.status === 'OK') {
          console.log('OK backendAPI.joinRoom', data);
          getSongQueue();
        } else {
          if (data.message === "The correct password was not provided.") {
            // TODO: reuse this code below?
            sharedRoomData.passwordProtected = true;
            sharedRoomData.password = window.prompt("Enter the password:");
            $cookies.put(sharedRoomData.roomId, sharedRoomData.password);
            joinRoom();
          }
          console.log('NOT OK backendAPI.joinRoom', data);
        }
      }).error(function (error) {
        console.log('ERROR backendAPI.joinRoom', error);
      });
    }

    function getSongQueue() {
      backendAPI.getSongQueue({
        room_id: sharedRoomData.roomId,
        password: sharedRoomData.password
      }).success(function (data) {
        if (data.status === 'OK') {
          console.log('OK backendAPI.getSongQueue', data);
          sharedRoomData.roomName = data.room_name;
          sharedRoomData.queue = data.data;
          sharedRoomData.allAdmin = data.all_admin == '1' ? true : false;
          sharedRoomData.loaded = true;
          // start interval if it hasn't been started already
          if (!autoRefreshQueue) {
            autoRefreshQueue = $interval(function () {
              if (!inEditMode) getSongQueue();
            }, QUEUE_REFRESH_RATE);
          }
          //console.log('OK backendAPI.getSongQueue', data);
        } else {
            if (data.message === "The correct password was not provided.") {
              sharedRoomData.passwordProtected = true;
              sharedRoomData.password = window.prompt("Enter the password:");
              $cookies.put(sharedRoomData.roomId, sharedRoomData.password);
              getSongQueue();
            }
            console.log('NOT OK backendAPI.getSongQueue', data);
          }
      }).error(function (error) {
        console.log('ERROR backendAPI.getSongQueue', error);
      });
    }

    function changeSongPosition(songId, newPos) {
      backendAPI.reorderSong({
        room_id: sharedRoomData.roomId,
        user_id: sharedRoomData.userId,
        password: sharedRoomData.password,
        song_id: songId,
        new_pos: newPos
      }).success(function (data) {
        if (data.status === 'OK') {
          console.log('OK backendAPI.reorderSong', data);
          getSongQueue();
        } else {
          console.log('NOT OK backendAPI.reorderSong', data);
        }
      }).error(function (data) {
        console.log('ERROR backendAPI.reorderSong', error);
      });
    }

    function deleteSong(songId) {
      backendAPI.deleteSong({
        room_id: sharedRoomData.roomId,
        user_id: sharedRoomData.userId,
        password: sharedRoomData.password,
        song_id: songId
      }).success(function (data) {
        if (data.status === 'OK') {
          console.log('OK backendAPI.deleteSong', data);
          getSongQueue();
        } else {
          console.log('NOT OK backendAPI.deleteSong', data);
        }
      }).error(function (data) {
        console.log('ERROR backendAPI.deleteSong', error);
      });
    }

    // TODO: only allow if admin
    $scope.dragControlListeners = {
      accept: function accept(sourceItemHandleScope, destSortableScope) {
        return true; //override to determine drag is allowed or not. default is true.
      },
      dragStart: function dragStart(event) {
        inEditMode = true;
      },
      dragEnd: function dragEnd(event) {
        inEditMode = false;
      },
      orderChanged: function orderChanged(event) {
        var songId = event.source.itemScope.element[0].dataset.uuid;
        var newPos = event.dest.index;
        changeSongPosition(songId, newPos);
      },
      containment: '.song-queue'
      //clone: true, //optional param for clone feature.
      //allowDuplicates: false, //optional param allows duplicates to be dropped.
    };

    // $scope.dragControlListeners1 = {
    //   //containment: '#board', //optional param.
    //   allowDuplicates: true, //optional param allows duplicates to be dropped.
    // };

    $scope.deleteSong = function ($event) {
      var songId = $event.target.parentElement.dataset.uuid; // another, slower, way: angular.element($event.target).parent()
      deleteSong(songId);
    };
  });
})();
'use strict';

(function () {

  'use strict';

  angular.module('jukebox').controller('HomeController', homeController);

  function homeController($scope, $location, backendAPI, $http) {

    var GEOLOCATION_TIMEOUT = 30; // in seconds
    var OLDEST_CACHED_GEOLOCATION_TO_ACCEPT = 60; // in seconds

    $scope.pageClass = 'home-page';
    $scope.coordinates = [];

    // $scope.logoFill = 'black';

    function getLocation(callbackOnSuccess, callbackOnFailure) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          $scope.logoFill = 'url(#lg)';
          console.log('Location acquired.');
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          $scope.coordinates = [lat, lng];
          console.log($scope.coordinates);
          if (callbackOnSuccess) callbackOnSuccess();
        }, function () {
          if (callbackOnFailure) callbackOnFailure();
        }, { timeout: GEOLOCATION_TIMEOUT * 1000 }, { maximumAge: OLDEST_CACHED_GEOLOCATION_TO_ACCEPT * 1000 } // I'm not sure if this is helpful
        );
      } else {
          if (callbackOnFailure) callbackOnFailure(); // browser/device does not support geolocation
        }
    }

    getLocation(function () {
      // success
      backendAPI.searchRooms({
        coordinates: $scope.coordinates[0] + ',' + $scope.coordinates[1],
        distance: '10000'
      }).success(function (data) {
        if (data.status === 'OK') {
          console.log('OK backendAPI.searchRooms', data);
          if (data.data.length >= 1) {
            $location.path(data.data[0].id);
          } else {
            console.log('No nearby rooms available.');
          }
        } else {
          console.log('NOT OK backendAPI.searchRooms', data);
        }
      }).error(function (data) {
        console.log('NOT OK backendAPI.searchRooms', data);
      });
    }, function () {
      // failure
      console.log("Could not get location.");
    });
  }
})();
'use strict';

(function () {

  'use strict';

  angular.module('jukebox').controller('DatavizController', datavizController);

  function datavizController($scope, $http, Spotify) {

    $scope.pageClass = 'dataviz-page';
    $scope.musicLoadingIsComplete = false;
    $scope.getSongsClicked = false;
    $scope.musicData = {}; // maps spotify ids to data objects
    $scope.musicTracks = [];
    $scope.savedTrackList = [];
    $scope.topTracks = {
      "long_term": {},
      "medium_term": {},
      "short_term": {}
    };

    Spotify.login();

    $scope.login = function () {
      Spotify.login();
    };

    // Helper functions
    // TODO: Move these to a separate file / service.
    function isEmpty(obj) {
      return Object.keys(obj).length === 0;
    }

    $scope.getSongs = function () {
      $scope.getSongsClicked = true;
      getSavedTracksFromSpotify(0, 50);
    };

    $scope.playSelectedSong = function (track_name, artist_name) {
      $scope.$broadcast('updateVideoEvent', track_name, artist_name);
    };

    $scope.$watch('featureRequestsToMake', function () {
      //console.log($scope.featureRequestsToMake);
      if ($scope.featureRequestsToMake == 0) {
        console.log("Music loading is complete!", $scope.musicData);
        $scope.musicTracks = Object.keys($scope.musicData).map(function (key) {
          return $scope.musicData[key];
        });
        $scope.musicLoadingIsComplete = true;
      }
    });

    $scope.$watch('topTracks', function () {
      // listener function
      if (!isEmpty($scope.topTracks["long_term"]) && !isEmpty($scope.topTracks["medium_term"]) && !isEmpty($scope.topTracks["short_term"])) {
        console.log("All top tracks finished loading!", $scope.topTracks);
        // getAudioFeaturesFromTracks($scope.savedTrackList);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = $scope.savedTrackList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            var track_obj = item.track;
            track_obj["added_at"] = item["added_at"];
            track_obj["is_top"] = [];
            if ($scope.topTracks["long_term"][track_obj.id]) track_obj["is_top"].push("long_term");
            if ($scope.topTracks["medium_term"][track_obj.id]) track_obj["is_top"].push("medium_term");
            if ($scope.topTracks["short_term"][track_obj.id]) track_obj["is_top"].push("short_term");
            $scope.musicData[track_obj.id] = track_obj;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        addAudioFeaturesToTracks(Object.keys($scope.musicData));
      }
    }, true);

    function getTracksAudioFeatures(track_ids_str, offset, idList) {
      Spotify.getTracksAudioFeatures(track_ids_str).then(function (data) {
        $scope.featureRequestsToMake -= 1;
        for (var j = 0; j < data["audio_features"].length; j++) {
          if (offset + 1 == idList.length) {
            // last run of getTracks
            if (idList[idList.length - idList.length % 100 + j] != data["audio_features"][j].id) console.log("There is a problem at ", offset, j);
            $scope.musicData[idList[idList.length - idList.length % 100 + j]]["audio_features"] = data["audio_features"][j];
          } else if ((offset + 1) % 100 == 0) {
            // mid run of getTracks
            if (idList[offset + 1 - 100 + j] != data["audio_features"][j].id) console.log("There is a problem at ", offset, j);
            $scope.musicData[idList[offset + 1 - 100 + j]]["audio_features"] = data["audio_features"][j];
          } else {
            console.log("This should never happen...");
          }
        }
      }).catch(function (e) {
        console.log("Something went wrong!");
        console.log(e); // "oh, no!"
      });
    }

    function addAudioFeaturesToTracks(idList) {
      $scope.featureRequestsToMake = Math.ceil(idList.length / 100);
      console.log($scope.featureRequestsToMake);
      var track_ids_str = "";
      for (var i = 0; i < idList.length; i++) {
        track_ids_str += idList[i] + ',';
        if ((i + 1) % 100 == 0 || i + 1 == idList.length) {
          track_ids_str = track_ids_str.slice(0, -1);
          getTracksAudioFeatures(track_ids_str, i, idList);
          track_ids_str = "";
        }
      }
    }

    function getSavedTracksFromSpotify(offset, limit) {
      Spotify.getSavedUserTracks({ "offset": offset, "limit": limit }).then(function (data) {
        console.log(offset, data.items);
        $scope.savedTrackList = $scope.savedTrackList.concat(data.items);
        if (data.items.length < limit) {
          console.log('Saved tracks finished loading!', $scope.savedTrackList);
          getTopTracksFromSpotify();
          return true;
        }
        setTimeout(function () {
          getSavedTracksFromSpotify(offset + limit, limit);
        }, 100);
      }).catch(function (e) {
        console.log("Something went wrong!");
        console.log(e); // "oh, no!"
      });
    }

    function getTopTracksFromSpotify() {
      Spotify.getUserTopTracks({ "limit": 50, "time_range": "long_term" }).then(function (data) {
        for (var i = 0; i < data.items.length; i++) {
          $scope.topTracks["long_term"][data.items[i].id] = data.items[i];
        }
        // console.log('Top tracks: long_term', $scope.topTracks["long_term"]);
        return true;
      });
      Spotify.getUserTopTracks({ "limit": 50, "time_range": "medium_term" }).then(function (data) {
        for (var i = 0; i < data.items.length; i++) {
          $scope.topTracks["medium_term"][data.items[i].id] = data.items[i];
        }
        // console.log('Top tracks: medium_term', $scope.topTracks["medium_term"]);
        return true;
      });
      Spotify.getUserTopTracks({ "limit": 50, "time_range": "short_term" }).then(function (data) {
        for (var i = 0; i < data.items.length; i++) {
          $scope.topTracks["short_term"][data.items[i].id] = data.items[i];
        }
        // console.log('Top tracks: short_term', $scope.topTracks["short_term"]);
        return true;
      });
    }
  }
})();
'use strict';

(function (window, angular, undefined) {
  'use strict';

  angular.module('spotify', []).provider('Spotify', function () {

    // Module global settings.
    var settings = {};
    settings.clientId = null;
    settings.redirectUri = null;
    settings.scope = null;
    settings.authToken = null;

    this.setClientId = function (clientId) {
      settings.clientId = clientId;
      return settings.clientId;
    };

    this.getClientId = function () {
      return settings.clientId;
    };

    this.setAuthToken = function (authToken) {
      settings.authToken = authToken;
      return settings.authToken;
    };

    this.setRedirectUri = function (redirectUri) {
      settings.redirectUri = redirectUri;
      return settings.redirectUri;
    };

    this.getRedirectUri = function () {
      return settings.redirectUri;
    };

    this.setScope = function (scope) {
      settings.scope = scope;
      return settings.scope;
    };

    var utils = {};
    utils.toQueryString = function (obj) {
      var parts = [];
      angular.forEach(obj, function (value, key) {
        this.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
      }, parts);
      return parts.join('&');
    };

    /**
     * API Base URL
     */
    settings.apiBase = 'https://api.spotify.com/v1';

    this.$get = ['$q', '$http', '$window', function ($q, $http, $window) {

      function NgSpotify() {
        this.clientId = settings.clientId;
        this.redirectUri = settings.redirectUri;
        this.apiBase = settings.apiBase;
        this.scope = settings.scope;
        this.authToken = settings.authToken;
        this.toQueryString = utils.toQueryString;
      }

      function openDialog(uri, name, options, cb) {
        var win = window.open(uri, name, options);
        var interval = window.setInterval(function () {
          try {
            if (!win || win.closed) {
              window.clearInterval(interval);
              cb(win);
            }
          } catch (e) {}
        }, 1000);
        return win;
      }

      NgSpotify.prototype = {
        api: function api(endpoint, method, params, data, headers) {
          var deferred = $q.defer();

          //console.log(endpoint, method, params, data, headers);

          $http({
            url: this.apiBase + endpoint,
            method: method ? method : 'GET',
            params: params,
            data: data,
            headers: headers,
            withCredentials: false
          }).success(function (data) {
            deferred.resolve(data);
          }).error(function (data) {
            deferred.reject(data);
          });
          return deferred.promise;
        },

        _auth: function _auth(isJson) {
          var auth = {
            'Authorization': 'Bearer ' + this.authToken
          };
          if (isJson) {
            auth['Content-Type'] = 'application/json';
          }
          return auth;
        },

        /**
          ====================== Albums =====================
         */

        /**
         * Gets an album
         * Pass in album id or spotify uri
         */
        getAlbum: function getAlbum(album) {
          album = album.indexOf('spotify:') === -1 ? album : album.split(':')[2];

          return this.api('/albums/' + album);
        },

        /**
         * Gets an album
         * Pass in comma separated string or array of album ids
         */
        getAlbums: function getAlbums(albums) {
          albums = angular.isString(albums) ? albums.split(',') : albums;
          angular.forEach(albums, function (value, index) {
            albums[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
          });
          return this.api('/albums', 'GET', {
            ids: albums ? albums.toString() : ''
          });
        },

        /**
         * Get Album Tracks
         * Pass in album id or spotify uri
         */
        getAlbumTracks: function getAlbumTracks(album, options) {
          album = album.indexOf('spotify:') === -1 ? album : album.split(':')[2];

          return this.api('/albums/' + album + '/tracks', 'GET', options);
        },

        /**
          ====================== Artists =====================
         */

        /**
         * Get an Artist
         */
        getArtist: function getArtist(artist) {
          artist = artist.indexOf('spotify:') === -1 ? artist : artist.split(':')[2];

          return this.api('/artists/' + artist);
        },

        /**
         * Get multiple artists
         */
        getArtists: function getArtists(artists) {
          artists = angular.isString(artists) ? artists.split(',') : artists;
          angular.forEach(artists, function (value, index) {
            artists[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
          });
          return this.api('/artists/', 'GET', {
            ids: artists ? artists.toString() : ''
          });
        },

        //Artist Albums
        getArtistAlbums: function getArtistAlbums(artist, options) {
          artist = artist.indexOf('spotify:') === -1 ? artist : artist.split(':')[2];

          return this.api('/artists/' + artist + '/albums', 'GET', options);
        },

        /**
         * Get Artist Top Tracks
         * The country: an ISO 3166-1 alpha-2 country code.
         */
        getArtistTopTracks: function getArtistTopTracks(artist, country) {
          artist = artist.indexOf('spotify:') === -1 ? artist : artist.split(':')[2];

          return this.api('/artists/' + artist + '/top-tracks', 'GET', {
            country: country
          });
        },

        getRelatedArtists: function getRelatedArtists(artist) {
          artist = artist.indexOf('spotify:') === -1 ? artist : artist.split(':')[2];

          return this.api('/artists/' + artist + '/related-artists');
        },

        /**
          ====================== Browse =====================
         */
        getFeaturedPlaylists: function getFeaturedPlaylists(options) {
          return this.api('/browse/featured-playlists', 'GET', options, null, this._auth());
        },

        getNewReleases: function getNewReleases(options) {
          return this.api('/browse/new-releases', 'GET', options, null, this._auth());
        },

        getCategories: function getCategories(options) {
          return this.api('/browse/categories', 'GET', options, null, this._auth());
        },

        getCategory: function getCategory(category_id, options) {
          return this.api('/browse/categories/' + category_id, 'GET', options, null, this._auth());
        },

        getCategoryPlaylists: function getCategoryPlaylists(category_id, options) {
          return this.api('/browse/categories/' + category_id + '/playlists', 'GET', options, null, this._auth());
        },

        getRecommendations: function getRecommendations(options) {
          return this.api('/recommendations', 'GET', options, null, this._auth());
        },

        getAvailableGenreSeeds: function getAvailableGenreSeeds() {
          return this.api('/recommendations/available-genre-seeds', 'GET', null, null, this._auth());
        },

        /**
          ====================== Following =====================
         */
        following: function following(type, options) {
          options = options || {};
          options.type = type;
          return this.api('/me/following', 'GET', options, null, this._auth());
        },

        follow: function follow(type, ids) {
          return this.api('/me/following', 'PUT', { type: type, ids: ids }, null, this._auth());
        },

        unfollow: function unfollow(type, ids) {
          return this.api('/me/following', 'DELETE', { type: type, ids: ids }, null, this._auth());
        },

        userFollowingContains: function userFollowingContains(type, ids) {
          return this.api('/me/following/contains', 'GET', { type: type, ids: ids }, null, this._auth());
        },

        followPlaylist: function followPlaylist(userId, playlistId, isPublic) {
          return this.api('/users/' + userId + '/playlists/' + playlistId + '/followers', 'PUT', null, {
            public: isPublic || null
          }, this._auth(true));
        },

        unfollowPlaylist: function unfollowPlaylist(userId, playlistId) {
          return this.api('/users/' + userId + '/playlists/' + playlistId + '/followers', 'DELETE', null, null, this._auth());
        },

        playlistFollowingContains: function playlistFollowingContains(userId, playlistId, ids) {
          return this.api('/users/' + userId + '/playlists/' + playlistId + '/followers/contains', 'GET', {
            ids: ids.toString()
          }, null, this._auth());
        },

        /**
          ====================== Library =====================
         */
        getSavedUserTracks: function getSavedUserTracks(options) {
          return this.api('/me/tracks', 'GET', options, null, this._auth());
        },

        userTracksContains: function userTracksContains(tracks) {
          tracks = angular.isString(tracks) ? tracks.split(',') : tracks;
          angular.forEach(tracks, function (value, index) {
            tracks[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
          });
          return this.api('/me/tracks/contains', 'GET', {
            ids: tracks.toString()
          }, null, this._auth());
        },

        saveUserTracks: function saveUserTracks(tracks) {
          tracks = angular.isString(tracks) ? tracks.split(',') : tracks;
          angular.forEach(tracks, function (value, index) {
            tracks[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
          });
          return this.api('/me/tracks', 'PUT', {
            ids: tracks.toString()
          }, null, this._auth());
        },

        removeUserTracks: function removeUserTracks(tracks) {
          tracks = angular.isString(tracks) ? tracks.split(',') : tracks;
          angular.forEach(tracks, function (value, index) {
            tracks[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
          });
          return this.api('/me/tracks', 'DELETE', {
            ids: tracks.toString()
          }, null, this._auth(true));
        },

        saveUserAlbums: function saveUserAlbums(albums) {
          albums = angular.isString(albums) ? albums.split(',') : albums;
          angular.forEach(albums, function (value, index) {
            albums[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
          });
          return this.api('/me/albums', 'PUT', {
            ids: albums.toString()
          }, null, this._auth());
        },

        getSavedUserAlbums: function getSavedUserAlbums(options) {
          return this.api('/me/albums', 'GET', options, null, this._auth());
        },

        removeUserAlbums: function removeUserAlbums(albums) {
          albums = angular.isString(albums) ? albums.split(',') : albums;
          angular.forEach(albums, function (value, index) {
            albums[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
          });
          return this.api('/me/albums', 'DELETE', {
            ids: albums.toString()
          }, null, this._auth(true));
        },

        userAlbumsContains: function userAlbumsContains(albums) {
          albums = angular.isString(albums) ? albums.split(',') : albums;
          angular.forEach(albums, function (value, index) {
            albums[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
          });
          return this.api('/me/albums/contains', 'GET', {
            ids: albums.toString()
          }, null, this._auth());
        },

        /**
          ====================== Personalization =====================
         */
        getUserTopArtists: function getUserTopArtists(options) {
          options = options || {};
          return this.api('/me/top/artists', 'GET', options, null, this._auth());
        },

        getUserTopTracks: function getUserTopTracks(options) {
          options = options || {};
          return this.api('/me/top/tracks', 'GET', options, null, this._auth());
        },

        /**
          ====================== Playlists =====================
         */
        getUserPlaylists: function getUserPlaylists(userId, options) {
          return this.api('/users/' + userId + '/playlists', 'GET', options, null, {
            'Authorization': 'Bearer ' + this.authToken
          });
        },

        getPlaylist: function getPlaylist(userId, playlistId, options) {
          return this.api('/users/' + userId + '/playlists/' + playlistId, 'GET', options, null, this._auth());
        },

        getPlaylistTracks: function getPlaylistTracks(userId, playlistId, options) {
          return this.api('/users/' + userId + '/playlists/' + playlistId + '/tracks', 'GET', options, null, this._auth());
        },

        createPlaylist: function createPlaylist(userId, options) {
          return this.api('/users/' + userId + '/playlists', 'POST', null, options, this._auth(true));
        },

        addPlaylistTracks: function addPlaylistTracks(userId, playlistId, tracks, options) {
          tracks = angular.isArray(tracks) ? tracks : tracks.split(',');
          angular.forEach(tracks, function (value, index) {
            tracks[index] = value.indexOf('spotify:') === -1 ? 'spotify:track:' + value : value;
          });
          return this.api('/users/' + userId + '/playlists/' + playlistId + '/tracks', 'POST', {
            uris: tracks.toString(),
            position: options ? options.position : null
          }, null, this._auth(true));
        },

        removePlaylistTracks: function removePlaylistTracks(userId, playlistId, tracks) {
          tracks = angular.isArray(tracks) ? tracks : tracks.split(',');
          var track;
          angular.forEach(tracks, function (value, index) {
            track = tracks[index];
            tracks[index] = {
              uri: track.indexOf('spotify:') === -1 ? 'spotify:track:' + track : track
            };
          });
          return this.api('/users/' + userId + '/playlists/' + playlistId + '/tracks', 'DELETE', null, {
            tracks: tracks
          }, this._auth(true));
        },

        reorderPlaylistTracks: function reorderPlaylistTracks(userId, playlistId, options) {
          return this.api('/users/' + userId + '/playlists/' + playlistId + '/tracks', 'PUT', null, options, this._auth(true));
        },

        replacePlaylistTracks: function replacePlaylistTracks(userId, playlistId, tracks) {
          tracks = angular.isArray(tracks) ? tracks : tracks.split(',');
          var track;
          angular.forEach(tracks, function (value, index) {
            track = tracks[index];
            tracks[index] = track.indexOf('spotify:') === -1 ? 'spotify:track:' + track : track;
          });
          return this.api('/users/' + userId + '/playlists/' + playlistId + '/tracks', 'PUT', {
            uris: tracks.toString()
          }, null, this._auth(true));
        },

        updatePlaylistDetails: function updatePlaylistDetails(userId, playlistId, options) {
          return this.api('/users/' + userId + '/playlists/' + playlistId, 'PUT', null, options, this._auth(true));
        },

        /**
          ====================== Profiles =====================
         */

        getUser: function getUser(userId) {
          return this.api('/users/' + userId);
        },

        getCurrentUser: function getCurrentUser() {
          return this.api('/me', 'GET', null, null, this._auth());
        },

        /**
         * Search Spotify
         * q = search query
         * type = artist, album or track
         */
        search: function search(q, type, options) {
          options = options || {};
          options.q = q;
          options.type = type;

          return this.api('/search', 'GET', options);
        },

        /**
          ====================== Tracks =====================
         */
        getTrack: function getTrack(track) {
          track = track.indexOf('spotify:') === -1 ? track : track.split(':')[2];

          return this.api('/tracks/' + track);
        },

        getTracks: function getTracks(tracks) {
          tracks = angular.isString(tracks) ? tracks.split(',') : tracks;
          angular.forEach(tracks, function (value, index) {
            tracks[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
          });
          return this.api('/tracks/', 'GET', {
            ids: tracks ? tracks.toString() : ''
          });
        },

        getTrackAudioFeatures: function getTrackAudioFeatures(track) {
          track = track.indexOf('spotify:') === -1 ? track : track.split(':')[2];
          return this.api('/audio-features/' + track, 'GET', null, null, this._auth());
        },

        getTracksAudioFeatures: function getTracksAudioFeatures(tracks) {
          tracks = angular.isString(tracks) ? tracks.split(',') : tracks;
          angular.forEach(tracks, function (value, index) {
            tracks[index] = value.indexOf('spotify:') > -1 ? value.split(':')[2] : value;
          });
          return this.api('/audio-features/', 'GET', {
            ids: tracks ? tracks.toString() : ''
          }, null, this._auth());
        },

        /**
          ====================== Login =====================
         */
        setAuthToken: function setAuthToken(authToken) {
          this.authToken = authToken;
          return this.authToken;
        },

        login: function login() {
          var deferred = $q.defer();
          var that = this;

          var w = 400,
              h = 500,
              left = screen.width / 2 - w / 2,
              top = screen.height / 2 - h / 2;

          var params = {
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: this.scope || '',
            response_type: 'token'
          };

          var authCompleted = false;
          var authWindow = openDialog('https://accounts.spotify.com/authorize?' + this.toQueryString(params), 'Spotify', 'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=' + w + ',height=' + h + ',top=' + top + ',left=' + left, function () {
            if (!authCompleted) {
              deferred.reject();
            }
          });

          function storageChanged(e) {
            if (e.key === 'spotify-token') {
              if (authWindow) {
                authWindow.close();
              }
              authCompleted = true;

              that.setAuthToken(e.newValue);
              $window.removeEventListener('storage', storageChanged, false);

              deferred.resolve(e.newValue);
            }
          }

          $window.addEventListener('storage', storageChanged, false);

          return deferred.promise;
        }
      };

      return new NgSpotify();
    }];
  });
})(window, angular);
'use strict';

(function (module) {
  try {
    module = angular.module('jukebox');
  } catch (e) {
    module = angular.module('jukebox', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/jukebox/dataviz/dataviz.html', '<div class="dataviz-page"><div class="header"><div>Jukebox</div><button ng-click="login()">Login</button> <button ng-click="getSongs()">Get Songs</button></div><div ng-if="!getSongsClicked" class="explainer-text">Click Get Songs to get started. &mapstoup;</div><div ng-if="getSongsClicked && !musicLoadingIsComplete" spinner></div><div ng-controller="GraphController" ng-if="musicLoadingIsComplete"><div class="graph-view"><div id="mygraph" ng-class="selectedTimePeriod"><div class="mydiv"></div></div></div><div ng-controller="GraphControlsController"><div class="graph-controls-view"><div class="control-box"><div class="content">Top tracks from<select ng-model="selectedTimePeriod" ng-change="changeTopTimePeriod()" name="time-period"><option value="long_term">All time</option><option value="medium_term">Last 6 months</option><option value="short_term">Last 4 weeks</option></select><br>Hide non top tracks? <input type="checkbox" ng-change="toggleHiddenNonTopTracks()" name="hide-non-top" ng-model="nonTopTracksHidden"><br>Display tracks based on<br><select ng-model="yAxisCategory" ng-change="changeYAxisCategory()" name="y-axis-category"><option value="danceability">Danceability</option><option value="energy">Energy</option><option value="speechiness">Speechiness</option><option value="acousticness">Acousticness</option><option value="instrumentalness">Instrumentalness</option><option value="liveness">Liveness</option><option value="valence">Valence</option></select>x<select ng-model="xAxisCategory" ng-change="changeXAxisCategory()" name="x-axis-category"><option value="time">Date added</option></select></div></div></div></div></div><div ng-controller="YoutubeController"><div class="iframe-container"><iframe id="ytplayer" type="text/html" ng-src="{{ yt_video_id | youtubeEmbedUrl }}" frameborder="0" allowfullscreen></div></div></div>');
  }]);
})();

(function (module) {
  try {
    module = angular.module('jukebox');
  } catch (e) {
    module = angular.module('jukebox', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/jukebox/dataviz/spotify_login.html', '<script>var hash = window.location.hash;\n' + '  if (window.location.search.substring(1).indexOf("error") !== -1) {\n' + '    // login failure\n' + '    console.log("Spotify login failure.");\n' + '    window.close();\n' + '  } else if (hash) {\n' + '    var token = window.location.hash.split(\'&\')[0].split(\'=\')[1];\n' + '    if (token) {\n' + '      // login success\n' + '      console.log("Spotify login success.");\n' + '      localStorage.setItem(\'spotify-token\', token);\n' + '    } else {\n' + '      console.log("Spotify token is undefined.");\n' + '    }\n' + '  }</script>');
  }]);
})();

(function (module) {
  try {
    module = angular.module('jukebox');
  } catch (e) {
    module = angular.module('jukebox', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/jukebox/home/home.html', '<div class="home-page"><div class="jb-icon"><svg><lineargradient id="lg" x1="1" y1="1" x2="0" y2="0"><stop offset="0%" stop-opacity="1" stop-color="white"><stop offset="0%" stop-opacity="1" stop-color="white"><animate attributename="offset" values="0;1" fill="freeze" repeatcount="0" dur="5s" begin="0s"></stop><stop offset="0%" stop-opacity="1" stop-color="black"><animate attributename="offset" values="0;1" fill="freeze" repeatcount="0" dur="5s" begin="0s"></stop><stop offset="100%" stop-opacity="1" stop-color="black"></lineargradient><use xlink:href="#plus-icon"></use></svg></div></div>');
  }]);
})();

(function (module) {
  try {
    module = angular.module('jukebox');
  } catch (e) {
    module = angular.module('jukebox', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/jukebox/queue/queue.html', '<div class="desktop-content"><div ng-controller="YoutubeController" ng-if="room.queue[0] && !mobile"><div class="iframe-container"><iframe id="ytplayer" type="text/html" ng-src="{{ yt_video_id | youtubeEmbedUrl }}" frameborder="0" allowfullscreen></div></div></div><div class="queue-wrapper"><div ng-if="!room.loaded" spinner></div><div ng-if="room.loaded"><div header currently-playing="room.queue[0]"></div><div class="song-queue" data-as-sortable="dragControlListeners" data-ng-model="room.queue"><div ng-repeat="song in room.queue"><div class="song-queue-item noselect" data-uuid="{{ song.unique_id }}" data-as-sortable-item ng-swipe-left="showDeleteButton = true" ng-swipe-right="showDeleteButton = false"><img src="{{ song.image_url }}" class="song-image"><div class="song-info"><div class="song-title">{{ song.track }}</div><div class="song-artist">{{ song.artist }}</div><div class="song-user">@{{ song.submitter }}</div></div><i class="fa fa-th-list drag-button" ng-if="room.allAdmin && !showDeleteButton" data-as-sortable-item-handle></i> <i class="fa fa-trash fa-lg delete-button" ng-if="room.allAdmin && showDeleteButton" ng-click="deleteSong($event)"></i></div></div></div></div></div><div plus-button></div>');
  }]);
})();

(function (module) {
  try {
    module = angular.module('jukebox');
  } catch (e) {
    module = angular.module('jukebox', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/jukebox/search/search.html', '<div class="search-wrapper"><div class="search-header-items"><div class="search-header-item search"><input id="song-search-box" type="search" ng-model="searchText" ng-model-options="{ debounce: 500 }" ng-change="myData.sendQuery()" placeholder="Search Spotify..." autofocus></div><div class="search-header-item close-search"><button ng-click="closeSearch()"><span>Cancel</span></button></div></div><div class="song-suggestions" ng-if="!myData.spotify.results && !searchText"><div class="song-results-header"><span>Trending</span></div><div ng-if="myData.spotify.suggestions.length > 0"><div ng-repeat="result in myData.spotify.suggestions"><div ng-click="addSong(result.uri, result.name, result.artists[0].name, result.album.name, result.album.images[0].url)" class="song-search-result"><img src="{{ result.album.images[0].url }}" class="song-image"><div class="song-info"><div class="song-title">{{ result.name }}</div><div class="song-artist">{{ result.artists[0].name }}</div></div></div></div></div></div><div class="song-search-results"><div ng-if="myData.spotify.results.length > 0"><div ng-repeat="result in myData.spotify.results"><div ng-click="addSong(result.uri, result.name, result.artists[0].name, result.album.name, result.album.images[0].url)" class="song-search-result"><img src="{{ result.album.images[0].url }}" class="song-image"><div class="song-info"><div class="song-title">{{ result.name }}</div><div class="song-artist">{{ result.artists[0].name }}</div></div></div></div></div></div><div ng-if="querying"><div spinner></div></div></div>');
  }]);
})();

(function (module) {
  try {
    module = angular.module('jukebox');
  } catch (e) {
    module = angular.module('jukebox', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/jukebox/common/footer/footer.html', '<div class="footer"><div class="footer-label"><span>Jukebox App</span></div><div class="footer-copyright"><span>&copy; 2016, All rights reserved.</span></div></div>');
  }]);
})();

(function (module) {
  try {
    module = angular.module('jukebox');
  } catch (e) {
    module = angular.module('jukebox', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/jukebox/common/header/header.html', '<div class="header"><div class="header-info" ng-if="currentlyPlaying"><div class="header-label song"><span>{{ currentlyPlaying.track }}</span></div><div class="header-label artist"><span>{{ currentlyPlaying.artist }}</span></div><div class="header-label user"><span>@{{ currentlyPlaying.submitter }}</span></div></div><div class="record-player"><div class="record" ng-if="currentlyPlaying"><img src="{{ currentlyPlaying.image_url }}"></div><div class="record" ng-if="!currentlyPlaying"><svg><use xlink:href="#plus-icon"></use></svg></div></div></div>');
  }]);
})();

(function (module) {
  try {
    module = angular.module('jukebox');
  } catch (e) {
    module = angular.module('jukebox', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/jukebox/common/plusButton/plusButton.html', '<button ng-click="showSearch()" class="plus-button"><div class="plus-icon"><svg><use xlink:href="#plus-icon"></use></svg></div></button>');
  }]);
})();

(function (module) {
  try {
    module = angular.module('jukebox');
  } catch (e) {
    module = angular.module('jukebox', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/jukebox/common/ui-elements/defaultModal.html', '<div class="default" tabindex="-1"><div class="modal-header"><h3 class="modal-title">{{ modal_title }}</h3></div><form><div class="modal-body" compile ng-bind-html="modal_body_html"></div><div class="modal-footer"><button class="btn btn-primary" type="submit" ng-click="ok()">{{ primary_btn_text }}</button><div ng-if="secondary_btn_text"><button class="btn btn-warning" type="button" ng-click="cancel()">{{ secondary_btn_text }}</button></div></div></form></div>');
  }]);
})();