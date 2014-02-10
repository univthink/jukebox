import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb


class SearchRoom(webapp2.RequestHandler):

	def get(self):
		# room_exists = True

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
		if self.request.get('coordinates') and self.request.get('radius'):
			[lat, lon] = self.request.get('coordinates').split(',')
			[latMin, latMax, lonMin, lonMax] = utils.boundingBox(float(lat), float(lon), float(self.request.get('radius')))
			room = room.filter(models.Room.lat >= latMin, models.Room.lat <= latMax)
			filterLon = True
			# room = room.filter(models.Room.lon >= lonMin, models.Room.lon <= lonMax)

		rooms = room.fetch()
		if filterLon:
			rooms = [p for p in rooms if (p.lon >= lonMin and p.lon <= lonMax)]
		self.response.write(utils.JSONEncoder().encode(rooms))

		# if room == None:
		# 	room_exists = False;

		# web_app = self.request.get('web_app','false') != 'false'

		# if not room_exists:
		# 	if web_app:
		# 		self.response.write("The requested room was not found.")
		# 	else:
		# 		self.response.write('0')
		# else:
		# 	if room.password != '' and room.password != self.request.get('password'):
		# 		if web_app:
		# 			self.response.write("You did not enter the proper password for room: " + room.name)
		# 		else:
		# 			self.response.write('0')
		# 	else:
		# 		username = self.request.get('username',get_anonymous_name())
		# 		if username == '':
		# 			username = get_anonymous_name()

		# 		guest = models.Guest(parent=room.key,username=username)
		# 		guest_key = guest.put()
		# 		#TODO: Consdier adding detail to "Guest"

		# 		if web_app:
		# 			self.response.write("\"" + room.name + "\" was successfully joined!")
		# 		else:
		# 			self.response.write("1")

		# if web_app:
		# 	self.response.write(forms.RETURN_TO_MAIN)