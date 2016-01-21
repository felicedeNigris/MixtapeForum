'use strict'
angular.module('mixtapes')
  .directive(modalDialog,'okModal')

    function okModal() {
      return {

        templateUrl: "./okmodal.view.html"
      };
    }
