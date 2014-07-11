
// author: Christopher Kelley, 2014

"use strict";

var extend = require('node.extend');
var less   = require('less');
var path   = require('path');

var enable_safe_callback = require('./safe_callback');

module.exports =
(function(options){

    // Entend the settings with the passed options
    var settings = extend({
        // Settings for the less compiler
        compiler:
        {
            compress: 'auto',
            sourceMap: false,
            yuicompress: false
        },
        // Settings for the css parser
        parser:
        {
            dumpLineNumbers: 0,
            optimization: 0,
            relativeUrls: false
        },
        includes: [ ],
        timeout: 3000,
        // Pre, post process and error logging functions
        preprocess : function(src) { return src; },
        postprocess: function(src) { return src; }
    }, options);

    return {
        // This parser will convert from less to css
        from    : 'less',
        to      : 'css',
        // Compile function takes raw source and returns compiled css
        // or an error message on parse or compilation error
        // @param {String} src Source content.
        // @param {String} file Name of the file being parsed.
        // @param {Function} callback Function to call with error or file.
        // @return compiled source file.
        compile : function(src, file, callback)
        {
            src = settings.preprocess(src);

            // make the parser
            // TODO: figure out if this would be better off out
            //       of the compile function.. not sure it needs
            //       to be made every time
            var parser = new less.Parser(extend({ }, settings.parser, {
                filename: file,
                paths: settings.includes.concat([path.dirname(file)])
            }));

            var safe_callback = enable_safe_callback(callback, settings.timeout);

            // async parsing
            parser.parse(src, function(err, tree) {
                if (err)
                {
                    //parse error
                    safe_callback('parse error in ' + file + ': ' + err.message);
                    return;
                }

                try
                {
                    src = tree.toCSS(extend({ }, settings.compiler, {
                        compress: (settings.compiler.compress == 'auto')
                            ? true
                            : settings.compiler.compress
                    }));
                }
                catch (compile_error)
                {
                    //compile error
                    safe_callback('compile error in ' + file + ': ' + compile_error.message);
                    return;
                }

                safe_callback(undefined, settings.postprocess(src));
            });
        }
    };

});
