import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

class RegisterUser(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		userlist_name = self.request.get('userlist_name', utils.DEFAULT_USERLIST_NAME)
		user = models.User(parent=utils.userlist_key(userlist_name), username=self.request.get('username'))
		user_key = user.put()
		self.response.write(json.dumps(user_key.integer_id()))