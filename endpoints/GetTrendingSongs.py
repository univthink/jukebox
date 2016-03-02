import webapp2
import requests
import spotipy

sp = spotipy.Spotify()

class GetTrendingSongs(webapp2.RequestHandler):

  def get(self):
    self.response.headers['Content-Type'] = 'application/json'

    results = sp.featured_playlists()


    print 'Attempting to get Trending Spotify Songs!!!'