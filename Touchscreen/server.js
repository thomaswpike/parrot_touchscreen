const exec = require('child_process').exec;
const express = require('express');
const http = require('http');
const fs = require('fs');
const interfaces = require('os').networkInterfaces();
const gpio = require('onoff').Gpio;

const pir = new gpio(27, 'in');
let movement = [];
setInterval(function() {
	movement.push(pir.readSync());
	if (movement.length > 10) {
		movement.shift();
	}
}, 1000);

const config = JSON.parse(fs.readFileSync('/home/pi/Touchscreen/config.json'));

const app = express();

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	next();
});

/**
 * Gets the output of the PIR.
 */
app.get('/getmovement/', function (req, res) {
	let score = 0;
	for (let i = 0; i < movement.length; i++) {
		score += movement[i];
	}
	score = Math.round((score / movement.length) * 100);
	res.send(score.toString());
});

/**
 * Gets the IP address of this device.
 */
app.get('/getip/', function (req, res) {
	var addresses = [];
	for (let k in interfaces) {
		for (let k2 in interfaces[k]) {
			let address = interfaces[k][k2];
			if (address.family === 'IPv4' && address.address !== '127.0.0.1' && !address.internal) {
				addresses.push(address.address);
			}
		}
	}
	res.send(addresses.toString().replace(',', ', '));
});

/**
 * Gets the ID of this device.
 */
app.get('/getdeviceid/', function (req, res) {
	res.send(config.deviceId);
});

/**
 * Sets the ID of this device.
 */
app.get('/setdeviceid/', function (req, res) {
	config.deviceId = req.query.id;
	fs.writeFileSync('/home/pi/Touchscreen/config.json', JSON.stringify(config));
	res.sendStatus(200);
});

/**
 * Gets the current Treat and Train channel.
 */
app.get('/gettreatandtrainchannel/', function (req, res) {
	res.send(config.treatAndTrainChannel.toString());
});

/**
 * Sets the current Treat and Train channel.
 */
app.get('/settreatandtrainchannel/', function (req, res) {
	config.treatAndTrainChannel = parseInt(req.query.channel);
	fs.writeFileSync('/home/pi/Touchscreen/config.json', JSON.stringify(config));
	res.sendStatus(200);
});

/**
 * Gets the remote server base URL.
 */
app.get('/getremoteserverbaseurl/', function (req, res) {
	res.send(config.remoteServerBaseUrl);
});

/**
 * Sets the remote server base URL.
 */
app.get('/setremoteserverbaseurl/', function (req, res) {
	config.remoteServerBaseUrl = req.query.url;
	fs.writeFileSync('/home/pi/Touchscreen/config.json', JSON.stringify(config));
	res.sendStatus(200);
});

/**
 * Gets the package name.
 */
app.get('/getpackage/', function (req, res) {
	res.send(config.package);
});

/**
 * Sets the package name.
 */
app.get('/setpackage/', function (req, res) {
	config.package = req.query.name;
	fs.writeFileSync('/home/pi/Touchscreen/config.json', JSON.stringify(config));
	res.sendStatus(200);
});

/**
 * Refreshes the browser.
 */
app.get('/refresh/', function (req, res) {
	exec('DISPLAY=:0.0 xdotool key "shift+F5"');
	res.sendStatus(200);
});

/**
 * Activates the Treat and Train to deliver a reward.
 */
app.get('/reward/', function (req, res) {
	exec('python /home/pi/Touchscreen/dispense.py ch' + config.treatAndTrainChannel);
	res.sendStatus(200);
});

/**
 * Stops the kiosk service.
 */
app.get('/stop/', function (req, res) {
	exec('sudo systemctl stop kiosk.service');
	res.sendStatus(200);
});

/**
 * Restarts the kiosk service.
 */
app.get('/restart/', function (req, res) {
	exec('sudo systemctl restart kiosk.service');
	res.sendStatus(200);
});

/**
 * Reboots the pi.
 */
app.get('/reboot/', function (req, res) {
	exec('sudo reboot now');
	res.sendStatus(200);
});

/**
 * Shuts down the pi.
 */
app.get('/shutdown/', function (req, res) {
	exec('sudo shutdown now');
	res.sendStatus(200);
});

app.listen(3000, function() {
	//
});
