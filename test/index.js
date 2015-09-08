// require('array.prototype.find')
// require('array.prototype.findindex')

var IncrementalDOM = require('./incremental-dom')

var patch = IncrementalDOM.patch
var elementOpen = IncrementalDOM.elementOpen
var elementVoid = IncrementalDOM.elementVoid
var elementClose = IncrementalDOM.elementClose
var text = IncrementalDOM.text

window.patch = patch
window.elementOpen = elementOpen
window.elementVoid = elementVoid
window.elementClose = elementClose
window.text = text

var basket = require('./basket')
basket(document.getElementById('mount'))
basket(document.getElementById('mount1'))
