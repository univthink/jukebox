import webapp2, models, forms, json
from google.appengine.ext import ndb

DEFAULT_ROOMLIST_NAME = "default_roomlist"
DEFAULT_USERLIST_NAME = "default_userlist"

def roomlist_key(roomlist_name=DEFAULT_ROOMLIST_NAME):
	return ndb.Key('RoomList',roomlist_name)

def userlist_key(userlist_name=DEFAULT_USERLIST_NAME):
	return ndb.Key('UserList',userlist_name)

class Main(webapp2.RequestHandler):

	def get(self):
		self.response.write('Welcome to Music Vis!')
		self.response.write(forms.CREATE_ROOM_FORM)

		self.response.write('<b>Current Rooms:<br></b>')

		roomlist_name = self.request.get('roomlist_name', DEFAULT_ROOMLIST_NAME)
		room_query = models.Room.query(ancestor=roomlist_key(roomlist_name))
		rooms = room_query.fetch(10)

		for room in rooms:
			self.response.write(room)
			self.response.write("<br>")

		self.response.write(forms.CREATE_USER_FORM)

		self.response.write('<b>Current Users:<br></b>')

		userlist_name = self.request.get('userlist_name', DEFAULT_USERLIST_NAME)
		user_query = models.User.query(ancestor=userlist_key(userlist_name))
		users = user_query.fetch(10)

		for user in users:
			self.response.write(user)
			self.response.write("<br>")

		# self.response.write("<br><br>" + JOIN_FORM)

class CreateRoom(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		roomlist_name = self.request.get('roomlist_name', DEFAULT_ROOMLIST_NAME)
		room = models.Room(parent=roomlist_key(roomlist_name), creator=int(self.request.get('creator')), name=self.request.get('room_name'), mode=self.request.get('mode'), password=self.request.get('password', ''))
		room_key = room.put()
		self.response.write(json.dumps(room_key.integer_id()))

class RegisterUser(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		userlist_name = self.request.get('userlist_name', DEFAULT_USERLIST_NAME)
		user = models.User(parent=userlist_key(userlist_name), username=self.request.get('username'))
		user_key = user.put()
		self.response.write(json.dumps(user_key.integer_id()))


application = webapp2.WSGIApplication([
	('/', Main),
	('/create_room',CreateRoom),
	('/register_user',RegisterUser)
], debug=True)