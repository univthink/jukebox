import webapp2, models, forms, json, endpoints, utils, urllib2
from google.appengine.ext import ndb

class DeleteUser(webapp2.RequestHandler):

	def post(self):
		self.response.headers['Content-Type'] = 'application/json'
		user_exists = True

		userlist_name = self.request.get('userlist_name',utils.DEFAULT_USERLIST_NAME)
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
				self.response.write("The requested user was not found.")
			else:
				self.response.write(json.dumps({"status": "NOT OK", "message": "The requested user was not found."}))
		else:

			user.key.delete()
			#TODO: Delete associated guests.
			if web_app:
				self.response.write("You successfully deleted the song.")
			else:
				self.response.write(json.dumps({"status":"OK"}))

		if web_app:
			self.response.write(forms.RETURN_TO_MAIN)