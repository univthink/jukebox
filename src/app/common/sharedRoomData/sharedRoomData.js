(function () {

    'use strict';

    angular
        .module('jukebox')
        .factory('sharedRoomData', function() {
            var data = {
                roomId: '',
                roomName: '',
                roomPassword: '',
                userId: '',
                userName: '',
            }
            return data;
        });

})();