/* jshint -W033 */
'use strict'

angular.module('mixtapes')
.directive('suremodal', function() {
  return {
    restrict: "EA",
    scope: {
      remove:'&'
    },
    template: '<button ng-init"modalShow = false" ng-click="modalShow = !modalShow" class="c-mixtape-button"> Delete</button>'+ '<div>' +
    '<div ng-show="modalShow" class="m-ok-modal">' +
    '<h3> Are you sure you want to delete this mix ? </h3>' +
    '<button type="button" ng-click="remove(track)"> Yes </button>'  +
    '<button type="button" ng-click="modalShow = !modalShow"> Cancel </button>' +
    '</div>' +
    '</div>'
  }//end return
})
