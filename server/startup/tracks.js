Meteor.startup(function(){
  //if no tracks are found
  if(Tracks.find().count === 0){
    //then create sample tracks
      var sampleTracks = [
        {
        name: "David Bowie Greatest Hits",
        playlist: "Spotify Playlist Link",
        creator: "George Kafalukus"
        },
        {
        name: "Kinfolk Dinner Playlist",
        playlist: "Spotify Playlist Link",
        creator: "Kelly"
        },
        {
        name: "Jazz Hits",
        playlist: "Spotify Playlist Link",
        creator: "Gary Tuko"
        }
      ]

      sampleTracks.forEach(function(mix){
        Tracks.insert(sampleTracks[mix])
      })
  }

  // Configure Spotify service
  ServiceConfiguration.configurations.update(
    { "service": "spotify" },
    {
      $set: {
        "clientId": "d12a078de127492693230ee1b9a1380e",
        "secret": "9f1653c2a10f4cb1af814974195c4d87"
      }
    },
    { upsert: true }
  );
})
