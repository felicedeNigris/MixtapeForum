'use strict'

angular.module('mixtapes')
  .controller('thisMix',thisMix)


  function thisMix($scope, $stateParams, $meteor){
    //reads the mixd from stateprovider and maps a url
    //$scope.mixId = $stateParams.mixId
    $scope.mixId = $meteor.object(Tracks, $stateParams.mixId).subscribe("tracks")

  }
