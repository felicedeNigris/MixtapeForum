(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Accounts = Package['accounts-base'].Accounts;
var AccountsServer = Package['accounts-base'].AccountsServer;
var _ = Package.underscore._;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var Spotify = Package['xinranxiao:spotify'].Spotify;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/xinranxiao_accounts-spotify/packages/xinranxiao_accounts-spotify.js                          //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
(function () {                                                                                           // 1
                                                                                                         // 2
/////////////////////////////////////////////////////////////////////////////////////////////////////    // 3
//                                                                                                 //    // 4
// packages/xinranxiao:accounts-spotify/spotify_common.js                                          //    // 5
//                                                                                                 //    // 6
/////////////////////////////////////////////////////////////////////////////////////////////////////    // 7
                                                                                                   //    // 8
Accounts.oauth.registerService('spotify');                                                         // 1  // 9
/////////////////////////////////////////////////////////////////////////////////////////////////////    // 10
                                                                                                         // 11
}).call(this);                                                                                           // 12
                                                                                                         // 13
                                                                                                         // 14
                                                                                                         // 15
                                                                                                         // 16
                                                                                                         // 17
                                                                                                         // 18
(function () {                                                                                           // 19
                                                                                                         // 20
/////////////////////////////////////////////////////////////////////////////////////////////////////    // 21
//                                                                                                 //    // 22
// packages/xinranxiao:accounts-spotify/spotify_server.js                                          //    // 23
//                                                                                                 //    // 24
/////////////////////////////////////////////////////////////////////////////////////////////////////    // 25
                                                                                                   //    // 26
Accounts.addAutopublishFields({                                                                    // 1  // 27
  forLoggedInUser: _.map(                                                                          // 2  // 28
    // publish access token since it can be used from the client                                   // 3  // 29
    // refresh token probably shouldn't be sent down.                                              // 4  // 30
    Spotify.whitelistedFields.concat(['accessToken', 'expiresAt']), // don't publish refresh token // 5  // 31
    function (subfield) { return 'services.spotify.' + subfield; }),                               // 6  // 32
                                                                                                   // 7  // 33
  forOtherUsers: _.map(                                                                            // 8  // 34
    // even with autopublish, no legitimate web app should be                                      // 9  // 35
    // publishing all users' emails                                                                // 10
    _.without(Spotify.whitelistedFields, 'email', 'id', 'uri'),                                    // 11
    function (subfield) { return 'services.spotify.' + subfield; })                                // 12
});                                                                                                // 13
/////////////////////////////////////////////////////////////////////////////////////////////////////    // 40
                                                                                                         // 41
}).call(this);                                                                                           // 42
                                                                                                         // 43
///////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['xinranxiao:accounts-spotify'] = {};

})();

//# sourceMappingURL=xinranxiao_accounts-spotify.js.map
