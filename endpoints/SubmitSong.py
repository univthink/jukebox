import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

class SubmitSong(webapp2.RequestHandler):

	def post(self):
		room_exists = True

		roomlist_name = self.request.get('roomlist_name',utils.DEFAULT_ROOMLIST_NAME)
		room_id = self.request.get('room_id')

		room = models.Room.get_by_id(int(room_id),parent=utils.roomlist_key(roomlist_name))
		if room == None:
			room_exists = False;

		web_app = self.request.get('web_app','false') != 'false'

		if not room_exists:
			if web_app:
				self.response.write("The referenced room was not found.")
			else:
				self.response.write('0')
		else:
			user_id = self.request.get('user_id')
			guest = models.Guest.get_by_id(int(user_id),parent=room.key)
			if guest == None:
				if web_app:
					self.response.write("You need to join this room before you can submit a song.")
				else:
					self.response.write('0')
			else:
				#TODO: Add values necessary for other modes
				song = models.Song(parent=room.key,
								   spotifyURL=self.request.get('url'),
								   trackName=self.request.get('track_name'),
								   artistName=self.request.get('artist_name'),
								   albumName=self.request.get('album_name'),
								   status=0)

				song_key = song.put()

				#TODO: Order differently based on mode
				room.queue.append(song_key.integer_id())
				room.put()

				if web_app:
					self.response.write("You successfully submitted \"" + self.request.get('track_name') + "\" to the room \"" + room.name + "\".")
				else:
					self.response.write('1')

		if web_app:
			self.response.write(forms.RETURN_TO_MAIN)