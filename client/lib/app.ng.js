angular.module('mixtapes', [
  'angular-meteor',
  'ui.router',
  'angularUtils.directives.dirPagination',
  'accounts.ui',
])

onReady = function() {
  angular.bootstrap(document, ['mixtapes'])
}

if(Meteor.isCordova) {
  angular.element(document).on('deviceready', onReady)
} else {
  angular.element(document).ready(onReady)
}
