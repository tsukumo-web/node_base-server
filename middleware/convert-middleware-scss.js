
// author: Christopher Kelley, 2014

"use strict";

var extend = require('node.extend');
var sass   = require('node-sass');
var path   = require('path');

var enable_safe_callback = require('./safe_callback');

module.exports =
(function(options){

    var settings = extend({
        // Settings for the scss compiler
        compiler:
        {
            ouputStyle: 'compressed'
        },
        includes: [ ],
        timeout: 3000,
        // Pre, post process and error logging functions
        preprocess: function(src) { return src; },
        postprocess: function(src) { return src; }
    }, options);

    return {
        // This parser will convert from sass to css
        from    : 'scss',
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

            var safe_callback = enable_safe_callback(callback, settings.timeout);

            try
            {
                sass.render(extend({ }, settings.compiler, {
                    data: src,
                    error: function(err) {
                        safe_callback('compile error in ' + file + ': ' + err);
                    },
                    includePaths: settings.includes.concat([path.dirname(file)]),
                    success: function(css){
                        safe_callback(undefined, settings.postprocess(css));
                    }
                }));
            }
            catch(err)
            {
                safe_callback('compile error in ' + file + ': ' + err.message);
            }
        }
    };

});
