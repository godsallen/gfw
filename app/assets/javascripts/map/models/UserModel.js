define([
 'backbone', 'underscore'
], function(Backbone, _) {

  'use strict';

  var User = Backbone.Model.extend({
    urlRoot: window.gfw.config.GFW_API_HOST_V2 + '/user',

    setEmailIfEmpty: function(email) {
      if (_.isEmpty(this.get('email'))) {
        this.set('email', email);
      }
    },

    isLoggedIn: function() {
      return !_.isEmpty(this.attributes);
    },

    parse: function(response) {
      var attributes = response.data.attributes;
      attributes.id = response.data.id;

      return attributes;
    },

    sync: function(method, model, options) {
      options || (options = {});

      if (!options.crossDomain) {
        options.crossDomain = true;
      }

      if (!options.xhrFields) {
        options.xhrFields = {withCredentials:true};
      }

      return Backbone.sync.call(this, method, model, options);
    }
  });

  return User;

});
