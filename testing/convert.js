(function() {
  var before;

  before = window.onload;

  window.onload = function() {
    before();
    return document.getElementById('test-coffee').innerHTML = "Coffee Working!";
  };

}).call(this);
