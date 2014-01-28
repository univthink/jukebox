from google.appengine.ext import ndb

class Room(ndb.Model):
	id = db.IntegerProperty(required=True)
	creator = db.ReferenceProperty(User,required=True)
	name = db.StringProperty(required=True)
	mode = db.StringProperty(required=True)
	coordinates = db.GeoPtProperty(required=True)
	queue = db.ListProperty(Song,required=True) #(List of Keys to children?)
	guests = db.ListProperty(Guest,required=True) #(List of Keys to children?)
	password = db.StringProperty()

class Guest(ndb.Model):
	userid = db.ReferenceProperty(User, required=True)
	#Subcategorize for different room types here.

class User(ndb.Model):
	id = db.IntegerProperty(required=True)
	username = db.StringProperty(required=True)

class Song(ndb.Model):
	spotifyURL = db.StringProperty(required=True)
	trackName = db.StringProperty(required=True)
	artistName = db.StringProperty(required=True)
	albumName = db.StringProperty()
	upvotes = db.ListProperty(required=True) #(List of usernames)
	downvotes = db.ListProperty(required=True) #(List of usernames)
	submitter = db.ReferenceProperty(Guest, required=True)
	status = db.StringProperty(required=True)
	timeSubmitted = db.DateTimeProperty(required=True)
	timePlayed = db.DateTimeProperty()