/* jshint -W033 */
'use strict'

angular.module('mixtapes')
.directive('suremodal', function() {
  return {
    scope:true,
    template: '<div ng-show="modalShow">' +
    '<div ng-show="show" ng-if="modalShow === true" class="m-ok-modal">' +
    '<h3> Are you sure you want to delete this mix ? </h3>' +
    '<button type="button" ng-click="yesDelete(track)" /> Yes'  +
    '<button type="button" ng-click="hideModal(track)"/> Cancel' +
    '</div>' +
    '</div>'
  }//end return
})
