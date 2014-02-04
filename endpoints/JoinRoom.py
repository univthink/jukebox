import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

def get_anonymous_name():
	#TODO: Update
	return 'anonymous'

class JoinRoom(webapp2.RequestHandler):

	def post(self):
		room_exists = True

		roomlist_name = self.request.get('roomlist_name', utils.DEFAULT_ROOMLIST_NAME)
		room_id = self.request.get('room_id')
		room = models.Room.get_by_id(int(room_id), parent=utils.roomlist_key(roomlist_name))
		if room == None:
			room_exists = False;

		web_app = self.request.get('web_app','false') != 'false'

		if not room_exists:
			if web_app:
				self.response.write("The requested room was not found.")
			else:
				self.response.write('0')
		else:
			if room.password != '' and room.password != self.request.get('password'):
				if web_app:
					self.response.write("You did not enter the proper password for room: " + room.name)
				else:
					self.response.write('0')
			else:
				username = self.request.get('username',get_anonymous_name())
				if username == '':
					username = get_anonymous_name()

				guest = models.Guest(parent=room.key,username=username)
				guest_key = guest.put()
				#TODO: Consdier adding detail to "Guest"

				if web_app:
					self.response.write("\"" + room.name + "\" was successfully joined!")
				else:
					self.response.write("1")

		if web_app:
			self.response.write(forms.RETURN_TO_MAIN)