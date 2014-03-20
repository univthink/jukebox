import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

class ChangeUsername(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'

		user = utils.get_user_by_id(self.request.get('user_id'))

		if not user:
			self.response.write(json.dumps({"status":"NOT OK", "message":"The requested user was not found."}))

		if len(self.request.get('name','')) == 0:
			self.response.write(json.dumps({"status":"NOT OK","message":"You must include a valid, new username."}))

		if len(self.request.get('name','')) > 20:
			self.response.write(json.dumps({"status":"NOT OK","message":"Usernames cannot be greater than 20 characters."}))

		user.username = self.request.get('name')
		user.put()

		self.response.write(json.dumps({"status":"OK"}))