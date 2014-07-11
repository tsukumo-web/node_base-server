// author: Christopher Kelley, 2014

"use strict";

var url    = require('url');
var fs     = require('fs');
var path   = require('path');
var mkdirp = require('mkdirp');
var extend = require('node.extend');
//var touch  = require('touch');

/* Closure represents the actual middleware, returns the function
 * to handle incoming requests.
 *
 * @param {String} source (required) Root directory of the source files.
 * @param {Array}  array_of_parsers Array of convert-middleware parsers.
 * @param {Object} options Additional options to specify to the middleware.
 * @return function handle for requests.
 *
 * Parser - object which defines three things:
 *  from    - {String}   file type to convert from
 *  to      - {String}   file type to convert to
 *  compule - {Function} function to compile the from type to the to type
 *
 * Options:
 *  dest  - {String}   root directory for the destination files.
 *      Default: same as source directory
 *  force - {Boolean}  whether the files should be forced to be
 *                     recompiled even if there is no change.
 *      Default: false
 *  store - {Function} function taking a path, content, and next function
 *                     which decides how to cache the compiled files.
 *      Default: function creates directories if necessary and writes
 *               the compiled source to file then calls next.
 */
module.exports = (function(source, array_of_parsers, options) {

    // Default source is root directory.. not very useful
    source = source || __dirname;

    // Extend the options onto the default settings
    var settings = extend({
        dest: source,
        force: false,
        debug: function(msg){ console.log(msg); },
        error: function(msg){ console.log(msg); },
        store: function(pathname, content, next)
        {
            // Only needs to be read, 511 is fine
            mkdirp(path.dirname(pathname), 511, function(err) {
                if (err)
                    { return next(err); }

                fs.writeFile(pathname, content, 'utf8', next);
            });
        }
    }, options);

    // Initial setup for parsers - feed them into a ductionary of
    // arrays based on their to field.
    var parsers = { };
    for (var cnt = 0; cnt < array_of_parsers.length; cnt++)
    {
        var parser = array_of_parsers[cnt];
        var to = parser.to;

        if (parsers[to])
            { parsers[to].push(parser); }
        else
            { parsers[to] = [parser]; }
    }

    // Function handle for requests
    return function(req, res, next)
    {
        // Renders the file with the given parser
        // @param {String} input_file File to read from.
        // @param {String} output_file File to write to.
        // @param {Object} parser Middleware parser provided to convert
        //                        from the from type to the to type of file.
        function render(input_file, output_file, parser)
        {
            settings.debug('Rendering: ' + input_file + ' -> ' + output_file);

            // Read in the file, to be processed
            fs.readFile(input_file, 'utf8', function(err, src) {
                if (err)
                {
                    // If the file doesn't exist pass onto the next
                    // without error, otherwise pass on the error.
                    return next( (err.code == 'ENOENT') ? null : err);
                }

                // Do the actual conversion work, depending on the parser
                parser.compile(src, input_file, function(err, data)
                {
                    // If there was an error compiling bail so the file
                    // can be reparsed on a new request
                    // TODO: create fail table, no reason to reparse if
                    // file has not bee updated.
                    if (err)
                    {
                        settings.error(err);
                        next();
                        return;
                    }
                    // When the callback returns with the data, store it
                    // based on the function provided by the settings
                    settings.store(output_file, data, next);
                });

            });
        }

        // Called only if the passed parser matched
        // @param {String} from    Base file path (no ext) for the input file.
        // @param {String} to      Base file path (no ext) for the output file.
        // @param {Array}  parsers Array of parsers to attempt to use.
        function process(from, to, parsers)
        {

            for (var cnt = 0; cnt < parsers.length; cnt++)
            {
                var parser = parsers[cnt];

                var i = from + '.' + parser.from;
                var o = to + '.' + parser.to;

                settings.debug('Attempting to parse: ' + i + ' -> ' + o);

                // Ensure the file exists in the format of the parser
                var istats;
                try
                {
                    istats = fs.statSync(i);
                }
                catch (err)
                {
                    // If the file doesn't exist, we probably aren't
                    // looking for this parser.

                    // Yes... this is the way I am checking... there
                    // is probably a better way but this works with the
                    // current schema, if you have a better method please
                    // let me know your idea at tsukumo+web@gmail.com or
                    // just fork me - Thanks!

                    if (err.code == 'ENOENT')
                        { continue; }
                    // Otherwise something went terribly wrong and we
                    // should crash and burn.
                    else
                        { return next(err); }
                }

                // If the settings want us to force a write, who cares
                // about the destination file, just write.
                if (settings.force)
                {
                    return render(i, o, parser);
                }

                // Get information on the output file for caching
                var ostats;
                try
                {
                    ostats = fs.statSync(o);
                }
                catch (err)
                {
                    // If the file doesn't exist we should definately
                    // make it, so render.
                    if ('ENOENT' == err.code)
                        { return render(i, o, parser); }
                    // Otherwise something went terribly wrong and we
                    // should crash and burn.
                    else
                        { return next(err); }
                }

                // If there was no error, check that the file should
                // be updated based on the time stamps
                if (istats.mtime > ostats.mtime)
                {
                    return render(i, o, parser);
                }
                // Given the timestamps make sense to not update
                // just move onto the next handle where hopefully
                // the correct file will be picked up.
                else
                {
                    return next();
                }
            }
            settings.debug('No parser found.');
            // No parser was selected so move on as the file probably exists
            // in the to state already - otherwise a 404 will be sent anyway.
            return next();
        }

        // If the request doesn't concern us, move on
        if ('GET' != req.method.toUpperCase() &&
           'HEAD' != req.method.toUpperCase())
            { return next(); }

        // Get all the needed information to continue
        var pathname = url.parse(req.url).pathname;
        var ext = path.extname(pathname).substr(1);
        var pathbase =
            pathname.substr(0, pathname.length - ext.length - 1);

        // Get the list of parsers for this file type
        var probable_parsers = parsers[ext];

        // If there are waiting parsers process them,
        // Otherwise just move to the next handle.
        return (probable_parsers) ?
            process(
                path.join(source, pathbase),
                path.join(settings.dest, pathbase),
                probable_parsers)
            : next();

    }

});
