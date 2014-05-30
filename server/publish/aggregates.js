/*****************************************************************************/
/* Aggregates Publish Functions
/*****************************************************************************/

Meteor.publish('aggregates', function (brand, location) {
  // you can remove this if you return a cursor
  var self = this
  // var cur = Aggregates.find({
  //   query : brand,
  //   geo: {
  //     $regex : new RegExp('^'+location, 'i')
  //   }
  // })
  var cur = Aggregates.aggregate([
            {
              $match : {
                query : brand,
                geo: {
                  $regex : new RegExp('^'+location, 'i')
                }
              }
            },

            {
              $group : {
                _id : "$hour",
                Neutral : {$sum : "$Neutral"},
                Positive : {$sum : "$Positive"},
                Negative : {$sum : "$Negative"},
                Unknown : {$sum : "$UNKNOWN"},
              }
            }
          ])

  _.map(cur, function(x){
    x['hour'] = x['_id'] * 3600
    self.added('aggregates', x._id, x)
  })
  this.ready()
});


