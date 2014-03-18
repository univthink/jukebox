// Global vars
    var cur_user = null;
    var cur_userID = null;
    var cur_roomID = null;
    var sortable = false;
    var coordinates = null;
    var colors = ['red', 'blue', 'green', 'pink'];
    var username_arr = ['Banana', 'Apple', 'Peach', 'Mango', 'Cherry', 'Grape', 'Pear', 'Plum'];
    var NUM_DAYS_TO_KEEP_COOKIES = 1;
    var GEOLOCATION_TIMEOUT = 30; // in seconds
    var OLDEST_CACHED_GEOLOCATION_TO_ACCEPT = 60; // in seconds

// Shared functions

    function setCookie(name, value) {
      $.cookie(name.toString(), value.toString(), NUM_DAYS_TO_KEEP_COOKIES);
    }

    function getCookie(name) {
      return $.cookie(name.toString());
    }

    function removeCookie(name) {
      $.removeCookie(name.toString());
    }

    function getParam(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { 
          return pair[1]; 
        }
      }
     return null;
    }

    function assignUsername(callback) {
      var sUsername = username_arr[Math.floor((Math.random()*username_arr.length))];
      cur_user = sUsername;
      registerUser(cur_user, function() {
        setCookie("username", cur_user);
        setCookie("user_id", cur_userID);
        if (callback) callback();
      });
    }

    function registerUser(username, callback) {
      $.ajax({
        type: "POST",
        url: "/register_user",
        data: {username: username},
        success: function(data) {
          if (data["status"] == "OK") {
            cur_userID = data["data"];
            if (callback) callback();
          }
        }
      });
    }

    function ajaxJoin(roomID, userID, password, callbackOnSuccess, callbackOnFailure) {
      if (!password) password = "";
      $.ajax({
       type: "POST",
        url: "/join_room",
        data: {room_id: roomID, user_id: userID, password: password},
        success: function(data) {
          if (data["status"] == "OK") {
            alert("Joined successfully!");
            if (callbackOnSuccess) callbackOnSuccess();
          } else {
            if (callbackOnFailure) callbackOnFailure();
          }
        }
      }); 
    }

// Home.html functions 

    function showUsernameUpdateDiv() {
      $("#username_update_div").css("display", "block");
    }

    // Function called when join room button is on the join room page
    function joinSpecificRoom() {
      var form_username = $('input[name="username_join"]').val();
      if (form_username != cur_user) {
        cur_user = form_username;
        cur_userID = 0;
        $("#username_display").html(cur_user);
      }
      var roomID = $("#id_join").val();
      var joinPassword = $("#password_join").val();
      joinRoom(roomID, joinPassword);
    }

    // Function called when the join room button is pressed next a room on the room list (no password)
    function joinRoom(roomID) {
      ajaxJoin(roomID, cur_userID, null, function() {
        getAndDisplayMyRooms();
        getAndDisplayNearbyRooms();
      });
    }

    // Join room with a password
    function joinRoom_p(roomID) {
      var password = getCookie(roomID);
      if (!password) {
        password = prompt("Please enter the room password:");
        setCookie(roomID, password);
      }
      ajaxJoin(roomID, cur_userID, password,
        function() {
          getAndDisplayMyRooms();
          getAndDisplayNearbyRooms();
        },
        function() {
          alert(data["message"]);
          if (data["message"].indexOf("password") != -1) {
            console.log("Provided password was incorrect.");
            removeCookie(roomID);
          }
        }
      );
    }

    function getAndDisplayMyRooms() {
     $.ajax({
        type: "POST",
        url: "/search_room",
        data: {user_id: cur_userID},
        success: function(data) {
          $("#my_rooms").empty();
          if (data["status"] == "OK") {
            $.each(data["data"], function(index, itemData) {
                $("#nearby_rooms").append(
                    "<li>"
                  + "Room Name: " + itemData["name"] + "<br>"
                  + "Creator: " + itemData["creator_name"] + "<br>"
                  + '<a href="queue.html?id=' + itemData["id"] + '" class="button action align-right" id="view_queue_button">View Queue</a>'
                  + "</li>"
                );
            });
          }
          else {
            console.log(data["message"]);
          }
        }
      });
    }

    function getAndDisplayNearbyRooms() {
      $.ajax({
        type: "POST",
        url: "/search_room",
        data: {coordinates: coordinates[0] + ',' + coordinates[1]},
        success: function(data) {
          $("#nearby_rooms").empty();
          if (data["status"] == "OK") {
            $.each(data["data"], function(index, itemData) {
                $("#nearby_rooms").append(
                    "<li>"
                  + "Room Name: " + itemData["name"] + "<br>"
                  + "Creator: " + itemData["creator_name"] + "<br>"
                  + ( itemData["password"] ? '<a href="javascript:joinRoom_p(' + itemData["id"] + ');" ' : '<a href="javascript:joinRoom(' + itemData["id"] + ');" ' )
                  + 'class="button action align-right" id="join_room_button">Join Room</a>'
                  + '<a href="queue.html?id=' + itemData["id"] + '" class="button action align-right" id="view_queue_button">View Queue</a>'
                  + "</li>"
                );
            });
          }
          else {
            console.log(data["message"]);
          }
        }
      });
    }

    function getLocation(callbackOnSuccess, callbackOnFailure) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(position) {
            console.log('Location acquired.');
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            coordinates = [lat, lng];
            console.log(coordinates[0] + ',' + coordinates[1]);
            if (callbackOnSuccess) callbackOnSuccess();
          },
          function() {
            if (callbackOnFailure) callbackOnFailure();
          },
          { timeout: GEOLOCATION_TIMEOUT * 1000 },
          { maximumAge: OLDEST_CACHED_GEOLOCATION_TO_ACCEPT * 1000 } // I'm not sure if this is helpful
        );
      } else {
        if (callbackOnFailure) callbackOnFailure(); // browser/device does not support geolocation 
      }
    }

    function getLocationAndDisplayNearbyRooms() {
      console.log("Getting location...");
      getLocation(
        function() { // success
          getAndDisplayNearbyRooms();
        },
        function() { // failure
          $("#nearby_rooms").append('<li>Cannot retrieve nearby rooms without location services enabled.</li>');
        });
    }

    function homeReady() {

      $.UISlideout();
      $.UISlideout.populate([{main:'Home'},{header:'Actions'},{join_room:'Join Room'}]);

      // Display user information
      cur_user = getCookie("username");
      if (!cur_user) {
        assignUsername(function() {
          $("#username_display").html(cur_user);
          $('input[name="username_join"]').val(cur_user);
          getAndDisplayMyRooms();
          getLocationAndDisplayNearbyRooms();
        });
      } else {
        cur_userID = getCookie("user_id");
        $("#username_tag").html("Welcome back ");
        $("#username_display").html(cur_user);
        $('input[name="username_join"]').val(cur_user);
        getAndDisplayMyRooms();
        getLocationAndDisplayNearbyRooms();
      }
      console.log('User: ' + cur_user);
      console.log('User ID: ' + cur_userID);

      // $("#username_update_form").submit(function(e) {
      //   var newUsername = $("#username_input").val()
      //   $("#username_display").html(newUsername);
      //   $('input[name="username_join"]').val(newUsername);
      //   cur_user = newUsername;
      //   cur_userID = 0;
      //   $("#username_input").val('');
      //   $("#username_update_div").css("display", "none");
      //   registerUser(newUsername, function() {
      //     getMyRooms();
      //     getNearbyRooms();
      //   });
      //   e.preventDefault();
      // });

    }

// Queue.html functions

    function submitSong(roomID, autocompleteData) {
      var password = getCookie(roomID);
      if (!password) password = "";
      $.ajax({
        type: "POST",
        url: "/submit_song",
        data: {room_id: roomID, user_id: cur_userID, password: password, url: autocompleteData.url, track: autocompleteData.name, artist: autocompleteData.artist, album: autocompleteData.album},
        success: function(data) {
          if (data["status"]=="OK") alert("Song added successfully!");
          displayQueue(roomID, password);
          $("#spotify_song_search").val('');
        }
      });
    }

    function displayQueue(roomID, password) {
      if (!password) password = "";
      $.ajax({
        type: "GET",
        url: "/get_song_queue",
        data: {room_id: roomID, password: password},
        success: function(data) {
          if (data["status"] == "OK") {
            $("#queue_list").empty();
            $.each(data["data"], function(index, song) {
              var sColor = colors[Math.floor((Math.random()*colors.length))];
              $("#queue_list").append(
                '<li class="comp">'
                + '<aside>'
                //+ '<div class="square" style="background:' + sColor + ';">'
                + '<a class="squareButton" href="javascript:void(null)">'
                + ( song["image_url"] ? '<img src="'+song["image_url"]+'" style="width:60px; height=60px;"/></a>' : '<div class="square"><img></div></a>' )
                + '</aside>'
                + '<div>'
                + '<h3>' + song["track"] + '</h3>'
                + '<h4>' + song["artist"] + '</h4>'
                + '<p>' + song["album"] + '</p>'
                + '<span style="display:none;">' + song["url"] + '</span>'
                + '</div>'
                + '</li>'
              );
            });
            $.UIDeletable({
              list: '#queue_list', 
              callback: function(item) {
                var url = $(item).siblings('div').find('span').text(); //url is not unique (think: duplicates)
                alert("You deleted " + url);
              }
            });
            $(".squareButton").click(function(event) {
              console.log(event);
              curCB = event.target;
              $("#colorPopover").show();
            });
          } else {
            $("#queue_list").append('<li class="comp">Error in displaying queue: ' +data["message"]+'</li>');
          }
        }
      });
    }

    function prepareSongSearch() {
      $("#spotify_song_search").autocomplete({
        source: function(request, response) {
            $.get("http://ws.spotify.com/search/1/track.json", {
              //currently selected in input
                q: request.term
            }, function(data) {
                response($.map(data.tracks, function(item) {
                    return {label: item.artists[0].name + " - " + item.name, data: {artist: item.artists[0].name, album: item.album.name, url: item.href, name: item.name}};
                }));
            });
        },
        select: function(event, ui) {
          if (cur_userID == 0) {
            alert("You are not a registered user. You may not add a song to this queue.")
          } else {
            submitSong(cur_roomID, ui.item.data);
          }
        },
        messages: {
            noResults: '',
            results: function() {}
        }
      });
    }

    function toggleSortDelete() {
      sortable = !sortable;
      if (sortable) {
        $('.sortable').sortable('enable');
      } else {
        $('.sortable').sortable('disable');
      }
    }

    function populateColorPicker() {
      var colors = ['red','orange','yellow','green','blue','indigo','violet','pink','black'];
      $.each(colors, function(index, color) {
        $("#colorPickerList").append('<li><a class="miniSquareButton" href="javascript:void(null)"><div class="miniSquare" style="background:' + color + ';"><img /></div></a></li>');
      });
      $("#colorPopover").hide();
    }

    function ifPasswordPromptAndDisplay() {
      var password = getCookie(cur_roomID);
      ajaxJoin(cur_roomID, cur_userID, password, 
        function() {
          displayQueue(cur_roomID, password);
          prepareSongSearch();
        },
        function() {
          var password = prompt("Please enter the room password:");
          setCookie(cur_roomID, password);
          ajaxJoin(cur_roomID, cur_userID, password, 
            function() {
              $("#queue_list").empty();
              $("#spotify_song_search").removeAttr("disabled");
              displayQueue(cur_roomID, password);
              prepareSongSearch();
            },
            function() {
              removeCookie(cur_roomID);
              $("#queue_list").html('<li class="comp">Incorrect password provided. <a href="javascript:ifPasswordPromptAndDisplay();" <label>try again?</label></a> </li>');
              $("#spotify_song_search").attr("disabled", "disabled");
            }
          );
        }
      );
    }

    function queueReady() {

      cur_roomID = getParam("id");
      if (!cur_roomID) {
        $("#queue_list").append('<li class="comp">No room ID provided.</li>');
        return;
      }

      // Get user information
      cur_user = getCookie("username");
      if (!cur_user) {
        assignUsername(function() {
          ifPasswordPromptAndDisplay();
        });
      } else {
        cur_userID = getCookie("user_id");
        ifPasswordPromptAndDisplay();
      }
      console.log('User: ' + cur_user);
      console.log('User ID: ' + cur_userID);

      $('.sortable').sortable();
      $('.sortable').sortable('disable');

      populateColorPicker();

      $(".miniSquareButton").click(function(event) {
        var color = $(event.target).css("background-color");
        $(curCB).css("background-color", color);
        $(curCB).css("border", "3px solid");
        $(curCB).css("border-color", color);
        $("#colorPopover").hide();
      });

    }

