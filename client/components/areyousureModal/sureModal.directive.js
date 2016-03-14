/* jshint -W033 */
'use strict'

angular.module('mixtapes')
.directive('suremodal', function() {
  return {
    restrict: "EA",
    scope: {},
    template: '<button ng-init"modalShow = false" ng-click="modalShow = !modalShow"/> Toggle'+ '<div>' +
    '<h3> modalShow directive is {{modalShow}}</h3>'+ '</div>'
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
