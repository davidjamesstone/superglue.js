var IncrementalDOM = require('./incremental-dom')

var patch = IncrementalDOM.patch
var elementOpen = IncrementalDOM.elementOpen
var elementVoid = IncrementalDOM.elementVoid
var elementClose = IncrementalDOM.elementClose
var text = IncrementalDOM.text

var basket = require('./basket')
var todo = require('./todo')

window.patch = patch
window.elementOpen = elementOpen
window.elementVoid = elementVoid
window.elementClose = elementClose
window.text = text

window.basket = basket
window.todo = todo
