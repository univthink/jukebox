import webapp2, models, forms, json, endpoints, utils, urllib2, hashlib
from google.appengine.ext import ndb
from google.appengine.ext import deferred

#Function that loads image_url for a song specified
#by song key from the url specified by url.
#Used to do deferred loading of album art images.
def load_image_stuff(song_key,url):
	try:
		song = song_key.get()
		song.image_url = json.loads(urllib2.urlopen("https://embed.spotify.com/oembed/?url="+url).read())["thumbnail_url"]
		song.put()
	except:
		pass

#Parameters
#coordinates: string coordinates of room location
#room_name
#creator: user_id of creator
#mode: 0 for first-come-first-server, 1 for fairness
#all_admin: 0 false, 1 true
#password
#initial playlist: JSON blob with songs to add initially
 
#Creates room according to the parameters passed to it
class CreateRoom(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		roomlist_name = utils.DEFAULT_ROOMLIST_NAME
		
		has_coordinates = True
		if self.request.get("coordinates") != '':
			try:
				[lat, lon] = self.request.get("coordinates").split(',')
			except:
				has_coordinates = False
		else:
			has_coordinates = False

		if len(self.request.get("room_name",'')) == 0:
			self.response.write(json.dumps({"status": "NOT OK", "message": "You must enter a room name."}))
			return

		if len(self.request.get("room_name",'')) > 20:
			self.response.write(json.dumps({"status": "NOT OK", "message": "The room name cannot be more than 20 characters."}))
			return

		userlist_name = utils.DEFAULT_USERLIST_NAME
		try:
			user = models.User.get_by_id(int(self.request.get('creator')),parent=utils.userlist_key(userlist_name))
		except:
			user = None
		if user == None:
			self.response.write(json.dumps({"status": "NOT OK", "message": "Invalid user_id."}))
		else:

			try:
				mode = int(self.request.get('mode'))
			except:
				mode = 0

			try:
				all_admin = int(self.request.get('all_admin'))
			except:
				all_admin = 0

			password = self.request.get('password', '')
			hashed_password = hashlib.sha512(password).hexdigest() if password else ''

			room = models.Room(parent=utils.roomlist_key(roomlist_name),
							   creator=int(self.request.get('creator')),
							   name=self.request.get('room_name'),
							   mode=mode,
							   all_admin=all_admin,
							   password= hashed_password,
							   queue=[],
							   history=[])


			if has_coordinates:
				room.lat = float(lat)
				room.lon = float(lon)

			room_key = room.put()

			guest = models.Guest(parent=room_key,user_id=int(self.request.get('creator')),admin=True)
			guest.put()

			if self.request.get('initial_playlist'):
				try:
					for song in json.loads(self.request.get('initial_playlist')):

						if len(song['track']) > 100 or len(song['artist']) > 100 or len(song['album']) > 100:
							continue

						song_model = models.Song(parent=room_key,
										   url=song['url'],
										   track=song['track'],
										   artist=song['artist'],
										   album=song['album'],
										   history = False,
										   image_url=None,
										   status=0,
										   submitter=guest.key)

						song_key = song_model.put()
						try:
							deferred.defer(load_image_stuff,song_key,song['url'])
						except:
							continue

						#TODO: Order differently based on mode
						room.queue.append(song_key.integer_id())

					room_key = room.put()
				except:
					pass

			self.response.write(json.dumps({"status": "OK", "data":room_key.integer_id()}))