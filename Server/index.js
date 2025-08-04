const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const expressWs = require('express-ws')(app);
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const crypto = require('crypto');

app.use(bodyParser.json({type: 'application/json'}));
app.use(bodyParser.text({type: 'text/plain'}));
app.use(express.static('public'));

const port = 3000;

const clients = new Map();
app.ws('/connect', function(ws, req) {
	let deviceId = req.query.deviceid;
	clients.forEach(function(value, key, map) {
		if (value.deviceId == deviceId) {
			clients.delete(key);
		}
	});
	clients.set(ws, {deviceId: deviceId});
	ws.on('close', function() {
		clients.delete(ws);
	});
});

app.get('/testconnection', cors(), function(req, res) {
	res.sendStatus(200);
});

app.get('/getconecteddevices', cors(), function(req, res) {
	let connectedDeviceIds = [];
	clients.forEach(function(value, key, map) {
		connectedDeviceIds.push(value.deviceId);
	});
	res.send(connectedDeviceIds.toString());
});

app.get('/remotecontrol', cors(), function(req, res) {
	let deviceId = req.query.deviceid;
	let subjectId = req.query.subjectid;
	clients.forEach(function(value, key, map) {
		if (value.deviceId == deviceId) {
			key.send(subjectId);
		}
	});
	res.sendStatus(200);
});

app.get('/getdata', cors(), function(req, res) {
	let package = req.query.package;
	let file = __dirname + '/public/' + package + '/data/' + req.query.file;
	try {
		let data = '{}';
		if (fs.existsSync(file)) {
			data = fs.readFileSync(file);
		}
		res.send(data);
	}
	catch(err) {
		res.sendStatus(503);
	}
});

app.post('/setdata', cors(), function(req, res) {
	try {
		let file = __dirname + '/public/' + req.query.package + '/data/' + req.query.subject + '.json';
		if (!fs.existsSync(file)) {
			fs.writeFileSync(file, '{}');
		}
		let subjectData = JSON.parse(fs.readFileSync(file));
		let folder = req.query.folder;
		let newData = req.body;
		if (!subjectData.hasOwnProperty(folder)) {
			subjectData[folder] = {};
		}
		for (let key in newData) {
			subjectData[folder][key] = newData[key];
		}
		fs.writeFileSync(file, JSON.stringify(subjectData));
		res.sendStatus(200);
	}
	catch(err) {
		res.sendStatus(503);
	}
});

app.post('/appenddata', cors(), function(req, res) {
	try {
		let file = __dirname + '/public/' + req.query.package + '/data/' + req.query.subject + '.json';
		if (!fs.existsSync(file)) {
			fs.writeFileSync(file, '{}');
		}
		let subjectData = JSON.parse(fs.readFileSync(file));
		let folder = req.query.folder;
		let newData = req.body;
		if (!subjectData.hasOwnProperty(folder)) {
			subjectData[folder] = {};
		}
		for (let key in newData) {
			if (newData.hasOwnProperty(key)) {
				if (Array.isArray(subjectData[folder][key])) {
					subjectData[folder][key].push(newData[key]);
				}
				else {
					if (subjectData[folder].hasOwnProperty(key)) {
						subjectData[folder][key] = [subjectData[folder][key], newData[key]];
					}
					else {
						subjectData[folder][key] = [newData[key]];
					}
				}
			}
		}
		fs.writeFileSync(file, JSON.stringify(subjectData));
		res.sendStatus(200);
	}
	catch(err) {
		res.sendStatus(503);
	}
});

app.get('/log', cors(), function(req, res) {
	let package = req.query.package;
	let logdata = req.query.logdata;
	let file = __dirname + '/public/' + package + '/device.log';
	try {
		const dateTime = new Date().toLocaleString('en-UK', {
			timeZone: 'Europe/London'
		});
		fs.appendFileSync(file, dateTime + ' -> ' + logdata + '\n');
		res.sendStatus(200);
	}
	catch(err) {
		res.sendStatus(503);
	}
});

app.listen(port);