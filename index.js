var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");

http.createServer(function(request, response) {
    var uri = url.parse(request.url).pathname;
    var filename = path.join(process.cwd(), uri);
	var ending = filename.replace(/^.*\.(\w+)$/, '$1');
	var contentType = 'text/plain';
	switch (ending) {
		case 'html':
		contentType = 'text/html';
		break;
		case 'js':
		contentType = 'text/javascript';
		break;
	}
    path.exists(filename, function(exists) {
    	if(!exists) {
    		response.writeHeader(404, {"Content-Type": contentType });
    		response.end("404 Not Found\n");
    		return;
    	}

    	fs.readFile(filename, "binary", function(err, file) {
    		if(err) {
    			response.writeHeader(500, {"Content-Type": contentType });
    			response.end(err + "\n");
    			return;
    		}

    		response.writeHeader(200, {"Content-Type": contentType });
    		response.end(file, "binary");
    	});
    });
}).listen(8080);

sys.puts("Server running at http://localhost:8080/");
