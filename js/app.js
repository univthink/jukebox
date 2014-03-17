// Global vars

    var cur_user = "Anonymous";
    var cur_userID;
    var roomID = null;
    var qr = 0;
    var sortable = false;
    var colors = ['red', 'blue', 'green', 'pink'];
    var usernames = ['Oak', 'Misty', 'Ash', 'Brock', 'Mai'];

// Shared functions

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

    function registerUser(username, callback) {
      $.ajax({
        type: "POST",
        url: "/register_user",
        data: {username: username},
        success: function(data) {
          $("#register_flag").html("You are registered.");
          cur_userID = data["data"];
          callback();
        }
      });
    }

    function ajaxJoin(roomID, userID, password, callback) {
      if (password == "null") password = "";
      $.ajax({
       type: "POST",
        url: "/join_room",
        data: {room_id: roomID, user_id: userID, password: password},
        success: function(data) {
          if (data["status"] == "OK") alert("Joined successfully!");
          callback();
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

    // Function called when the join room button is pressed next a room on the room list
    function joinRoom(roomID, password) {
      if (cur_userID == 0) {
        registerUser(cur_user, function() {
          ajaxJoin(roomID, cur_userID, password, function() {
            getMyRooms();
            getNearbyRooms();
          });
        });
      } else {
        ajaxJoin(roomID, cur_userID, password, function() {
          getMyRooms();
          getNearbyRooms();
        });
      }
    }

    function getMyRooms() {
      $.ajax({
        type: "POST",
        url: "/search_room",
        data: {user_id: cur_userID},
        success: function(data) {
          $("#nearby_rooms").empty();
          if (data["status"] == "OK") {
            $.each(data["data"], function(index, itemData) {
                itemData = itemData["data"];
                var password = itemData["password"];
                if (password == "") password = "null"
                $("#nearby_rooms").append(
                  "<li>"
                  + "Room Name: " + itemData["name"] + "<br>"
                  + "Creator: " + itemData["creator_name"] + "<br>"
                  + '<a href="javascript:joinRoom(' + itemData["id"] + ',' + password + ');" class="button action align-right" id="join_room_button">Join Room</a>'
                  + '<a href="queue.html?user=' + cur_userID + '&id=' + itemData["id"] + '" class="button action align-right" id="view_queue_button">View Queue</a>'
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

    function getNearbyRooms() {
      $.ajax({
        type: "POST",
        url: "/search_room",
        data: {},
        success: function(data) {
          $("#nearby_rooms").empty();
          if (data["status"] == "OK") {
            $.each(data["data"], function(index, itemData) {
                var password = itemData["password"];
                if (password == "") password = "null"
                $("#nearby_rooms").append(
                  "<li>"
                  + "Room Name: " + itemData["name"] + "<br>"
                  + "Creator: " + itemData["creator_name"] + "<br>"
                  + '<a href="javascript:joinRoom(' + itemData["id"] + ',' + password + ');" class="button action align-right" id="join_room_button">Join Room</a>'
                  + '<a href="queue.html?user=' + cur_userID + '&id=' + itemData["id"] + '" class="button action align-right" id="view_queue_button">View Queue</a>'
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

    function homeReady() {

      $.UISlideout();
      $.UISlideout.populate([{main:'Home'},{header:'Actions'},{join_room:'Join Room'}]);

      // Display user information
      cur_userID = getParam('user');
      if (cur_userID == null) cur_userID = 0;
      $("#username_display").html(cur_user);
      $('input[name="username_join"]').val(cur_user);

      getMyRooms();
      getNearbyRooms();

      $("#username_update_form").submit(function(e) {
        var newUsername = $("#username_input").val()
        $("#username_display").html(newUsername);
        $('input[name="username_join"]').val(newUsername);
        cur_user = newUsername;
        cur_userID = 0;
        $("#username_input").val('');
        $("#username_update_div").css("display", "none");
        registerUser(newUsername, function() {
          getMyRooms();
          getNearbyRooms();
        });
        e.preventDefault();
      });

    }

// Queue.html functions

    function submitSong(roomID, autocompleteData) {
      $.ajax({
        type: "POST",
        url: "/submit_song",
        data: {room_id: roomID, user_id: cur_userID, url: autocompleteData.url, track: autocompleteData.name, artist: autocompleteData.artist, album: autocompleteData.album},
        success: function(data) {
          if (data["status"]=="OK") alert("Song added successfully!");
          displayQueue(roomID);
          $("#spotify_song_search").val('');
        }
      });
    }

    function displayQueue(roomID, password) {
      if (password == null) password = "";
      $.ajax({
        type: "GET",
        url: "/get_song_queue",
        data: {room_id: roomID, web_app: 'true', password: password},
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
                + (song["image_url"] ?'<img src="'+song["image_url"]+'" style="width:60px; height=60px;"/></a>' : '<div class="square"><img></div></a>')
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
            $("#queue_list").append('<li class="comp">' +data["message"]+'</li>');
          }
        }
      });
    }

    function prepareSongSearch() {
        $("#homeButton").attr("href", "home.html?user=" + cur_userID);
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
              submitSong(roomID, ui.item.data);
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

    function queueReady() {

      cur_userID = getParam("user");
      if (cur_userID == null) cur_userID = 0;

      roomID = getParam("id");
      if (roomID) {
        displayQueue(roomID);
      } else {
        $("#queue_list").append('<li class="comp">No room ID provided.</li>');
      }

      if (getParam("qr")) qr = 1;
      if (qr) {
        registerUser("Anonymous", function() {
          ajaxJoin(roomID, cur_userID, "", prepareSongSearch);
        });
      } else {
        ajaxJoin(roomID, cur_userID, "", prepareSongSearch);
      }

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

