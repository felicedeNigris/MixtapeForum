/* jshint -W033 */
'use strict'

angular.module('mixtapes')
.controller('menucontroller',menucontroller)
.directive('toolbar', function() {
  return {
    restrict: 'AE',
    templateUrl: 'client/components/toolbar/toolbar.view.html',
    replace: true,
    controller: menucontroller
  }
})

function menucontroller($scope,$location,$auth){
  //on-off state based on click counts
  // if click is % 2 === on
  $scope.clickedSignInTimes = 1;

  $scope.clickedSignIn = function(clickedSignInTimes){


    $scope.clickedSignInTimes++


    //ON STATE
    if($scope.clickedSignInTimes % 2 === 0){

      $scope.$watch('currentUser',function(newVal, oldVal){

        var options = {
          showDialog: true, // Whether or not to force the user to approve the app again if they’ve already done so.
          requestPermissions: ['user-read-email','playlist-modify-private', 'user-library-read','user-follow-read', 'playlist-read-private','streaming'] // Spotify access scopes.
        }

        console.log('watch newVal: '+ newVal,' watch oldVal: '+ oldVal)
        //if auth.currentUser isn't an object
        //reload and login untill it is an object
        if(typeof newVal !== typeof {} ){ //&& typeof oldVal !== typeof {}
          setTimeout(function(){
            location.reload()
                Meteor.loginWithSpotify(options,function(err){
                  console.log(err || 'No Error logging in with Spotify')
                })
          },2000)
        }
        //reload page if the currentUser newVal isn't equal to currentUser oldVal
        if(oldVal !== newVal ){
          setTimeout(function(){
            location.reload()
          },700)
        }
        console.log('watch newVal: ' + newVal,' watch oldVal: '+ oldVal)
      })
    }else{
      setTimeout(function(){
        location.reload()
      },700)
    }
    console.log("ON is 1, OFF is 2 : ",$scope.clickedSignInTimes)
  }


  $scope.activePath = function(route){
    //console.log($location.path())
    if($location.path() === route){
      return true
    }else {
      return false
    }
  }

}
