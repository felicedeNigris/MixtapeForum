'use strict'

angular.module('mixtapes')
  .controller('MixList', MixList)


//The list of Mixtapes
function MixList($scope,$meteor,$location){

  //list of tracks in mongo database
  $scope.tracks = $meteor.collection(function(){
    return Tracks.find({}, {sort: {createdAt: -1 }})
  }).subscribe("tracks") //subscribe to the servers tracks.js


  $scope.createMixTape = function(newTrack){
    //create a mixtape
      $scope.tracks.push({
      name: newTrack.name,
      playlist: newTrack.playlist,
      creator: newTrack.creator
    })
    $scope.newTrack = {}
    $location.path('/mymixes')
  }//end createMixTape

  $scope.deleteMixTape = function(track){
    //delete a mixtape
    $scope.tracks.remove({_id: track._id})
  }//end deleteMixTape

  $scope.editMixTape = function(track, updateTrack){
    //edit a mixtape
    $scope.tracks.save({_id: track._id, name:track.name, playlist: track.playlist, creator: track.creator})

    $scope.track = {}

  }//end editMixTape


  /*****************************************************
    This is an angular filter which checks if a user is
    signed In.
    This filter is used in mymixes.jade to filter only
    mixes created by the user
  *****************************************************/
  $scope.isOwner = function(track){
    return track.owner === Meteor.userId()
  }//end isOwner
}
