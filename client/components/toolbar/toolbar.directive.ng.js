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

function menucontroller($scope,$location){

  $scope.signedIn = Meteor.userId()

  $scope.reload = function(){
    $scope.getReactively('signedIn')
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
