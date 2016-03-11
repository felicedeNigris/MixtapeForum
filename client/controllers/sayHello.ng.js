'use strict'

angular.module('mixtapes')
  .controller('sayHi', sayHi)


function sayHi($scope){
  $scope.hello = function(){
    return console.log("Hey there")
  }
}
