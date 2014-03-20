import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

class GetSongQueue(webapp2.RequestHandler):

	def get(self):
		self.response.headers['Content-Type'] = 'application/json'
		room_exists = True

		roomlist_name = utils.DEFAULT_ROOMLIST_NAME
		room_id = self.request.get('room_id')

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
				self.response.write(json.dumps({"status": "NOT OK", "message": "The referenced room was not found."}))
		else:
			allowed = utils.checkPassword(self.request.get('password', ''), room.password)
			if not allowed:
				if web_app:
					self.response.write("The correct password was not provided.")
				else:
					self.response.write(json.dumps({"status": "NOT OK", "message": "The correct password was not provided."}))
			else:
				#TODO: Error checking
				try:
					num_songs = int(self.request.get('num_songs',"1000"))
				except:
					num_songs = 1000
				songs = []
				song_pos = 0;
				song_list = room.queue

				if self.request.get('type') == 'history':
					song_list = room.history
				elif self.request.get('type') == 'both':
					song_list = song_list + room.history

				for song_id in song_list:
					try:
						song = models.Song.get_by_id(int(song_id),parent=room.key)
						song_dict = song.to_dict()
						try:
							song_dict['submitter'] = utils.get_user_by_guest_id(room,song_dict['submitter'].integer_id()).username
						except:
							song_dict['submitter']
						song_dict['timeSubmitted'] = str(song_dict['timeSubmitted'])
						song_dict['unique_id'] = int(song_id)
						if song.history == False:
							song_dict['song_pos'] = song_pos
							song_pos = song_pos + 1
						songs.append(song_dict)
						if len(songs) >= num_songs:
							break;
					except:
						pass

				self.response.write(utils.JSONEncoder().encode({"status": "OK","data": songs,"room_name":room.name,"all_admin":room.all_admin}))
