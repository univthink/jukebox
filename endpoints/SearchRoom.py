import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb


class SearchRoom(webapp2.RequestHandler):

	def post(self):
		# room_exists = True

		self.response.headers['Content-Type'] = 'application/json'
		roomlist_name = self.request.get('roomlist_name', utils.DEFAULT_ROOMLIST_NAME)
		room_id = self.request.get('room_id')
		room = models.Room.query(ancestor=utils.roomlist_key(roomlist_name))
		if self.request.get('name'):
			room = room.filter(models.Room.name == self.request.get('name'))
		if self.request.get('user_id'):
			# bool has_user= False
			room = room.filter(models.Room.creator==int(self.request.get('user_id')))
		filterLon = False
		lonMin = 0
		lonMax =0
		if self.request.get('coordinates'):
			[lat, lon] = self.request.get('coordinates').split(',')
			[latMin, latMax, lonMin, lonMax] = utils.boundingBox(float(lat), float(lon), float(self.request.get('distance', '1000')))
			room = room.filter(models.Room.lat >= latMin, models.Room.lat <= latMax)
			filterLon = True
			# room = room.filter(models.Room.lon >= lonMin, models.Room.lon <= lonMax)

		rooms = room.fetch()
		if filterLon:
			rooms = [p for p in rooms if (p.lon != None and p.lon>= lonMin and p.lon <= lonMax)]

		self.response.write(utils.JSONEncoder().encode({"status":"OK", "data": rooms}))