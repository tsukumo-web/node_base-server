
// author: Christopher Kelley, 2014

// Load configuration
var config      = require('./config.json');

var conf_port   = config['port'] || 3000;
var conf_path   = __dirname + (config['path'] || '/public');

// Registry creation
var registry = {
    start: function(port){}
};

module.exports.on = function(evt, cb)
{
    registry[evt] = cb;
}

// Cache variables
var express     = module.exports.express    = require('express');
var app         = module.exports.app        = express();
var http        = module.exports.http       = require('http');
var server      = module.exports.server     = http.createServer(app);

// Start the server
server.listen(conf_port, function () {
    registry['start'](conf_port);
});


app.use(require('./middleware/convert-middleware.js')(conf_path,
    [require('./middleware/convert-middleware-less.js')()]
));

// Setup for less conversion
//app.use(require('less-middleware')(conf_path));

// Setup for coffee conversion
app.use(require('coffee-middleware')(conf_path));

// Setup for markdown conversion
app.use(require('express-markdown')({directory:conf_path}));

// Catch all
app.use( express.static(conf_path) );

// current version: 3
//
// changelog
// ---------
//     2 - added support for less and coffee conversion
//     3 - added support for markdown conversion
