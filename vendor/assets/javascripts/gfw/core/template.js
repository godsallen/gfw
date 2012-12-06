/**
 * template system
 * usage:
   var tmpl = new gfw.core.Template({
     template: "hi, my name is {{ name }}",
     type: 'mustache' // undescore by default
   });
   console.log(tmpl.render({name: 'rambo'})));
   // prints "hi, my name is rambo"


   you could pass the compiled tempalte directly:

   var tmpl = new gfw.core.Template({
     compiled: function() { return 'my compiled template'; }
   });
 */

gfw.core.Template = Backbone.Model.extend({

  initialize: function() {
    this.bind('change', this._invalidate);
    this._invalidate();
  },

  url: function() {
    return this.get('template_url');
  },

  parse: function(data) {
    return {
      'template': data
    };
  },

  _invalidate: function() {
    this.compiled = null;
    if(this.get('template_url')) {
      this.fetch();
    }
  },

  compile: function() {
    var tmpl_type = this.get('type') || 'underscore';
    var fn = gfw.core.Template.compilers[tmpl_type];
    if(fn) {
      return fn(this.get('template'));
    } else {
      gfw.log.error("can't get rendered for " + tmpl_type);
    }
    return null;
  },

  /**
  * renders the template with specified vars
  */
  render: function(vars) {
    var c = this.compiled = this.compiled || this.get('compiled') || this.compile();
    var r = gfw.core.Profiler.get('template_render');
    r.start();
    var rendered = c(vars);
    r.end();
    return rendered;
  },

  asFunction: function() {
    return _.bind(this.render, this);
  }

}, {
  compilers: {
    'underscore': _.template,
    'mustache': typeof(Mustache) === 'undefined' ? null: Mustache.compile
  },
  compile: function(tmpl, type) {
    var t = new gfw.core.Template({
      template: tmpl,
      type: type || 'underscore'
    });
    return _.bind(t.render, t);
  }
}
);

gfw.core.TemplateList = Backbone.Collection.extend({

  model: gfw.core.Template,

  getTemplate: function(template_name) {
    if(this.namespace) {
      template_name = this.namespace + template_name;
    }
    var t = this.find(function(t) {
      return t.get('name') === template_name;
    });
    if(t) {
      return _.bind(t.render, t);
    }
    gfw.log.error(template_name+" not found");
    return null;
  }
});

/**
* global variable
*/
gfw.templates = new gfw.core.TemplateList();

/**
* load JST templates.
* rails creates a JST variable with all the templates.
* This functions loads them as default into cbd.template
*/
gfw._loadJST = function() {
  if(typeof(window.JST) !== undefined) {
    gfw.templates.reset(
      _(JST).map(function(tmpl, name) {
        return { name: name, compiled: tmpl };
      })
    );
  }
};

