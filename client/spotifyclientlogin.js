/* jshint -W033 */
var options = {
  showDialog: true, // Whether or not to force the user to approve the app again if they’ve already done so.
  requestPermissions: ['user-read-email','playlist-modify-private', 'user-library-read','user-follow-read', 'playlist-read-private','streaming'] // Spotify access scopes.
};



// var scopes = ['user-read-email','playlist-modify-private', 'user-library-read','user-follow-read', 'playlist-read-private','streaming']
// Accounts.ui.config({'requestPermissions':{'spotify':scopes}})
//
// Meteor.loginWithSpotify(options, function(accessToken) {
//   console.log('accessToken is ', accessToken)
// });
