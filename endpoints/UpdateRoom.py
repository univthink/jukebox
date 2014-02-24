import webapp2, models, forms, json, endpoints, utils, urllib2
from google.appengine.ext import ndb

class UpdateRoom(webapp2.RequestHandler):

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

			if self.request.get("coordinates") != '':
				try:
					[lat, lon] = self.request.get("coordinates").split(',')
					room.lat = float(lat)
					room.lon = float(lon)
					room.put()
					if web_app:
						self.response.write("You successfully updated the room.")
					else:
						self.response.write(json.dumps({"status":"OK"}))
				except:
					if web_app:
						self.response.write("Misformatted coordinates specified.")
					else:
						self.response.write(json.dumps({"status": "NOT OK", "message": "Misformatted coordinates specified."}))
			else:
				if web_app:
					self.response.write("No coordinates specified.")
				else:
					self.response.write(json.dumps({"status": "NOT OK", "message": "No coordinates specified."}))

			

		if web_app:
			self.response.write(forms.RETURN_TO_MAIN)