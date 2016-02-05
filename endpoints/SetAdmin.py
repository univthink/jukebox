import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb


class SetAdmin(webapp2.RequestHandler):

	def post(self):

		room_exists = True
		self.response.headers['Content-Type'] = 'application/json'

		self.response.write({"status": "NOT OK", "message": "Set Admin is not available."})
		return

		roomlist_name = utils.DEFAULT_ROOMLIST_NAME
		room_id = self.request.get('room_id')
		if not room_id:
			room_exists = False
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
				self.response.write(json.dumps({"status": "NOT OK", "message": "The correct password was not provided."}))
			else:
				user_id = self.request.get('user_id')
				userlist_name = utils.DEFAULT_USERLIST_NAME
				try:
					user = models.User.get_by_id(int(user_id),parent=utils.userlist_key(userlist_name))
				except:
					user = None
				if user == None:
					self.response.write(json.dumps({"status": "NOT OK", "message": "The given user_id is not a valid user."}))
				else:
					guest_query = models.Guest.query(models.Guest.user_id == int(user_id),ancestor=room.key)
					guests = guest_query.fetch()
					if len(guests) == 0:
						self.response.write(json.dumps({"status": "NOT OK", "message": "The referenced user is not in this room."}))
					else:
						guest = guests[0]

						try:
							value = int(self.request.get('value'))
						except:
							self.response.write(json.dumps({"status": "NOT OK", "message": "Value must be an integer."}))
						else:
							if value == 0:
								guest.admin = False
							else:
								guest.admin = True
							guest.put()
							self.response.write(json.dumps({"status":"OK"}))