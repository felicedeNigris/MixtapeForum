/* jshint -W033*/
'use strict';

angular.module('mixtapes')

.config(function($locationProvider, $stateProvider, $urlRouterProvider) {
  $locationProvider.html5Mode(true)

  $urlRouterProvider.otherwise('/')
}).run(function($rootScope, $state) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    switch(error) {
      case 'AUTH_REQUIRED':
      case 'FORBIDDEN':
      case 'UNAUTHORIZED':
        $state.go('main');
        break;
    }
  })
})
