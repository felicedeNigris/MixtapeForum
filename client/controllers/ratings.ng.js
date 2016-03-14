/* jshint -W033*/
'use strict'

angular.module('mixtapes')
  .controller('ratings',ratings)



function ratings($scope){
  $scope.vote = 0;

  $scope.upVote = function(vote){
    var startvote = $scope.vote
    //if current vote < current vote + 1
    if(startvote < ($scope.vote +1) ){
      var votedUp = $scope.vote += 1
      return votedUp
      //if new vote - vote(prior to addition) === 1
      if(votedUp - startvote === 1){
        //cant vote up again
        return votedUp += 0
      }
      else{
        alert("Can't up vote twice !")
      }
      //write plus one to $scope.vote
      $scope.vote = votedUp
      console.log($scope.vote)
      return $scope.vote
    }
  }// end upVote


  $scope.downVote = function(vote){
    var startvote = $scope.vote
    //if current vote > current vote - 1
    if(startvote > ($scope.vote - 1)){
      var votedDown = $scope.vote -= 1
      return votedDown
      //if new vote + vote(prior to subtraction) === 1
      if(votedDown - startvote === -1){
        //cant down vote again
        return votedDown += 0
      }
      else{
        alert("Can't down vote twice !")
      }
      //write minus one to $scope.vote
      $scope.vote = votedDown
      console.log($scope.vote)
      return $scope.vote
    }
  }// end downVote
}
