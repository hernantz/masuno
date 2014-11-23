window.App = {}; 
window.sum = function (list) { return _.reduce(list, function (memo, num) { return memo + num; }, 0); };

App.thingstableTpl = _.template([
  '<h3>Things</h3>',
  '<table class="table">',
  '  <thead>',
  '    <tr>',
  '      <th>Item</th>',
  '      <th>$</th>',
  '      <th></th>',
  '    </tr>',
  '  </thead>',
  '  <tbody>',
  '  </tbody>',
  '  <tfoot>',
  '    <tr>',
  '      <td><strong>Total</strong></td>',
  '      <td class="total">0</td>',
  '      <td></td>',
  '    </tr>',
  '  </tfoot>',
  '</table>',
  '<button class="btn btn-default btn-machi btn-sm pull-right"><span class="glyphicon glyphicon-plus"></span> Moar!</button>'
].join());

App.ppltableTpl = _.template([
  '<h3>People</h3>',
  '<table class="table">',
  '  <thead>',
  '    <tr>',
  '      <th>Nickname</th>',
  '      <% things.each(function (thing) { %> <th><%= thing.get(\'name\') %></th> <% }) %>',
  '      <th>To Pay</th>',
  '      <th>Paid</th>',
  '      <th>Balance</th>',
  '      <th></th>',
  '    </tr>',
  '  </thead>',
  '  <tbody> </tbody>',
  '  <tfoot>',
  '    <tr>',
  '      <td><strong class="tt" data-toggle="tooltip" data-placement="bottom" title="Pesos Por Pera">ppp</strong></td>',
  '      <% things.each(function (thing) { %> <td><%= ppp(thing) %></td> <% }) %>',
  '      <td></td>',
  '      <td></td>',
  '      <td></td>',
  '      <td></td>',
  '    </tr>',
  '  </tfoot>',
  '</table>',
  '<button class="btn btn-default btn-machi btn-sm pull-right"><span class="glyphicon glyphicon-plus"></span> 1</button>'
].join());

App.pplTmpl = _.template([
  '<td><input placeholder="Name" class="name" value="<%= name %>" /></td>',
  '<% things.each(function (thing) { %>',
  '<td><input type="checkbox" value="<%= thing.get(\'name\') %>" <% if (thing.containedIn(ownThings)) { %> checked <% } %> /></td>',
  '<% }) %>',
  '<td><%= toPay %></td>',
  '<td><input type="number" class="paid" value="<%= paid %>"></td>',
  '<td><%= balance %></td>',
  '<td><button type="button" class="close" aria-hidden="true">&times;</button></td>'
].join());

App.thingTpl = _.template([
  '<td><input placeholder="Something" class="name" value="<%= name %>" /></td>',
  '<td><input type="number" class="cost" value="<%= cost %>" /></td>',
  '<td><button type="button" class="close" aria-hidden="true">&times;</button></td>'
].join());

$(function () {
  var $pplData = $('#ppl-data'), $thingsData = $('#things-data'), $version = $('#version');

  App.Things = Backbone.Collection.extend({
    model: Backbone.Model.extend({
      defaults: { 'name': '', 'cost': 0, },
      containedIn: function (list) { return _.contains(list, this.get('name')); }
    }),
    total: function () { return sum(this.pluck('cost')); },
  });

  App.People = Backbone.Collection.extend({
    model: Backbone.Model.extend({ defaults: { 'name': '', 'paid': 0, ownThings: [] } }),
  });

  App.ppl = new App.People(JSON.parse($pplData.val()));
  App.things = new App.Things(JSON.parse($thingsData.val()));

  App.toJSON = function ($storage, data) { $storage.val(JSON.stringify(data.toJSON())); }
  App.title = function () { };
  App.dec = function (num) { return parseFloat(num.toFixed(2)) }
  App.base64 =  function() { return 'data:text/html;base64,'+ window.btoa(document.documentElement.innerHTML) };
  App.ppp = function (thing) {
    var n = 0;
    App.ppl.each(function (p) { if (thing.containedIn(p.get('ownThings'))) { n++; } });
    return n ? App.dec(thing.get('cost') / n) : 0;
  };
  
  App.toPay = function (p) {
    var total = 0;
    App.things.each(function (thing) { if (thing.containedIn(p.get('ownThings'))) { total += App.ppp(thing); } });
    return total;
  };

  App.ThingRowView = Backbone.Marionette.ItemView.extend({
    collection: App.things,
    template: App.thingTpl,
    tagName: 'tr',
    events: {'click .close': 'rm', 'change input': 'update'},
    rm: function () { return this.collection.remove(this.model); },
    update: function () { this.model.set({'name': this.$('.name').val(), 'cost': parseFloat(this.$('.cost').val())}); }
  });

  App.PplRowView = Backbone.Marionette.ItemView.extend({
    collection: App.ppl,
    things: App.things,
    template: App.pplTmpl,
    tagName: 'tr',
    events: {'click .close': 'rm', 'change input': 'update'},
    rm: function () { return this.collection.remove(this.model); },
    update: function () {
      var ownThings = [];
      this.$('input[type="checkbox"]:checked').each(function () { ownThings.push(this.value); });
      this.model.set({'name': this.$('.name').val(), 'paid': parseFloat(this.$('.paid').val()), 'ownThings': ownThings});
    },
    serializeData: function () {
      var toPay = App.toPay(this.model);
      var bal = App.dec(this.model.get('paid') - toPay);
      return _.extend({things: this.things, toPay: toPay, balance: bal}, this.model.toJSON());
    },
  });

  App.ThingsView = Backbone.Marionette.CompositeView.extend({
    collection: App.things,
    childView: App.ThingRowView,
    childViewContainer: 'tbody',
    el: '#thingstable',
    template: App.thingstableTpl,
    events: {'click .btn-machi': 'add'},
    collectionEvents: {'change': 'setTotal', 'remove': 'render'},
    setTotal: function () { this.$('.total').text(this.collection.total()); },
    add: function () { this.collection.add({}); },
    onRender: function () { this.setTotal(); }
  });

  App.PeopleView = Backbone.Marionette.CompositeView.extend({
    collection: App.ppl,
    childView: App.PplRowView,
    el: '#ppltable',
    childViewContainer: 'tbody',
    template: App.ppltableTpl,
    events: {'click .btn-machi': 'add'},
    collectionEvents: {'remove change': 'render'},
    initialize: function () { this.listenTo(App.things, 'add change remove', this.render); },
    setTotal: function () { this.$('.total').text(this.collection.total()); },
    add: function () { this.collection.add({}); },
    serializeData: function () { return _.extend({ things: App.things }, this.collection.toJSON()); },
    templateHelpers: { 'ppp': App.ppp },
    onRender: function () { App.toJSON($pplData, App.ppl); App.toJSON($thingsData, App.things); }
  });

  App.ShareBtn = Backbone.View.extend({
    el: $('#share'),
    initialize: function () {
      this.listenTo(App.things, 'add change remove', this.render);
      this.listenTo(App.ppl, 'add change remove', this.render); 
    },
    render: function () {
      var url = 'http://v.gd/create.php?format=simple&url=' + App.base64();// + '&shorturl=' + App.title();
      this.$el.attr('href', url);
    }
  });

  //new README
  //release 2.0
  $('#save').on('click', function () { window.location = App.base64(); });

  App.thingsView = new App.ThingsView().render();
  //App.peopleView = new App.PeopleView().render();
  //App.shareBtn = new App.ShareBtn().render();
  $('.tt').tooltip();
});
