var app = angular.module('MasUnoApp', []);

app.directive('tooltip', function() {
  return function(scope, element, attrs) {
    $(element).tooltip();
  }
});

app.filter('escape', function() {
  return window.escape;
});

app.controller('Almuerzo', ['$scope', '$location', function ($scope, $location) {
  'use strict';

  $scope.mostrarCompartir = function () {
    return $location.search().data !== undefined;
  };

  $scope.comidas = [
    {"name": "Sandwich de Bondiola", "cost": 113.25},
    {"name": "Gaseosa", "cost": 25}
  ];

  $scope.costoTotal = function () {
    var total = 0;
    for (var i = 0; i < $scope.comidas.length; i++) {
      total += $scope.comidas[i].cost;
    }
    return total;
  };

  $scope.masComida = function () {
    $scope.comidas.push({
      "name": "",
      "cost": 0,
    });
  };

  $scope.menosComida = function (index) {
    $scope.comidas.splice(index, 1);
  };

  $scope.comensales = [
    {"name": "e_chango", "paid": 100, "comidas": {}},
    {"name": "j2gatti", "paid": 50, "comidas": {}},
    {"name": "pdelboca", "paid": 0, "comidas": {}},
  ];

  $scope.precioPorPera = function(index) {
    var comida = $scope.comidas[index];
    var nComensales = 0;
    for (var i = 0; i < $scope.comensales.length; i++ ) {
      if ($scope.comensales[i].comidas[comida.name]) {
        nComensales++;
      }
    }
    return comida.cost / nComensales;
  };

  $scope.aPagar = function(index) {
    var comensal = $scope.comensales[index];
    var total = 0;
    for (var i = 0; i < $scope.comidas.length; i++ ) {
      if (comensal.comidas[$scope.comidas[i].name]) {
        total += $scope.precioPorPera(i);
      }
    }
    return total;
  };

  $scope.masComensales = function () {
    $scope.comensales.push({
      "name": "",
      "paid": 0,
      "comidas": {}
    });
  };

  $scope.menosComensales = function (index) {
    $scope.comensales.splice(index, 1);
  };

  $scope.initTooltips = function () {
    $('*[data-toggle="tooltip"]').tooltip();
  };

  $scope.init = function () {
    var parsed = null;
    if ($location.search().data) {
      parsed = JSON.parse($location.search().data);
      $scope.comidas = parsed.comidas;
      $scope.comensales = parsed.comensales;
    }
  };

  $scope.guardar = function () {
    var json = angular.toJson({
      comensales: $scope.comensales,
      comidas: $scope.comidas
    });
    $location.search({data: json});
  };

  $scope.compartirUrl = function () {
    return $location.absUrl();
  };

}]);
