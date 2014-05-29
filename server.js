
// author: Christopher Kelley, 2014

var extend = require('node.extend');

var server;
module.exports = server = (function(options){

    var settings = extend({
        port : 3000,
        src  : __dirname + '/public',

        middleware:
        {
            less   : { },
            coffee : { }
        }
    }, options);
    // Define after extend to collect extended source
    settings.dest = settings.dest || settings.src;

    var registry = {
        start: function(port, path){ }
    };

    // Cache variables
    var express = require('express');
    var app     = express();
    var http    = require('http');
    var server  = http.createServer(app);

    // Start the server
    server.listen(settings.port, function () {
        registry['start'](settings.port, settings.path);
    });

    // Setup middleware
    app.use(require('./middleware/convert-middleware.js')(
        settings.src,
        [
        require('./middleware/convert-middleware-less.js')
            (settings.middleware.less),
        require('./middleware/convert-middleware-coffee.js')
            (settings.middleware.coffee)
        ],
        {dest: settings.dest}
    ));

    // Setup for coffee conversion
    //app.use(require('coffee-middleware')(settings.src));

    // Setup for markdown conversion
    app.use(require('express-markdown')({directory:settings.src}));

    // Catch all
    app.use( express.static(settings.dest) );

    return {
        on: function(evt, cb)
        {
            registry[evt] = cb;
        },
        express: express,
        app: app,
        http: http,
        server: server
    };
});

if (require.main === module)
{
    var conf = require('./config.json');

    var s = server({
        port: conf['port'] || 3000,
        src : __dirname + (conf['src'] || '/public')
    });
    /*s.on('start', function(port, path){
        console.log('Server port: ' + port);
        console.log('Server path: ' + path);
    })*/
}

// current version: 4
//
// changelog
// ---------
//     2 - added support for less and coffee conversion
//     3 - added support for markdown conversion
//     4 - moved server logic into a closure
