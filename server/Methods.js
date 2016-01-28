// Meteor.methods({
//
//
//   addMixTrack: function(newTrack){
//     //make sure the user is logged in
//     //before adding a mixtape
//     if(Meteor.userId() === null){
//       throw new Meteor.Error('not-authorized')
//     }
//     //add a mix to Tracks database
//     Tracks.insert({
//       name: newTrack.name,
//       playlist: newTrack.playlist,
//       creator: newTrack.creator,
//       owner: Meteor.userId()
//     })
//
//   },//end addMixTrack
//   //remove a mix from Tracks collection
//   deleteMixTrack: function(track){
//
//     Tracks.remove({_id: track._id})
//   },
//   //edit mixtape
//   editMixTrack: function(track, updateTrack){
//     if(track.owner !== Meteor.userId()){
//       throw new Meteor.Error('not-authorized')
//     }
//     Tracks.update({_id: track._id, name:track.name, playlist: track.playlist, creator: track.creator })
//   }
//
// })
