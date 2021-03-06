/* jshint -W033 */
'use strict'

angular.module('mixtapes')
  .config(function($stateProvider,$urlRouterProvider) {

    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'client/main/main.view.html',
        controller: 'homeCtrl'
      })
      .state('mixes',{
        url:'/mixes',
        templateUrl: 'client/mixes/mixlist.html',
        controller: 'MixList',
      })
      .state('create',{
        url:'/create',
        templateUrl: "client/create-a-mix/mixtapeform.html",
        controller:'MixList',
        resolve: {
            currentUser: function($q){
              if(Meteor.userId() === null){
                //won't allow user to create a post unless logged in
                alert('Authorization Required')
                return $q.reject('AUTH_REQUIRED')
              }
              else{
                return $q.resolve()
              }
            }
        }// end resolve
      })
      .state('mymixes',{
        url:'/mymixes',
        templateUrl: 'client/mixes/mymixes/mymixtapes.html',
        controller: 'MixList',
      })
      .state('thisMix',{
        url:'/mixes/thismix/:mixId',
        templateUrl:'client/thisMix/thisMix.html',
        controller:'thisMix'
      })

        $urlRouterProvider.otherwise('/')

  })
