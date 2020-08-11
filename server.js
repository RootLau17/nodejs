var http = require('http')
var fs = require('fs')
var path = require('path')
var mime = require('mime')

var cache = {}

// err response.
function send404(response){
    response.writeHead(404,{'Content-Type':'text/plain'})
    response.write('Error 404: resource not found.')
    response.end()
}

// file content response.
function sendFile(response, filePath, fileContents){
    response.writeHead(200,{'content-Type':mime.lookup(path.basename(fileContents))})
    response.end(fileContents)
}