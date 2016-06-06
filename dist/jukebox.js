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
    // SpotifyProvider.setRedirectUri('http://localhost:8080/spotify_login/');
    SpotifyProvider.setRedirectUri('http://letsjukebox.com/spotify_login/');
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
      if ($scope.axisCategory.x.value == 'time') {
        for (var i = 0; i < $scope.musicTracks.length; i++) {
          $scope.musicTracks[i]["x_category"] = $scope.musicTracks[i]["date"];
          $scope.musicTracks[i]["x_category_val"] = 'time';
        }
        $scope.changeXScaleToDate();
      } else {
        for (var i = 0; i < $scope.musicTracks.length; i++) {
          $scope.musicTracks[i]["x_category"] = $scope.musicTracks[i]["audio_features"][$scope.axisCategory.x.value];
          $scope.musicTracks[i]["x_category_val"] = $scope.axisCategory.x.value;
        }
        $scope.changeXScaleToFeature();
      }
      $scope.updateAxisLabels();
      $scope.updateGraph();
    };

    $scope.changeYAxisCategory = function () {
      for (var i = 0; i < $scope.musicTracks.length; i++) {
        $scope.musicTracks[i]["y_category"] = $scope.musicTracks[i]["audio_features"][$scope.axisCategory.y.value];
        $scope.musicTracks[i]["y_category_val"] = $scope.axisCategory.y.value;
      }
      $scope.updateAxisLabels();
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

  function graphController($scope, $http) {
    $scope.selectedTimePeriod = "long_term";
    $scope.axisCategories = [{ name: "Danceability", value: "danceability" }, { name: "Energy", value: "energy" }, { name: "Speechiness", value: "speechiness" }, { name: "Acousticness", value: "acousticness" }, { name: "Instrumentalness", value: "instrumentalness" }, { name: "Liveness", value: "liveness" }, { name: "Valence", value: "valence" }, { name: "Date added", value: "time" }];

    $scope.axisCategory = {
      x: $scope.axisCategories[7], // time
      y: $scope.axisCategories[1] // energy
    };

    $scope.xAxisIsLocked = false;
    $scope.yAxisIsLocked = false; // TODO: debug this

    // Original zoomable d3 scatterplot code adopted from here: https://github.com/bhargavavn/Scatterplot_zoom/blob/master/scatter.html

    // Set the dimensions of the svg / graph
    var margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 60
    };
    var padding = 50;
    var width = 1400 - margin.left - margin.right;
    var height = 530 - margin.top - margin.bottom;

    // Parse the date / time
    // e.g. "2016-03-02T07:22:01Z"
    var parseDate = d3.time.format.iso.parse;

    // Set the ranges
    var x = d3.time.scale().range([padding, width]);
    var y = d3.scale.linear().range([height, padding / 2]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5).tickSize(8);
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5).tickSize(8);

    // Adds the svg svg
    var svg = d3.select(".mydiv").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var div = d3.select(".mydiv").append("div").attr("class", "tooltip").style("opacity", 0);

    // Get the data
    var data;
    if ($scope.loadFromSampleData) {
      $http.get('resources/' + $scope.loadFromSampleData + '_data.json').then(function (json) {
        $scope.musicTracks = json.data;
        data = $scope.musicTracks;
        drawGraph();
      });
    } else {
      data = $scope.musicTracks;
      drawGraph();
    }

    // console.log(data);
    // var json = JSON.stringify(data);
    // console.log(json);

    // var toDownload = new Blob([json], { type:'application/json' });
    // var link = window.URL.createObjectURL(toDownload);
    // window.location=link;
    /*
        // process data for output
        for (let d of data) {
          delete d["album"];
          delete d["available_markets"];
          delete d["external_ids"];
          delete d["external_urls"];
        }
      */

    function drawGraph() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {

        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var d = _step.value;

          if ($scope.axisCategory.x.value == "time") {
            d["date"] = parseDate(d["added_at"]);
            d["x_category"] = d["date"];
            d["x_category_val"] = "time";
          } else {
            d["x_category"] = d["audio_features"][$scope.axisCategory.x.value];
            d["x_category_val"] = $scope.axisCategory.x.value;
          }
          d["y_category"] = d["audio_features"][$scope.axisCategory.y.value];
          d["y_category_val"] = $scope.axisCategory.y.value;
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
        return d["x_category"];
      }));
      y.domain([0, d3.max(data, function (d) {
        return d["y_category"];
      }) + 0.1]);
      //y.domain([0, 1]);
      //y.domain([0, d3.max(data, function(d) { return d.close; })]);

      // Zoom selection
      svg.append("rect").attr("width", width + margin.left + margin.right + padding).attr("height", height + margin.top + margin.bottom + padding);

      // Add axis labels
      var leftLabel = svg.append("text").attr("y", height / 2 + 25).attr("x", margin.left).attr("class", "axis-label x left");

      var rightLabel = svg.append("text").attr("y", height / 2 + 25).attr("x", width - 150).attr("class", "axis-label x right");

      var topLabel = svg.append("text").attr("y", margin.top).attr("x", width / 2 - padding).attr("class", "axis-label y top");

      var bottomLabel = svg.append("text").attr("y", height - padding / 2).attr("x", width / 2 - padding).attr("class", "axis-label y bottom");

      $scope.updateAxisLabels = function () {
        if ($scope.axisCategory.x.value == "time") {
          leftLabel.text("");
          rightLabel.text("");
        } else {
          leftLabel.text("low " + $scope.axisCategory.x.value);
          rightLabel.text("high " + $scope.axisCategory.x.value);
        }
        topLabel.text("high " + $scope.axisCategory.y.value);
        bottomLabel.text("low " + $scope.axisCategory.y.value);
      };

      $scope.updateAxisLabels();

      // Data point creation
      svg.selectAll("dot").data(data).enter().append("circle").attr("class", "dot").attr("class", function (d) {
        if (d["is_top"].length > 0) {
          return "top " + d["is_top"].join(" ");
        }
      }).attr("r", 8).style("opacity", 0.5).attr("cx", function (d) {
        return x(d["x_category"]);
      }).attr("cy", function (d) {
        return y(d["y_category"]);
      }).on("mouseover", function (d) {
        d3.select(this)
        //.attr("r", (2 * d3.select(this).attr("r")))
        .attr("r", 16).classed("selected", true);
        div.transition().duration(200).style("opacity", .8).attr("r", 30);
        div.html(function () {
          if (d["x_category_val"] == "time") {
            var date = new Date(d["x_category"]);
            var date_str = date.toLocaleString();
            return d.name + '<br>' + d.artists[0].name + '<br><div class="subtext">' + d["y_category"] + ' ' + d["y_category_val"] + '<br>' + 'Added ' + date_str + '<br></div>';
          } else {
            return d.name + '<br>' + d.artists[0].name + '<br><div class="subtext">' + d["y_category"] + ' ' + d["y_category_val"] + '<br>' + d["x_category"] + ' ' + d["x_category_val"] + '<br></div>';
          }
        })
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
      svg.append("g").attr("class", "x axis").call(xAxis).attr("transform", "translate(0," + height + ")"); // factor in padding?

      // Add the Y Axis
      svg.append("g").attr("class", "y axis").call(yAxis);

      // Call funtion zoom
      svg.call(d3.behavior.zoom().x(x).y(y).on("zoom", zoom));

      $scope.changeXScaleToDate = function () {
        x = d3.time.scale().range([padding, width]);
        x.domain(d3.extent(data, function (d) {
          return d["x_category"];
        }));
        xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5).tickSize(8);
        svg.call(d3.behavior.zoom().x(x).y(y).on("zoom", zoom));
      };

      $scope.changeXScaleToFeature = function () {
        x = d3.scale.linear().range([padding, width]);
        x.domain([0, d3.max(data, function (d) {
          return d["x_category"];
        }) + 0.1]);
        xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5).tickSize(8);
        svg.call(d3.behavior.zoom().x(x).y(y).on("zoom", zoom));
      };

      $scope.toggleYAxisLock = function () {
        $scope.yAxisIsLocked = !$scope.yAxisIsLocked;
        //xAxis.scale(x);
      };

      // Zoom into data (.dot)
      function zoom() {
        // console.log(d3.event.scale);
        if ($scope.xAxisIsLocked && $scope.yAxisIsLocked) return;
        if ($scope.xAxisIsLocked) {
          svg.selectAll("circle").classed("animate", false).attr("cy", function (d) {
            return x(d["y_category"]);
          });
          d3.select('.y.axis').call(yAxis);
        } else if ($scope.yAxisIsLocked) {
          svg.selectAll("circle").classed("animate", false).attr("cx", function (d) {
            return x(d["x_category"]);
          });
          d3.select('.x.axis').call(xAxis);
        } else {
          svg.selectAll("circle").classed("animate", false).attr("cx", function (d) {
            return x(d["x_category"]);
          }).attr("cy", function (d) {
            return y(d["y_category"]);
          });
          d3.select('.x.axis').call(xAxis);
          d3.select('.y.axis').call(yAxis);
        }
      }

      $scope.updateGraph = function () {
        // x.domain(d3.extent(data, function(d) { return d["x_category"]; }));
        // y.domain([0, d3.max(data, function(d) { return d["y_category"]; }) + 0.1]);
        // d3.select('.x.axis').call(xAxis);
        // d3.select('.y.axis').call(yAxis);
        svg.selectAll("circle").classed("animate", true).attr("cx", function (d) {
          return x(d["x_category"]);
        }).attr("cy", function (d) {
          return y(d["y_category"]);
        });
        d3.select('.x.axis').call(xAxis);
        d3.select('.y.axis').call(yAxis);
      };
    }

    // TODO: Investigate why neither of these work.
    // $scope.$watch('yAxisIsLocked', function() {
    //   console.log($scope.yAxisIsLocked);
    // });
    // $scope.$watch('nonTopTracksHidden', function() {
    //   console.log($scope.nonTopTracksHidden);
    // });
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

  function datavizController($scope, $http, $timeout, Spotify) {
    $scope.loadFromSampleData = "";
    $scope.pageClass = 'dataviz-page';
    $scope.musicLoadingIsComplete = false;
    $scope.getSongsClicked = false;
    $scope.errorText = "";
    $scope.tutorialVisible = true;

    // initialize data objects
    $scope.musicData = {}; // maps spotify ids to data objects
    $scope.musicTracks = [];
    $scope.savedTrackList = [];
    $scope.topTracks = {
      "long_term": {},
      "medium_term": {},
      "short_term": {}
    };

    $scope.userIsLoggedIn = false;
    $scope.login = function () {
      Spotify.login();
      $scope.userIsLoggedIn = true;
    };

    // Helper functions
    // TODO: Move these to a separate file / service.
    function isEmpty(obj) {
      return Object.keys(obj).length === 0;
    }

    $scope.getSongs = function () {
      $scope.errorText = "";
      $scope.getSongsClicked = true;
      $scope.loadFromSampleData = "";
      $scope.musicLoadingIsComplete = false;
      $scope.musicData = {}; // maps spotify ids to data objects
      $scope.musicTracks = [];
      $scope.savedTrackList = [];
      $scope.topTracks = {
        "long_term": {},
        "medium_term": {},
        "short_term": {}
      };
      getSavedTracksFromSpotify(0, 50);
    };

    $scope.loadFromDataSet = function (str) {
      $scope.loadFromSampleData = str;
      //$scope.userIsLoggedIn = true;
      //$scope.getSongsClicked = true;
      $scope.musicLoadingIsComplete = true;
      if ($scope.tutorialVisible) $timeout(function () {
        $scope.tutorialVisible = false;
      }, 10000);
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
        $scope.musicLoadingIsComplete = true; // triggers initializing the GraphController
        if ($scope.tutorialVisible) $timeout(function () {
          $scope.tutorialVisible = false;
        }, 10000);
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
        $scope.errorText = 'Error importing Spotify library. Please click Get Songs again.';
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

(function (module) {
  try {
    module = angular.module('jukebox');
  } catch (e) {
    module = angular.module('jukebox', []);
  }
  module.run(['$templateCache', function ($templateCache) {
    $templateCache.put('/jukebox/dataviz/dataviz.html', '<div class="dataviz-page"><div class="header"><div class="contents"><div>Project Jukebox</div><button ng-click="login()">Login</button> <button ng-click="getSongs()" ng-disabled="!userIsLoggedIn">Get&nbsp;Your&nbsp;Songs</button></div></div><div class="notifications"><div ng-if="!userIsLoggedIn && !loadFromSampleData" class="explainer-text">Click Login to authorize Jukebox to pull data from your Spotify account.<br>Alternatively, load a sample data set.<br><button ng-click="loadFromDataSet(\'small\')">Load&nbsp;Small&nbsp;Data&nbsp;Set</button> <button ng-click="loadFromDataSet(\'large\')">Load&nbsp;Large&nbsp;Data&nbsp;Set</button></div><div ng-if="userIsLoggedIn && !getSongsClicked && !loadFromSampleData" class="explainer-text">Click Get Your Songs to get started.</div><div ng-show="musicLoadingIsComplete && tutorialVisible" class="tutorial-text">Scroll to Zoom. Click and drag to pan.<br>Click on any data point to play that song.</div><div ng-if="errorText" class="error-text">{{errorText}}</div></div></div><div ng-if="getSongsClicked && !musicLoadingIsComplete && !errorText" class="spinner-container"><div spinner></div></div><div ng-controller="GraphController" ng-if="musicLoadingIsComplete"><div class="graph-view"><div id="mygraph" ng-class="selectedTimePeriod"><div class="mydiv"></div></div></div><div ng-controller="GraphControlsController"><div class="graph-controls-view"><div class="control-box"><div class="control-item"><span style="color: yellow">Highlight</span> top tracks from<select ng-model="selectedTimePeriod" ng-change="changeTopTimePeriod()" name="time-period"><option value="long_term">all time</option><option value="medium_term">last 6 months</option><option value="short_term">last 4 weeks</option></select></div><div class="control-item">Fade non top tracks? <input type="checkbox" ng-change="toggleHiddenNonTopTracks()" name="hide-non-top" ng-model="nonTopTracksHidden"></div><div class="control-item">Display tracks based on<select ng-options="item as item.name for item in axisCategories" ng-model="axisCategory.x" ng-change="changeXAxisCategory()"></select>x<select ng-options="item as item.name disable when item.value == \'time\' for item in axisCategories" ng-model="axisCategory.y" ng-change="changeYAxisCategory()"></select></div><div class="control-item">Lock Y-axis on zoom? <input type="checkbox" ng-change="toggleYAxisLock()" ng-model="yAxisIsLocked" name="lock-y-axis"></div></div></div></div></div><div ng-controller="YoutubeController"><div class="iframe-container"><iframe id="ytplayer" type="text/html" ng-src="{{ yt_video_id | youtubeEmbedUrl }}" frameborder="0" allowfullscreen></div></div>');
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