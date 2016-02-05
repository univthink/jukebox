from google.appengine.ext import ndb
import json, math, models, hashlib

DEFAULT_ROOMLIST_NAME = "default_roomlist"
DEFAULT_USERLIST_NAME = "default_userlist"

# Allows us to do multiple datastore puts
# in one atomic transaction.
@ndb.transactional
def transactional_put(*args):
	for obj in args:
		if isinstance(obj, ndb.Model):
			obj.put()

# Returns roomlist from key.
def roomlist_key(roomlist_name=DEFAULT_ROOMLIST_NAME):
	return ndb.Key('RoomList',roomlist_name)

# Returns userlist from key.
def userlist_key(userlist_name=DEFAULT_USERLIST_NAME):
	return ndb.Key('UserList',userlist_name)

# Returns user associated with a guest_id.
def get_user_by_guest_id(room,guest_id,userlist_name=DEFAULT_USERLIST_NAME):
	guest = models.Guest.get_by_id(int(guest_id),parent=room.key)
	if guest == None:
		return None
	else:
		user_id = guest.user_id
		user = models.User.get_by_id(int(user_id),parent=userlist_key(userlist_name))
		return user

# Returns user associated with a user_id.
def get_user_by_id(user_id,userlist_name=DEFAULT_USERLIST_NAME):
	return models.User.get_by_id(int(user_id),parent=userlist_key(userlist_name))

# Checks whether a user is an admin.
def is_admin(room,user_id):
	userlist_name = DEFAULT_USERLIST_NAME
	user = models.User.get_by_id(int(user_id),parent=userlist_key(userlist_name))

	
	if user == None:
		return False

	guest_query = models.Guest.query(models.Guest.user_id == int(user_id),ancestor=room.key)
	guests = guest_query.fetch()
	if len(guests) == 0:
		return False

	return guests[0].admin

# Subclass of JSONEncoder that we intercept in order to add/censor values.
class JSONEncoder(json.JSONEncoder):

    def default(self, o):
        # If this is a key, you might want to grab the actual model.
        #if isinstance(o, ndb.Key):
        #    o = ndb.get(o)
        if isinstance(o, ndb.Model):
        	obj = o.to_dict()
        	obj['id'] = o.key.integer_id()
        	if isinstance(o, models.Room):
        		#Removes song queue and song history, changes creator_id to creator, changes password hash to existence of password.
        		user = models.User.get_by_id(int(obj['creator']),parent=userlist_key(DEFAULT_USERLIST_NAME))
        		del obj['creator']
        		del obj['queue']
        		del obj['history']
        		obj['creator_name'] = user.username
        		obj['password'] =  bool(obj['password'])
        	return obj
        elif isinstance(o, (ndb.GeoPt)):
            return str(o)  # Or whatever other date format you're OK with...

# Finds the distance between two points in meters using the Haversine formula.
def distanceBetween(lat1, lon1, lat2, lon2):
	R = 6371000; #earth radius in meters
	dLat = toRad(lat2-lat1);
	dLon = toRad(lon2-lon1);
	lat1 = toRad(lat1);
	lat2 = toRad(lat2);

	a = math.sin(dLat/2) * math.sin(dLat/2) + math.sin(dLon/2) * math.sin(dLon/2) * math.cos(lat1) * math.cos(lat2)
	c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a)); 
	d = R * c;
	return d;

# Creates a rough bounding box given a central lat/long and a distance in meters.
def boundingBox (lat, lon, dist):
	R = 6371000.0; #earth radius in meters
	r=dist/R

	deltaLat = toDeg(r)
	latMin = lat - deltaLat
	latMax = lat + deltaLat

	deltaLon = math.fabs(math.asin(math.sin(r)/math.cos(lat)))
	lonMin = lon - deltaLon
	lonMax = lon + deltaLon

	return [latMin, latMax, lonMin, lonMax]

# Converts numeric degrees to radians
def toRad(value):
	return value * math.pi / 180

# Converts numeric degrees to radians
def toDeg(value):
	return value * 180 / math.pi

# Checks password against hash using standard SHA-512 hashing.
def checkPassword (submitted, passHash):
	return not passHash or passHash == hashlib.sha512(submitted).hexdigest()
