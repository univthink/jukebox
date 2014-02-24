import webapp2, models, forms, json, endpoints, utils, urllib2
from google.appengine.ext import ndb

class CheckPlayStatus(webapp2.RequestHandler):

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

			try:
				playing = room.playing
			except:
				playing = True

			if web_app:
				if playing:
					self.response.write("The song is playing.")
				else:
					self.response.write("The song is paused.")
			else:
				self.response.write(json.dumps({"status":"OK", "data": json.dumps(playing)}))	

		if web_app:
			self.response.write(forms.RETURN_TO_MAIN)