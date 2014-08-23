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
  this.stops       = [];
  this.distance    = 0;
}

Object.defineProperty(Trip, 'collection', {
  get: function(){return global.mongodb.collection('trips');}
});

Object.defineProperty(Trip.prototype, 'events', {
  get: function(){
    return this.stops.reduce(function(sum, stop){return stop.events.length + sum;} , 0);
  }
});

Object.defineProperty(Trip.prototype, 'photos', {
  get: function(){
    return this.stops.reduce(function(sum, stop){return stop.photos.length + sum;} , 0);
  }
});

Object.defineProperty(Trip.prototype, 'gallons', {
  get: function(){
    return this.distance / this.mpg;
  }
});

Object.defineProperty(Trip.prototype, 'cost', {
  get: function(){
    return this.gallons * this.gas;
  }
});

Object.defineProperty(Trip.prototype, 'delta', {
  get: function(){
    return this.cash - this.cost;
  }
});

Trip.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Trip.collection.findOne({_id:_id}, function(err, obj){
    cb(err, _.create(Trip.prototype, obj));
  });
};

Trip.all = function(cb){
  Trip.collection.find().toArray(function(err, objs){
    cb(err, objs.map(function(o){return _.create(Trip.prototype, o);}));
  });
};

Trip.create = function(fields, files, cb){
  var t = new Trip(fields);
  t.carphotos = moveFiles(files.carphotos, 0, '/img/' + t._id);
  Trip.collection.save(t, cb);
};

Trip.prototype.save = function(cb){
  Trip.collection.save(this, cb);
};

Trip.prototype.addStop = function(places){
  places = places.map(function(place){
    return {name:place.name, lat:place.lat*1, lng:place.lng*1, events:[], photos:[]};
  });

  this.stops = this.stops.concat(places);
};

Trip.prototype.addEvent = function(index, name){
  this.stops[index].events.push(name);
};

Trip.prototype.addPhoto = function(index, files){
  var oldphotos = this.stops[index].photos,
      newphotos = moveFiles(files.photos, oldphotos.length, '/img/' + this._id + '/' + index);

  this.stops[index].photos = oldphotos.concat(newphotos);
};

module.exports = Trip;

// PRIVATE FUNCTIONS ///

function moveFiles(photos, count, relDir){
  var baseDir = __dirname + '/../static',
      absDir  = baseDir + relDir;

  if(!fs.existsSync(absDir)){fs.mkdirSync(absDir);}

  var tmpPhotos = photos.map(function(photo, index){
    if(!photo.size){return;}

    var ext      = path.extname(photo.path),
        name     = count + index + ext,
        absPath  = absDir + '/' + name,
        relPath  = relDir + '/' + name;

    fs.renameSync(photo.path, absPath);
    return relPath;
  });

  return _.compact(tmpPhotos);
}

