import webapp2, models, forms, json, utils
from endpoints import *
from google.appengine.ext import ndb

class Main(webapp2.RequestHandler):

	def get(self):
		self.response.write('Welcome to Music Vis!')
		self.response.write(forms.CREATE_ROOM_FORM)

		self.response.write('<b>Current Rooms:<br></b>')

		roomlist_name = self.request.get('roomlist_name', utils.DEFAULT_ROOMLIST_NAME)
		room_query = models.Room.query(ancestor=utils.roomlist_key(roomlist_name))
		rooms = room_query.fetch(10)

		for room in rooms:
			self.response.write(room)
			self.response.write("<br>")

			users_query = models.Guest.query(ancestor=room.key)
			users = users_query.fetch()
			self.response.write("Users:<br>")
			for user in users:
				self.response.write("<t>" + user.username + " -- ")
				self.response.write(user)
				self.response.write("<br>")

			self.response.write("<br>Songs:<br>")
			for song_id in room.queue:
				song = models.Song.get_by_id(int(song_id),parent=room.key)
				self.response.write(song)
				self.response.write("<br>")

		self.response.write('<br><br><b>Join a Room!<br></b>')
		self.response.write(forms.JOIN_ROOM_FORM)

		self.response.write('<br><br><b>Submit a Song!<br></b>')
		self.response.write(forms.SUBMIT_SONG_FORM)

		self.response.write(forms.CREATE_USER_FORM)

		self.response.write('<b>Current Users:<br></b>')

		userlist_name = self.request.get('userlist_name', utils.DEFAULT_USERLIST_NAME)
		user_query = models.User.query(ancestor=utils.userlist_key(userlist_name))
		users = user_query.fetch(10)

		for user in users:
			self.response.write(user)
			self.response.write("<br>")

		# self.response.write("<br><br>" + JOIN_FORM)


application = webapp2.WSGIApplication([
	('/', Main),
	('/create_room', CreateRoom.CreateRoom),
	('/register_user', RegisterUser.RegisterUser),
	('/join_room', JoinRoom.JoinRoom),
	('/submit_song',SubmitSong.SubmitSong)
], debug=True)