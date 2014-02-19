import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

class RegisterUser(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		userlist_name = self.request.get('userlist_name', utils.DEFAULT_USERLIST_NAME)
		user = models.User(parent=utils.userlist_key(userlist_name), username=self.request.get('username'))
		if user == None:
			self.response.write(json.dumps({"status":"NOT OK", "message": "The requested user was not found."}))
		else:
			user_key = user.put()
			self.response.write(json.dumps({"status":"OK", "data": user_key.integer_id()}))