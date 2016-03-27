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

  $scope.$watch('currentUser',function(newVal, oldVal){
    var options = {
      showDialog: true, // Whether or not to force the user to approve the app again if they’ve already done so.
      requestPermissions: ['user-read-email','playlist-modify-private', 'user-library-read','user-follow-read', 'playlist-read-private','streaming'] // Spotify access scopes.
    };
    console.log('watch newVal: '+ newVal,'watch oldVal: '+ oldVal)
    if(newVal !== oldVal){
      setTimeout(function(){
        location.reload()
            Meteor.loginWithSpotify(options,function(err){
              console.log(err || 'No Error logging in with Spotify')
            })
      },1500)
    }
    console.log('watch newVal: '+ newVal,'watch oldVal: '+ oldVal)
  })

  $scope.activePath = function(route){
    //console.log($location.path())
    if($location.path() === route){
      return true
    }else {
      return false
    }
  }

}
