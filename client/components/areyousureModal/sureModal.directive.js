/* jshint -W033 */
'use strict'

angular.module('mixtapes')
.directive('suremodal', function() {
  return {
    restrict: "EA",
    scope: {
      remove:'&'
    },
    template: '<button ng-init"modalShow = false" ng-click="modalShow = !modalShow"/> Delete'+ '<div>' +
    '<div ng-show="modalShow" class="m-ok-modal">' +
    '<h3> Are you sure you want to delete this mix ? </h3>' +
    '<button type="button" ng-click="remove(track)" /> Yes'  +
    '<button type="button" ng-click="modalShow = !modalShow"/> Cancel' +
    '</div>' +
    '</div>'
  }//end return
})

//
// '<div ng-show="modalShow">' +
// '<div ng-show="show" ng-if="modalShow === true" class="m-ok-modal">' +
// '<h3> Are you sure you want to delete this mix ? </h3>' +
// '<button type="button" ng-click="yesDelete(track)" /> Yes'  +
// '<button type="button" ng-click="hideModal(track)"/> Cancel' +
// '</div>' +
// '</div>'


// '<button ng-init"modalShow = false" ng-click="modalShow = !modalShow"/> Toggle'+ '<div>' +
// '<h3> modalShow directive is {{modalShow}}</h3>'+ '</div>'
