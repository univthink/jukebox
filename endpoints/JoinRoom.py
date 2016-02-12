import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb


class JoinRoom(webapp2.RequestHandler):

	def post(self):
		room_exists = True
		self.response.headers['Content-Type'] = 'application/json'
		roomlist_name = utils.DEFAULT_ROOMLIST_NAME
		room_id = self.request.get('room_id')
		if not room_id:
			room_exists = False
			self.response.write(json.dumps({"status": "NOT OK", "message": "The room_id was not provided."}))
			return
		else:
			try:
				room = models.Room.get_by_id(int(room_id), parent=utils.roomlist_key(roomlist_name))
				if room == None:
					room_exists = False
			except:
				room_exists = False

		if not room_exists:
			self.response.write(json.dumps({"status": "NOT OK", "message": "The requested room was not found."}))
		else:
			allowed = utils.checkPassword(self.request.get('password', ''), room.password)
			if not allowed:
				self.response.write(json.dumps({"status": "NOT OK", "message": "You did not enter the proper password for room: " + room.name}))
			else:
				user_id = self.request.get('user_id')
				if user_id == '':
					self.response.write(json.dumps({"status": "NOT OK", "message": "No user_id was provided."}))
				else:
					userlist_name = utils.DEFAULT_USERLIST_NAME

					try:
						user = models.User.get_by_id(int(user_id),parent=utils.userlist_key(userlist_name))
					except:
						user = None
					if user == None:
						self.response.write("Invalid user_id.")
					else:
						if room.all_admin == 0:
							guest = models.Guest(parent=room.key,user_id=int(user_id))
						else:
							guest = models.Guest(parent=room.key,user_id=int(user_id),admin=True)
						guest_key = guest.put()
						self.response.write(json.dumps({"status":"OK"}))