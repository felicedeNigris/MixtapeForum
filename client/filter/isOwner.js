angular.module('mixtapes').filter('isOwner',function(){
    return Meteor.userId()
})
