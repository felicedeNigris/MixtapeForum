Tracks = new Mongo.Collection('tracks')

Tracks.allow({
  insert: function(userId, track) {
    track.createdAt = new Date();
    track.name_sort = track.name.toLowerCase();
    return true;
  },
  update: function(userId, track, fields, modifier) {
    track.createdAt = new Date();
    track.name_sort = track.name.toLowerCase();
    return true;
  },
  remove: function(userId, track) {
    return true;
  }
});
