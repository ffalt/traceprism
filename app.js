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

app.get('/', function (req, res) {
	res.render('index', { title: 'Traceprism' });
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
