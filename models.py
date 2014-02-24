from google.appengine.ext import ndb

class Room(ndb.Model):
	# id = ndb.IntegerProperty(required=True)
	creator = ndb.IntegerProperty(required=True)
	name = ndb.StringProperty(required=True)
	mode = ndb.IntegerProperty(required=True,default=0)
	lat = ndb.FloatProperty()
	lon = ndb.FloatProperty()
	queue = ndb.IntegerProperty(repeated=True)
	history = ndb.IntegerProperty(repeated=True)
	playing = ndb.BooleanProperty(default=True)
	password = ndb.StringProperty()

class Guest(ndb.Model):
	user_id = ndb.IntegerProperty(required=True)
	admin = ndb.BooleanProperty(required=True,default=False)
#	userid = ndb.ReferenceProperty(User, required=True)
# 	#Subcategorize for different room types here.

class User(ndb.Model):
	# id = ndb.IntegerProperty(required=True)
	username = ndb.StringProperty(required=True)

class Song(ndb.Model):
	url = ndb.StringProperty(required=True)
	track = ndb.StringProperty(required=True)
	artist = ndb.StringProperty(required=True)
	album = ndb.StringProperty()
	image_url = ndb.StringProperty()
	history = ndb.BooleanProperty(required=True)
	# upvotes = ndb.ListProperty(required=True) #(List of usernames)
	# downvotes = ndb.ListProperty(required=True) #(List of usernames)
	submitter = ndb.KeyProperty(kind=Guest, required=True)
	status = ndb.IntegerProperty(required=True)
	timeSubmitted = ndb.DateTimeProperty(auto_now_add=True,required=True)
	#timePlayed = ndb.DateTimeProperty()