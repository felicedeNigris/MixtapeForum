Tracks = new Mongo.Collection('tracks')

Tracks.allow({
  insert: function(userId, track) {
    track.createdAt = new Date();
    track.name_sort = track.name.toLowerCase()
    track.owner = userId
    return userId //if signedIn you can post
  },
  update: function(userId, track, fields, modifier) {
    track.createdAt = new Date()
    track.name_sort = track.name.toLowerCase()
    return userId === track.owner //if you created it & signedIn you can edit
  },
  remove: function(userId, track) {
    return track.owner === userId //if you created it & signedIn you can delete
  }
});
