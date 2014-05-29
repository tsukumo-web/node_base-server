
// author: Christopher Kelley, 2014

"use strict";

var extend = require('node.extend');
var coffee = require('coffee-script');

module.exports =
(function(options){

    var settings = extend({
        // Settings for the coffee compiler
        compiler:
        {
            bare: false
        },
        // Pre, post process and error logging functions
        preprocess: function(src) { return src; },
        postprocess: function(src) { return src; },
        error: function(file, type, msg)
        {
            console.log(type + ' error in ' + file + ': ' + msg);
            return 'error processing file: ' + msg;
        }
    }, options);

    return {
        // This parser will convert from less to css
        from    : 'coffee',
        to      : 'js',
        // Compile function takes raw source and returns compiled js
        // or an error message on parse of compilation error
        // @param {String} src Source content.
        // @param {String} file Name of the file being parsed.
        // @return compiled source file.
        compile : function(src, file)
        {
            src = settings.preprocess(src);

            try
            {
                src = coffee.compile(src, extend({ }, settings.compiler, {
                    filename: file
                })).js;
            }
            catch(err)
            {
                return settings.error(file, 'compile', err.message);
            }

            src = settings.postprocess(src);
            return src;
        }
    };

});
