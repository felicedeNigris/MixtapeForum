'use strict'

angular.module('mixtapes')
.controller('MixList', MixList)

//The list of Mixtapes
function MixList($scope,$meteor,$window){
  //list of tracks in mongo database
  $scope.tracks = $meteor.collection(function(){
    return Tracks.find({}, {sort: {createdAt: -1 }})
  })

  $scope.createMixTape = function(newTrack,$window){
    //create a mixtape
    $scope.tracks.push({
      name: newTrack.name,
      playlist: newTrack.playlist,
      creator: newTrack.creator
    })
    $scope.newTrack = {}
    $window.location.pathname ='/'
  }
  $scope.deleteMixTape = function(track){
    //delete a mixtape
    $scope.tracks.remove({_id: track._id})
  }
  $scope.editMixTape = function(track, updateTrack){
    //edit a mixtape
    $scope.tracks.save({_id: track._id, name:track.name, playlist: track.playlist, creator: track.creator})

    $scope.track = {}

  }
  $scope.isOwner = function(track){
    return track.owner === Meteor.userId()
  }



  // $scope.myMixes = $meteor.collection(function(){
  //   var user = Meteor.users.find(this.userId)
  //   return Tracks.filter({groupId: user.profile.groupId})
  // })
}

// Meteor.publish('groupItems', function () {
//   if ( ! this.userId ) return [];  //return an empty array if no user is logged in.
//
//   var user = Meteor.users.find( this.userId );
//   return Items.filter({ groupId : user.profile.groupId });
// });
