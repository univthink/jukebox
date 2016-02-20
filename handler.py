import webapp2, models, forms, json, utils, os
from endpoints import *
from google.appengine.ext import ndb
# from google.appengine.api import users


class APIDebugger(webapp2.RequestHandler):
	def get(self):

		# user = users.get_current_user()
		# if user:
		# 	if not users.is_current_user_admin():
		# 		self.response.write('Access denied.')
		# 		return
		# 	self.response.headers['Content-Type'] = 'text/html; charset=utf-8'
		# 	self.response.write('Hello, ' + user.nickname() + '. ')
		# else:
		# 	self.redirect(users.create_login_url(self.request.uri))

		# self.response.headers['Content-Type'] = 'text/html; charset=utf-8'
		# self.response.write('Hello, ' + user.nickname() + '. ')

		self.response.write('Welcome to the Jukebox API Debugger!')
		self.response.write(forms.CREATE_ROOM_FORM)

		self.response.write('<b>Current Rooms:<br></b>')

		roomlist_name = self.request.get('roomlist_name', utils.DEFAULT_ROOMLIST_NAME)
		room_query = models.Room.query(ancestor=utils.roomlist_key(roomlist_name))
		rooms = room_query.fetch(10)

		for room in rooms:
			self.response.write(room)
			self.response.write("<br>")

			users_query = models.Guest.query(ancestor=room.key)
			room_users = users_query.fetch()
			self.response.write("Users:<br>")
			for user in room_users:
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

		self.response.write('<br><br><b>Create a user!</b><br>')
		self.response.write(forms.CREATE_USER_FORM)

		self.response.write('<b>Current Users:<br></b>')

		userlist_name = self.request.get('userlist_name', utils.DEFAULT_USERLIST_NAME)
		user_query = models.User.query(ancestor=utils.userlist_key(userlist_name))
		room_users = user_query.fetch(10)

		for user in room_users:
			self.response.write(user)
			self.response.write("<br>")

		# self.response.write("<br><br>" + JOIN_FORM)
		self.response.write("<br><br><b>Get Song Queue!</b><br>")
		self.response.write(forms.GET_SONG_QUEUE_FORM)

		self.response.write("<br><br><b>Reorder Song!</b><br>")
		self.response.write(forms.REORDER_SONG_FORM)

		self.response.write("<br><br><b>Archive Song!</b><br>")
		self.response.write(forms.ARCHIVE_SONG_FORM)

		self.response.write("<br><br><b>Set Admin!</b><br>")
		self.response.write(forms.SET_ADMIN_FORM)

		self.response.write("<br><br><b>Delete Song!</b><br>")
		self.response.write(forms.DELETE_SONG_FORM)

		self.response.write("<br><br><b>Search Room!</b><br>")
		self.response.write(forms.SEARCH_ROOM_FORM)

		self.response.write("<br><br><b>Change Username!</b><br>")
		self.response.write(forms.CHANGE_USERNAME_FORM)


application = webapp2.WSGIApplication([
	('/api', APIDebugger),
	('/api/create_room', CreateRoom.CreateRoom),
	('/api/register_user', RegisterUser.RegisterUser),
	('/api/join_room', JoinRoom.JoinRoom),
	('/api/submit_song',SubmitSong.SubmitSong),
	('/api/search_room',SearchRoom.SearchRoom),
	('/api/get_song_queue',GetSongQueue.GetSongQueue),
	('/api/reorder_song',ReorderSong.ReorderSong),
	('/api/delete_song', DeleteSong.DeleteSong),
	('/api/get_room_from_id', GetRoomFromID.GetRoomFromID),
	('/api/get_user_from_id', GetUserFromID.GetUserFromID),
	('/api/archive_song',ArchiveSong.ArchiveSong),
	('/api/delete_room', DeleteRoom.DeleteRoom),
	('/api/delete_user', DeleteUser.DeleteUser),
	('/api/update_room', UpdateRoom.UpdateRoom),
	('/api/pause_song', PauseSong.PauseSong),
	('/api/check_play_status', CheckPlayStatus.CheckPlayStatus),
	('/api/set_admin',SetAdmin.SetAdmin),
	('/api/change_username',ChangeUsername.ChangeUsername)
], debug=True)