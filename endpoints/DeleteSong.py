import webapp2, models, forms, json, endpoints, utils, urllib2
from google.appengine.ext import ndb

def fairness_adjustment(room,position,submitter):
	x = position
	while x < len(room.queue):
		queue_id = room.queue[x]
		queue_song = models.Song.get_by_id(int(queue_id),parent=room.key)
		queue_submitter = queue_song.submitter.integer_id()
		if queue_submitter == submitter:
			if position == x:
				break
			room.queue.remove(queue_id)
			room.queue.insert(position,queue_id)
			position = x + 1
		x = x + 1

class DeleteSong(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		room_exists = True

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
				room_exists = None

		if room_exists:
			if not utils.is_admin(room,self.request.get('user_id')):
				self.response.write(json.dumps({"status": "NOT OK", "message": "You must be an admin to delete songs."}))
				return

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
				if room.mode != 0 and room.mode != 1:
					if web_app:
						self.response.write("You cannot delte songs in this mode.")
					else: 
						self.response.write(json.dumps({"status": "NOT OK", "message": "You cannot delet songs in this mode."}))
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
								removedSong = False
								try:
									position = int(self.request.get('position'))
									for song in songs:
										index = room.queue.index(song.key.integer_id())
										if position == index:

											submitter = song.submitter.integer_id()

											room.queue.remove(song.key.integer_id())

											if room.mode == 1:
												fairness_adjustment(room,position,submitter)

											song.key.delete()
											room.put()
											if web_app:
												self.response.write("You successfully deleted the song.")
											else:
												self.response.write(json.dumps({"status":"OK"}))
											removedSong = True
											break
								except:
									removedSong = False
								if not removedSong:
									if web_app:
										self.response.write("Song not found at that position in room.")
									else:
										self.response.write(json.dumps({"status": "NOT OK", "message": "Song not found at that position in room."}))
							else:
								submitter = songs[0].submitter.integer_id()
								position = room.queue.index(songs[0].key.integer_id())

								room.queue.remove(songs[0].key.integer_id())
								songs[0].key.delete()

								if room.mode == 1:
									fairness_adjustment(room,position,submitter)

								room.put()
								if web_app:
									self.response.write("You successfully deleted the song.")
								else:
									self.response.write(json.dumps({"status":"OK"}))

		if web_app:
			self.response.write(forms.RETURN_TO_MAIN)