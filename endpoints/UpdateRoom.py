import webapp2, models, forms, json, endpoints, utils, urllib2
from google.appengine.ext import ndb

class UpdateRoom(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		room_exists = True

		roomlist_name = utils.DEFAULT_ROOMLIST_NAME
		room_id = self.request.get('room_id')

		if not room_id:
			room_exists = False
		else:
			try:
				room = models.Room.get_by_id(int(room_id),parent=utils.roomlist_key(roomlist_name))
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
				if self.request.get("coordinates") != '':
					try:
						[lat, lon] = self.request.get("coordinates").split(',')
						room.lat = float(lat)
						room.lon = float(lon)
						room.put()
						self.response.write(json.dumps({"status":"OK"}))
					except:
						self.response.write(json.dumps({"status": "NOT OK", "message": "Misformatted coordinates specified."}))
				else:
					self.response.write(json.dumps({"status": "NOT OK", "message": "No coordinates specified."}))