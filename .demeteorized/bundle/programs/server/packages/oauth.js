(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var check = Package.check.check;
var Match = Package.check.Match;
var _ = Package.underscore._;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var Log = Package.logging.Log;
var URL = Package.url.URL;

/* Package-scope variables */
var OAuth, OAuthTest, Oauth;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/oauth/oauth_server.js                                                                 //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
var Fiber = Npm.require('fibers');                                                                // 1
var url = Npm.require('url');                                                                     // 2
                                                                                                  // 3
OAuth = {};                                                                                       // 4
OAuthTest = {};                                                                                   // 5
                                                                                                  // 6
RoutePolicy.declare('/_oauth/', 'network');                                                       // 7
                                                                                                  // 8
var registeredServices = {};                                                                      // 9
                                                                                                  // 10
// Internal: Maps from service version to handler function. The                                   // 11
// 'oauth1' and 'oauth2' packages manipulate this directly to register                            // 12
// for callbacks.                                                                                 // 13
OAuth._requestHandlers = {};                                                                      // 14
                                                                                                  // 15
                                                                                                  // 16
// Register a handler for an OAuth service. The handler will be called                            // 17
// when we get an incoming http request on /_oauth/{serviceName}. This                            // 18
// handler should use that information to fetch data about the user                               // 19
// logging in.                                                                                    // 20
//                                                                                                // 21
// @param name {String} e.g. "google", "facebook"                                                 // 22
// @param version {Number} OAuth version (1 or 2)                                                 // 23
// @param urls   For OAuth1 only, specify the service's urls                                      // 24
// @param handleOauthRequest {Function(oauthBinding|query)}                                       // 25
//   - (For OAuth1 only) oauthBinding {OAuth1Binding} bound to the appropriate provider           // 26
//   - (For OAuth2 only) query {Object} parameters passed in query string                         // 27
//   - return value is:                                                                           // 28
//     - {serviceData:, (optional options:)} where serviceData should end                         // 29
//       up in the user's services[name] field                                                    // 30
//     - `null` if the user declined to give permissions                                          // 31
//                                                                                                // 32
OAuth.registerService = function (name, version, urls, handleOauthRequest) {                      // 33
  if (registeredServices[name])                                                                   // 34
    throw new Error("Already registered the " + name + " OAuth service");                         // 35
                                                                                                  // 36
  registeredServices[name] = {                                                                    // 37
    serviceName: name,                                                                            // 38
    version: version,                                                                             // 39
    urls: urls,                                                                                   // 40
    handleOauthRequest: handleOauthRequest                                                        // 41
  };                                                                                              // 42
};                                                                                                // 43
                                                                                                  // 44
// For test cleanup.                                                                              // 45
OAuthTest.unregisterService = function (name) {                                                   // 46
  delete registeredServices[name];                                                                // 47
};                                                                                                // 48
                                                                                                  // 49
                                                                                                  // 50
OAuth.retrieveCredential = function(credentialToken, credentialSecret) {                          // 51
  return OAuth._retrievePendingCredential(credentialToken, credentialSecret);                     // 52
};                                                                                                // 53
                                                                                                  // 54
                                                                                                  // 55
// The state parameter is normally generated on the client using                                  // 56
// `btoa`, but for tests we need a version that runs on the server.                               // 57
//                                                                                                // 58
OAuth._generateState = function (loginStyle, credentialToken, redirectUrl) {                      // 59
  return new Buffer(JSON.stringify({                                                              // 60
    loginStyle: loginStyle,                                                                       // 61
    credentialToken: credentialToken,                                                             // 62
    redirectUrl: redirectUrl})).toString('base64');                                               // 63
};                                                                                                // 64
                                                                                                  // 65
OAuth._stateFromQuery = function (query) {                                                        // 66
  var string;                                                                                     // 67
  try {                                                                                           // 68
    string = new Buffer(query.state, 'base64').toString('binary');                                // 69
  } catch (e) {                                                                                   // 70
    Log.warn('Unable to base64 decode state from OAuth query: ' + query.state);                   // 71
    throw e;                                                                                      // 72
  }                                                                                               // 73
                                                                                                  // 74
  try {                                                                                           // 75
    return JSON.parse(string);                                                                    // 76
  } catch (e) {                                                                                   // 77
    Log.warn('Unable to parse state from OAuth query: ' + string);                                // 78
    throw e;                                                                                      // 79
  }                                                                                               // 80
};                                                                                                // 81
                                                                                                  // 82
OAuth._loginStyleFromQuery = function (query) {                                                   // 83
  var style;                                                                                      // 84
  // For backwards-compatibility for older clients, catch any errors                              // 85
  // that result from parsing the state parameter. If we can't parse it,                          // 86
  // set login style to popup by default.                                                         // 87
  try {                                                                                           // 88
    style = OAuth._stateFromQuery(query).loginStyle;                                              // 89
  } catch (err) {                                                                                 // 90
    style = "popup";                                                                              // 91
  }                                                                                               // 92
  if (style !== "popup" && style !== "redirect") {                                                // 93
    throw new Error("Unrecognized login style: " + style);                                        // 94
  }                                                                                               // 95
  return style;                                                                                   // 96
};                                                                                                // 97
                                                                                                  // 98
OAuth._credentialTokenFromQuery = function (query) {                                              // 99
  var state;                                                                                      // 100
  // For backwards-compatibility for older clients, catch any errors                              // 101
  // that result from parsing the state parameter. If we can't parse it,                          // 102
  // assume that the state parameter's value is the credential token, as                          // 103
  // it used to be for older clients.                                                             // 104
  try {                                                                                           // 105
    state = OAuth._stateFromQuery(query);                                                         // 106
  } catch (err) {                                                                                 // 107
    return query.state;                                                                           // 108
  }                                                                                               // 109
  return state.credentialToken;                                                                   // 110
};                                                                                                // 111
                                                                                                  // 112
OAuth._isCordovaFromQuery = function (query) {                                                    // 113
  try {                                                                                           // 114
    return !! OAuth._stateFromQuery(query).isCordova;                                             // 115
  } catch (err) {                                                                                 // 116
    // For backwards-compatibility for older clients, catch any errors                            // 117
    // that result from parsing the state parameter. If we can't parse                            // 118
    // it, assume that we are not on Cordova, since older Meteor didn't                           // 119
    // do Cordova.                                                                                // 120
    return false;                                                                                 // 121
  }                                                                                               // 122
};                                                                                                // 123
                                                                                                  // 124
// Checks if the `redirectUrl` matches the app host.                                              // 125
// We export this function so that developers can override this                                   // 126
// behavior to allow apps from external domains to login using the                                // 127
// redirect OAuth flow.                                                                           // 128
OAuth._checkRedirectUrlOrigin = function (redirectUrl) {                                          // 129
  var appHost = Meteor.absoluteUrl();                                                             // 130
  var appHostReplacedLocalhost = Meteor.absoluteUrl(undefined, {                                  // 131
    replaceLocalhost: true                                                                        // 132
  });                                                                                             // 133
  return (                                                                                        // 134
    redirectUrl.substr(0, appHost.length) !== appHost &&                                          // 135
    redirectUrl.substr(0, appHostReplacedLocalhost.length) !== appHostReplacedLocalhost           // 136
  );                                                                                              // 137
};                                                                                                // 138
                                                                                                  // 139
                                                                                                  // 140
// Listen to incoming OAuth http requests                                                         // 141
WebApp.connectHandlers.use(function(req, res, next) {                                             // 142
  // Need to create a Fiber since we're using synchronous http calls and nothing                  // 143
  // else is wrapping this in a fiber automatically                                               // 144
  Fiber(function () {                                                                             // 145
    middleware(req, res, next);                                                                   // 146
  }).run();                                                                                       // 147
});                                                                                               // 148
                                                                                                  // 149
var middleware = function (req, res, next) {                                                      // 150
  // Make sure to catch any exceptions because otherwise we'd crash                               // 151
  // the runner                                                                                   // 152
  try {                                                                                           // 153
    var serviceName = oauthServiceName(req);                                                      // 154
    if (!serviceName) {                                                                           // 155
      // not an oauth request. pass to next middleware.                                           // 156
      next();                                                                                     // 157
      return;                                                                                     // 158
    }                                                                                             // 159
                                                                                                  // 160
    var service = registeredServices[serviceName];                                                // 161
                                                                                                  // 162
    // Skip everything if there's no service set by the oauth middleware                          // 163
    if (!service)                                                                                 // 164
      throw new Error("Unexpected OAuth service " + serviceName);                                 // 165
                                                                                                  // 166
    // Make sure we're configured                                                                 // 167
    ensureConfigured(serviceName);                                                                // 168
                                                                                                  // 169
    var handler = OAuth._requestHandlers[service.version];                                        // 170
    if (!handler)                                                                                 // 171
      throw new Error("Unexpected OAuth version " + service.version);                             // 172
    handler(service, req.query, res);                                                             // 173
  } catch (err) {                                                                                 // 174
    // if we got thrown an error, save it off, it will get passed to                              // 175
    // the appropriate login call (if any) and reported there.                                    // 176
    //                                                                                            // 177
    // The other option would be to display it in the popup tab that                              // 178
    // is still open at this point, ignoring the 'close' or 'redirect'                            // 179
    // we were passed. But then the developer wouldn't be able to                                 // 180
    // style the error or react to it in any way.                                                 // 181
    if (req.query.state && err instanceof Error) {                                                // 182
      try { // catch any exceptions to avoid crashing runner                                      // 183
        OAuth._storePendingCredential(OAuth._credentialTokenFromQuery(req.query), err);           // 184
      } catch (err) {                                                                             // 185
        // Ignore the error and just give up. If we failed to store the                           // 186
        // error, then the login will just fail with a generic error.                             // 187
        Log.warn("Error in OAuth Server while storing pending login result.\n" +                  // 188
                 err.stack || err.message);                                                       // 189
      }                                                                                           // 190
    }                                                                                             // 191
                                                                                                  // 192
    // close the popup. because nobody likes them just hanging                                    // 193
    // there.  when someone sees this multiple times they might                                   // 194
    // think to check server logs (we hope?)                                                      // 195
    // Catch errors because any exception here will crash the runner.                             // 196
    try {                                                                                         // 197
      OAuth._endOfLoginResponse(res, {                                                            // 198
        query: req.query,                                                                         // 199
        loginStyle: OAuth._loginStyleFromQuery(req.query),                                        // 200
        error: err                                                                                // 201
      });                                                                                         // 202
    } catch (err) {                                                                               // 203
      Log.warn("Error generating end of login response\n" +                                       // 204
               (err && (err.stack || err.message)));                                              // 205
    }                                                                                             // 206
  }                                                                                               // 207
};                                                                                                // 208
                                                                                                  // 209
OAuthTest.middleware = middleware;                                                                // 210
                                                                                                  // 211
// Handle /_oauth/* paths and extract the service name.                                           // 212
//                                                                                                // 213
// @returns {String|null} e.g. "facebook", or null if this isn't an                               // 214
// oauth request                                                                                  // 215
var oauthServiceName = function (req) {                                                           // 216
  // req.url will be "/_oauth/<service name>" with an optional "?close".                          // 217
  var i = req.url.indexOf('?');                                                                   // 218
  var barePath;                                                                                   // 219
  if (i === -1)                                                                                   // 220
    barePath = req.url;                                                                           // 221
  else                                                                                            // 222
    barePath = req.url.substring(0, i);                                                           // 223
  var splitPath = barePath.split('/');                                                            // 224
                                                                                                  // 225
  // Any non-oauth request will continue down the default                                         // 226
  // middlewares.                                                                                 // 227
  if (splitPath[1] !== '_oauth')                                                                  // 228
    return null;                                                                                  // 229
                                                                                                  // 230
  // Find service based on url                                                                    // 231
  var serviceName = splitPath[2];                                                                 // 232
  return serviceName;                                                                             // 233
};                                                                                                // 234
                                                                                                  // 235
// Make sure we're configured                                                                     // 236
var ensureConfigured = function(serviceName) {                                                    // 237
  if (!ServiceConfiguration.configurations.findOne({service: serviceName})) {                     // 238
    throw new ServiceConfiguration.ConfigError();                                                 // 239
  }                                                                                               // 240
};                                                                                                // 241
                                                                                                  // 242
var isSafe = function (value) {                                                                   // 243
  // This matches strings generated by `Random.secret` and                                        // 244
  // `Random.id`.                                                                                 // 245
  return typeof value === "string" &&                                                             // 246
    /^[a-zA-Z0-9\-_]+$/.test(value);                                                              // 247
};                                                                                                // 248
                                                                                                  // 249
// Internal: used by the oauth1 and oauth2 packages                                               // 250
OAuth._renderOauthResults = function(res, query, credentialSecret) {                              // 251
  // For tests, we support the `only_credential_secret_for_test`                                  // 252
  // parameter, which just returns the credential secret without any                              // 253
  // surrounding HTML. (The test needs to be able to easily grab the                              // 254
  // secret and use it to log in.)                                                                // 255
  //                                                                                              // 256
  // XXX only_credential_secret_for_test could be useful for other                                // 257
  // things beside tests, like command-line clients. We should give it a                          // 258
  // real name and serve the credential secret in JSON.                                           // 259
                                                                                                  // 260
  if (query.only_credential_secret_for_test) {                                                    // 261
    res.writeHead(200, {'Content-Type': 'text/html'});                                            // 262
    res.end(credentialSecret, 'utf-8');                                                           // 263
  } else {                                                                                        // 264
    var details = {                                                                               // 265
      query: query,                                                                               // 266
      loginStyle: OAuth._loginStyleFromQuery(query)                                               // 267
    };                                                                                            // 268
    if (query.error) {                                                                            // 269
      details.error = query.error;                                                                // 270
    } else {                                                                                      // 271
      var token = OAuth._credentialTokenFromQuery(query);                                         // 272
      var secret = credentialSecret;                                                              // 273
      if (token && secret &&                                                                      // 274
          isSafe(token) && isSafe(secret)) {                                                      // 275
        details.credentials = { token: token, secret: secret};                                    // 276
      } else {                                                                                    // 277
        details.error = "invalid_credential_token_or_secret";                                     // 278
      }                                                                                           // 279
    }                                                                                             // 280
                                                                                                  // 281
    OAuth._endOfLoginResponse(res, details);                                                      // 282
  }                                                                                               // 283
};                                                                                                // 284
                                                                                                  // 285
// This "template" (not a real Spacebars template, just an HTML file                              // 286
// with some ##PLACEHOLDER##s) communicates the credential secret back                            // 287
// to the main window and then closes the popup.                                                  // 288
OAuth._endOfPopupResponseTemplate = Assets.getText(                                               // 289
  "end_of_popup_response.html");                                                                  // 290
                                                                                                  // 291
OAuth._endOfRedirectResponseTemplate = Assets.getText(                                            // 292
  "end_of_redirect_response.html");                                                               // 293
                                                                                                  // 294
// Renders the end of login response template into some HTML and JavaScript                       // 295
// that closes the popup or redirects at the end of the OAuth flow.                               // 296
//                                                                                                // 297
// options are:                                                                                   // 298
//   - loginStyle ("popup" or "redirect")                                                         // 299
//   - setCredentialToken (boolean)                                                               // 300
//   - credentialToken                                                                            // 301
//   - credentialSecret                                                                           // 302
//   - redirectUrl                                                                                // 303
//   - isCordova (boolean)                                                                        // 304
//                                                                                                // 305
var renderEndOfLoginResponse = function (options) {                                               // 306
  // It would be nice to use Blaze here, but it's a little tricky                                 // 307
  // because our mustaches would be inside a <script> tag, and Blaze                              // 308
  // would treat the <script> tag contents as text (e.g. encode '&' as                            // 309
  // '&amp;'). So we just do a simple replace.                                                    // 310
                                                                                                  // 311
  var escape = function (s) {                                                                     // 312
    if (s) {                                                                                      // 313
      return s.replace(/&/g, "&amp;").                                                            // 314
        replace(/</g, "&lt;").                                                                    // 315
        replace(/>/g, "&gt;").                                                                    // 316
        replace(/\"/g, "&quot;").                                                                 // 317
        replace(/\'/g, "&#x27;").                                                                 // 318
        replace(/\//g, "&#x2F;");                                                                 // 319
    } else {                                                                                      // 320
      return s;                                                                                   // 321
    }                                                                                             // 322
  };                                                                                              // 323
                                                                                                  // 324
  // Escape everything just to be safe (we've already checked that some                           // 325
  // of this data -- the token and secret -- are safe).                                           // 326
  var config = {                                                                                  // 327
    setCredentialToken: !! options.setCredentialToken,                                            // 328
    credentialToken: escape(options.credentialToken),                                             // 329
    credentialSecret: escape(options.credentialSecret),                                           // 330
    storagePrefix: escape(OAuth._storageTokenPrefix),                                             // 331
    redirectUrl: escape(options.redirectUrl),                                                     // 332
    isCordova: !! options.isCordova                                                               // 333
  };                                                                                              // 334
                                                                                                  // 335
  var template;                                                                                   // 336
  if (options.loginStyle === 'popup') {                                                           // 337
    template = OAuth._endOfPopupResponseTemplate;                                                 // 338
  } else if (options.loginStyle === 'redirect') {                                                 // 339
    template = OAuth._endOfRedirectResponseTemplate;                                              // 340
  } else {                                                                                        // 341
    throw new Error('invalid loginStyle: ' + options.loginStyle);                                 // 342
  }                                                                                               // 343
                                                                                                  // 344
  var result = template.replace(/##CONFIG##/, JSON.stringify(config));                            // 345
                                                                                                  // 346
  return "<!DOCTYPE html>\n" + result;                                                            // 347
};                                                                                                // 348
                                                                                                  // 349
// Writes an HTTP response to the popup window at the end of an OAuth                             // 350
// login flow. At this point, if the user has successfully authenticated                          // 351
// to the OAuth server and authorized this app, we communicate the                                // 352
// credentialToken and credentialSecret to the main window. The main                              // 353
// window must provide both these values to the DDP `login` method to                             // 354
// authenticate its DDP connection. After communicating these vaues to                            // 355
// the main window, we close the popup.                                                           // 356
//                                                                                                // 357
// We export this function so that developers can override this                                   // 358
// behavior, which is particularly useful in, for example, some mobile                            // 359
// environments where popups and/or `window.opener` don't work. For                               // 360
// example, an app could override `OAuth._endOfPopupResponse` to put the                          // 361
// credential token and credential secret in the popup URL for the main                           // 362
// window to read them there instead of using `window.opener`. If you                             // 363
// override this function, you take responsibility for writing to the                             // 364
// request and calling `res.end()` to complete the request.                                       // 365
//                                                                                                // 366
// Arguments:                                                                                     // 367
//   - res: the HTTP response object                                                              // 368
//   - details:                                                                                   // 369
//      - query: the query string on the HTTP request                                             // 370
//      - credentials: { token: *, secret: * }. If present, this field                            // 371
//        indicates that the login was successful. Return these values                            // 372
//        to the client, who can use them to log in over DDP. If                                  // 373
//        present, the values have been checked against a limited                                 // 374
//        character set and are safe to include in HTML.                                          // 375
//      - error: if present, a string or Error indicating an error that                           // 376
//        occurred during the login. This can come from the client and                            // 377
//        so shouldn't be trusted for security decisions or included in                           // 378
//        the response without sanitizing it first. Only one of `error`                           // 379
//        or `credentials` should be set.                                                         // 380
OAuth._endOfLoginResponse = function (res, details) {                                             // 381
  res.writeHead(200, {'Content-Type': 'text/html'});                                              // 382
                                                                                                  // 383
  var redirectUrl;                                                                                // 384
  if (details.loginStyle === 'redirect') {                                                        // 385
    redirectUrl = OAuth._stateFromQuery(details.query).redirectUrl;                               // 386
    var appHost = Meteor.absoluteUrl();                                                           // 387
    if (OAuth._checkRedirectUrlOrigin(redirectUrl)) {                                             // 388
      details.error = "redirectUrl (" + redirectUrl +                                             // 389
        ") is not on the same host as the app (" + appHost + ")";                                 // 390
      redirectUrl = appHost;                                                                      // 391
    }                                                                                             // 392
  }                                                                                               // 393
                                                                                                  // 394
  var isCordova = OAuth._isCordovaFromQuery(details.query);                                       // 395
                                                                                                  // 396
  if (details.error) {                                                                            // 397
    Log.warn("Error in OAuth Server: " +                                                          // 398
             (details.error instanceof Error ?                                                    // 399
              details.error.message : details.error));                                            // 400
    res.end(renderEndOfLoginResponse({                                                            // 401
      loginStyle: details.loginStyle,                                                             // 402
      setCredentialToken: false,                                                                  // 403
      redirectUrl: redirectUrl,                                                                   // 404
      isCordova: isCordova                                                                        // 405
    }), "utf-8");                                                                                 // 406
    return;                                                                                       // 407
  }                                                                                               // 408
                                                                                                  // 409
  // If we have a credentialSecret, report it back to the parent                                  // 410
  // window, with the corresponding credentialToken. The parent window                            // 411
  // uses the credentialToken and credentialSecret to log in over DDP.                            // 412
  res.end(renderEndOfLoginResponse({                                                              // 413
    loginStyle: details.loginStyle,                                                               // 414
    setCredentialToken: true,                                                                     // 415
    credentialToken: details.credentials.token,                                                   // 416
    credentialSecret: details.credentials.secret,                                                 // 417
    redirectUrl: redirectUrl,                                                                     // 418
    isCordova: isCordova                                                                          // 419
  }), "utf-8");                                                                                   // 420
};                                                                                                // 421
                                                                                                  // 422
                                                                                                  // 423
var OAuthEncryption = Package["oauth-encryption"] && Package["oauth-encryption"].OAuthEncryption;
                                                                                                  // 425
var usingOAuthEncryption = function () {                                                          // 426
  return OAuthEncryption && OAuthEncryption.keyIsLoaded();                                        // 427
};                                                                                                // 428
                                                                                                  // 429
// Encrypt sensitive service data such as access tokens if the                                    // 430
// "oauth-encryption" package is loaded and the oauth secret key has                              // 431
// been specified.  Returns the unencrypted plaintext otherwise.                                  // 432
//                                                                                                // 433
// The user id is not specified because the user isn't known yet at                               // 434
// this point in the oauth authentication process.  After the oauth                               // 435
// authentication process completes the encrypted service data fields                             // 436
// will be re-encrypted with the user id included before inserting the                            // 437
// service data into the user document.                                                           // 438
//                                                                                                // 439
OAuth.sealSecret = function (plaintext) {                                                         // 440
  if (usingOAuthEncryption())                                                                     // 441
    return OAuthEncryption.seal(plaintext);                                                       // 442
  else                                                                                            // 443
    return plaintext;                                                                             // 444
}                                                                                                 // 445
                                                                                                  // 446
// Unencrypt a service data field, if the "oauth-encryption"                                      // 447
// package is loaded and the field is encrypted.                                                  // 448
//                                                                                                // 449
// Throws an error if the "oauth-encryption" package is loaded and the                            // 450
// field is encrypted, but the oauth secret key hasn't been specified.                            // 451
//                                                                                                // 452
OAuth.openSecret = function (maybeSecret, userId) {                                               // 453
  if (!Package["oauth-encryption"] || !OAuthEncryption.isSealed(maybeSecret))                     // 454
    return maybeSecret;                                                                           // 455
                                                                                                  // 456
  return OAuthEncryption.open(maybeSecret, userId);                                               // 457
};                                                                                                // 458
                                                                                                  // 459
// Unencrypt fields in the service data object.                                                   // 460
//                                                                                                // 461
OAuth.openSecrets = function (serviceData, userId) {                                              // 462
  var result = {};                                                                                // 463
  _.each(_.keys(serviceData), function (key) {                                                    // 464
    result[key] = OAuth.openSecret(serviceData[key], userId);                                     // 465
  });                                                                                             // 466
  return result;                                                                                  // 467
};                                                                                                // 468
                                                                                                  // 469
////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/oauth/pending_credentials.js                                                          //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
//                                                                                                // 1
// When an oauth request is made, Meteor receives oauth credentials                               // 2
// in one browser tab, and temporarily persists them while that                                   // 3
// tab is closed, then retrieves them in the browser tab that                                     // 4
// initiated the credential request.                                                              // 5
//                                                                                                // 6
// _pendingCredentials is the storage mechanism used to share the                                 // 7
// credential between the 2 tabs                                                                  // 8
//                                                                                                // 9
                                                                                                  // 10
                                                                                                  // 11
// Collection containing pending credentials of oauth credential requests                         // 12
// Has key, credential, and createdAt fields.                                                     // 13
OAuth._pendingCredentials = new Mongo.Collection(                                                 // 14
  "meteor_oauth_pendingCredentials", {                                                            // 15
    _preventAutopublish: true                                                                     // 16
  });                                                                                             // 17
                                                                                                  // 18
OAuth._pendingCredentials._ensureIndex('key', {unique: 1});                                       // 19
OAuth._pendingCredentials._ensureIndex('credentialSecret');                                       // 20
OAuth._pendingCredentials._ensureIndex('createdAt');                                              // 21
                                                                                                  // 22
                                                                                                  // 23
                                                                                                  // 24
// Periodically clear old entries that were never retrieved                                       // 25
var _cleanStaleResults = function() {                                                             // 26
  // Remove credentials older than 1 minute                                                       // 27
  var timeCutoff = new Date();                                                                    // 28
  timeCutoff.setMinutes(timeCutoff.getMinutes() - 1);                                             // 29
  OAuth._pendingCredentials.remove({ createdAt: { $lt: timeCutoff } });                           // 30
};                                                                                                // 31
var _cleanupHandle = Meteor.setInterval(_cleanStaleResults, 60 * 1000);                           // 32
                                                                                                  // 33
                                                                                                  // 34
// Stores the key and credential in the _pendingCredentials collection.                           // 35
// Will throw an exception if `key` is not a string.                                              // 36
//                                                                                                // 37
// @param key {string}                                                                            // 38
// @param credential {Object}   The credential to store                                           // 39
// @param credentialSecret {string} A secret that must be presented in                            // 40
//   addition to the `key` to retrieve the credential                                             // 41
//                                                                                                // 42
OAuth._storePendingCredential = function (key, credential, credentialSecret) {                    // 43
  check(key, String);                                                                             // 44
  check(credentialSecret, Match.Optional(String));                                                // 45
                                                                                                  // 46
  if (credential instanceof Error) {                                                              // 47
    credential = storableError(credential);                                                       // 48
  } else {                                                                                        // 49
    credential = OAuth.sealSecret(credential);                                                    // 50
  }                                                                                               // 51
                                                                                                  // 52
  // We do an upsert here instead of an insert in case the user happens                           // 53
  // to somehow send the same `state` parameter twice during an OAuth                             // 54
  // login; we don't want a duplicate key error.                                                  // 55
  OAuth._pendingCredentials.upsert({                                                              // 56
    key: key                                                                                      // 57
  }, {                                                                                            // 58
    key: key,                                                                                     // 59
    credential: credential,                                                                       // 60
    credentialSecret: credentialSecret || null,                                                   // 61
    createdAt: new Date()                                                                         // 62
  });                                                                                             // 63
};                                                                                                // 64
                                                                                                  // 65
                                                                                                  // 66
// Retrieves and removes a credential from the _pendingCredentials collection                     // 67
//                                                                                                // 68
// @param key {string}                                                                            // 69
// @param credentialSecret {string}                                                               // 70
//                                                                                                // 71
OAuth._retrievePendingCredential = function (key, credentialSecret) {                             // 72
  check(key, String);                                                                             // 73
                                                                                                  // 74
  var pendingCredential = OAuth._pendingCredentials.findOne({                                     // 75
    key: key,                                                                                     // 76
    credentialSecret: credentialSecret || null                                                    // 77
  });                                                                                             // 78
  if (pendingCredential) {                                                                        // 79
    OAuth._pendingCredentials.remove({ _id: pendingCredential._id });                             // 80
    if (pendingCredential.credential.error)                                                       // 81
      return recreateError(pendingCredential.credential.error);                                   // 82
    else                                                                                          // 83
      return OAuth.openSecret(pendingCredential.credential);                                      // 84
  } else {                                                                                        // 85
    return undefined;                                                                             // 86
  }                                                                                               // 87
};                                                                                                // 88
                                                                                                  // 89
                                                                                                  // 90
// Convert an Error into an object that can be stored in mongo                                    // 91
// Note: A Meteor.Error is reconstructed as a Meteor.Error                                        // 92
// All other error classes are reconstructed as a plain Error.                                    // 93
var storableError = function(error) {                                                             // 94
  var plainObject = {};                                                                           // 95
  Object.getOwnPropertyNames(error).forEach(function(key) {                                       // 96
    plainObject[key] = error[key];                                                                // 97
  });                                                                                             // 98
                                                                                                  // 99
  // Keep track of whether it's a Meteor.Error                                                    // 100
  if(error instanceof Meteor.Error) {                                                             // 101
    plainObject['meteorError'] = true;                                                            // 102
  }                                                                                               // 103
                                                                                                  // 104
  return { error: plainObject };                                                                  // 105
};                                                                                                // 106
                                                                                                  // 107
// Create an error from the error format stored in mongo                                          // 108
var recreateError = function(errorDoc) {                                                          // 109
  var error;                                                                                      // 110
                                                                                                  // 111
  if (errorDoc.meteorError) {                                                                     // 112
    error = new Meteor.Error();                                                                   // 113
    delete errorDoc.meteorError;                                                                  // 114
  } else {                                                                                        // 115
    error = new Error();                                                                          // 116
  }                                                                                               // 117
                                                                                                  // 118
  Object.getOwnPropertyNames(errorDoc).forEach(function(key) {                                    // 119
    error[key] = errorDoc[key];                                                                   // 120
  });                                                                                             // 121
                                                                                                  // 122
  return error;                                                                                   // 123
};                                                                                                // 124
                                                                                                  // 125
////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/oauth/oauth_common.js                                                                 //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
OAuth._storageTokenPrefix = "Meteor.oauth.credentialSecret-";                                     // 1
                                                                                                  // 2
OAuth._redirectUri = function (serviceName, config, params, absoluteUrlOptions) {                 // 3
  // XXX COMPAT WITH 0.9.0                                                                        // 4
  // The redirect URI used to have a "?close" query argument.  We                                 // 5
  // detect whether we need to be backwards compatible by checking for                            // 6
  // the absence of the `loginStyle` field, which wasn't used in the                              // 7
  // code which had the "?close" argument.                                                        // 8
  // This logic is duplicated in the tool so that the tool can do OAuth                           // 9
  // flow with <= 0.9.0 servers (tools/auth.js).                                                  // 10
  var query = config.loginStyle ? null : "close";                                                 // 11
                                                                                                  // 12
  // Clone because we're going to mutate 'params'. The 'cordova' and                              // 13
  // 'android' parameters are only used for picking the host of the                               // 14
  // redirect URL, and not actually included in the redirect URL itself.                          // 15
  var isCordova = false;                                                                          // 16
  var isAndroid = false;                                                                          // 17
  if (params) {                                                                                   // 18
    params = _.clone(params);                                                                     // 19
    isCordova = params.cordova;                                                                   // 20
    isAndroid = params.android;                                                                   // 21
    delete params.cordova;                                                                        // 22
    delete params.android;                                                                        // 23
    if (_.isEmpty(params)) {                                                                      // 24
      params = undefined;                                                                         // 25
    }                                                                                             // 26
  }                                                                                               // 27
                                                                                                  // 28
  if (Meteor.isServer && isCordova) {                                                             // 29
    var rootUrl = process.env.MOBILE_ROOT_URL ||                                                  // 30
          __meteor_runtime_config__.ROOT_URL;                                                     // 31
                                                                                                  // 32
    if (isAndroid) {                                                                              // 33
      // Match the replace that we do in cordova boilerplate                                      // 34
      // (boilerplate-generator package).                                                         // 35
      // XXX Maybe we should put this in a separate package or something                          // 36
      // that is used here and by boilerplate-generator? Or maybe                                 // 37
      // `Meteor.absoluteUrl` should know how to do this?                                         // 38
      var url = Npm.require("url");                                                               // 39
      var parsedRootUrl = url.parse(rootUrl);                                                     // 40
      if (parsedRootUrl.hostname === "localhost") {                                               // 41
        parsedRootUrl.hostname = "10.0.2.2";                                                      // 42
        delete parsedRootUrl.host;                                                                // 43
      }                                                                                           // 44
      rootUrl = url.format(parsedRootUrl);                                                        // 45
    }                                                                                             // 46
                                                                                                  // 47
    absoluteUrlOptions = _.extend({}, absoluteUrlOptions, {                                       // 48
      // For Cordova clients, redirect to the special Cordova root url                            // 49
      // (likely a local IP in development mode).                                                 // 50
      rootUrl: rootUrl                                                                            // 51
    });                                                                                           // 52
  }                                                                                               // 53
                                                                                                  // 54
  return URL._constructUrl(                                                                       // 55
    Meteor.absoluteUrl('_oauth/' + serviceName, absoluteUrlOptions),                              // 56
    query,                                                                                        // 57
    params);                                                                                      // 58
};                                                                                                // 59
                                                                                                  // 60
////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/oauth/deprecated.js                                                                   //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
// XXX COMPAT WITH 0.8.0                                                                          // 1
                                                                                                  // 2
Oauth = OAuth;                                                                                    // 3
                                                                                                  // 4
////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.oauth = {
  OAuth: OAuth,
  OAuthTest: OAuthTest,
  Oauth: Oauth
};

})();

//# sourceMappingURL=oauth.js.map
