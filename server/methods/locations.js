/*****************************************************************************/
/* Locations Methods */
/*****************************************************************************/

Meteor.methods({
  '/metadata/locations': function () {
    return Aggregates.locations()
  }
});
