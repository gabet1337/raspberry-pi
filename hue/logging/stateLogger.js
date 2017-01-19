#!/usr/bin/nodejs
const fs = require('fs');
const http = require('http');

var apiKey = fs.readFileSync('../api-key.txt','utf-8').trim();

http.get({
    hostname: '192.168.1.154',
    port: 80,
    path: '/api/'+apiKey+'/lights/',
    agent: false
}, (res) => {
    const statusCode = res.statusCode;
    var error;
    if (res.statusCode !== 200) {
        error = new Error('Request Failed.\n' + 'Status Code: ${statusCode}');
    }
    if (error) {
        console.log(error.message);
        res.resume();
        return;
    }

    res.setEncoding('utf8');
    var rawData = '';
    res.on('data', (chunk) => rawData += chunk);
    res.on('end', () => {
        try {
            var parsedData = JSON.parse(rawData);
            for (var light in parsedData) {
                if (parsedData.hasOwnProperty(light)) {
                    var l = parsedData[light];
                    var s = Date.now() + ';' + l.state.on + ';' + l.state.reachable + ';' + l.state.bri + '\n';
                    fs.appendFile(l.name + '.csv', s, (err) => {});
                    console.log(parsedData[light].name);
                }
            }

        } catch (e) {
            console.log(e.message);
        }
    });
}).on('error', (e) => {
    console.log('Got error: ${e.message}');
});
