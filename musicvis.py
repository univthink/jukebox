#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
from google.appengine.ext import ndb

DEFAULT_ROOMLIST_NAME = "default_roomlist"

RETURN_TO_MAIN = """\
	<form action="/" method="get">
	<input type="submit" value="Return to home">
	</form>
"""

ROOM_FORM_SUBMISSION = """\
	<br><br>Create a room!<br>
	<form action="create_room" method="post">
	Room Name: <input type="text" name="roomname"><br>
	<input type="submit" value="Create Room">
	</form>
"""

JOIN_FORM = """\
	Join a room!<br>
	<form action="join_room" method="post">
	User Name: <input type="text" name="username"><br>
	Room Name: <input type="text" name="roomname"><br>
	<input type="submit" value="Join Room">
	</form>
"""

class Room(ndb.Model):
	name = ndb.StringProperty(indexed=True, required=True)
	time = ndb.DateTimeProperty(auto_now_add=True)

class User(ndb.Model):
	name = ndb.StringProperty(indexed=False, required=True)

def roomlist_key(roomlist_name=DEFAULT_ROOMLIST_NAME):
	return ndb.Key('RoomList',roomlist_name)


class MainHandler(webapp2.RequestHandler):

    def get(self):
        #self.response.headers['Content-Type'] = 'text/plain'
        self.response.write('Welcome to Music Vis!')
        self.response.write(ROOM_FORM_SUBMISSION)

        self.response.write('Current Rooms:<br>')

        roomlist_name = self.request.get('roomlist_name',DEFAULT_ROOMLIST_NAME)
        room_query = Room.query(ancestor=roomlist_key(roomlist_name)).order(-Room.time)
        rooms = room_query.fetch(10)

        for room in rooms:
        	self.response.write(room.name + "<br>")

        self.response.write("<br><br>" + JOIN_FORM)


class RoomList(webapp2.RequestHandler):
	def post(self):
		roomlist_name = self.request.get('roomlist_name',DEFAULT_ROOMLIST_NAME)
		room = Room(parent=roomlist_key(roomlist_name))

		room.name = self.request.get('roomname');
		room.put()

		self.redirect('/');

class JoinRoom(webapp2.RequestHandler):
	def post(self):
		room_name = self.request.get('roomname')
		room_query = Room.query(Room.name == room_name)

		rooms = room_query.fetch(1)

		if len(rooms) == 0:
			self.response.write("There is no room with the name " + room_name)
		else:
			self.response.write("Successfully joined " + rooms[0].name)
			#add user to room
			#button - go to room
		
		self.response.write(RETURN_TO_MAIN)

application = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/create_room',RoomList),
    ('/join_room',JoinRoom)
], debug=True)
