import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

class GetUserFromID(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'

		user_exists = True

		userlist_name = utils.DEFAULT_USERLIST_NAME
		user_id = self.request.get('user_id')

		if not user_id:
			user_exists = False
		else:
			try:
				user = models.User.get_by_id(int(user_id),parent=utils.userlist_key(userlist_name))
				if user == None:
					user_exists = False
			except:
				user_exists = False

		web_app = self.request.get('web_app','false') != 'false'

		if not user_exists:
			if web_app:
				self.response.write("The referenced user was not found.")
			else:
				self.response.write(json.dumps({"status": "NOT OK", "message": "The requested user was not found."}))
		else:
			if web_app:
				self.response.write(utils.JSONEncoder().encode(user))
			else:
				self.response.write(utils.JSONEncoder().encode({"status":"OK", "data": user}))

		if web_app:
			self.response.write(forms.RETURN_TO_MAIN)