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