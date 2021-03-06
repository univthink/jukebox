import webapp2, models, forms, json, endpoints, utils, urllib2
from google.appengine.ext import ndb

#Called when a song is deleted in fairness mode.
#It will shift the user's songs up to replace
#the delted song.
#position: position where the song was deleted
#submitter: the id of the person whose song was deleted
def fairness_adjustment(room,position,submitter):
	x = position
	while x < len(room.queue):
		queue_id = room.queue[x]
		queue_song = models.Song.get_by_id(int(queue_id),parent=room.key)
		queue_submitter = queue_song.submitter.integer_id()
		if queue_submitter == submitter:#found a song to be moved up
			if position == x:
				break
			#move song up
			room.queue.remove(queue_id)
			room.queue.insert(position,queue_id)
			#set position to where the song was moved from
			#this way, the algorithm can keep running and will
			#continue moving songs up to fill the gaps.
			position = x + 1
		x = x + 1

#Parameters
#room_id: room of the song to be deleted
#user_id: user_id of deleter(must be admin)
#password: password for validation purposes
#song_id: UUID for the song
#DEPRECATED: url: spotify uri that matches the song you want to delete
#DEPRECATED: position: queue position of the song being deleted
class DeleteSong(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		room_exists = True

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
				room_exists = None

		if room_exists:
			user_id = self.request.get('user_id')
			if not utils.is_admin(room, user_id):
				self.response.write(json.dumps({"status": "NOT OK", "message": "You must be an admin to delete songs."}))
				return

		if not room_exists:
			self.response.write(json.dumps({"status": "NOT OK", "message": "The requested room was not found."}))
		else:
			allowed = utils.checkPassword(self.request.get('password', ''), room.password)
			if not allowed:
				self.response.write(json.dumps({"status": "NOT OK", "message": "The correct password was not provided."}))
			else:
				if room.mode != 0 and room.mode != 1:
					self.response.write(json.dumps({"status": "NOT OK", "message": "You cannot delete songs in this mode."}))
				else:

					#TODO: Error checking
					song_exists = True
					try:
						song_id = int(self.request.get('song_id'))
					except:
						song_exists = False
					if not song_exists or room.queue.count(song_id) == 0:
						self.response.write(json.dumps({"status": "NOT OK", "message": "The requested song is not in the Room's queue."}))
					else:

					# if self.request.get('url') == None:
					# 	self.response.write(json.dumps({"status": "NOT OK", "message": "No url specified."}))
					# else:
					# 	song = models.Song.query(ancestor=room.key)
					# 	song = song.filter(models.Song.url == self.request.get('url'))
					# 	songs = song.fetch()

					# 	if not songs:
					# 		self.response.write(json.dumps({"status": "NOT OK", "message": "Song not found in room."}))
					# 	else:

							# if self.request.get('position'):
							# 	removedSong = False
							# 	try:
							# 		position = int(self.request.get('position'))
							# 		for song in songs:
							# 			index = room.queue.index(song.key.integer_id())
							# 			#If a valid position is specified, removes that particular instance of the song.
							# 			if position == index:

							# 				submitter = song.submitter.integer_id()

							# 				room.queue.remove(song.key.integer_id())

							# 				#If the room is in fairness mode, adjust accordingly.
							# 				if room.mode == 1:
							# 					fairness_adjustment(room,position,submitter)

							# 				song.key.delete()
							# 				room.put()

							# 				self.response.write(json.dumps({"status":"OK"}))

							# 				removedSong = True
							# 				break
							# 	except:
							# 		removedSong = False
							# 	if not removedSong:
							# 		self.response.write(json.dumps({"status": "NOT OK", "message": "Song not found at that position in room."}))
							# else:

								#If a position is not specified, remove the first instance of that song, deleting from both queue and song list.
								# submitter = songs[0].submitter.integer_id()
								# position = room.queue.index(songs[0].key.integer_id())

								# room.queue.remove(songs[0].key.integer_id())
								# songs[0].key.delete()

								room.queue.remove(song_id)

								#If the room is in fairness mode, adjust accordingly.
								if room.mode == 1:
									position = room.queue.index(song_id)
									submitter = int(user_id)
									fairness_adjustment(room,position,submitter)

								room.put()
								self.response.write(json.dumps({"status":"OK"}))
