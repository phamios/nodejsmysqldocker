var Promise = require('promise');
exports = module.exports = GlobalGmap;
var Q = require('q');
var config = require('../config/config');
var request = require('request');
var NodeGeocoder = require('node-geocoder');
var MapsClient = require('@google/maps');
var GlobalFunction = require('./global_function');

var googleMapsClient = MapsClient.createClient({
    key: config.MAP_API_KEY,
});
var options = {
  provider: 'google',
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: config.MAP_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null,         // 'gpx', 'string', ...
  region: 'vn',
};

var geocoder = NodeGeocoder(options);

function GlobalGmap() {
    
}

/**
 * get JSON geocode by address
 * 
 */
GlobalGmap.getGeocode = function(address) {
    var def = Q.defer();
    address = GlobalFunction.searchString(address);
    googleMapsClient.places ({'query': address, language: 'vi', radius: 10000}, function(err, res) {
        if(err) {
            def.resolve(true)
        } else {
            def.resolve(res.json.results);
        }
    });

    return def.promise;
}

/**
 * get JSON geocode by address
 * 
 */
GlobalGmap.getAddress = function(geocode) {
    var def = Q.defer();
    geocoder.reverse({
        lat:geocode.lat,
        lon:geocode.lng
    }, function(err, res) {
        def.resolve(res);
    });
    return def.promise;
}

/**
 * return array distance between 2 point or null
 */
GlobalGmap.getDistance = function(origin, des) {
    var def = Q.defer();
    googleMapsClient.distanceMatrix({
            origins: origin,
            destinations: des,
            mode: 'walking',
            // transit_mode: ['bus', 'rail'],
            // transit_routing_preference: 'less_walking'
        }, function(err, res){
            if (err) {
                def.reject(null);
            } else if(res) {
                var row = JSON.parse(JSON.stringify(res));
                if(row.status == 200 && row.json.status == "OK") {
                    var rows = row.json.rows;
                    def.resolve(rows[0].elements);
                } else {
                    def.resolve(null);
                }
            }
        });
    return def.promise;
}