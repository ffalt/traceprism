var express = require('express')
	, http = require('http')
	, path = require('path')
	, tracegeoip = require('./tracegeoip');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use('/static', express.static(__dirname + '/static'));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/trace', function (req, res) {
	var url = 'instagram.com';
	console.log('trace ' + url);
	traceroute.trace(url, function (err, hops) {
		if (!err) {
			var waypoints = [];
			hops.forEach(function (hop) {
				for (key in hop) {
					console.log('lookup geoip ' + key);
					hop.geoip = geoip.lookup(key);
					if (hop.geoip) {
						waypoints.push([hop.geoip.ll[0], hop.geoip.ll[1]]);
					}
				}
			});
			//console.log(hops);
			var result = {};
			result.attributes = {
				"route_type": 3,
				"id": "12500883",
				"head_sign": url
			};
			result.waypoints = waypoints;
			res.json(result);
		}
	});
});

app.get('/', function (req, res) {
	res.render('index', { title: 'Express' });
});

app.get('/tracegeoip/:cmd', function (req, res) {
	var trace = new tracegeoip.TraceGeoIP();
	var filename = path.resolve(__dirname, './static/json') + '/' + req.params.cmd + '.json';
	trace.trace(req.params.cmd, filename, function (result) {
		res.json(result);
	});
});

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
