
// author: Christopher Kelley, 2014

"use strict";

var extend = require('node.extend');
var marked = require('marked');

module.exports =
(function(options){

    var settings = extend({
        // Settings for the markdown compiler
        compiler: { }, // Leave marked defaults
        // Pre, post process and error logging functions
        preprocess: function(src) { return src; },
        postprocess: function(src) { return src; },
        error: function(file, type, msg)
        {
            console.log(type + ' error in ' + file + ': ' + msg);
            return 'error processing file: ' + msg;
        }
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
        compile : function(src, file)
        {
            src = settings.preprocess(src);

            try
            {
                src = marked(src);
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
