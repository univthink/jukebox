(function () {

    'use strict';

    angular
        .module('jukebox')
        .factory('backendAPI', ['$http', function($http) {

        var urlBase = '/api';
        var backendAPI = {};

        /* Register a user
         *
         * params = {
         *   username: String,      (required)
         * }
         *
         */
        backendAPI.registerUser = function(params) {
            return $http.post(urlBase + '/register_user', params);
        };

        /* Change username
         *
         * params = {
         *   user_id: String,       (required)
         *   name: String,          (required) // new user name
         * }
         *
         */
        backendAPI.changeUsername = function(params) {
            return $http.post(urlBase + '/change_username', params);
        };

        /* Join a room
         *
         * params = {
         *   room_id: String,       (required)
         *   user_id: String,       (required)
         *   password: String,      (optional)
         * }
         *
         */
        backendAPI.joinRoom = function(params) {
            // may not be necessary
            // if (!params.hasOwnProperty('password') {
            //     params.password = '';
            // }
            return $http.post(urlBase + '/join_room', params);
        };

        /* Get a song queue
         *
         * params = {
         *   room_id: String,       (required)
         *   password: String,      (optional)
         * }
         *
         */
        backendAPI.getSongQueue = function(params) {
            return $http.get(urlBase + '/get_song_queue', params);
        };

        /* Add a song to the queue
         *
         * params = {
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
        backendAPI.addSong = function(params) {
            return $http.post(urlBase + '/submit_song', params);
        };

        /* Reorder a song in the queue
         *
         * params = {
         *   room_id: String,       (required)
         *   user_id: String,       (required)
         *   password: String,      (optional)
         *   song_id: String,       (required) // this is the backend uuid (source independent)
         *   new_pos: String,       (required) // new position in the queue
         * }
         *
         */
        backendAPI.reorderSong = function(params) {
            return $http.post(urlBase + '/reorder_song', params);
        };

        /* Delete a song from the queue
         *
         * params = {
         *   room_id: String,       (required)
         *   user_id: String,       (required)
         *   password: String,      (optional)
         *   url: String,           (required) // for Spotify, this must be the uri
         *   position: String,      (required) // the current position in the queue of the song to be deleted
         * }
         *
         */
        backendAPI.deleteSong = function(params) {
            return $http.post(urlBase + '/delete_song', params);
        };

        return backendAPI;
    }]);

})();