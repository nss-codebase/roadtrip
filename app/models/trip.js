'use strict';

var Mongo = require('mongodb'),
    fs    = require('fs'),
    path  = require('path'),
    _     = require('lodash');

function Trip(files){
  this._id         = Mongo.ObjectID();
  this.name        = files.name[0];
  this.cash        = files.cash[0] * 1;
  this.mpg         = files.mpg[0]  * 1;
  this.gas         = files.gas[0]  * 1;
  this.dates       = {departure:new Date(files.departure[0]), arrival:new Date(files.arrival[0])};
  this.origin      = {name:files.originname[0], lat:files.originlat[0]*1, lng:files.originlng[0]*1};
  this.destination = {name:files.destinationname[0], lat:files.destinationlat[0]*1, lng:files.destinationlng[0]*1};
}

Object.defineProperty(Trip, 'collection', {
  get: function(){return global.mongodb.collection('trips');}
});

Trip.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Trip.collection.findOne({_id:_id}, cb);
};

Trip.all = function(cb){
  Trip.collection.find().toArray(cb);
};

Trip.create = function(fields, files, cb){
  var t = new Trip(fields);
  t.moveFiles(files);
  Trip.collection.save(t, cb);
};

Trip.prototype.moveFiles = function(files){
  var baseDir = __dirname + '/../static',
      relDir  = '/img/' + this._id,
      absDir  = baseDir + relDir;

  fs.mkdirSync(absDir);

  this.carphotos = files.carphotos.map(function(photo, index){
    if(!photo.size){return;}

    var ext      = path.extname(photo.path),
        name     = index + ext,
        absPath  = absDir + '/' + name,
        relPath  = relDir + '/' + name;

    fs.renameSync(photo.path, absPath);
    return relPath;
  });

  this.carphotos = _.compact(this.carphotos);
};

module.exports = Trip;

