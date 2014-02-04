import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

class CreateRoom(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		roomlist_name = self.request.get('roomlist_name', utils.DEFAULT_ROOMLIST_NAME)
		room = models.Room(parent=utils.roomlist_key(roomlist_name), creator=int(self.request.get('creator')), name=self.request.get('room_name'), mode=self.request.get('mode'), password=self.request.get('password', ''))
		room_key = room.put()

		self.response.write(json.dumps(room_key.integer_id()))