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
				self.response.write(user)
				self.response.write("<br>")

			self.response.write("<br>Songs:<br>")
			for song_id in room.queue:
				try:
					song = models.Song.get_by_id(int(song_id),parent=room.key)
					self.response.write(song)
					self.response.write("<br>")
				except:
					pass

			self.response.write("<br><br>")

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
		self.response.write("<br><br>Get Song Queue!<br>")
		self.response.write(forms.GET_SONG_QUEUE_FORM)

		self.response.write("<br><br>Reorder Song!<br>")
		self.response.write(forms.REORDER_SONG_FORM)

		self.response.write("<br><br>Archive Song!<br>")
		self.response.write(forms.ARCHIVE_SONG_FORM)

		self.response.write("<br><br>Set Admin!<br>")
		self.response.write(forms.SET_ADMIN_FORM)

		self.response.write("<br><br>Delete Song!<br>")
		self.response.write(forms.DELETE_SONG_FORM)

		self.response.write("<br><br>Search Room!<br>")
		self.response.write(forms.SEARCH_ROOM_FORM)

		self.response.write("<br><br>Change Username!<br>")
		self.response.write(forms.CHANGE_USERNAME_FORM)


application = webapp2.WSGIApplication([
	('/', Main),
	('/create_room', CreateRoom.CreateRoom),
	('/register_user', RegisterUser.RegisterUser),
	('/join_room', JoinRoom.JoinRoom),
	('/submit_song',SubmitSong.SubmitSong),
	('/search_room',SearchRoom.SearchRoom),
	('/get_song_queue',GetSongQueue.GetSongQueue),
	('/reorder_song',ReorderSong.ReorderSong),
	('/delete_song', DeleteSong.DeleteSong),
	('/get_room_from_id', GetRoomFromID.GetRoomFromID),
	('/get_user_from_id', GetUserFromID.GetUserFromID),
	('/archive_song',ArchiveSong.ArchiveSong),
	('/delete_room', DeleteRoom.DeleteRoom),
	('/delete_user', DeleteUser.DeleteUser),
	('/update_room', UpdateRoom.UpdateRoom),
	('/pause_song', PauseSong.PauseSong),
	('/check_play_status', CheckPlayStatus.CheckPlayStatus),
	('/set_admin',SetAdmin.SetAdmin),
	('/change_username',ChangeUsername.ChangeUsername)
], debug=True)