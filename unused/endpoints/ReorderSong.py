import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

class ReorderSong(webapp2.RequestHandler):

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
				room_exists = False

		if room_exists:
			if not utils.is_admin(room,self.request.get('user_id')):
				self.response.write(json.dumps({"status": "NOT OK", "message": "You must be an admin to reorder songs."}))
				return

		if not room_exists:
			self.response.write(json.dumps({"status": "NOT OK", "message": "The requested room was not found."}))
		else:
			if room.mode != 0:
				self.response.write(json.dumps({"status": "NOT OK", "message": "You can only reorder songs in First Come First Serve mode."}))
			else:
				allowed = utils.checkPassword(self.request.get('password', ''), room.password)
				if not allowed:
					self.response.write(json.dumps({"status": "NOT OK", "message": "The correct password was not provided."}))
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
						try:
							new_pos = int(self.request.get('new_pos'))
						except: # originally a else, getting a syntax error
							new_pos = 0
						room.queue.remove(song_id)
						room.queue.insert(new_pos,song_id)
						room.put()
						self.response.write(json.dumps({"status":"OK"}))