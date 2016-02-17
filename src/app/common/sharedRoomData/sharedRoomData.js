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