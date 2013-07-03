var express = require('express')
	, http = require('http')
	, path = require('path')
	, fs = require('fs')
	, url = require('url')
	, tracegeoip = require('./tracegeoip');

var app = express();

// all environments
app.set('port', process.env.PORT || 20016);
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

app.get('/', function (req, res) {
	res.render('index', { title: 'Traceprism' });
});

var datapath = path.resolve(__dirname, './data');

app.get('/tracegeoip/:cmd', function (req, res) {
	var u = url.parse(req.params.cmd);
	var scan;
	if (u.host) {
		scan = u.host;
	} else if (u.path) {
		scan = u.path.split('/')[0];
	}
	if (scan) {
		var trace = new tracegeoip.TraceGeoIP(datapath);
		trace.trace(scan, function (result) {
			res.json(result);
			trace.storeResult(scan, result);
		});
	} else {
		res.send(412);
	}
});

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
