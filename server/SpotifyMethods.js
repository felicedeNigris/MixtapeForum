Meteor.methods({



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

    let userplaylists = spotifyApi.getUserPlaylists(Meteor.user().profile.id,function(err,data){
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
