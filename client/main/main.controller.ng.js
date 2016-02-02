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
      authorid: newTrack.authorid, //spotify id
      authorname: newTrack.authorname //spotify display name

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

  $scope.isOwner = function(track){
    return track.owner === Meteor.userId()
  }//end isOwner


  $scope.modalShow = false //access modal from delete button

  $scope.toggleModal = function(){
    $scope.modalShow = !$scope.modalShow
  }

  $scope.yesDelete = function(track){
      $scope.tracks.remove({_id: track._id})
  }
  $scope.getElvis = function(){
    Meteor.call('getElvis',function(err,data){
      if(err){
        console.log('failed ', err)
      }
      else{
        console.log('success ', data)
      }
    })
  }

  $scope.getUserPlaylists = function(){
    Meteor.call('getUserPlaylists',(err,data)=>{
      if(err){
        console.log('playlist retrieval failed ',err)
      }
      else{
        console.log('Success ',data)
      }
    })
  }

}


// Template.test.helpers({
//   mixes: function(){
//     return Template.currentData().getReactively('tracks', true)
//   }
// })
