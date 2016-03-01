import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

import requests
import spotipy
sp = spotipy.Spotify()

from google.appengine.ext import vendor
vendor.add('requests')

class GetTrendingSongs(webapp2.RequestHandler):

  def get(self):
    self.response.headers['Content-Type'] = 'application/json'

    results = sp.featured_playlists()


    print 'Attempting to get Trending Spotify Songs!!!'