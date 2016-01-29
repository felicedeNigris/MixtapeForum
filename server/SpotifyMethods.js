Meteor.methods({
  createPlaylist: function(selectedTracks, playlistName) {
    if (!selectedTracks || !playlistName || selectedTracks.length > 20) throw new Error("No tracks or playlist name specified");

    // Call
    var spotifyApi = new SpotifyWebApi();
    var response = spotifyApi.createPlaylist(Meteor.user().services.spotify.id, playlistName, { public: false });

    // Need to refresh token
    if (checkTokenRefreshed(response, spotifyApi)) {
      response = spotifyApi.createPlaylist(Meteor.user().services.spotify.id, playlistName, { public: false });
    }

    // Put songs into the playlist.
    var uris = selectedTracks.map(function(track) {
      return track.uri;
    });
    spotifyApi.addTracksToPlaylist(Meteor.user().services.spotify.id, response.data.body.id, uris, {});

    return response.data.body;
  }
});
