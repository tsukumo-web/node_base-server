// author: Christopher Kelley, 2014

// the things we need to do for async

var safe_callback;
module.exports = safe_callback = (function(callback, timeout){

    var timedout = false;
    var once = false;

    var timeout_store = undefined;

    if (timeout)
    {
        timeout_store = setTimeout(function(){
            timedout = true;
            callback('timeout');
        }, timeout);
    }

    return function safe_callback()
    {
        if (!once && !timedout)
        {
            once = true;

            clearTimeout(timeout_store);
            callback.apply(this, arguments);
        }
    }
});
