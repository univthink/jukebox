import webapp2, models, forms, json, endpoints, utils, urllib2
from google.appengine.ext import ndb

class DeleteSong(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		room_exists = True

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
			allowed = utils.checkPassword(self.request.get('password', ''), room.password)
			if not allowed:
				if web_app:
					self.response.write("The correct password was not provided.")
				else:
					self.response.write(json.dumps({"status": "NOT OK", "message": "The correct password was not provided."}))
			else:
				if room.mode != 0:
					if web_app:
						self.response.write("You can only reorder songs in First Come First Serve mode.")
					else: 
						self.response.write(json.dumps({"status": "NOT OK", "message": "You can only reorder songs in First Come First Serve mode."}))
				else:
					if self.request.get('url') == None:
						if web_app:
							self.response.write("No url specified.")
						else:
							self.response.write(json.dumps({"status": "NOT OK", "message": "No url specified."}))
					else:
						song = models.Song.query(ancestor=room.key)
						song = song.filter(models.Song.url == self.request.get('url'))
						songs = song.fetch()

						if not songs:
							if web_app:
								self.response.write("Song not found in room.")
							else:
								self.response.write(json.dumps({"status": "NOT OK", "message": "Song not found in room."}))
						else:
							if self.request.get('position'):
								position = int(self.request.get('position'))
								removedSong = False
								for song in songs:
									index = room.queue.index(song.key.integer_id())
									if position == index:
										room.queue.remove(song.key.integer_id())
										song.key.delete()
										room.put()
										if web_app:
											self.response.write("You successfully deleted the song.")
										else:
											self.response.write(json.dumps({"status":"OK"}))
										removedSong = True
										break
								if not removedSong:
									if web_app:
										self.response.write("Song not found at that position in room.")
									else:
										self.response.write(json.dumps({"status": "NOT OK", "message": "Song not found at that position in room."}))
							else:
								room.queue.remove(songs[0].key.integer_id())
								songs[0].key.delete()
								room.put()
								if web_app:
									self.response.write("You successfully deleted the song.")
								else:
									self.response.write(json.dumps({"status":"OK"}))

		if web_app:
			self.response.write(forms.RETURN_TO_MAIN)