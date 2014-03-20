import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb


class SearchRoom(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'

		if self.request.get('member_id'):
			try:
				roomlist_name = self.request.get('roomlist_name', utils.DEFAULT_ROOMLIST_NAME)
				room_query = models.Room.query(ancestor=utils.roomlist_key(roomlist_name))
				test_rooms = room_query.fetch()
				member_id = int(self.request.get('member_id'))

				rooms = []

				for test_room in test_rooms:
					guest_query = models.Guest.query(models.Guest.user_id == member_id, ancestor=test_room.key)
					guest = guest_query.fetch()
					if len(guest) != 0:
						rooms.append(test_room)

				self.response.write(utils.JSONEncoder().encode({"status":"OK", "data": rooms}))
				return
			except:
				pass

		roomlist_name = utils.DEFAULT_ROOMLIST_NAME
		room_id = self.request.get('room_id')
		room = models.Room.query(ancestor=utils.roomlist_key(roomlist_name))
		if self.request.get('name'):
			room = room.filter(models.Room.name == self.request.get('name'))
		if self.request.get('user_id'):
			# bool has_user= False
			try:
				room = room.filter(models.Room.creator==int(self.request.get('user_id')))
			except:
				pass
		filterLon = False
		lonMin = 0
		lonMax =0
		if self.request.get('coordinates'):
			try:
				[lat, lon] = self.request.get('coordinates').split(',')
				[latMin, latMax, lonMin, lonMax] = utils.boundingBox(float(lat), float(lon), float(self.request.get('distance', '1000')))
				#Because ndb doesn't allow filtering on multiple inequalities, latitude is filtered using ndb, and longitude is filtered 
				#later programtically.
				room = room.filter(models.Room.lat >= latMin, models.Room.lat <= latMax)
				filterLon = True
			except:
				pass
			# room = room.filter(models.Room.lon >= lonMin, models.Room.lon <= lonMax)

		rooms = room.fetch()
		#Programatically filtering by longitude.
		if filterLon:
			rooms = [p for p in rooms if (p.lon != None and p.lon>= lonMin and p.lon <= lonMax)]

		self.response.write(utils.JSONEncoder().encode({"status":"OK", "data": rooms}))