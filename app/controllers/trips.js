'use strict';

var Trip = require('../models/trip'),
    mp   = require('multiparty');

exports.new = function(req, res){
  res.render('trips/new');
};

exports.create = function(req, res){
  var form = new mp.Form();
  form.parse(req, function(err, fields, files){
    Trip.create(fields, files, function(){
      res.redirect('/trips');
    });
  });
};

exports.index = function(req, res){
  Trip.all(function(err, trips){
    res.render('trips/index', {trips:trips});
  });
};


exports.show = function(req, res){
  Trip.findById(req.params.id, function(err, trip){
    res.render('trips/show', {trip:trip});
  });
};

