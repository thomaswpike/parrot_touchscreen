const SerialPort = require('serialport');
const ByteLength = require('@serialport/parser-byte-length');
const http = require('http');
const fs = require('fs');

const config = require('./config.json');

SerialPort.list().then(function(ports) {
	for (const port of ports) {
		if (port.manufacturer == 'FTDI') {

			const ftdiPort = new SerialPort(port.path, {
				baudRate: 19200,
				dataBits: 8,
				parity: 'none',
				stopBits: 1
			});

			const parser = ftdiPort.pipe(new ByteLength({length: 16}));

			parser.on('data', function(buffer) {

				let unitNumber = parseInt(hex2bin(buffer.slice(2, 3).toString('hex')), 2).toString();
				let trovanHexCode = buffer.slice(5, 13).toString('hex');
				let trovanDecimalCode = parseInt(hex2bin(trovanHexCode.substring(0, 9)).split('').reverse().join(''), 2) + 9.56e14;
				let deviceId = config.deviceMap[unitNumber];

				console.log('Read tag ' + trovanHexCode + ' (' + trovanDecimalCode + ') on ' + unitNumber);
				let url = config.baseUrl + 'remotecontrol?deviceid=' + deviceId + '&subjectid=' + trovanHexCode;
				http.get(url);

			});
		}
	}
});

function hex2bin(hex) {
	let hexCodes = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
	let binCodes = ['0000','0001','0010','0011','0100','0101','0110','0111','1000','1001','1010','1011','1100','1101','1110','1111'];
	let bin = '';
	for (let i = 0; i < hex.length; i++) {
		bin += binCodes[hexCodes.indexOf(hex.charAt(i))];
	}
	return(bin);
}

console.log('Running...');
