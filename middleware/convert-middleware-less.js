
// author: Christopher Kelley, 2014

"use strict";

var extend = require('node.extend');
var less   = require('less');

module.exports =
(function(options){

    var settings = extend({
        compiler:
        {
            compress: 'auto',
            sourceMap: false,
            yuicompress: false
        },
        parser:
        {
            dumpLineNumbers: 0,
            optimization: 0,
            relativeUrls: false
        },
        preprocess: function(src) { return src; },
        postprocess: function(src) { return src; }
    }, options);

    return {
        from    : 'less',
        to      : 'css',
        compile : function(src, file)
        {
            src = settings.preprocess(src);

            var parser = new less.Parser(extend({ }, settings.parser, {
                filename: file
            }));

            parser.parse(src, function(err, tree) {
                if (err)
                {
                    //parse error
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
                }
            })

            src = settings.postprocess(src);
            return src;
        }
    };

});
