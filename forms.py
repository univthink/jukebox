CREATE_ROOM_FORM = """\
	<br><br>Create a room!<br>
	<form action="create_room" method="post">
	Creator: <input type="text" name="creator"><br>
	Room Name: <input type="text" name="room_name"><br>
	Mode: <input type="text" name="mode"><br>
	Password: <input type="text" name="password"><br>
	<input type="submit" value="Create Room">
	</form>
"""

CREATE_GUEST_FORM = """\
	<form action="create_guest" method="post">
	Id: <input type="text" name="id"><br>
	<input type="submit" value="Create Guest">
	</form>
"""

CREATE_USER_FORM = """\
	<br><br>Create a user!<br>
	<form action="register_user" method="post">
	Username: <input type="text" name="username"><br>
	<input type="submit" value="Create User">
	</form>
"""

CREATE_SONG_FORM = """\
	<form action="create_guest" method="post">
	Spotify URL: <input type="text" name="spotify_url"><br>
	Track Name: <input type="text" name="track_name"><br>
	Artist Name: <input type="text" name="artist_name"><br>
	Album Name: <input type="text" name="album_name"><br>
	Submitter: <input type="text" name="submitter"><br>
	Status: <input type="text" name="status"><br>
	Time Submitted: <input type="text" name="time_submitted"><br>
	Time Played: <input type="text" name="time_played"><br>
	<input type="submit" value="Create Song">
	</form>
"""

RETURN_TO_MAIN = """\
	<form action="/" method="get">
	<input type="submit" value="Return to home">
	</form>
"""