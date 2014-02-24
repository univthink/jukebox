import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

class ArchiveSong(webapp2.RequestHandler):

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
			song_id = int(self.request.get('song_id'))
			if room.queue.count(song_id) == 0:
				if web_app:
					self.response.write("The requested song is not in the Room's queue.")
				else:
					self.response.write(json.dumps({"status": "NOT OK", "message": "The requested song is not in the Room's queue."}))
			else:
				song = models.Song.get_by_id(int(song_id),parent=room.key)
				song.history = True
				song.put()

				room.queue.remove(song_id)
				room.history.append(song_id)
				room.put()

				if web_app:
					self.response.write("You successfully archived song \"" + str(song_id) + ".\"")
				else:
					self.response.write(json.dumps({"status":"OK"}))

		if web_app:
			self.response.write(forms.RETURN_TO_MAIN)