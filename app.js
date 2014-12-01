$(function () {
  'use strict';
  window.App = {};

  App.Things = Backbone.Collection.extend({
    model: Backbone.Model.extend({
      defaults: { 'name': '', 'cost': 0, },
      containedIn: function (list) { return _.contains(list, this.get('name')); }
    }),
    total: function () { return App.sum(this.pluck('cost')); },
  });

  App.People = Backbone.Collection.extend({
    model: Backbone.Model.extend({ defaults: { 'name': '', 'paid': 0, ownThings: [] } }),
  });
  
  App.ppl = new App.People([{}]);
  App.things = new App.Things([{}]);

  App.sum = function (list) { return _.reduce(list, function (memo, num) { return memo + num; }, 0); };
  App.title = function () { return App.things.pluck('name').join(', '); };
  App.dec = function (num) { return parseFloat(num.toFixed(2)) };
  App.ppp = function (thing) {
    var n = 0;
    App.ppl.each(function (p) { if (thing.containedIn(p.get('ownThings'))) { n++; } });
    return n ? App.dec(thing.get('cost') / n) : 0;
  };
  App.toPay = function (p) {
    var total = 0;
    App.things.each(function (thing) {
      if (thing.containedIn(p.get('ownThings'))) { total += App.ppp(thing); }
    });
    return total;
  };

  App.ThingRowView = Marionette.ItemView.extend({
    template: '#thing-tpl',
    tagName: 'tr',
    events: {'click .close': 'rm', 'change input': 'update'},
    rm: function () { return App.things.remove(this.model); },
    update: function () {
      this.model.set({ 'name': this.$('.name').val(), 'cost': parseFloat(this.$('.cost').val()) });
    }
  });

  App.PplRowView = Marionette.ItemView.extend({
    collection: App.ppl,
    things: App.things,
    template: '#ppl-tpl',
    tagName: 'tr',
    events: {'click .close': 'rm', 'change input': 'update'},
    rm: function () { return this.collection.remove(this.model); },
    update: function () {
      var ownThings = [];
      this.$('input[type="checkbox"]:checked').each(function () { ownThings.push(this.value); });
      this.model.set({
        'name': this.$('.name').val(),
        'paid': parseFloat(this.$('.paid').val()),
        'ownThings': ownThings
      });
    },
    serializeData: function () {
      var toPay = App.toPay(this.model);
      var bal = App.dec(this.model.get('paid') - toPay);
      return _.extend({things: this.things, toPay: toPay, balance: bal}, this.model.toJSON());
    },
  });

  App.ThingsView = Marionette.CompositeView.extend({
    collection: App.things,
    childView: App.ThingRowView,
    childViewContainer: 'tbody',
    el: '#thingstable',
    template: '#thingstable-tpl',
    events: {'click .btn-machi': 'add'},
    collectionEvents: {'change': 'setTotal', 'remove': 'render'},
    setTotal: function () { this.$('.total').text(this.collection.total()); },
    add: function () { this.collection.add({}); },
    onRender: function () { this.setTotal(); }
  });

  App.PeopleView = Marionette.CompositeView.extend({
    collection: App.ppl,
    childView: App.PplRowView,
    el: '#ppltable',
    childViewContainer: 'tbody',
    template: '#ppltable-tpl',
    events: {'click .btn-machi': 'add'},
    collectionEvents: {'remove change': 'render'},
    initialize: function () { this.listenTo(App.things, 'add change remove', this.render); },
    setTotal: function () { this.$('.total').text(this.collection.total()); },
    add: function () { this.collection.add({}); },
    serializeData: function () { return _.extend({ things: App.things }, this.collection.toJSON()); },
    templateHelpers: { 'ppp': App.ppp },
    onRender: function () { App.pplData = App.ppl.toJSON(); App.thingsData = App.things.toJSON(); }
  });

  App.TitleView = Backbone.View.extend({
    el: $('title'),
    initialize: function () { this.listenTo(App.peopleView, 'render', this.render); },
    render: function () { this.$el.text(App.title() + ' | +1'); }
  });

  App.ShareBtn = Backbone.View.extend({
    el: $('#share'),
    initialize: function () { this.listenTo(App.peopleView, 'render', this.render); },
    render: function () {
      var url = 'http://v.gd/create.php?format=simple&url=';// + App.base64();// + '&shorturl=' + App.title();
      this.$el.attr('href', url);
    }
  });

  App.thingsView = new App.ThingsView().render();
  App.peopleView = new App.PeopleView().render();
  new App.ShareBtn();
  new App.TitleView();
  $('.tt').tooltip();
});
