from google.appengine.ext import db

class Room(db.Model):
	id = db.IntegerProperty(required=True)
	creator = db.ReferenceProperty(User,required=True)
	name = db.StringProperty(required=True)
	mode = db.StringProperty(required=True)
	coordinates = db.GeoPtProperty(required=True)
	queue = db.ListProperty(Song,required=True) (List of Keys to children?)
	guests = db.ListProperty(Guest,required=True)(List of Keys to children?)
	password = db.StringProperty()

CREATE_ROOM_FORM = """\
	<br><br>Create a room!<br>
	<form action="create_room" method="post">
	Id: <input type="text" name="id"><br>
	Creator: <input type="text" name="creator"><br>
	Room Name: <input type="text" name="room_name"><br>
	Latitude:<input type="text" name="latitude"><br>
	Longitude: <input type="text" name="longitude"><br>
	Password: <input type="text" name="password"><br>
	<input type="submit" value="Create Room">
	</form>
"""

class Guest(db.Model):
	userid = db.ReferenceProperty(User, required=True)
	#Subcategorize for different room types here.

CREATE_GUEST_FORM = """\
	<form action="create_guest" method="post">
	Id: <input type="text" name="id"><br>
	<input type="submit" value="Create Guest">
	</form>
"""

class User(db.Model):
	id = db.IntegerProperty(required=True)
	username = db.StringProperty(required=True)

CREATE_GUEST_FORM = """\
	<form action="create_user" method="post">
	Id: <input type="text" name="id"><br>
	Username: <input type="text" name="username"><br>
	<input type="submit" value="Create Guest">
	</form>
"""

class Song(db.Model):
	spotifyURL = db.StringProperty(required=True)
	trackName = db.StringProperty(required=True)
	artistName = db.StringProperty(required=True)
	albumName = db.StringProperty()
	upvotes = db.ListProperty(required=True) (List of usernames)
	downvotes = db.ListProperty(required=True) (List of usernames)
	submitter = db.ReferenceProperty(Guest, required=True)
	status = db.StringProperty(required=True)
	timeSubmitted = db.DateTimeProperty(required=True)
	timePlayed = db.DateTimeProperty()

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
