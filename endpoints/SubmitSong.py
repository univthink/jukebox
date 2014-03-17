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

		roomlist_name = self.request.get('roomlist_name',utils.DEFAULT_ROOMLIST_NAME)
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

		web_app = self.request.get('web_app','false') != 'false'

		if not room_exists:
			if web_app:
				self.response.write("The referenced room was not found.")
			else:
				self.response.write(json.dumps({"status": "NOT OK", "message": "The requested room was not found."}))
		else:
			allowed = utils.checkPassword(self.request.get('password', ''), room.password)
			if not allowed:
				if web_app:
					self.response.write("The correct password was not provided.")
				else:
					self.response.write(json.dumps({"status": "NOT OK", "message": "The correct password was not provided."}))
			else:
				user_id = self.request.get('user_id')
				userlist_name = self.request.get('userlist_name',utils.DEFAULT_USERLIST_NAME)
				try:
					user = models.User.get_by_id(int(user_id),parent=utils.userlist_key(userlist_name))
				except:
					user = None
				if user == None:
					if web_app:
						self.response.write("The given user_id is not a valid user.")
					else:
						self.response.write(json.dumps({"status": "NOT OK", "message": "The given user_id is not a valid user."}))
				else:
					guest_query = models.Guest.query(models.Guest.user_id == int(user_id),ancestor=room.key)
					guest = guest_query.fetch()
					if len(guest) == 0:
						if web_app:
							self.response.write("You need to join this room before you can submit a song.")
						else:
							self.response.write(json.dumps({"status": "NOT OK", "message": "You need to join this room before you can submit a song."}))
					else:
						try:
							imageStuff = json.loads(urllib2.urlopen("https://embed.spotify.com/oembed/?url="+self.request.get('url')).read())
						except: # originally a else, getting a syntax error
							imageStuff = None

						# self.response.write(imageStuff)
						# TODO: Add values necessary for other modes
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

						#TODO: Order differently based on mode
						#TODO: Delete/Reorder for Fairness?
						if room.mode == 1:
							insert_pos = self.fairness_insert(room,guest[0])
							room.queue.insert(insert_pos,song_key.integer_id())
						else:
							room.queue.append(song_key.integer_id())

						room.put()

						if web_app:
							self.response.write("You successfully submitted \"" + self.request.get('track_name') + "\" to the room \"" + room.name + "\".")
						else:
							self.response.write(json.dumps({"status":"OK"}))

		if web_app:
			self.response.write(forms.RETURN_TO_MAIN)