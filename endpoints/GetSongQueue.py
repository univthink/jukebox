import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

class GetSongQueue(webapp2.RequestHandler):

	def get(self):
		self.response.headers['Content-Type'] = 'application/json'
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
			#TODO: Error checking
			num_songs = int(self.request.get('num_songs',"1000"))
			songs = []
			for song_id in room.queue:
				song = models.Song.get_by_id(int(song_id),parent=room.key)
				song_dict = song.to_dict()
				song_dict['timeSubmitted'] = str(song_dict['timeSubmitted'])
				songs.append(song_dict)
				if len(songs) >= num_songs:
					break;

			self.response.write(json.dumps(songs))
