/* jshint -W033 */
'use strict'

angular.module('mixtapes')
  .config(function($stateProvider,$urlRouterProvider) {

    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'client/main/main.view.html',
        controller: 'MainCtrl'
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
        resolve: {
            currentUser: ($q)=>{
              if(Meteor.userId() === null){
                //won't allow user to create a post unless logged in
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
        templateUrl: 'client/mymixes/mymixtapes.html',
        controller: 'MixList',
        //controllerAs:'vm'
      })
      .state('thisMix',{
        url:'/mixes/thismix/:mixId',
        templateUrl:'client/thisMix/thisMix.html',
        controller:'thisMix'
      })

        $urlRouterProvider.otherwise('/')

  })
