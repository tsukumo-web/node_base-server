
// author: Christopher Kelley, 2014

"use strict";

var extend = require('node.extend');
var coffee = require('coffee-script');

module.exports =
(function(options){

    var settings = extend({
        compiler:
        {
            bare: false
        },
        preprocess: function(src) { return src; },
        postprocess: function(src) { return src; },
        error: function(file, type, msg)
        {
            console.log(type + ' error in ' + file + ': ' + msg);
            return 'error processing file: ' + msg;
        }
    }, options);

    return {
        from    : 'coffee',
        to      : 'js',
        compile : function(src, file)
        {
            src = settings.preprocess(src);

            try
            {
                src = coffee.compile(src, extend({ }, settings.compiler, {
                    filename: file,
                    sourceMap: true
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
