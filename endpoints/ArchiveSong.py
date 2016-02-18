import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

#Parameters
#room_id: the room for which a song will be archived
#song_id: the id of the song which will be archived
#password: password for validation purposes

#Archive songs takes the given song in a room's queue and
#moves it to the "history" to represent that it has
#alredy been played.
class ArchiveSong(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		room_exists = True

		roomlist_name = utils.DEFAULT_ROOMLIST_NAME

		try:
			room_id = int(self.request.get('room_id'))
		except:
			self.response.write(json.dumps({"status": "NOT OK", "message": "room_id is not a valid integer"}))
			return

		try:
			room = models.Room.get_by_id(room_id,parent=utils.roomlist_key(roomlist_name))
			if room == None:
				self.response.write(json.dumps({"status": "NOT OK", "message": "The requested Room was not found."}))
				return
		except:
			self.response.write(json.dumps({"status": "NOT OK", "message": "The requested Room was not found."}))
			return

		if not utils.checkPassword(self.request.get('password', ''), room.password):
			self.response.write(json.dumps({"status": "NOT OK", "message": "The correct password was not provided."}))
			return

		if not room.creator == long(self.request.get('user_id')):
			self.response.write(json.dumps({"status": "NOT OK", "message": "Only the creator of a room can archive a song."}))
			return

		try:
			song_id = int(self.request.get('song_id'))
		except:
			self.response.write(json.dumps({"status": "NOT OK", "message": "You did not submit a valid song id."}))
			return

		if room.queue.count(song_id) == 0:
			self.response.write(json.dumps({"status": "NOT OK", "message": "The requested song is not in the Room's queue."}))
			return

		song = models.Song.get_by_id(song_id,parent=room.key)
		song.history = True

		room.queue.remove(song_id)
		room.history.append(song_id)
		try:
			utils.transactional_put(song,room)
		except Exception as e:
			self.response.write(json.dumps({"status": "NOT OK", "message": e}))
			return

		self.response.write(json.dumps({"status":"OK"}))