/*****************************************************************************/
/* AggregateStats: Event Handlers and Helpers */
/*****************************************************************************/
var _state = new ReactiveDict();
_state.setDefault('start_date', new Date('2014-05-17'))
_state.setDefault('end_date', new Date('2014-05-20'))
_state.setDefault('location', 'WW')
_state.setDefault('brand', 'pepsi')

Template.AggregateStats.events({
  /*
   * Example: 
   *  'click .selector': function (e, tmpl) {
   *
   *  }
   */
});

Template.AggregateStats.helpers({
  /*
   * Example: 
   *  items: function () {
   *    return Items.find();
   *  }
   */
});

/*****************************************************************************/
/* AggregateStats: Lifecycle Hooks */
/*****************************************************************************/
Template.AggregateStats.created = function () {

  Deps.autorun(function(){
    var location = _state.get('location')
    var brand = _state.get('brand')
    Meteor.subscribe('aggregates', brand, location)
  })


  var self = this
  nv.addGraph(function() {
    var chart = nv.models.lineChart()
      .useInteractiveGuideline(true)
      // .interpolate('monotone')
      .color(d3.scale.category10().range())
      .size(0)
      .showLegend(false)

    chart.xAxis
      .tickFormat(function(d) {
        d = new moment(d);
        return d.format("YYYY-MMM-D")
      });

    chart.yAxis
      .tickFormat(d3.format(',.0f'))
      .axisLabelDistance(50);
    

    self.chart = chart

    nv.utils.windowResize(self.chart.update);

  });

};

Template.AggregateStats.rendered = function () {

  var self = this
  var min_date = new Date('2014-01-01')
  var max_date = new Date()

  $("#slider").dateRangeSlider({
      bounds: {min: min_date, max: max_date},
      defaultValues : {min : new Date('2014-05-17'), max: new Date('2014-05-20')},
      scales: [{
        first: function(value){ return value; },
        end: function(value) {return value; },
        next: function(value){
          var next = new Date(value);
          return new Date(next.setMonth(value.getMonth() + 1));
        },
        label: function(value){
          return ''
        },
        format: function(tickContainer, tickStart, tickEnd){
        },
      }],
      formatter : function(val){
          return moment(val).format("YYYY-MMM-D");
      },
      arrows : false
    });

  $("#slider").on("userValuesChanged", function(e, data){
      _state.set('start_date', data.values.min)
      _state.set('end_date', data.values.max)

  });



  $('#location').selectize({
    valueField: 'Code',
    labelField: 'Name',
    searchField: 'Name',
    sortField: 'Name',

    optgroupField : 'Type',
    optgroupValueField : 'value',
    optgroupLabelField : 'label',
    optgroupOrder : ['World', 'Country', 'Region',
                      'Division', 'State', 'City'],

    onItemAdd : function(value){
      _state.set('location', value)
    },
    onInitialize : function(){
      var self = this
      Meteor.call('/metadata/locations', function (error, result) {
        self.addOption(result)

        var types = _.unique(_.pluck(result, 'Type'))
        _.each(types, function(type){
          self.addOptionGroup(type, {'value' : type, 'label' : type})
        })

      });

    }
  })


  $('#brand').selectize({
    valueField: 'Code',
    labelField: 'Name',
    searchField: 'Name',
    sortField: 'Name',

    onItemAdd : function(value){
      _state.set('brand', value)
    },
    onInitialize : function(){
      var self = this
      Meteor.call('/metadata/brands', function (error, result) {
        self.addOption(result)
      });

    }

  })



  Deps.autorun(function(){

    var start_date = _state.get('start_date')
    var end_date = _state.get('end_date')

    var data = {
      Neutral : {
        key : 'Neutral',
        values : [],
        color : 'yellow'
      },

      Positive : {
        key : 'Positive',
        values : [],
        color : 'green'      
      },

      Negative : {
        key : 'Negative',
        values : [],
        color : 'red'
      },

      Unknown : {

        key : 'Unknown',
        values : [],
        color : 'grey'

      }
    }

    var recs = Aggregates.find({}, {sort : {hour : 1}})
    recs.forEach(function(rec){
      var hour = new Date(rec['hour'] * 1000)
      if(hour >= start_date && hour < end_date){

        _.each(_.keys(data), function(key){
          data[key]['values'].push({
            x : hour,
            y : rec[key]
          })
        })

      }
      else{

      }


    })

    data = _.values(data)

    if(_.isEmpty(data)){
      return
    }

    var chart_id = 'aggregate_chart'

    if(_.isEmpty($('#' + chart_id))){
      return
    }

    Meteor.defer(function(){    
      d3.select('#' + chart_id  + ' svg')
        .datum(data)
        .transition()
        .duration(500)
        .call(self.chart);
    })

  })


  Deps.autorun(function(){

    var brand = _state.get('brand')
    var location = _state.get('location')
    var start_date = _state.get('start_date')
    var end_date = _state.get('end_date')
    Meteor.call('/app/wordcloud', brand, location, start_date, end_date,
      function(err, words){

        var fsize = d3.scale['linear']().range([10, 100])
        fsize.domain([0, words[0]['size']])

        $('#wordcloud svg g').remove()

        var id = 'wordcloud'
        var fill = d3.scale.category10();

        d3.layout.cloud().size([960, 600])
                .spiral('archimedean')
                .words(words)
                .padding(5)
                .rotate(function() { return 0; })
                .fontSize(function(d) { return fsize( d.size); })
                .on("end", draw)
                .start();

        function draw(words) {
            d3.select("#" + id + " svg")
                    .attr("width", 960)
                    .attr("height", 600)
                .append("g")
                    .attr("transform", "translate(475,300)")
                .selectAll("text")
                    .data(words)
                .enter().append("text")
                    .style("font-size", function(d) { return d.size + "px"; })
                    .style("fill", function(d, i) { return fill(i); })
                    .attr("text-anchor", "middle")
                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function(d) { return d.text; });
        }


      })

  })





}

Template.AggregateStats.destroyed = function () {
};
