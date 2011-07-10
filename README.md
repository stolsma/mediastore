# MediaStore

*Apiary MediaStore service to store media objects like movies and pictures*

# What is MediaStore?

MediaStore is an open-source project that uses [node.js](http://nodejs.org) and Open Source Packages to store media objects like movies and pictures and has a defined REST interface for interaction. 

# How does it work?

TODO

## Where can I run MediaStore?

TODO

# Installation (to be implemented)

MediaStore can be run as a service by Apiary.

# Documentation

MediaStore documentation is still very much a work in progress. We'll be actively updating the documentation in the upcoming months to make it easier to get acclimated with `MediaStore`.

# An overview of using MediaStore

## Starting up a MediaStore environment

(to be described)

The Mediastore service is intended to be run in a [Apiary](http://code.tolsma.net/apiary) environment although standalone installation (with some static configuration file editing) can be done too.

# MediaStore API

A MediaStore service allows client applications to view and update albums, media, and comments in the form of JSON REST API calls. Your client application can use the MediaStore API to create new albums, upload media, add comments, edit or delete existing albums, media, and comments, and query for items that match particular criteria.

This chapter is intended for programmers who want to write client applications that can interact with MediaStore services. It provides a series of examples of basic Data API interactions using raw JSON/HTTP, with explanations. After reading this chapter, you can learn more about interacting with the API by reading the language-specific examples found on the other sections of this document.


## Authorization

When your application requests non-public MediaStore data, it must include an authorization token. The token also identifies your application to the MediaStore.


### About authorization

Before your application can get access to data from a MediaStore service, the application must request authorization from the MediaStore service. OpenID Connect + OAuth 2.0 are the authorization protocols required for that.


### Authorizing requests with OpenID Connect + OAuth 2.0

Requests to the MediaStore Service API for non-public user data must be authorized by the owner of the MediaStore service. He will grant access to certain Albums or Media items by adding OpenID identifiers (see authorizing Albums/Items chapter). By using OpenID Connect Authentication the MediaStore Service knows what data can be served to the requesting Client.

The details of the authorization process, or "flow," for OpenID Connect / OAuth 2.0 vary somewhat depending on what kind of application you're writing. The following general process applies to all application types:

1. First your client needs to register with the specific MediaStore sevice at the MediaStore Client Registration endpoint. the MediaStore service then provides information you'll need later, such as a client ID and a client secret.
2. When your client application needs access to the MediaStore data, it asks for an authentication code at the MediaStore Authentication endpoint. 
3. MediaStore displays an OAuth dialog to the user of your client application, asking them to authenticate themselves with an OpenID Connect account. 
4. If the user is not yet logged in with their OpenID Connect provider it needs to login at their OpenID Connect provider.
5. The MediaStore service gets user authentication confirmation of the OpenID Connect provider and then asks for authorization of your client application to request some of the user's data.
6. If the user approves, then the MediaStore service gives your application a short-lived Authentication token.
7. This Authentication Token needs to be changed for a Refresh and Access token at the MediaStore Token endpoint
8. Your application requests MediaStore data, attaching the access token to the request.
9. If the MediaStore service determines that your request and the token are valid, it returns the requested data.

Some flows include additional steps, such as using refresh tokens to acquire new access tokens. For detailed information about flows for various types of applications, see Google's OAuth 2.0 documentation.

Here's the OAuth 2.0 scope information for the MediaStore API:

* `public` for public read access to the MediaStore (default and always set for everyone, can not be set with the user API).
* `comment` to have comment add, delete and edit (always own comments!) capability.
* `read` for private album read access to the MediaStore service.
* `write` for private write access to the specific user  "drop box" store location.
* `admin` for full access (read, write, delete) to the MediaStore service except for `superuser` authorization.
* `superuser` for scope `admin` and  `superuser` auhorization setting
(to be extended)  

To request access using OAuth 2.0, your application needs the scope information, as well as information that the MediaStore service supplies during client application registration (such as the client ID and/or the client secret).


## Working with albums

Albums are the way MediaStore groups media items into useful sets. These albums can be `public`, `select` or `private`, and have their own properties such as a geographic location, a description, or a date.

You do not have to authenticate to retrieve data about `public` albums, but in order to retrieve data about `select` albums you must be authenticated. To create, update, or delete albums you must have 'admin' scope authentication as discussed in the authentication section.

### Requesting a list of albums

To get a listing of all of the albums accessible to public or authenticated users, send an HTTP request like the following to the MediaStore API:

````
GET https://[MediaStore hostname]/data/@me/album/:AlbumID
````

If `:AlbumID` is not given then all albums of the authenticated user's root will be given.

Note: The string `@me` can be replaced by a real userID, in which case the server returns the album view of the given userID. This is only applicable to authenticated users with `admin` access.

The server returns a feed of album entries, which looks similar to the following:

````
[example]
````


### Creating an album

You can create an album in a parent album identified by `:ParentAlbumID`, by sending an `admin` authenticated POST request with an appropriately formed entry. To authenticate, use the authentication mechanism discussed in the Authentication section.

````
POST https://[MediaStore hostname]/data/@me/album/:ParentAlbumID

{
}
````

MediaStore creates a new album using the data you sent, then returns an HTTP 201 status code, along with a copy of the new album in the form of an JSON response. The returned entry is similar to the one you sent, but the returned one contains various elements added by the server, such as an `id` element.

If `:ParentAlbumID` is not given then the album will be created in the root album.

If your request fails for some reason, then a different status code may be returned. For information about the status codes used by the API, see the HTTP status codes section.

Answer:
````
{
}
````


### Modifying the properties of an album

After retrieving an album entry (identified by `:AlbumID`), you can modify it by sending an `admin` authenticated PUT request, containing the new album data:

````
PUT https://[MediaStore hostname]/data/@me/album/:AlbumID
````

Answer:
````
{
}
````


### Deleting an album

You can delete an album (identified by `:AlbumID`) by sending an `admin` authenticated HTTP DELETE request:

````
DELETE https://[MediaStore hostname]/data/@me/album/:AlbumID
````

Answer:
````
{
}
````


## Working with media items

When uploading, modifying, or removing photos, you will have to authenticate using one of the methods discussed in the Authentication section.


###Requesting a list of media items

There are different ways to retrieve media items. The most common is to get a list of all of the media items in an album, but you can also retrieve recently added media items.

### Listing media items in an album

To get a listing all of the media items in an album with the id ':AlbumID', send an HTTP request like the following to the MediaStore service:

````
GET https://[MediaStore hostname]/data/@me/item/album/:AlbumID
````

Note: The string `@me` can be replaced by a real userID, in which case the server returns the album view of the given userID. This is only applicable to authenticated users with `admin` access.
Note: The entries in an answer are ordered based upon the item's display order attribute.

Answer:

````
{
	"id": "",
	"child": [
		{
			"id": "4678JSKD46HGSH",
			"tnsmall": "https://[MediaStore hostname]/tn/4678JSKD46HGSH"
		},
		...
	]
	"items": [
		{
			"id": "46KSL234D46HSH"
			"type": "image/jpeg",
			"tnsmall": "https://[MediaStore hostname]/tn/46KSL234D46HSH"
		},
		...
	] 
}
````

### Listing media items recently uploaded

It is also possible to retrieve the last `:Number` media items uploaded:

````
GET https://[MediaStore hostname]/data/item/last/:Number
````

Answer:

````
{
}
````


### Changing a media items or posting a new media item

There are two ways to add a media item to the MediaStore using the API:

* Upload the binary media data along with its metadata. To do this, use MIME content type "multipart/related"; send media metadata in one part of the POST body, and binary-encoded media data in another part. This is the preferred approach.
* Upload the binary media data without the metadata. Connection to an album needs to be done later else they can't be seen!!.

Media items of any of the following types can be uploaded using the API:

Photo

* image/bmp
* image/gif
* image/jpeg
* image/png

Video

* video/3gpp
* video/avi
* video/quicktime
* video/mp4
* video/mpeg
* video/mpeg4
* video/msvideo
* video/x-ms-asf
* video/x-ms-wmv
* video/x-msvideo

Media items have to undergo some processing before they become available for publication. In order to monitor the current processing state, the entry returned after posting a new video will contain an additional `status` element. The four possible values of the 'status' element are:

    pending: the item is still being processed
    ready: the item has been processed but still needs a thumbnail
    final: the item has been processed and has received a thumbnail
    failed: a processing error has occured and the item should be deleted

Usually a video can be streamed/played or accessed at the URL provided in the '' element of the entry shortly after reaching the status ready or final. The `` element will contain the URL to the video stream.

#### Providing your own video thumbnail

Normally the video processing system will automatically provide a thumbnail at the end of the processing stage. This thumbnail is created from one of the first few frames of the video. Instead, you can provide your own thumbnail by simply following the steps outlined under Updating a media item. You can do this at any time while the video is still being processed or afterwards. Automatically provided thumbnails always come at standard MediaStore resolutions. To account for larger than 4:3 aspect ratios (e.g. 16:9), black borders will be added to the top and bottom of the thumbnail image.

#### Limitations

All uploaded videos are processed and converted into streaming formats that can be played back using the HTML5 or Flash video player integrated into the MediaStore one-up view.

Several streaming formats are currently created: (to be decided!!!  an mp4 stream with a maximum resolution of 480 x 360 pixels.)

You can download original media item files. Use the 


#### Posting a media item with metadata

To send metadata along with the media item, post to the following URL:

````
https://[MediaStore hostname]/data/@me/item/:StorePath
````

And use the following format for the body of the POST:

````
Content-Type: multipart/related; boundary="END_OF_PART"
Content-Length: 423478347
MIME-version: 1.0

Media multipart posting
--END_OF_PART
Content-Type: application/json

{
}
--END_OF_PART
Content-Type: image/jpeg

...binary image data...
--END_OF_PART--
````

Note that the '' element contains the filename you want to use for the image.

Answer:

````
{
}
````


#### Posting a media item without metadata

To send a media item without its associated metadata, post to the following URL:

````
https://[MediaStore hostname]/data/@me/item/:StorePath
````

And use the following format for the body of the POST:

````
Content-Type: image/jpeg
Content-Length: 47899

...binary image data goes here...
````

Note: If you want to post a media item without being `admin` authenticated but you are `write` authenticated, you can post the media item to the authenticated user's "Drop Box." This special store location will automatically be created the first time it is used to store a media item. To post to the Drop Box, use an empty `:StorePath` value.

Answer:

````
{
}
````


#### Updating a media item and its metadata

To replace both the binary data and metadata for the media item (identified by `:ItemID`) that you inserted earlier, use an HTTP request like the following:

````
PUT https://[MediaStore hostname]/data/@me/item/:ItemID
````

In the body of the PUT, include the updated metadata and media item data, in the same multipart format that you used to do the POST with metadata.

Note: With PUT, you can't do a partial update of an entry; you have to send the full entry data to replace the existing data. You can, however, use PUT to send only the metadata or only the binary data, as described in the following sections.

In order to make other types partial updates, you must use PATCH. See the section on partial updates for details.

Answer:

````
{
}
````


#### Updating only the binary data

To replace only the media item's binary data (identified by `:ItemID`), use the following HTTP request:

````
PUT https://[MediaStore hostname]/data/@me/item/:ItemID
````

In the body of the PUT, include the replacement image data, in the same format that you used to do the POST without metadata.

Answer:

````
{
}
````


#### Updating only the metadata

To replace only the media item's (identified by `:ItemID`) metadata (and not the binary data itself), you follow the steps that you would follow to send an update.

In particular, send the following HTTP request:

````
PUT https://[MediaStore hostname]/data/@me/item/:ItemID
````

In the body of the PUT, provide the updated metadata, in the form of a JSON object containing image metadata.

The media item's binary data itself is not re-sent to the server.

Answer:

````
{
}
````


### Deleting a media item

To delete a media item and its metadata, send an HTTP DELETE request. The media item's binary data and metadata are then deleted.

For example, to delete the media item from the previous examples:

````
DELETE https://[MediaStore hostname]/data/@me/item/:ItemID
````

Answer:

````
{
}
````


## Working with the binary store

(to be filled)


### Store retrieval

The binary store xx can be retrieved by calling (`admin` authorization is needed for the full store, `write` authorization) :

````
GET https://[MediaStore hostname]/data/@me/store/:StorePath`
````

It will return the items 

Answer:

````
{
}
````


## Working with User authorizations

(to be filled)

At a minimum `admin` scope authorization plus sometimes `superuser` scope authorization is needed for the following API calls.


### User data retrieval

(to be filled)

````
GET https://[MediaStore hostname]/data/user/:UserID
````

Answer:

````
{
	"id": "724KJDLLKD98243",
	"name": "User Example",
	"description": "A description of the user",
	"openid": "user@example.com",
	"openidatt" : {
		... all retrieved OpenID Connect attributes ...
	},
	"scope": [
		"public",
		"comment",
		"read",
		"write",
		"admin",
		"superuser"
	]
}
````

Answer:

````
{
}
````

### User addition

(to be filled)

````
POST https://[MediaStore hostname]/data/user

{
	"name": "User Example",
	"description": "A description of the user",
	"openid": "user@example.com",
	"scope": [
		"public",
		"comment",
		"read",
		"write",
		"admin",
		"superuser"
	]
}
````

Answer:

````
{
}
````

### User data update

Makes it possible to update user information and to set user scope authorization. The `admin` and `superuser` scope authorization can only be set by a user with `superuser` authorization

````
PUT https://[MediaStore hostname]/data/user/:UserID

{
	"name": "User Example",
	"description": "A description of the user",
	"openid": "user@example.com",
	"scope": [
		"public",
		"comment",
		"read",
		"write",
		"admin",
		"superuser"
	]
}
````

Answer:

````
{
}
````

### 'Deleting' a user

Removes all scope authorizations except for "public" from a user's scope authentication attribute. Comments can't be changed and the user "drop box" stay available but can't be seen by the user anymore.

````
DELETE https://[MediaStore hostname]/data/user/:UserID
````

Answer:

````
{
}
````


Documentation License
=====================

Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License

http://creativecommons.org/licenses/by-nc-sa/3.0/

Copyright (c)2011 [TTC](http://www.tolsma.net)/[Sander Tolsma](http://sander.tolsma.net/)


Code License
============

[MIT License](http://www.opensource.org/licenses/mit-license.php)

Copyright (c)2011 [TTC](http://www.tolsma.net)/[Sander Tolsma](http://sander.tolsma.net/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
