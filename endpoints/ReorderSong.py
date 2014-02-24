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
			#TODO: Mode?
			if room.mode != 0:
				if web_app:
					self.response.write("You can only reorder songs in First Come First Serve mode.")
				else: 
					self.response.write(json.dumps({"status": "NOT OK", "message": "You can only reorder songs in First Come First Serve mode."}))
			else:
				#TODO: Error checking
				song_id = int(self.request.get('song_id'))
				if room.queue.count(song_id) == 0:
					if web_app:
						self.response.write("The requested song is not in the Room's queue.")
					else:
						self.response.write(json.dumps({"status": "NOT OK", "message": "The requested song is not in the Room's queue."}))
				else:
					new_pos = int(self.request.get('new_pos'))
					room.queue.remove(song_id)
					room.queue.insert(new_pos,song_id)
					room.put()

					if web_app:
						self.response.write("You successfully moved song \"" + str(song_id) + "\" to position " + str(new_pos))
					else:
						self.response.write(json.dumps({"status":"OK"}))

		if web_app:
			self.response.write(forms.RETURN_TO_MAIN)