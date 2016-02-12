'use strict'

angular.module('mixtapes')
.controller('signedIn',signedIn)
.directive('toolbar', function() {
  return {
    restrict: 'AE',
    templateUrl: 'client/components/toolbar/toolbar.view.html',
    replace: true,
    controller: signedIn
  }
})

function signedIn($scope){
  $scope.In = function(){
    return Meteor.user() === null
  }
  $scope.reload = function(){
    if(window.location.pathname === '/mymixes' || window.location.pathname === '/create' || window.location.pathname === '/mixes'){
      window.location.pathname = '/'
    }
    if(window.location.pathname === '/'){
      window.location.pathname = '/mixes'
    }
  }
}
