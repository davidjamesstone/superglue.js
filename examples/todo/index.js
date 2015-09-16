var list = require('./index.html')
var patch = require('../incremental-dom').patch
var supermodels = require('supermodels.js')
var helpers = require('../helpers')

var Todo = supermodels({
  id: helpers.rndstr,
  text: String,
  completed: Boolean
})
var Todos = supermodels([Todo])
var Lists = supermodels([Todos])

module.exports = function (el) {
  //var todos = new Todos()

  var lists = new Lists([[
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
  ]])
  function render () {
    patch(el, list, lists)
  }
  render()

  lists.on('change', render)
}
