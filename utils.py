from google.appengine.ext import ndb

DEFAULT_ROOMLIST_NAME = "default_roomlist"
DEFAULT_USERLIST_NAME = "default_userlist"

def roomlist_key(roomlist_name=DEFAULT_ROOMLIST_NAME):
	return ndb.Key('RoomList',roomlist_name)

def userlist_key(userlist_name=DEFAULT_USERLIST_NAME):
	return ndb.Key('UserList',userlist_name)