'use strict'

angular.module('mixtapes')
  .controller('thisMix',thisMix)


  function thisMix($scope, $stateParams, $meteor){
    //reads the mixd from stateprovider and maps a url
    //$scope.mixId = $stateParams.mixId
    $scope.mixId = $meteor.object(Tracks, $stateParams.mixId)

    $scope.thisMixtape = function($scope){
      return Tracks.findOne({_id: 'vr4dsCXCB9hs6oapc' },{name: 1, _id: 0})// this returns name in terminal
    }
  }
