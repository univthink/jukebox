import webapp2, models, forms, json, endpoints, utils
from google.appengine.ext import ndb

import base64
import requests
import spotipy
from spotipy import oauth2
import json

client_id = '39903cb10e0a4f6da882d6c53db62776'
client_secret = '96193ae482b04d1c882b80b0091a8666'

class GetTrendingSongs(webapp2.RequestHandler):

  def get(self):
    self.response.headers['Content-Type'] = 'application/json'

    auth_header = base64.b64encode(client_id + ':' + client_secret)
    headers = {'Authorization': 'Basic %s' % auth_header}
    url = 'https://accounts.spotify.com/api/token'
    payload = { 'grant_type': 'client_credentials'}
    r = requests.post(url, data=payload, headers=headers)
    token_info = r.json()
    access_token = token_info['access_token']

    sp = spotipy.Spotify(auth=access_token)
    playlists = sp.featured_playlists()
    topPlaylist = playlists['playlists']['items'][0]
    tracks = sp.user_playlist_tracks(topPlaylist['owner']['id'], playlist_id=topPlaylist['id'])

    self.response.write(utils.JSONEncoder().encode({"status":"OK", "data": tracks['items']}))