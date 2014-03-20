import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

class ChangeUsername(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'

		user = utils.get_user_by_id(self.request.get('user_id'))

		if not user:
			self.response.write({"status":"NOT OK", "message":"The requested user was not found."})

		if len(self.request.get('name','')) == 0:
			self.response.write({"status":"NOT OK","message":"You must include a valid, new username."})

		user.username = self.request.get('name')
		user.put()

		self.response.write({"status":"OK"})