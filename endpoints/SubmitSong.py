import webapp2, models, forms, json, endpoints, utils, urllib2
from google.appengine.ext import ndb
from sets import Set

class SubmitSong(webapp2.RequestHandler):

	def get_submitter_id(self,song_id,room):
		try:
			song = models.Song.get_by_id(int(song_id),parent=room.key)
			return song.submitter.integer_id()
		except:
			return 0

	def fairness_insert(self,room,guest):
		x = 0
		already_seen = Set()
		while x < len(room.queue):

			submitter_id = self.get_submitter_id(room.queue[x],room)

			if submitter_id not in already_seen:
				already_seen.add(submitter_id)
				x = x + 1
			else:
				if guest.key.integer_id() in already_seen:
					already_seen.clear()
				else:
					return x

		return x

	def post(self):
		room_exists = True
		self.response.headers['Content-Type'] = 'application/json'

		roomlist_name = utils.DEFAULT_ROOMLIST_NAME
		room_id = self.request.get('room_id')

		if not room_id:
			room_exists = False
		else:
			try:
				room = models.Room.get_by_id(int(room_id),parent=utils.roomlist_key(roomlist_name))
				if room == None:
					room_exists = False
			except:
				room_exists = False

		if not room_exists:
			self.response.write(json.dumps({"status": "NOT OK", "message": "The requested room was not found."}))
		else:
			allowed = utils.checkPassword(self.request.get('password', ''), room.password)
			if not allowed:
				self.response.write(json.dumps({"status": "NOT OK", "message": "The correct password was not provided."}))
			else:
				user_id = self.request.get('user_id')
				userlist_name = utils.DEFAULT_USERLIST_NAME
				try:
					user = models.User.get_by_id(int(user_id),parent=utils.userlist_key(userlist_name))
				except:
					user = None
				if user == None:
					self.response.write(json.dumps({"status": "NOT OK", "message": "The given user_id is not a valid user."}))
				else:
					guest_query = models.Guest.query(models.Guest.user_id == int(user_id),ancestor=room.key)
					guest = guest_query.fetch()
					if len(guest) == 0:
						self.response.write(json.dumps({"status": "NOT OK", "message": "You need to join this room before you can submit a song."}))
					else:
						#Use Spotify Metadata API to get album art image urls.
						try:
							imageStuff = json.loads(urllib2.urlopen("https://embed.spotify.com/oembed/?url="+self.request.get('url')).read())
						except: 
							self.response.write(json.dumps({"status":"NOT OK","message":"The requested spotify url could not be accessed"}))
							return
							imageStuff = None

						if len(self.request.get('track')) > 100 or len(self.request.get('artist')) > 100 or len(self.request.get('album')) > 100:
							self.response.write(json.dumps({"status":"NOT OK","message":"Track name, artist, or album cannot be more than 100 characters."}))
							return

						song = models.Song(parent=room.key,
										   url=self.request.get('url'),
										   track=self.request.get('track'),
										   artist=self.request.get('artist'),
										   album=self.request.get('album'),
										   history=False,
										   image_url=imageStuff["thumbnail_url"] if imageStuff else None,
										   status=0,
										   submitter=guest[0].key)

						song_key = song.put()

						if room.mode == 1:
							insert_pos = self.fairness_insert(room,guest[0])
							room.queue.insert(insert_pos,song_key.integer_id())
						else:
							room.queue.append(song_key.integer_id())

						room.put()
						self.response.write(json.dumps({"status":"OK"}))