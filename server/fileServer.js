var sys = require("sys"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");

var mimeTypes = [
  {re: /.*\.html/, type: 'text/html'},
  {re: /.*\.js/, type: 'application/javascript'},
  {re: /.*\.css/, type: 'text/css'}
];

var defaultMimeType = 'text/plain'

function selectMimeType(filename) {
  for(var i = 0; i < mimeTypes.length; ++i) {
    if(mimeTypes[i].re.exec(filename)) {
      return mimeTypes[i].type;
    }
  }
  return defaultMimeType;
}

function FileServer(fileList, directoryMap, relativeRoot, defaultFile) {
    this.fileList = fileList;
    this.directoryMap = directoryMap;
    this.defaultFile = defaultFile ? defaultFile : "index.html";
    this.relativeRoot = relativeRoot;
}

exports.FileServer = FileServer;

FileServer.prototype.attachTo = function(gameNodeServer) {
    this_ = this;
    gameNodeServer.handleRequest = function(request, response) {
        this_.handleRequest(request, response);
    };
}

FileServer.prototype.handleRequest = function(request, response) {
    var uri = url.parse(request.url).pathname;
    var filename = path.basename(uri);
    var directory = path.dirname(uri);

    if(filename.length == 0) {
        filename = this.defaultFile;
        directory = uri;
    }
    
    var filePath = null;
    if(directory == "/") {
        if(this.fileList !== undefined) {
            for(var i = 0; i < this.fileList.length; ++i) {
                if(filename == path.basename(this.fileList[i])) {
                    filePath = this.fileList[i];
                    break;
                }
            }
        }
    } else {
        if(this.directoryMap !== undefined) {
            var firstDir = directory.split("/")[1];
            var otherDirs = directory.split("/");
            otherDirs.splice(0, 2);
            
            if(firstDir in this.directoryMap) {
                filePath = path.join(this.directoryMap[firstDir], otherDirs.join("/"), filename);
            }
        }
    }
    
    if(filePath === null) {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
        response.end();
    } else {
        if(filePath[0] != "/") {
            filePath = path.join(this.relativeRoot, filePath);
        }

        fs.access(filePath, function(err) {
            if(!err) {
                fs.readFile(filePath, "binary", function(err, file) {
                        if(err) {
                                response.writeHead(500, {"Content-Type": "text/plain"});
                                response.write(err + "\n");
                                response.end();
                        } else {
                          response.writeHead(200, {"Content-Type": selectMimeType(filePath)});
                          response.write(file, "binary");
                          response.end();
                        }
                });
            } else {
                response.writeHead(404, {"Content-Type": "text/plain"});
                    response.write("404 Not Found\n");
                    response.end();        
            } 
        });
    }
}


