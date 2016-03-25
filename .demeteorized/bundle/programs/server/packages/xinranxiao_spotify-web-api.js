(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var _ = Package.underscore._;

/* Package-scope variables */
var SpotifyWebApi;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/xinranxiao_spotify-web-api/spotify-api.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var Future = Npm.require("fibers/future");                                                                             // 1
                                                                                                                       // 2
SpotifyWebApi = function(config) {                                                                                     // 3
  config = config || {};                                                                                               // 4
  var SpotifyWebApi = Npm.require('spotify-web-api-node');                                                             // 5
  var api = new SpotifyWebApi(config);                                                                                 // 6
                                                                                                                       // 7
  // Set the access token + refresh token (either provided, or retrieved from account)                                 // 8
  setAccessTokens(api, config);                                                                                        // 9
                                                                                                                       // 10
  // Create a refresh method that updates everything after the refresh.                                                // 11
  api.refreshAndUpdateAccessToken = function(callback) {                                                               // 12
    var response = api.refreshAccessToken();                                                                           // 13
                                                                                                                       // 14
    if (response.error) {                                                                                              // 15
      callback(response.error, null);                                                                                  // 16
    } else {                                                                                                           // 17
      // Update the current API instance                                                                               // 18
      api.setAccessToken(response.data.body.access_token);                                                             // 19
                                                                                                                       // 20
      // Update the current user (if available)                                                                        // 21
      if (Meteor.userId()) {                                                                                           // 22
        Meteor.users.update({ _id: Meteor.userId() }, { $set: {                                                        // 23
          'services.spotify.accessToken': response.data.body.access_token,                                             // 24
          'services.spotify.expiresAt': (+new Date) + (1000 * response.data.body.expires_in)                           // 25
        }});                                                                                                           // 26
      }                                                                                                                // 27
                                                                                                                       // 28
      callback(null, response);                                                                                        // 29
    }                                                                                                                  // 30
  }                                                                                                                    // 31
                                                                                                                       // 32
  // Whitelist functions to be wrapped. This is ugly -- any alternatives?                                              // 33
  SpotifyWebApi.whitelistedFunctionNames = ['refreshAndUpdateAccessToken','getTrack','getTracks','getAlbum',           // 34
    'getAlbums','getArtist','getArtists','searchAlbums',                                                               // 35
    'searchArtists','searchTracks','searchPlaylists','getArtistAlbums','getAlbumTracks','getArtistTopTracks',          // 36
    'getArtistRelatedArtists','getUser','getMe','getUserPlaylists','getPlaylist','getPlaylistTracks','createPlaylist',
    'followPlaylist','unfollowPlaylist','changePlaylistDetails','addTracksToPlaylist','removeTracksFromPlaylist',      // 38
    'removeTracksFromPlaylistByPosition','replaceTracksInPlaylist','reorderTracksInPlaylist','clientCredentialsGrant',
    'authorizationCodeGrant','refreshAccessToken','getMySavedTracks','containsMySavedTracks',                          // 40
    'removeFromMySavedTracks','addToMySavedTracks','followUsers','followArtists','unfollowUsers','unfollowArtists',    // 41
    'isFollowingUsers','areFollowingPlaylist','isFollowingArtists', 'getFollowedArtists', 'getNewReleases','getFeaturedPlaylists',
    'getCategories','getCategory','getPlaylistsForCategory', 'removeFromMySavedAlbums', 'addToMySavedAlbums', 'getMySavedAlbums', 'containsMySavedAlbums'];
                                                                                                                       // 44
  // Wrap all the functions to be able to be called synchronously on the server.                                       // 45
  _.each(SpotifyWebApi.whitelistedFunctionNames, function(functionName) {                                              // 46
    var fn = api[functionName];                                                                                        // 47
    if (_.isFunction(fn)) {                                                                                            // 48
      api[functionName] = wrapAsync(fn, api);                                                                          // 49
    }                                                                                                                  // 50
  });                                                                                                                  // 51
                                                                                                                       // 52
  return api;                                                                                                          // 53
};                                                                                                                     // 54
                                                                                                                       // 55
/*                                                                                                                     // 56
  This is exactly the same as Meteor.wrapAsync except it properly returns the error.                                   // 57
  credit goes to @faceyspacey -- https://github.com/meteor/meteor/issues/2774#issuecomment-70782092                    // 58
 */                                                                                                                    // 59
var wrapAsync = function(fn, context) {                                                                                // 60
  return function (/* arguments */) {                                                                                  // 61
    var self = context || this;                                                                                        // 62
    var newArgs = _.toArray(arguments);                                                                                // 63
    var callback;                                                                                                      // 64
                                                                                                                       // 65
    for (var i = newArgs.length - 1; i >= 0; --i) {                                                                    // 66
      var arg = newArgs[i];                                                                                            // 67
      var type = typeof arg;                                                                                           // 68
      if (type !== "undefined") {                                                                                      // 69
        if (type === "function") {                                                                                     // 70
          callback = arg;                                                                                              // 71
        }                                                                                                              // 72
        break;                                                                                                         // 73
      }                                                                                                                // 74
    }                                                                                                                  // 75
                                                                                                                       // 76
    if(!callback) {                                                                                                    // 77
      var fut = new Future();                                                                                          // 78
      callback = function(error, data) {                                                                               // 79
        fut.return({error:  error, data: data});                                                                       // 80
      };                                                                                                               // 81
                                                                                                                       // 82
      ++i;                                                                                                             // 83
    }                                                                                                                  // 84
                                                                                                                       // 85
    newArgs[i] = Meteor.bindEnvironment(callback);                                                                     // 86
    var result = fn.apply(self, newArgs);                                                                              // 87
    return fut ? fut.wait() : result;                                                                                  // 88
  };                                                                                                                   // 89
};                                                                                                                     // 90
                                                                                                                       // 91
var setAccessTokens = function(api, config) {                                                                          // 92
  var serviceConfiguration = ServiceConfiguration.configurations.findOne({service: 'spotify'});                        // 93
  if (config.clientId && config.clientSecret) {                                                                        // 94
    api.setClientId(config.clientId);                                                                                  // 95
    api.setClientSecret(config.clientSecret);                                                                          // 96
  } else if (serviceConfiguration) {                                                                                   // 97
    api.setClientId(serviceConfiguration.clientId);                                                                    // 98
    api.setClientSecret(serviceConfiguration.secret);                                                                  // 99
  } else {                                                                                                             // 100
    throw new Error("No clientId/secret found. Please configure the `service-configuration` package.");                // 101
  }                                                                                                                    // 102
                                                                                                                       // 103
  if (config.accessToken) {                                                                                            // 104
    api.setAccessToken(config.accessToken);                                                                            // 105
    if (config.refreshToken) {                                                                                         // 106
      api.setRefreshToken(config.refreshToken);                                                                        // 107
    }                                                                                                                  // 108
  } else {                                                                                                             // 109
    var currUser = Meteor.user();                                                                                      // 110
    if (currUser && currUser.services && currUser.services.spotify && currUser.services.spotify.accessToken) {         // 111
      api.setAccessToken(currUser.services.spotify.accessToken);                                                       // 112
      if (currUser.services.spotify.refreshToken) {                                                                    // 113
        api.setRefreshToken(currUser.services.spotify.refreshToken);                                                   // 114
      }                                                                                                                // 115
    } else {                                                                                                           // 116
      // No token specified                                                                                            // 117
      throw new Error("No accessToken found. Please provide an accessToken or login with xinranxiao:accouns-spotify");
    }                                                                                                                  // 119
  }                                                                                                                    // 120
}                                                                                                                      // 121
                                                                                                                       // 122
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['xinranxiao:spotify-web-api'] = {
  SpotifyWebApi: SpotifyWebApi
};

})();

//# sourceMappingURL=xinranxiao_spotify-web-api.js.map
