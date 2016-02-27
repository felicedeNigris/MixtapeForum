Meteor.methods({




  // createPlaylist: function(selectedTracks, playlistName){
  //   if (!selectedTracks || !playlistName || selectedTracks.length > 20) throw new Error("No tracks or playlist name specified");
  //
  //   let spotifyApi = new SpotifyWebApi()
  //
  //   let createResponse = spotifyApi.createPlaylist(Meteor.user().profile.id, playlistName, {public: true})
  //
  //   // Put songs into the playlist.
  //   let uris = selectedTracks.map(function(track) {
  //    return track.uri
  //   })



  // },//endCreatePlaylist





  // Get a user's playlists
  getUserPlaylists: function() {
    //Spotify call
    let spotifyApi = new SpotifyWebApi()
    //response object
    let userplaylists = spotifyApi.getUserPlaylists(Meteor.user().profile.id,function(err,data){
      if(err){
        console.log("Retrieval error ", err)
      }
      else{
        console.log("Success, your playlist ", data.body)
      }
    })
    //Need to refresh token
    if(checkTokenRefreshed(userplaylists, spotifyApi)){
      userplaylists = spotifyApi.getUserPlaylists(Meteor.user().profile.id,function(err,data){
        if(err){
          console.log("Retrieval error ", err)
        }
        else{
          console.log("Success, your playlist ", data.body)
        }
      })//end response
    }//end checkTokenRefreshed

    return userplaylists

    // let userplaylists = spotifyApi.getUserPlaylists(Meteor.user().profile.id,function(err,data){
    //   if(err){
    //     console.log("Retrieval error ", err)
    //   }
    //   else{
    //     console.log("Success, your playlist ", data.body)
    //   }
    // })
    // return userplaylists
  }//end getUserPlaylists


})//end Meteor.methods



var checkTokenRefreshed = function(response, api) {
  if (response.error && response.error.statusCode === 401) {
    response
    return true
  } else {
    return false
  }
}
