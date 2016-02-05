import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

class ChangeUsername(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'

		try:
			user = utils.get_user_by_id(self.request.get('user_id'))
		except:
			self.response.write(json.dumps({"status":"NOT OK", "message":"The requested user was not found."}))
			return

		if not user:
			self.response.write(json.dumps({"status":"NOT OK", "message":"The requested user was not found."}))
			return

		if len(self.request.get('name','')) == 0:
			self.response.write(json.dumps({"status":"NOT OK","message":"You must include a valid, new username."}))
			return

		if len(self.request.get('name','')) > 20:
			self.response.write(json.dumps({"status":"NOT OK","message":"Usernames cannot be greater than 20 characters."}))
			return

		user.username = self.request.get('name')
		user.put()

		self.response.write(json.dumps({"status":"OK"}))