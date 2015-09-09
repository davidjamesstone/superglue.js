var todo = require('./todo.html')
var IncrementalDOM = require('../incremental-dom')
var supermodels = require('supermodels.js')

var patch = IncrementalDOM.patch
var elementOpen = IncrementalDOM.elementOpen
var elementVoid = IncrementalDOM.elementVoid
var elementClose = IncrementalDOM.elementClose
var text = IncrementalDOM.text

var Todo = supermodels({
  id: {
    __value: rndstr
  },
  text: String,
  completed: Boolean
})
var Todos = supermodels([Todo])

function rndstr () {
  return Math.random().toString(36).substr(2, 5)
}

module.exports = function (el) {
  var todos = new Todos([
    {
      text: 'Phone mum',
      completed: false
    },
    {
      text: 'Do shopping',
      completed: true
    },
    {
      text: 'Write email to Brian',
      completed: true
    }
  ])

  function render () {
    patch(el, todo, todos)
  }
  render()

  todos.on('change', render)
}
