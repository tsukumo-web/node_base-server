
// author: Christopher Kelley, 2014

"use strict";

var extend = require('node.extend');
var jade   = require('jade');

var enable_safe_callback = require('./safe_callback');

module.exports =
(function(options){

    var settings = extend({
        // Settings for the coffee compiler
        compiler: { },
        includes: [ ],
        timeout: 3000,
        // Pre, post process and error logging functions
        preprocess: function(src) { return src; },
        postprocess: function(src) { return src; }
    }, options);

    return {
        // This parser will convert from jade to html
        from    : 'jade',
        to      : 'html',
        // Compile function takes raw source and returns compiled html
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
                jade.render(src,　extend({ }, settings.compiler), function(err, data){
                    if (err)
                        { throw err; }

                    safe_callback(undefined, data);
                });
            }
            catch(err)
            {
                safe_callback('compile error in ' + file + ': ' + err.message);
            }
        }
    };

});
