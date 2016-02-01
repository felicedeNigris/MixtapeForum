Meteor.methods({

  // createPlaylist: function(selectedTracks, playlistName) {
  //   if (!selectedTracks || !playlistName || selectedTracks.length > 20) throw new Error("No tracks or playlist name specified");
  //
  //   // Call
  //   var spotifyApi = new SpotifyWebApi();
  //   var response = spotifyApi.createPlaylist(Meteor.user().services.spotify.id, playlistName, { public: false });
  //
  //   // Need to refresh token
  //   if (checkTokenRefreshed(response, spotifyApi)) {
  //     response = spotifyApi.createPlaylist(Meteor.user().services.spotify.id, playlistName, { public: false });
  //   }
  //
  //   // Put songs into the playlist.
  //   var uris = selectedTracks.map(function(track) {
  //     return track.uri;
  //   });
  //   spotifyApi.addTracksToPlaylist(Meteor.user().services.spotify.id, response.data.body.id, uris, {});
  //
  //   return response.data.body;
  // }


  getElvis: function(){
    var spotifyApi = new SpotifyWebApi()

    var elvisalbum = spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE',function(err,data){
      if(err){
        console.log("Something went wrong")
      }else {
        console.log(data)
      }
    })

    return elvisalbum


    // return 'Elvis Says Hi'
  },

  getUserPlaylists: function() {
    // Get a user's playlists
    let spotifyApi = new SpotifyWebApi()

    let userplaylists = spotifyApi.getUserPlaylists('felideni',function(err,data){
      if(err){
        console.log("Retrieval error ", err)
      }
      else{
        console.log("Success, your playlist ", data.body)
      }
    })

    return userplaylists
  }//end getUserPlaylists


})//end Meteor.methods

var checkTokenRefreshed = function(response, api) {
  if (response.error && response.error.statusCode === 401) {
    api.refreshAndUpdateAccessToken();
    return true;
  } else {
    return false;
  }
}
