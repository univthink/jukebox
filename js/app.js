// Global vars

    var cur_user = null;
    var cur_userID = null;
    var cur_roomID = null;
    var coordinates = null;
    var editMode = false;
    var joined_rooms = Object.create(null);
    var colors = ['red', 'blue', 'green', 'pink'];
    var username_arr = ['Banana', 'Apple', 'Peach', 'Mango', 'Cherry', 'Grape', 'Pear', 'Plum', 'Pineapple', 'Lychee', 'Kiwi'];
    var NUM_DAYS_TO_KEEP_COOKIES = 1/12; // 2 hours
    var GEOLOCATION_TIMEOUT = 30; // in seconds
    var OLDEST_CACHED_GEOLOCATION_TO_ACCEPT = 60; // in seconds
    var NUM_SECONDS_UNTIL_QUEUE_REFRESH = 5;
    var NUM_SECONDS_UNTIL_ROOM_REFRESH = 10;


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

    function isAlphanumeric(val) {
      return (! val.match(/^[a-zA-Z]+$/))
    }

    function showNotification(msg) {
      $("#notification_div").html(msg);
      $("#notification_div").css("margin-top","-22px");
      setTimeout(function() {
        $("#notification_div").css("margin-top","-140px");
      }, 1500);
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
            //alert("Joined successfully!");
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
        getAndDisplayMyRooms(getAndDisplayNearbyRooms);
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
          getAndDisplayMyRooms(getAndDisplayNearbyRooms);
        },
        function() {
          alert("Provided password was incorrect.");
          removeCookie(roomID);
          // alert(data["message"]);
          // if (data["message"].indexOf("password") != -1) {
          //   console.log("Provided password was incorrect.");
          //   removeCookie(roomID);
          // }
        }
      );
    }

    function getAndDisplayMyRooms(callback) {
     $.ajax({
        type: "POST",
        url: "/search_room",
        data: {member_id: cur_userID},
        success: function(data) {
          $("#my_rooms").empty();
          if (data["status"] == "OK") {
            $.each(data["data"], function(index, itemData) {
                joined_rooms[itemData["id"]] = true;
                //console.log(itemData["name"]);
                $("#my_rooms").append(
                    '<li class="comp">'
                  + '<aside><span class="icon music"></span></aside>'
                  + "<div><h3>" + itemData["name"] + "</h3>"
                  + '<h4>Created by <span class="created_by">' + itemData["creator_name"] + "</span></h3></div>"
                  + '<a href="queue.html?id=' + itemData["id"] + '" class="button align-flush" id="view_queue_button">View</a>'
                  + "</li>"
                );
            });
            if ($.isEmptyObject(joined_rooms)) $("#my_rooms").html("<li>You have not joined any rooms!</li>");
            if (callback) callback();
          } else {
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
              if (!Object.prototype.hasOwnProperty.call(joined_rooms, itemData["id"])) {
                $("#nearby_rooms").append(
                    '<li class="comp">'
                  + '<aside><span class="icon music"></span></aside>'
                  + "<div><h3>" + itemData["name"] + "</h3>"
                  + '<h4>Created by <span class="created_by">' + itemData["creator_name"] + "</span></h3></div>"
                  + ( itemData["password"] ? '<a href="javascript:joinRoom_p(' + itemData["id"] + ');" ' : '<a href="javascript:joinRoom(' + itemData["id"] + ');" ' )
                  + 'class="button align-flush" id="join_room_button">Join</a>'
                  + "</li>"
                );
              }
            });
            if ($("#nearby_rooms").is(':empty')) {
              if ($.isEmptyObject(joined_rooms)) $("#nearby_rooms").html("<li>There are no nearby rooms.</li>");
              else $("#nearby_rooms").html("<li>You are a member of all the nearby rooms.</li>");
            }
          }
          else {
            console.log(data["message"]);
          }
        }
      });
    }

    function changeUsername() {
      $.ajax({
        type: "POST",
        url: "/change_username",
        data: {user_id: cur_userID, name: cur_user},
        success: function(data) {
          if (data["status"] == "OK") { console.log("Username successfully changed."); }
          else console.log(data["message"]);
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

    function refresh_rooms() {
      getAndDisplayNearbyRooms();
      console.log("Refreshing rooms...");
    }

    function homeReady() {

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
        $("#username_tag").html("Welcome ");
        $("#username_display").html(cur_user);
        $('input[name="username_join"]').val(cur_user);
        getAndDisplayMyRooms();
        getLocationAndDisplayNearbyRooms();
      }
      console.log('User: ' + cur_user);
      console.log('User ID: ' + cur_userID);

      $("#username_update_form").submit(function(e) {
        var newUsername = $("#username_input").val()
        if (newUsername != "" && !isAlphanumeric(newUsername)) {
          $("#username_display").html(newUsername);
          cur_user = newUsername;
          $("#username_input").val('');
          $("#username_update_div").css("display", "none");
          changeUsername();
          setCookie("username", cur_user);
        }
        e.preventDefault();
      });

      setInterval(refresh_rooms, NUM_SECONDS_UNTIL_ROOM_REFRESH * 1000);

    }

// Queue.html functions

    function toggleSortDelete() {
      editMode = !editMode;
      $(".delete_icon").toggle();
      $(".swap_icon").toggle();
      $("#queue_list").toggleClass("shrunken");
      if (editMode) $("#editButton").html("Done");
      else $("#editButton").html("Edit");
    }

    function submitSong(roomID, autocompleteData) {
      var password = getCookie(roomID);
      if (!password) password = "";
      $.ajax({
        type: "POST",
        url: "/submit_song",
        data: {room_id: roomID, user_id: cur_userID, password: password, url: autocompleteData.url, track: autocompleteData.name, artist: autocompleteData.artist, album: autocompleteData.album, album_art_url: autocompleteData.},
        success: function(data) {
          console.log('successfully added a song!');
          console.log(data);
          if (data["status"]=="OK") {
            displayQueue(roomID, password);
          }
          $("#spotify_song_search").val('');
        },
        failure: function(data) {
          console.log('fail');
          console.log(data);
        }
      });
    }

    function reorderSong(song_id, new_pos) {
      var password = getCookie(cur_roomID);
      if (!password) password = "";
      $.ajax({
        type: "POST",
        url: "/reorder_song",
        data: {room_id: cur_roomID, user_id: cur_userID, password: password, song_id: song_id, new_pos: new_pos},
        success: function(data) {
          if (data["status"]=="OK") {
            console.log("Song successfully reordered.");
            displayQueue(cur_roomID, password, true);
          } else {
            console.log(data["message"]);
          }
        }
      });
    }

    function deleteSong(index, song_url) {
      var password = getCookie(cur_roomID);
      if (!password) password = "";
      showNotification("Deleted successfully.");
      $.ajax({
        type: "POST",
        url: "/delete_song",
        data: {room_id: cur_roomID, user_id: cur_userID, password: password, url: song_url, position: index},
        success: function(data) {
          if (data["status"]=="OK") {
            console.log("Song successfully deleted.");
            displayQueue(cur_roomID, password, true);
          } else {
            console.log(data["message"]);
          }
        }
      });
    }

    function displayQueue(roomID, password, editMode) {
      if (editMode === undefined) editMode = false;
      if (!password) password = "";
      $.ajax({
        type: "GET",
        url: "/get_song_queue",
        data: {room_id: roomID, password: password},
        success: function(data) {
          if (data["status"] == "OK") {
            $("#room_name").html(data["room_name"]);
            if (data["all_admin"]) $("#editButton").show();
            //console.log(data);
            $("#queue_list").empty();
            $.each(data["data"], function(index, song) {
              var sColor = colors[Math.floor((Math.random()*colors.length))];
              if (!editMode) {
                $("#queue_list").append(
                  '<li class="comp' + ( index == 0 ? ' unsortable">' : '">' )
                  //+ '<div class="square" style="background:' + sColor + ';">'
                  + ( index == 0 ? '' : '<span class="trash_container"><a class="delete_icon" style="display:none;" href=\'javascript:deleteSong(' + index + ',"' + song["url"] + '");\'><img src="../images/icons/trash_red.png"/></a></span>' )
                  + '<aside>'
                  + '<a class="squareButton" href="javascript:void(null)">'
                  + ( song["image_url"] ? '<img src="'+song["image_url"]+'" style="width:70px; height=70px;"/></a>' : '<div class="square"><img></div></a>' )
                  + '</aside>'
                  + '<div>'
                  + '<h3>' + song["track"] + '</h3>'
                  + '<h4>' + song["artist"]
                  + '</h4>'
                  + '<p>' + song["album"] + '</p>'
                  + '<p class="suggested_by">Added by <span>' + song["submitter"] + '</span></p>'
                  + '<span class="song_url" style="display:none;">' + song["url"] + '</span>'
                  + '<span class="song_id" style="display:none;">' + song["unique_id"] + '</span>'
                  + '</div>'
                  + '<div class="editSong">'
                  + ( index == 0 ? '<a class="playing_icon"><img src="../images/icons/playing_red.png"/></a>' : '<a class="swap_icon handle" style="display:none;"><img src="../images/icons/vertical_drag_red.png"/></a>' )
                  + '</div>'
                  + '</li>'
                );
              } else {
                $("#queue_list").append(
                  '<li class="comp' + ( index == 0 ? ' unsortable">' : '">' )
                  //+ '<div class="square" style="background:' + sColor + ';">'
                  + ( index == 0 ? '' : '<span class="trash_container"><a class="delete_icon" href=\'javascript:deleteSong(' + index + ',"' + song["url"] + '");\'><img src="../images/icons/trash_red.png"/></a></span>' )
                  + '<aside>'
                  + '<a class="squareButton" href="javascript:void(null)">'
                  + ( song["image_url"] ? '<img src="'+song["image_url"]+'" style="width:70px; height=70px;"/></a>' : '<div class="square"><img></div></a>' )
                  + '</aside>'
                  + '<div>'
                  + '<h3>' + song["track"] + '</h3>'
                  + '<h4>' + song["artist"]
                  + '</h4>'
                  + '<p>' + song["album"] + '</p>'
                  + '<p class="suggested_by">Added by <span>' + song["submitter"] + '</span></p>'
                  + '<span class="song_url" style="display:none;">' + song["url"] + '</span>'
                  + '<span class="song_id" style="display:none;">' + song["unique_id"] + '</span>'
                  + '</div>'
                  + '<div class="editSong">'
                  + ( index == 0 ? '<a class="playing_icon"><img src="../images/icons/playing_red.png"/></a>' : '<a class="swap_icon handle"><img src="../images/icons/vertical_drag_red.png"/></a>' )
                  + '</div>'
                  + '</li>'
                );
              }
            });
            // $.UIDeletable({
            //   list: '#queue_list',
            //   callback: function(item) {
            //     var url = $(item).siblings('div').find('span').text(); //url is not unique (think: duplicates)
            //     alert("You deleted " + url);
            //   }
            // });
            $(".squareButton").click(function(event) { // easter egg woo :)
              console.log(event);
              curCB = event.target;
              $("#colorPopover").show();
            });
            $(".sortable").sortable({
              handle: ".handle",
              items: "li:not(.unsortable)",
              update: function(e, ui) {
                var new_pos = ui.item.index();
                var song_id = ui.item.find('span.song_id').text();
                var song_url = ui.item.find('span.song_url').text()
                reorderSong(song_id, new_pos);
              }
            });
            $(".sortable").disableSelection();
          } else {
            $("#queue_list").append('<li class="comp">Error in displaying queue: ' +data["message"]+'</li>');
          }
        }
      });
    }

    function prepareSongSearch() {
      $("#spotify_song_search").autocomplete({
        source: function(request, response) {
            $.get("https://api.spotify.com/v1/search", {
              // currently selected in input
                "q": request.term,
                "type" : "track"
            }, function(data) {
                response($.map(data.tracks.items, function(item) {
                    var ui_data = {
                      artist: item.artists[0].name,
                      album: item.album.name,
                      album_art_url: item.album.images[0].url,
                      url: item.href,
                      name: item.name
                    };
                    console.log(ui_data);
                    return {
                      label: item.artists[0].name + " - " + item.name,
                      data: ui_data
                    };
                }));
            });
        },
        select: function(event, ui) {
          showNotification("You successfully added a song!");
          submitSong(cur_roomID, ui.item.data);
        },
        messages: {
            noResults: '',
            results: function() {}
        }
      });
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

    function refresh_queue() {
      var password = getCookie(cur_roomID);
      if (!password) password = "";
      if (!editMode) {
        displayQueue(cur_roomID, password);
        console.log("Refreshing queue...");
      }
    }

    function queueReady() {
      populateColorPicker();
      $(".miniSquareButton").click(function(event) {
        var color = $(event.target).css("background-color");
        $(curCB).css("background-color", color);
        $(curCB).css("border", "3px solid");
        $(curCB).css("border-color", color);
        $("#colorPopover").hide();
      });

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
        cur_userID = getCookie("user_id" );
        ifPasswordPromptAndDisplay();
      }
      console.log('User: ' + cur_user);
      console.log('User ID: ' + cur_userID);

      setInterval(refresh_queue, NUM_SECONDS_UNTIL_QUEUE_REFRESH * 1000);
    }

