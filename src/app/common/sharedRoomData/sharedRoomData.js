(function () {

    'use strict';

    angular
        .module('jukebox')
        .factory('sharedRoomData', function() {
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
            };
            return data;
        });

})();