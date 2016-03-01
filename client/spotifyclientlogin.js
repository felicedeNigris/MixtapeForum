var options = {
  showDialog: false, // Whether or not to force the user to approve the app again if they’ve already done so.
  requestPermissions: ['user-read-email','playlist-modify-private', 'user-library-read','user-follow-read', 'playlist-read-private','streaming'] // Spotify access scopes.
};
Meteor.loginWithSpotify(options, function(err) {
  console.log(err || "No error");
});

var scopes = ['user-read-email','playlist-modify-private', 'user-library-read','user-follow-read', 'playlist-read-private','streaming']
Accounts.ui.config({'requestPermissions':{'spotify':scopes}})


// if(Meteor.loginWithSpotify() === undefined){
//   var response = spotifyApi.refreshAccessToken();
//   spotifyApi.refreshAndUpdateAccessToken();
// }
