
// author: Christopher Kelley, 2014

"use strict";

var extend = require('node.extend');
var less   = require('less');

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
        // Pre, post process and error logging functions
        preprocess : function(src) { return src; },
        postprocess: function(src) { return src; },
        error      : function(file, type, msg)
        {
            console.log(type + ' error in ' + file + ': ' + msg);
            return 'error processing file: ' + msg;
        }
    }, options);

    return {
        // This parser will convert from less to css
        from    : 'less',
        to      : 'css',
        // Compile function takes raw source and returns compiled css
        // or an error message on parse of compilation error
        // @param {String} src Source content.
        // @param {String} file Name of the file being parsed.
        // @return compiled source file.
        compile : function(src, file)
        {
            src = settings.preprocess(src);

            // make the parser
            // TODO: figure out if this would be better off out
            //       of the compile function.. not sure it needs
            //       to be made every time
            var parser = new less.Parser(extend({ }, settings.parser, {
                filename: file
            }));

            // async? parsing
            parser.parse(src, function(err, tree) {
                if (err)
                {
                    //parse error
                    src = settings.error(file, 'parse', err.message);
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
                    src = settings.error(file, 'compile', err.message);
                    return;
                }
            });

            src = settings.postprocess(src);
            return src;
        }
    };

});
