var path = require('path');
var tracegeoip = require('./tracegeoip');
var request = require('request');

var url = process.argv[2];
if (!url)
	url = 'soup.io';
var filename = path.resolve(__dirname, './static/json') + '/' + url + '.json';

var trace = new tracegeoip.TraceGeoIP();
trace.trace(url, filename);
