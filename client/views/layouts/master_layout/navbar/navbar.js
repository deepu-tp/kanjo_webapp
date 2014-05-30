/*****************************************************************************/
/* Navbar: Event Handlers and Helpers */
/*****************************************************************************/
Template.Navbar.events({
  'click #gsl_logout_btn' : function(){
    Meteor.logout()
  }
});

Template.Navbar.helpers({
  /*
   * Example: 
   *  items: function () {
   *    return Items.find();
   *  }
   */
});

/*****************************************************************************/
/* Navbar: Lifecycle Hooks */
/*****************************************************************************/
Template.Navbar.created = function () {
};

Template.Navbar.rendered = function () {
};

Template.Navbar.destroyed = function () {
};
