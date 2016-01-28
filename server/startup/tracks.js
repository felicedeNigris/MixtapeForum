

/**********************************************
Meteor.publish() block will publish content you
filter or don't filter out to a public level
**********************************************/

Meteor.publish("tracks",()=>{
  return Tracks.find()
})
