from google.appengine.ext import db

class Room(db.Model):
	id = db.IntegerProperty(required=True)
	creator = db.ReferenceProperty(User,required=True)
	name = db.StringProperty(required=True)
	mode = db.StringProperty(required=True)
	coordinates = db.GeoPtProperty(required=True)
	queue = db.ListProperty(Song,required=True)
	guests = db.ListProperty(Guest,required=True)
	password = db.StringProperty()

class Guest(db.Model):
	userid = db.ReferenceProperty(User, required=True)
	#Subcategorize for different room types here.

class User(db.Model):
	id = db.IntegerProperty(required=True)
	username = db.StringProperty(required=True)

class FacebookUser(User):
	facebookOauth = db.StringProperty(required=True)

class Song(db.Model):
	spotifyURL = db.StringProperty(required=True)
	trackName = db.StringProperty(required=True)
	artistName = db.StringProperty(required=True)
	albumName = db.StringProperty()
	upvotes = db.IntegerProperty(required=True)
	downvotes = db.IntegerProperty(required=True)
	submitter = db.ReferenceProperty(Guest, required=True)
	status = db.StringProperty(required=True)
	timeSubmitted = db.DateTimeProperty(required=True)
	timePlayed = db.DateTimeProperty()
