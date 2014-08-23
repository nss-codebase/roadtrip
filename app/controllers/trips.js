'use strict';

var Trip   = require('../models/trip'),
    moment = require('moment'),
    mp     = require('multiparty');

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
    res.render('trips/index', {moment:moment, trips:trips});
  });
};

exports.show = function(req, res){
  Trip.findById(req.params.id, function(err, trip){
    res.render('trips/show', {trip:trip});
  });
};

exports.addStop = function(req, res){
  Trip.findById(req.params.id, function(err, trip){
    trip.addStop(req.body.places);
    trip.save(function(){
      res.redirect('/trips/' + req.params.id);
    });
  });
};

exports.distance = function(req, res){
  Trip.findById(req.params.id, function(err, trip){
    trip.distance = req.body.distance * 1;
    trip.save(function(){
      res.send({ok:true});
    });
  });
};

exports.showStop = function(req, res){
  Trip.findById(req.params.id, function(err, trip){
    res.render('trips/stop', {trip:trip, stop:trip.stops[req.params.index], index:req.params.index});
  });
};

exports.addEvent = function(req, res){
  Trip.findById(req.params.id, function(err, trip){
    trip.addEvent(req.params.index, req.body.name);
    trip.save(function(){
      res.render('trips/events', {events:trip.stops[req.params.index].events});
    });
  });
};

exports.addPhoto = function(req, res){
  Trip.findById(req.params.id, function(err, trip){
    var form = new mp.Form();
    form.parse(req, function(err, fields, files){
      trip.addPhoto(req.params.index, files);
      trip.save(function(){
        res.redirect('/trips/' + req.params.id + '/stops/' + req.params.index);
      });
    });
  });
};

