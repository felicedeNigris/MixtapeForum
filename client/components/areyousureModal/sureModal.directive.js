/* jshint -W033 */
'use strict'

angular.module('mixtapes')
.directive('suremodal', function() {
  return {
    restrict: 'AE',
    templateUrl: 'client/components/areyousureModal/sureModal.view.html',
    replace: true,
    link: function(scope,element, attrs){
      scope.show = true
      scope.hideModal = function(){
        scope.show = false
        setTimeout(setTrueAgain,500)
        function setTrueAgain(){
          scope.show = true
        }
      }
    }
  }//end return
})
