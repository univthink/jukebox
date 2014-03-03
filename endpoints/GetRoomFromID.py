import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

class GetRoomFromID(webapp2.RequestHandler):

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
				if web_app:
					self.response.write(utils.JSONEncoder().encode(room))
				else:
					self.response.write(utils.JSONEncoder().encode({"status":"OK", "data": room}))

		if web_app:
			self.response.write(forms.RETURN_TO_MAIN)