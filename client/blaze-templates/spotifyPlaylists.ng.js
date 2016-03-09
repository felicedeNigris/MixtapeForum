/* jshint -W033 */
Template.playlists.helpers({
  playlists: function(){
    return Session.get('getUserPlaylists')
  }
})


Meteor.call('getUserPlaylists', function(err,data){
  if(err)
    console.error("Error while retrieving user playlists")
  console.log("Your playlist data ", data.body)
  Session.set('getUserPlaylists',data.body)

})
