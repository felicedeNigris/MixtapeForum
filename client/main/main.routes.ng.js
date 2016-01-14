'use strict'

angular.module('mixtapes')
.config(function($stateProvider,$urlRouterProvider) {
  $urlRouterProvider.otherwise('/')
  $stateProvider
  .state('main', {
    url: '/',
    templateUrl: 'client/main/main.view.html',
    controller: 'MixList'
  })
  .state('mixes',{
    url:'/mixes',
    templateUrl: 'client/mixes/mixlist.html',
    controller: 'MixList',
    //controllerAs:'vm'
  })
  .state('create',{
    url:'/create',
    templateUrl: "client/create-a-mix/mixtapeform.html",
    controller:'MixList',
    //controllerAs:'vm'
  })
})
