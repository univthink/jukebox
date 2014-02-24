import webapp2, models, forms, json, endpoints, utils, urllib2
from google.appengine.ext import ndb

class SubmitSong(webapp2.RequestHandler):

	def post(self):
		room_exists = True
		self.response.headers['Content-Type'] = 'application/json'

		roomlist_name = self.request.get('roomlist_name',utils.DEFAULT_ROOMLIST_NAME)
		room_id = self.request.get('room_id')

		if not room_id:
			room_exists = False
		else:
			room = models.Room.get_by_id(int(room_id),parent=utils.roomlist_key(roomlist_name))
			if room == None:
				room_exists = False;

		web_app = self.request.get('web_app','false') != 'false'

		if not room_exists:
			if web_app:
				self.response.write("The referenced room was not found.")
			else:
				self.response.write(json.dumps({"status": "NOT OK", "message": "The requested room was not found."}))
		else:
			user_id = self.request.get('user_id')
			userlist_name = self.request.get('userlist_name',utils.DEFAULT_USERLIST_NAME)
			user = models.User.get_by_id(int(user_id),parent=utils.userlist_key(userlist_name))
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
					imageStuff = json.loads(urllib2.urlopen("https://embed.spotify.com/oembed/?url="+self.request.get('url')).read())
					# self.response.write(imageStuff)
					#TODO: Add values necessary for other modes
					song = models.Song(parent=room.key,
									   url=self.request.get('url'),
									   track=self.request.get('track'),
									   artist=self.request.get('artist'),
									   album=self.request.get('album'),
									   history=False,
									   image_url=imageStuff["thumbnail_url"] if imageStuff else None,
									   status=0)

					song_key = song.put()

					#TODO: Order differently based on mode
					room.queue.append(song_key.integer_id())
					room.put()

					if web_app:
						self.response.write("You successfully submitted \"" + self.request.get('track_name') + "\" to the room \"" + room.name + "\".")
					else:
						self.response.write(json.dumps({"status":"OK"}))

		if web_app:
			self.response.write(forms.RETURN_TO_MAIN)