import webapp2, models, forms, json, endpoints, utils, urllib2
from google.appengine.ext import ndb

class CreateRoom(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		roomlist_name = self.request.get('roomlist_name', utils.DEFAULT_ROOMLIST_NAME)
		
		has_coordinates = True
		if self.request.get("coordinates") != '':
			[lat, lon] = self.request.get("coordinates").split(',')
		else:
			has_coordinates = False


		userlist_name = self.request.get('userlist_name', utils.DEFAULT_USERLIST_NAME)
		user = models.User.get_by_id(int(self.request.get('creator')),parent=utils.userlist_key(userlist_name))
		if user == None:
			toReturn = {"status": "NOT OK", "message": "Invalid user_id."}
			self.response.write(json.dumps(toReturn))
		else:

			try:
				mode = int(self.request.get('mode'))
			except:
				mode = 0

			room = models.Room(parent=utils.roomlist_key(roomlist_name),
							   creator=int(self.request.get('creator')),
							   name=self.request.get('room_name'),
							   mode=mode,
							   password=self.request.get('password', ''),
							   queue=[],
							   history=[])


			if has_coordinates:
				room.lat = float(lat)
				room.lon = float(lon)

			room_key = room.put()

			if self.request.get('initial_playlist'):
				for song in json.loads(self.request.get('initial_playlist')):

					try:
						imageStuff = json.loads(urllib2.urlopen("https://embed.spotify.com/oembed/?url="+song['url']).read())
					except:
						imageStuff = None

					song = models.Song(parent=room_key,
									   url=song['url'],
									   track=song['track'],
									   artist=song['artist'],
									   album=song['album'],
									   history = False,
									   image_url=imageStuff["thumbnail_url"] if imageStuff else None,
									   status=0)

					song_key = song.put()

					#TODO: Order differently based on mode
					room.queue.append(song_key.integer_id())

				room_key = room.put()

			guest = models.Guest(parent=room_key,user_id=int(self.request.get('creator')))
			guest.put()

			toReturn = {"status": "OK", "data":room_key.integer_id()}
			self.response.write(json.dumps(toReturn))