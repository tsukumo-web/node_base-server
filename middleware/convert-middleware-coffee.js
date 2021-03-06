
// author: Christopher Kelley, 2014

"use strict";

var extend = require('node.extend');
var coffee = require('coffee-script');
require('coffee-script/register');
//coffee.register();

var enable_safe_callback = require('./safe_callback');

module.exports =
(function(options){

    var settings = extend({
        // Settings for the coffee compiler
        compiler:
        {
            bare: false
        },
        timeout: 3000,
        // Pre, post process and error logging functions
        preprocess: function(src) { return src; },
        postprocess: function(src) { return src; }
    }, options);

    return {
        // This parser will convert from coffee to js
        from    : 'coffee',
        to      : 'js',
        // Compile function takes raw source and returns compiled js
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
                src = coffee.compile(src, extend({ }, settings.compiler, {
                    filename: file
                }));
            }
            catch(err)
            {
                safe_callback('compile error in ' + file + ': ' + err.message);
            }

            safe_callback(undefined, settings.postprocess(src));
        }
    };

});
