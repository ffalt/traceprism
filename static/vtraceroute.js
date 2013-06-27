$('#adress').submit(function () {
	$('#btn').attr("disabled", "disabled");
	$('#input').attr("disabled", "disabled");
	$('#spinner').removeAttr("hidden");
	$.ajax({
		url: '/tracegeoip/' + $('#input').val(),
		dataType: 'json',
		timeout: 9999999999,
		success: function (data) {
			if (data)
				startPath(data);
			$('#spinner').attr("hidden", "hidden");
			$('#btn').removeAttr("disabled");
			$('#input').removeAttr("disabled");
		},
		error: function (xhr, ts, err) {
			$('#spinner').attr("hidden", "hidden");
			$('#btn').removeAttr("disabled");
			$('#input').removeAttr("disabled");
			alert(xhr.status + ': ' + err);
		}
	});
	return false;
});

var DEFAULT_POINT = new L.LatLng(52.50085, 13.42232);

var map = new L.Map("map", {
	center: DEFAULT_POINT,
	zoom: 4

}).addLayer(
		new L.TileLayer("http://{s}.tile.cloudmade.com/1a1b06b230af4efdbb989ea99e9841af/998/256/{z}/{x}/{y}.png",
			{attribution: '© 2012 CloudMade, OpenStreetMap contributors, CC-BY-SA'}
		));


var layers = [];
var alldata;

var jdata = ['dropbox.com', 'google.com', 'google.com', 'instagram.com', 'reddit.com', 'skype.com', 'soup.io', 'twitter.com', 'bild.de'];
jdata.forEach(function (d) {
	$('#urls').append('<a href="#" onclick="load(' + "'" + d + "'" + ')">' + d + '</a> ');
});

function load(url) {
	loadData("static/json/" + url + ".json");
}
function loadData(url) {
	$.ajax({
		url: url,
		dataType: 'json',
		success: function (data) {
			startPath(data);
		},
		error: function (xhr, ts, err) {
			alert(xhr.status + ': ' + err);
		}
	});
}

function addPathPart(src, dest, cb) {
	var b = new R.BezierAnim([src, dest], {}, function () {
		if (cb)
			cb();
	});
	layers.push(b);
	map.addLayer(b);
}

function addMarker(latlng) {
	var m = new R.Marker(latlng);
	layers.push(m);
	map.addLayer(m);
}

function addPulse(latlng) {
	var p = new R.Pulse(
		latlng,
		3,
		{'stroke': '#2478ad', 'fill': '#30a3ec'},
		{'stroke': '#30a3ec', 'stroke-width': 2});
	layers.push(p);
	map.addLayer(p);
	return p;
}

function getHopsText(hop) {
	return '<small>' + hop.ip + ' ' +
		hop.geoip.location.address.city + ', ' +
		hop.geoip.location.address.country +
		'</small>' + '<br/>';
}

function startPath(pathdata) {
	$('#ips').empty();
	alldata = pathdata;
	layers.forEach(function (l) {
		map.removeLayer(l);
	});
	layers = [];
	var path = [];
	pathdata.waypoints.forEach(function (p) {
		path.push(new L.LatLng(p[1], p[0]));
	});
	$('#ips').append(getHopsText(alldata.hops[0]));
	map.panTo(path[0]);
	addPulse(path[0]);
	setTimeout(function () {
		stepPath(path, 1);
	}, 500);
}

function stepPath(path, index) {
	if (index >= path.length) {
		console.log('over');
		return;
	}
	addPathPart(path[index - 1], path[index], function () {
		$('#ips').append(getHopsText(alldata.hops[index]));
		addPulse(path[index]);
		map.panTo(path[index]);
		setTimeout(function () {
			stepPath(path, index + 1);
		}, 500);
	});
}