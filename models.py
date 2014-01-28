from google.appengine.ext import ndb

class Room(ndb.Model):
	# id = ndb.IntegerProperty(required=True)
	creator = ndb.IntegerProperty(required=True)
	name = ndb.StringProperty(required=True)
	mode = ndb.StringProperty(required=True)
	coordinates = ndb.GeoPtProperty()
	# queue = ndb.ListProperty(Song,required=True) #(List of Keys to children?)
	# guests = ndb.ListProperty(Guest,required=True) #(List of Keys to children?)
	password = ndb.StringProperty()

# class Guest(ndb.Model):
# 	userid = ndb.ReferenceProperty(User, required=True)
# 	#Subcategorize for different room types here.

class User(ndb.Model):
	id = ndb.IntegerProperty(required=True)
	username = ndb.StringProperty(required=True)

class Song(ndb.Model):
	spotifyURL = ndb.StringProperty(required=True)
	trackName = ndb.StringProperty(required=True)
	artistName = ndb.StringProperty(required=True)
	albumName = ndb.StringProperty()
	# upvotes = ndb.ListProperty(required=True) #(List of usernames)
	# downvotes = ndb.ListProperty(required=True) #(List of usernames)
	# submitter = ndb.ReferenceProperty(Guest, required=True)
	status = ndb.StringProperty(required=True)
	timeSubmitted = ndb.DateTimeProperty(required=True)
	timePlayed = ndb.DateTimeProperty()