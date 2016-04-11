#!/usr/bin/env node

var program = require('commander');
var static = require('node-static');
var fs = require('fs');
var path = require('path');

program
    .version('0.0.1')
    .option('-d, --dir <path>', 'the catalog to be proxyed')
    .option('-o, --port <path>', 'http portal, default 80')
    .option('-s, --ports <path>', 'https portal, default 443')
    .option('-p, --path <path>', 'middle path,default /m/app/src', '/m/app/src')
    .parse(process.argv);


var fileServer = new static.Server(program.dir);
var httpsCreator = require('https');
var httpCreator = require('http');

var options = {
    key: fs.readFileSync(path.join(__dirname, 'privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cacert.pem'))
};
options.agent = new httpsCreator.Agent(options);
httpsCreator.createServer(options, function (request, response) {
    request.url = request.url.replace(program.path, '');
    request.addListener('end', function () {
        fileServer.serve(request, response, function (e, res) {
            e && console.log(e);
        });
    }).resume();
}).listen(parseInt(program.ports ? program.ports : 443));

httpCreator.createServer(function (request, response) {
    request.url = request.url.replace(program.path, '');
    request.addListener('end', function () {
        fileServer.serve(request, response, function (e, res) {
            e && console.log(e);
        });
    }).resume();
}).listen(parseInt(program.port ? program.port : 80));

console.log('start proxy.');