/* jshint -W033 */
Meteor.methods({



  // Get a user's playlists
  getUserPlaylists: function() {
    //Spotify call
    var spotifyApi = new SpotifyWebApi({
      clientId : 'd12a078de127492693230ee1b9a1380e',
      clientSecret : '051ec17063a54e4e8cc5056b6b7398b1',
      redirectUri : 'http://localhost:3000/_oauth/spotify?close'
    })
    //response object
    var userplaylists = spotifyApi.getUserPlaylists(Meteor.user().profile.id,function(err,data){
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

  }//end getUserPlaylists


})//end Meteor.methods



var checkTokenRefreshed = function(response, api) {
  if (response.error && response.error.statusCode === 401) {
    api.refreshAndUpdateAccessToken();
    return true
  } else {
    return false
  }
}
