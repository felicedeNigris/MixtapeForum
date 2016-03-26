/* jshint -W033 */
'use strict'

angular.module('mixtapes')
  .controller('getSpotify', getSpotify)

function getSpotify($scope){

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
}//end getSpotify
