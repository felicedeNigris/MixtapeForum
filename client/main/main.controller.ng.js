/* jshint -W033 */
'use strict'

angular.module('mixtapes')
  .controller('MixList', MixList)



//The list of Mixtapes
function MixList($scope,$meteor,$location,$reactive,$sce){

  //this prints the track uri when you choose a playlist
  // in the create a mix page
  $scope.trackdata = function(pickedPlaylist){
    var track = pickedPlaylist.spotifydata.playlist
    console.log(track)
    return track
  }

  //list of tracks in mongo database
  $scope.tracks = $meteor.collection(function(){
    return Tracks.find({}, {sort: {createdAt: -1 }})
  }).subscribe("tracks") //subscribe to the servers tracks.js

  $scope.createMixTape = function(newTrack){
    //create a mixtape
      $scope.tracks.push({
      name: newTrack.name,
      playlist: "https://embed.spotify.com/?uri=".concat(newTrack.spotifydata.playlist), //spotify data
      data: newTrack.spotifydata, //spotify uri and image { object }
      authorid: newTrack.authorid, //spotify id
      authorname: newTrack.authorname,  //spotify display name
      upvote: 0,// votes up count
      downvote: 0 //votes down
    })
    $scope.newTrack = {}
    $location.path('/mymixes')
  }//end createMixTape


  //this add trust to a url for iframe
  $scope.trustMixTape = function(track){
    return $sce.trustAsResourceUrl(track.playlist)
  }
  $scope.mixUris = $scope.tracks.filter(function(item){
    console.log("your items",item)
    return item.playlist
  })
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


  $scope.getUserPlaylists = function(){
    Meteor.call('getUserPlaylists',function(err,data){
      if(err){
        console.log('playlist retrieval failed ',err)
      }
      else{
        console.log('Success ',data.body)
      }
      return data.body
    })
     Session.set("playlists", data.body);
  }
/**********************************************************
                      MODAL POP UP
***********************************************************/

  //turn this scope of modal directive to false
  $scope.modalShow = false //access modal from delete button

  // flip the boolean value of modalShow for this scope
  $scope.toggleModal = function(){
    $scope.modalShow = !$scope.modalShow
    console.log('toggleModal set this.modalShow to', $scope.modalShow)
    setTimeout(modalfalseAgain,100)
    function modalfalseAgain(){
      //set modalShow to false again
      this.modalShow = false
      console.log('modalfalseAgain says this.modalShow', $scope.modalShow)
    }
  }

  this.showDelete = false //show settings for delete button

  $scope.toggleDelete = function(track){
    this.showDelete = !this.showDelete
  }
  $scope.yesDelete = function(track){
      $scope.tracks.remove({_id: track._id})
  }

  $scope.show = true
// hide with scope.show then reset it back to true with timer
  $scope.hideModal = function(track){
    $scope.show = false
    setTimeout(setTrueAgain,500)
    function setTrueAgain(){
      $scope.show = true
    }
  }

/**********************************************************
                  END MODAL POP UP
***********************************************************/


/*********************************************
      VOTING FEATURES
*********************************************/

  $scope.upVoteOnce = true

  $scope.upVote = function(track){
    if(this.upVoteOnce){
      var plusOne = track.upvote +=1
      $scope.tracks.save({_id: track._id , upvote: plusOne})
    }
    this.upVoteOnce = false
  }// end upVote

  $scope.downVoteOnce = true

  $scope.downVote = function(track){
    if(this.downVoteOnce){
      var plusOne = track.downvote +=1
      $scope.tracks.save({_id: track._id , downvote: plusOne})
    }
    this.downVoteOnce = false
  }//end DownVote
/*********************************************
        END VOTING FEATURES
*********************************************/

}
