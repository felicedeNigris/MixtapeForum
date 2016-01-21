'use strict'

angular.module('mixtapes')
.controller('MixList', MixList)

//The list of Mixtapes
function MixList($scope,$meteor,$location){
  //list of tracks in mongo database
  $scope.tracks = $meteor.collection(function(){
    return Tracks.find({}, {sort: {createdAt: -1 }})
  })

  //this block controls the okmodal directive
  $scope.modalShown = false;
  $scope.toggleModal = function(){
    //turns off modal directive
    $scope.modalShown = !$scope.modalShown;
  }// end okmodal controls

  $scope.createMixTape = function(newTrack){
    //create a mixtape
    $scope.tracks.push({
      name: newTrack.name,
      playlist: newTrack.playlist,
      creator: newTrack.creator
    })
    $scope.newTrack = {}
    $scope.toggleModal() // turn on modal
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

  $scope.isOwner = function(track){
    return track.owner === Meteor.userId()
  }//end isOwner
}
