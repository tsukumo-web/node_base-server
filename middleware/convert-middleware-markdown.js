
// author: Christopher Kelley, 2014

"use strict";

var extend = require('node.extend');
var marked = require('marked');

var enable_safe_callback = require('./safe_callback');

module.exports =
(function(options){

    var settings = extend({
        // Settings for the markdown compiler
        compiler: { }, // Leave marked defaults
        // Pre, post process and error logging functions
        timeout: 3000,
        preprocess: function(src) { return src; },
        postprocess: function(src) { return src; }
    }, options);

    marked.setOptions(settings.compiler);

    return {
        // This parser will convert from markdown to html
        from    : 'md',
        to      : 'html',
        // Compile function takes raw source and returns compiled html
        // or an error message on parse or compilation error
        // @param {String} src Source content.
        // @param {String} file Name of the file being parsed.
        // @return compiled source file.
        compile : function(src, file, callback)
        {
            src = settings.preprocess(src);

            var safe_callback = enable_safe_callback(callback, settings.timeout);

            try
            {
                src = marked(src);
            }
            catch(err)
            {
                'compile error in ' + file + ': ' + err.message
            }

            safe_callback(undefined, settings.postprocess(src));

        }
    };

});
