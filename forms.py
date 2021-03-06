CREATE_ROOM_FORM = """\
	<br><br><b>Create a room!</b><br>
	<form action="api/create_room" method="post">
	Creator: <input type="text" name="creator"><br>
	Room Name: <input type="text" name="room_name"><br>
	Mode: <input type="text" name="mode"><br>
	Password: <input type="text" name="password"><br>
	Coordinates: <input type="text" name="coordinates"><br>
	All Admin: <input type="text" name="all_admin"><br>
	<input type="submit" value="Create Room">
	</form>
"""

SUBMIT_SONG_FORM = """\
	<form action="api/submit_song" method="post">
	Room ID: <input type="text" name="room_id"><br>
	User ID: <input type="text" name="user_id"><br>
	Spotify URL: <input type="text" name="url"><br>
	Track Name: <input type="text" name="track"><br>
	Artist Name: <input type="text" name="artist"><br>
	Album Name: <input type="text" name="album"><br>
	<input type="hidden" name="web_app" value="true">
	<input type="submit" value="Submit Song">
	</form>
"""

JOIN_ROOM_FORM = """\
	<form action="api/join_room" method="post">
	Id: <input type="text" name="room_id"><br>
	User_ID: <input type="text" name="user_id"><br>
	Password: <input type="text" name="password"><br>
	<input type="hidden" name="web_app" value="true">
	<input type="submit" value="Join Room">
	</form>
"""

CREATE_GUEST_FORM = """\
	<form action="api/create_guest" method="post">
	Id: <input type="text" name="id"><br>
	<input type="submit" value="Create Guest">
	</form>
"""

CREATE_USER_FORM = """\
	<form action="api/register_user" method="post">
	Username: <input type="text" name="username"><br>
	<input type="submit" value="Create User">
	</form>
"""

CREATE_SONG_FORM = """\
	<form action="api/create_guest" method="post">
	Spotify URL: <input type="text" name="spotify_url"><br>
	Track Name: <input type="text" name="track"><br>
	Artist Name: <input type="text" name="artist"><br>
	Album Name: <input type="text" name="album"><br>
	Submitter: <input type="text" name="submitter"><br>
	Status: <input type="text" name="status"><br>
	Time Submitted: <input type="text" name="time_submitted"><br>
	Time Played: <input type="text" name="time_played"><br>
	<input type="submit" value="Create Song">
	</form>
"""

RETURN_TO_MAIN = """\
	<form action="api/" method="get">
	<input type="submit" value="Return to home">
	</form>
"""

GET_SONG_QUEUE_FORM = """\
	<form action="api/get_song_queue" method="get">
	Room ID: <input type="text" name="room_id"><br>
	Num Songs: <input type="text" name="num_songs"><br>
	Type: <input type="text" name="type"><br>
	<input type="submit" value="Get Song Queue">
	</form>
"""

REORDER_SONG_FORM = """\
	<form action="api/reorder_song" method="post">
	Room ID: <input type="text" name="room_id"><br>
	Song ID: <input type="text" name="song_id"><br>
	New Pos: <input type="text" name="new_pos"><br>
	User ID: <input type="text" name="user_id"><br>
	<input type="hidden" name="web_app" value="true">
	<input type="submit" value="Reorder Song!">
	</form>
"""

ARCHIVE_SONG_FORM = """\
	<form action="api/archive_song" method="post">
	Room ID: <input type="text" name="room_id"><br>
	Song ID: <input type="text" name="song_id"><br>
	<input type="hidden" name="web_app" value="true">
	<input type="submit" value="Archive Song!">
	</form>
"""

SET_ADMIN_FORM  = """\
	<form action="api/set_admin" method="post">
	Room ID: <input type="text" name="room_id"><br>
	Value: <input type="text" name="value"><br>
	User ID: <input type="text" name="user_id"><br>
	<input type="hidden" name="web_app" value="true">
	<input type="submit" value="Set Admin!">
	</form>
"""

DELETE_SONG_FORM = """\
	<form action="api/delete_song" method="post">
	Room ID: <input type="text" name="room_id"><br>
	User ID: <input type="text" name="user_id"><br>
	Song ID: <input type="text" name="song_id"><br>
	Password: <input type="text" name="password"><br>
	<input type="hidden" name="web_app" value="true">
	<input type="submit" value="Delete Song!">
	</form>
"""

SEARCH_ROOM_FORM = """\
	<form action="api/search_room" method="post">
	Member ID: <input type="text" name="member_id"><br>
	<input type="submit" value="Search Room!">
	</form>
"""

CHANGE_USERNAME_FORM = """\
	<form action="api/change_username" method="post">
	User ID: <input type="text" name="user_id"><br>
	Name: <input type="text" name="name"><br>
	<input type="submit" value="Change Username!">
	</form>
"""