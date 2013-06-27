var traceroute = require('traceroute');
//var geoip = require('geoip-lite');
var fs = require('fs');
var request = require('request');

function TraceGeoIP() {
}
TraceGeoIP.prototype = {

	saveData: function (result, filename, cb) {
		if (!filename) {
			cb();
			return;
		}
		fs.writeFile(filename, JSON.stringify(result, null, '\t'), 'utf8', function (err) {
			if (err) {
				console.log('Error:' + err);
			} else {
				console.log(filename + " saved!");
			}
			cb();
		});
	},

	geoip_proto: function (hop, result, cb) {
		request('http://geoip.prototypeapp.com/api/locate?ip=' + hop.ip, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var geoip = JSON.parse(body);
				if (geoip && (geoip.location.coords.longitude != "0")) {
					hop.geoip = geoip;
					result.hops.push(hop);
					result.waypoints.push([hop.geoip.location.coords.longitude, hop.geoip.location.coords.latitude]);
				}
			}
			cb();
		});
	},

	/*
	 geo_geoip: function (hop, result, cb) {
	 var geoip = geoip.lookup(hop.ip);
	 if (geoip) {
	 hop.geoip = geoip;
	 result.hops.push(hop);
	 result.waypoints.push([hop.geoip.ll[0], hop.geoip.ll[1]]);
	 }
	 cb();
	 },
	 */

	geoIt: function (index, hops, result, cb) {
		var caller = this;
		if (index >= hops.length) {
			cb();
		} else {
			console.log('lookup geoip ' + hops[index].ip);
			caller.geoip_proto(hops[index], result, function () {
				caller.geoIt(index + 1, hops, result, cb);
			});
		}
	},

	trace: function (url, filename, cb) {
		console.log('tracing ' + url);
		var caller = this;
		traceroute.trace(url, function (err, hops) {
			if (!err) {
				console.log(hops);
				var result = {url: url, waypoints: [], hops: []};
				var h = [];
				var last = "";
				hops.forEach(function (hop) {
					for (key in hop) {
						if ((last != key) && (key.match(/\./g))) {
							hop.ip = key;
							h.push(hop);
						}
						last = key;
					}
				});
				caller.geoIt(0, h, result, function () {
					caller.saveData(result, filename, function () {
						if (cb)
							cb(result);
					});
				});
			}
		});

	}
};

exports.TraceGeoIP = TraceGeoIP;