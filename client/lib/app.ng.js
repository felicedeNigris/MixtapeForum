/* jshint -W033 */
angular.module('mixtapes', [
  'angular-meteor',
  'ui.router',
  'angularUtils.directives.dirPagination',
  'accounts.ui',
  'angular-blaze-template',
  'angularUtils.directives.dirPagination',
  'angular-meteor.auth'
])

onReady = function() {
  angular.bootstrap(document, ['mixtapes'],{strictDi: true}) //strict minification safe
}

if(Meteor.isCordova) {
  angular.element(document).on('deviceready', onReady)
} else {
  angular.element(document).ready(onReady)
}
