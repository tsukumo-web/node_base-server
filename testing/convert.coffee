before = window.onload

window.onload = () ->
    before()
    document.getElementById('test-coffee').innerHTML = "Coffee Working!";
