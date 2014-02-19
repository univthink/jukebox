import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb


class JoinRoom(webapp2.RequestHandler):

	def post(self):
		room_exists = True
		self.response.headers['Content-Type'] = 'application/json'
		roomlist_name = self.request.get('roomlist_name', utils.DEFAULT_ROOMLIST_NAME)
		room_id = self.request.get('room_id')
		if not room_id:
			room_exists = False
		else:
			room = models.Room.get_by_id(int(room_id), parent=utils.roomlist_key(roomlist_name))
			if room == None:
				room_exists = False

		web_app = self.request.get('web_app','false') != 'false'

		if not room_exists:
			if web_app:
				self.response.write("The requested room was not found.")
			else:
				self.response.write(json.dumps({"status": "NOT OK", "message": "The requested room was not found."}))
		else:
			if room.password != '' and room.password != self.request.get('password'):
				if web_app:
					self.response.write("You did not enter the proper password for room: " + room.name)
				else:
					self.response.write(json.dumps({"status": "NOT OK", "message": "You did not enter the proper password for room: " + room.name}))
			else:
				user_id = self.request.get('user_id')
				if user_id == '':
					if web_app:
						self.response.write("No user_id was provided.")
					else:
						self.response.write(json.dumps({"status": "NOT OK", "message": "No user_id was provided."}))
				else:
					userlist_name = self.request.get('userlist_name', utils.DEFAULT_USERLIST_NAME)
					user = models.User.get_by_id(int(user_id),parent=utils.userlist_key(userlist_name))
					if user == None:
						self.response.write("Invalid user_id.")
					else:
						guest = models.Guest(parent=room.key,user_id=int(user_id))
						guest_key = guest.put()
						#TODO: Consdier adding detail to "Guest"

						if web_app:
							self.response.write("\"" + room.name + "\" was successfully joined!")
						else:
							self.response.write(json.dumps({"status":"OK"}))

		if web_app:
			self.response.write(forms.RETURN_TO_MAIN)