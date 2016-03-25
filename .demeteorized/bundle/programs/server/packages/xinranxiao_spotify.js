(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var _ = Package.underscore._;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;

/* Package-scope variables */
var Spotify;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/xinranxiao_spotify/packages/xinranxiao_spotify.js        //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
(function () {                                                       // 1
                                                                     // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/xinranxiao:spotify/spotify_common.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
if (typeof Spotify === 'undefined') {                                                                                  // 1
  Spotify = {};                                                                                                        // 2
}                                                                                                                      // 3
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                     // 13
}).call(this);                                                       // 14
                                                                     // 15
                                                                     // 16
                                                                     // 17
                                                                     // 18
                                                                     // 19
                                                                     // 20
(function () {                                                       // 21
                                                                     // 22
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/xinranxiao:spotify/spotify_server.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var OAuth = Package.oauth.OAuth;                                                                                       // 1
                                                                                                                       // 2
Spotify.whitelistedFields = ['display_name', 'email', 'id', 'uri', 'images'];                                          // 3
                                                                                                                       // 4
/*                                                                                                                     // 5
  Registers the oauth service.                                                                                         // 6
 */                                                                                                                    // 7
OAuth.registerService('spotify', 2, null, function(query) {                                                            // 8
  var response = getTokens(query);                                                                                     // 9
  var refreshToken = response.refreshToken;                                                                            // 10
  var identity = getIdentity(response.accessToken);                                                                    // 11
                                                                                                                       // 12
  // Set the service data.                                                                                             // 13
  var serviceData = {                                                                                                  // 14
    accessToken: response.accessToken,                                                                                 // 15
    expiresAt: (+new Date) + (1000 * response.expiresIn)                                                               // 16
  };                                                                                                                   // 17
                                                                                                                       // 18
  // Set refresh token.                                                                                                // 19
  if (refreshToken) {                                                                                                  // 20
    serviceData.refreshToken = refreshToken;                                                                           // 21
  }                                                                                                                    // 22
                                                                                                                       // 23
  // Set any additional fields.                                                                                        // 24
  var fields = _.pick(identity, Spotify.whitelistedFields);                                                            // 25
  _.extend(serviceData, fields);                                                                                       // 26
                                                                                                                       // 27
  return {                                                                                                             // 28
    serviceData: serviceData,                                                                                          // 29
    options: { profile: fields }                                                                                       // 30
  };                                                                                                                   // 31
});                                                                                                                    // 32
                                                                                                                       // 33
// checks whether a string parses as JSON                                                                              // 34
var isJSON = function (str) {                                                                                          // 35
  try {                                                                                                                // 36
    JSON.parse(str);                                                                                                   // 37
    return true;                                                                                                       // 38
  } catch (e) {                                                                                                        // 39
    return false;                                                                                                      // 40
  }                                                                                                                    // 41
};                                                                                                                     // 42
                                                                                                                       // 43
/*                                                                                                                     // 44
  Helper function that returns an object with:                                                                         // 45
    accessToken (token itself)                                                                                         // 46
    expiresIn (token lifespan)                                                                                         // 47
    refreshToken                                                                                                       // 48
 */                                                                                                                    // 49
var getTokens = function(query) {                                                                                      // 50
  var config = ServiceConfiguration.configurations.findOne({service: 'spotify'});                                      // 51
  if (!config)                                                                                                         // 52
    throw new ServiceConfiguration.ConfigError();                                                                      // 53
                                                                                                                       // 54
  var response;                                                                                                        // 55
  try {                                                                                                                // 56
    // Request access token.                                                                                           // 57
    response = HTTP.post(                                                                                              // 58
      "https://accounts.spotify.com/api/token", { params: {                                                            // 59
        code: query.code,                                                                                              // 60
        client_id: config.clientId,                                                                                    // 61
        client_secret: OAuth.openSecret(config.secret),                                                                // 62
        redirect_uri: OAuth._redirectUri('spotify', config),                                                           // 63
        grant_type: 'authorization_code'                                                                               // 64
      }});                                                                                                             // 65
  } catch (err) {                                                                                                      // 66
    throw _.extend(new Error("Failed to complete OAuth handshake with Spotify. " + err.message), {response: err.response});
  }                                                                                                                    // 68
                                                                                                                       // 69
  // Spotify returns responses like 'E{"error":"server_error","error_description":"Unexpected status: 415"}' on error. // 70
  if (isJSON(response)) {                                                                                              // 71
    throw new Error("Failed to complete OAuth handshake with Spotify. " + response);                                   // 72
  } else if (!response.data.access_token) {                                                                            // 73
    throw new Error("Failed to complete OAuth handshake with Spotify. No access_token found in response.");            // 74
  } else {                                                                                                             // 75
    return {                                                                                                           // 76
      accessToken: response.data.access_token,                                                                         // 77
      refreshToken: response.data.refresh_token,                                                                       // 78
      expiresIn: response.data.expires_in                                                                              // 79
    };                                                                                                                 // 80
  }                                                                                                                    // 81
};                                                                                                                     // 82
                                                                                                                       // 83
// Helper function that fetches and returns the user's Spotify profile.                                                // 84
var getIdentity = function(accessToken) {                                                                              // 85
  try {                                                                                                                // 86
    return HTTP.get(                                                                                                   // 87
      "https://api.spotify.com/v1/me",                                                                                 // 88
      { params: { access_token: accessToken }}).data;                                                                  // 89
  } catch (err) {                                                                                                      // 90
    throw _.extend(new Error("Failed to fetch identity from Spotify. " + err.message), { response: err.response });    // 91
  }                                                                                                                    // 92
}                                                                                                                      // 93
                                                                                                                       // 94
Spotify.retrieveCredential = function(credentialToken, credentialSecret) {                                             // 95
  return OAuth.retrieveCredential(credentialToken, credentialSecret);                                                  // 96
};                                                                                                                     // 97
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                     // 127
}).call(this);                                                       // 128
                                                                     // 129
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['xinranxiao:spotify'] = {
  Spotify: Spotify
};

})();

//# sourceMappingURL=xinranxiao_spotify.js.map
