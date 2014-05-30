/*
 * Add query methods like this:
 *  Aggregates.findPublic = function () {
 *    return Aggregates.find({is_public: true});
 *  }
 */

Aggregates.locations = function(){
  var values = Aggregates.distinct('geo')
  var cols = ['World', 'Country', 'Region', 'Division', 'State', 'City']
  var options = {}

  _.each(values, function(value){
    var parts = value.split(':::')
    var option = []
    _.each(parts, function(part){
      option.push(part)
      var code = option.join(':::')
      var name = option.slice().reverse().join(', ')
      var type = cols[option.length - 1]

      if(!_.has(options, code)){

        options[code] = {
          'Code' : code,
          'Name' : name,
          'Type' : type
        }
      }
    })
  })

  return _.values(options)
}

Aggregates.brands = function(){

  var values = Aggregates.distinct('query')
  var options = _.map(values, function(x){
    return {
      'Code' : x,
      'Name' : x
    }
  })
  return options

}