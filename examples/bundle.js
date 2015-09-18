(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
  "items": [
    {
      "productId": "dsf1f",
      "quantity": 2
    },
    {
      "productId": "dr6hb",
      "quantity": 5
    },
    {
      "productId": "sdr4f",
      "quantity": 1
    }
  ]
}

},{}],2:[function(require,module,exports){
var supermodels = require('supermodels.js')
var patch = require('incremental-dom').patch
var helpers = require('../helpers')
var template = require('./template.html')
var productsData = require('./products-data')
var basketData = require('./basket-data')

var productSchema = {
  productId: helpers.rndstr,
  productName: String,
  price: Number,
  image: String,
  discountPercent: Number,
  get cost () {
    return this.price - (this.price * this.discountPercent)
  }
}
var productsSchema = [productSchema]
var basketSchema = {
  sortBy: String,
  items: [{
    id: helpers.rndstr,
    productId: helpers.rndstr,
    quantity: Number,
    get cost () {
      var product = this.product
      return this.quantity * (product.price - (product.price * product.discountPercent))
    },
    get product () {
      var id = this.productId

      // This function looks up the product from the products list. We can get the list of products
      // by looking up to the root of the object (the last ancestor) which in our case is the `app` model instance.
      // While this object traversal is possible using supermodels.js, it's only here for the purposes of the example.
      var app = this.__ancestors[this.__ancestors.length - 1]
      return app.products.filter(function (item) {
        return item.productId === id
      })[0]
    }
  }],
  get totalCost () {
    var total = 0

    for (var i = 0, len = this.items.length; i < len; i++) {
      total += this.items[i].cost
    }

    return total
  },
  get totalQuantity () {
    var total = 0

    for (var i = 0, len = this.items.length; i < len; i++) {
      total += this.items[i].quantity
    }

    return total
  },
  get sortedItems () {
    var items = this.items.slice()
    var sortBy = this.sortBy

    items.sort(function (a, b) {
      if (a[sortBy] < b[sortBy]) {
        return -1
      }
      if (a[sortBy] > b[sortBy]) {
        return 1
      }
      return 0
    })

    return items
  }
}

var Basket = supermodels(basketSchema)
var Products = supermodels(productsSchema)

var appSchema = {
  basket: Basket,
  products: Products
}

var App = supermodels(appSchema)

window.apps = []

module.exports = function (el) {
  var app = new App({
    basket: new Basket(basketData),
    products: new Products(productsData)
  })

  function render () {
    patch(el, template, app)
  }
  render()

  /* patch the dom whenever the app model changes. */
  app.on('change', render)

  window.apps.push(app)
}

},{"../helpers":7,"./basket-data":1,"./products-data":4,"./template.html":5,"incremental-dom":12,"supermodels.js":13}],3:[function(require,module,exports){
var IncrementalDOM = require('incremental-dom')
var patch = IncrementalDOM.patch
var elementOpen = IncrementalDOM.elementOpen
var elementVoid = IncrementalDOM.elementVoid
var elementClose = IncrementalDOM.elementClose
var text = IncrementalDOM.text

module.exports = function description (data) {
elementOpen("h3")
  text(" \
    Total lines " + (data.items.length) + ", total quantity " + (data.totalQuantity) + " \
  ")
elementClose("h3")
};

},{"incremental-dom":12}],4:[function(require,module,exports){
module.exports=[
  {
    "productId": "dsf1f",
    "productName": "Apple iPod touch 32GB 5th Generation - White",
    "price": 190.50,
    "discountPercent": 0,
    "image": "basket/img/apple.jpg"
  },
  {
    "productId": "dr6hb",
    "productName": "Samsung Galaxy Tab 3 7-inch - (Black, Wi-Fi)",
    "price": 110,
    "discountPercent": 0.2,
    "image": "basket/img/samsung.jpg"
  },
  {
    "productId": "sdr4f",
    "productName": "Bose QuietComfort 20 Acoustic Noise Cancelling Headphones",
    "price": 250,
    "discountPercent": 0.125,
    "image": "basket/img/bose.jpg"
  }
]

},{}],5:[function(require,module,exports){
var IncrementalDOM = require('incremental-dom')
var patch = IncrementalDOM.patch
var elementOpen = IncrementalDOM.elementOpen
var elementVoid = IncrementalDOM.elementVoid
var elementClose = IncrementalDOM.elementClose
var text = IncrementalDOM.text

module.exports = function basket (model) {
  var basket = model.basket
      var products = model.products
      var linesSummary = require('./lines-summary.html')
      var totalSummary = require('./total-summary.html')

      function add (product) {
        var items = basket.items

        var existing;
        for (var i = 0; i
  < basket.items.length; i++) {
          if (basket.items[i].productId === product.productId) {
            existing = basket.items[i]
            break
          }
        }

        if (existing) {
          existing.quantity++
        } else {
          var item = items.create()
          item.productId = product.productId
          item.quantity = 1
          items.push(item)
        }
      }

      function remove ($index) {
        basket.items.splice($index, 1)
      }

      var sortBy = basket.sortBy
      var sortByTerms = ['cost', 'quantity', 'productId']
  elementOpen("select", null, ["class", "pull-right"], "onchange", function ($event) {
    $event.preventDefault();
    var $element = this;
  basket.sortBy = this.value})
    elementOpen("option")
      text("Sort by:")
    elementClose("option")
    ;(Array.isArray(sortByTerms) ? sortByTerms : Object.keys(sortByTerms)).forEach(function(term, $index) {
      elementOpen("option", $index, null, "value", term)
        text("" + (term) + "")
      elementClose("option")
    }, sortByTerms)
  elementClose("select")
  linesSummary(basket)
  if (basket.items.length) {
    elementOpen("table", null, ["class", "table"])
      elementOpen("thead")
        elementOpen("tr")
          elementOpen("th")
            text("id")
          elementClose("th")
          elementOpen("th")
            text("productId")
          elementClose("th")
          elementOpen("th")
            text("productName")
          elementClose("th")
          elementOpen("th")
            text("quantity")
          elementClose("th")
          elementOpen("th")
            text("price")
          elementClose("th")
          elementOpen("th")
            text("discountPercent")
          elementClose("th")
          elementOpen("th")
            text("cost")
          elementClose("th")
          elementOpen("th")
          elementClose("th")
        elementClose("tr")
      elementClose("thead")
      elementOpen("tbody")
        ;(Array.isArray(basket.sortedItems) ? basket.sortedItems : Object.keys(basket.sortedItems)).forEach(function(item, $index) {
          elementOpen("tr", item.id)
            elementOpen("td")
              text("" + (item.id) + "")
            elementClose("td")
            elementOpen("td")
              text("" + (item.product.productId) + "")
            elementClose("td")
            elementOpen("td")
              text("" + (item.product.productName) + "")
            elementClose("td")
            elementOpen("td")
              elementOpen("input", null, ["type", "number"], "value", item.quantity, "onchange", function ($event) {
                $event.preventDefault();
                var $element = this;
              item.quantity = this.value})
              elementClose("input")
            elementClose("td")
            elementOpen("td")
              text("" + (item.product.price) + "")
            elementClose("td")
            elementOpen("td")
              text("" + (item.product.discountPercent * 100 + ' %') + "")
            elementClose("td")
            elementOpen("td")
              text("" + (item.cost.toFixed(2)) + "")
            elementClose("td")
            elementOpen("td")
              elementOpen("button", null, ["class", "btn btn-sm btn-danger"], "onclick", function ($event) {
                $event.preventDefault();
                var $element = this;
              remove($index)})
                text("Remove")
              elementClose("button")
            elementClose("td")
          elementClose("tr")
        }, basket.sortedItems)
      elementClose("tbody")
      totalSummary(basket)
    elementClose("table")
  }
  if (!basket.items.length) {
    elementOpen("div", null, ["class", "alert alert-info"])
      text("You have no items in your basket!")
    elementClose("div")
  }
  ;(Array.isArray(products) ? products : Object.keys(products)).forEach(function(product, $index) {
    elementOpen("div", $index, ["style", "width: 33%; float: left;"])
      elementOpen("div")
        text("" + (product.productId) + "")
      elementClose("div")
      elementOpen("div")
        text("" + (product.productName) + "")
      elementClose("div")
      elementOpen("div")
        text("" + (product.price) + "")
      elementClose("div")
      elementOpen("div")
        text("" + (product.discountPercent * 100 + ' %') + "")
      elementClose("div")
      elementOpen("div")
        text("" + (product.cost) + "")
      elementClose("div")
      elementOpen("img", null, ["style", "max-width: 240px; max-height: 200px;"], "src", product.image)
      elementClose("img")
      elementOpen("button", null, ["class", "btn btn-sm btn-success"], "onclick", function ($event) {
        $event.preventDefault();
        var $element = this;
      add(product)})
        text("Add to basket")
      elementClose("button")
    elementClose("div")
  }, products)
  ;(Array.isArray(model) ? model : Object.keys(model)).forEach(function(key, $index) {
    elementOpen("div", key)
      elementOpen("span")
        text("" + (key) + "")
      elementClose("span")
      elementOpen("span")
        text("" + ($index) + "")
      elementClose("span")
    elementClose("div")
  }, model)
  elementOpen("pre")
    elementOpen("code")
      text(" \
          " + (JSON.stringify(model, null, 2)) + " \
          ")
    elementClose("code")
    elementOpen("pre")
    elementClose("pre")
  elementClose("pre")
};

},{"./lines-summary.html":3,"./total-summary.html":6,"incremental-dom":12}],6:[function(require,module,exports){
var IncrementalDOM = require('incremental-dom')
var patch = IncrementalDOM.patch
var elementOpen = IncrementalDOM.elementOpen
var elementVoid = IncrementalDOM.elementVoid
var elementClose = IncrementalDOM.elementClose
var text = IncrementalDOM.text

module.exports = function description (data) {
elementOpen("tfoot")
  elementOpen("tr")
    elementOpen("td", null, ["colspan", "8"])
      elementOpen("h3")
        text(" \
                " + (data.totalCost) + " \
              ")
      elementClose("h3")
    elementClose("td")
  elementClose("tr")
elementClose("tfoot")
};

},{"incremental-dom":12}],7:[function(require,module,exports){
function rndstr () {
  return Math.random().toString(36).substr(2, 5)
}

module.exports = {
  rndstr: {
    __value: rndstr
  }
}

},{}],8:[function(require,module,exports){
var basket = require('./basket')
var todo = require('./todo')

window.basket = basket
window.todo = todo

},{"./basket":2,"./todo":10}],9:[function(require,module,exports){
var IncrementalDOM = require('incremental-dom')
var patch = IncrementalDOM.patch
var elementOpen = IncrementalDOM.elementOpen
var elementVoid = IncrementalDOM.elementVoid
var elementClose = IncrementalDOM.elementClose
var text = IncrementalDOM.text

module.exports = function todoLists (lists) {
  var todo = require('./todo.html')

    function addNewList () {
      var newList = lists.create()
      lists.push(newList)
    }
  elementOpen("div", null, ["class", "clearfix"])
    ;(Array.isArray(lists) ? lists : Object.keys(lists)).forEach(function(list, $index) {
      elementOpen("div", $index, ["style", "width: 33%; float: left; height: 300px; overflow: auto; padding: 5px; border: 1px dashed #666;"])
        todo(list)
      elementClose("div")
    }, lists)
  elementClose("div")
  elementOpen("button", null, ["class", "btn btn-sm btn-success"], "onclick", function ($event) {
    $event.preventDefault();
    var $element = this;
  addNewList()})
    text("Add new todo list")
  elementClose("button")
  elementOpen("pre")
    text("" + (JSON.stringify(lists, null, 2)) + "")
  elementClose("pre")
};

},{"./todo.html":11,"incremental-dom":12}],10:[function(require,module,exports){
var list = require('./index.html')
var patch = require('incremental-dom').patch
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

},{"../helpers":7,"./index.html":9,"incremental-dom":12,"supermodels.js":13}],11:[function(require,module,exports){
var IncrementalDOM = require('incremental-dom')
var patch = IncrementalDOM.patch
var elementOpen = IncrementalDOM.elementOpen
var elementVoid = IncrementalDOM.elementVoid
var elementClose = IncrementalDOM.elementClose
var text = IncrementalDOM.text

module.exports = function todos (todos) {
  function add (form) {
      var newTodo = todos.create()
      newTodo.text = form.newTodo.value
      todos.push(newTodo)
      form.newTodo.select()
    }

    function clearCompleted (index) {
      var len = todos.length
      for (var i = len - 1; i >= 0; i--) {
        if (todos[i].completed) {
          todos.splice(i, 1)
        }
      }
    }

    function toggleCompleted (state) {
      todos.forEach(function(todo) {
        todo.completed = state
      })
    }

    function totalCompleted () {
      return todos.filter(function (todo) {
        return todo.completed
      }).length
    }
  elementOpen("table")
    elementOpen("thead")
      elementOpen("tr")
        elementOpen("td")
        elementClose("td")
        elementOpen("td")
          elementOpen("form", null, null, "onsubmit", function ($event) {
            $event.preventDefault();
            var $element = this;
          add($element)})
            elementOpen("input", null, ["type", "text", "name", "newTodo", "class", "form-control", "placeholder", "Enter new todo"])
            elementClose("input")
          elementClose("form")
        elementClose("td")
        elementOpen("td")
          elementOpen("input", null, ["type", "checkbox"], "onchange", function ($event) {
            $event.preventDefault();
            var $element = this;
          toggleCompleted(this.checked)})
          elementClose("input")
        elementClose("td")
      elementClose("tr")
    elementClose("thead")
    elementOpen("tbody")
      ;(Array.isArray(todos) ? todos : Object.keys(todos)).forEach(function(todo, $index) {
        elementOpen("tr", todo.id)
          elementOpen("td")
            text("" + ($index + 1) + ".")
          elementClose("td")
          elementOpen("td")
            elementOpen("input", null, ["type", "text", "class", "form-control"], "value", todo.text, "onkeyup", function ($event) {
              $event.preventDefault();
              var $element = this;
            todo.text = this.value}, "style", { borderColor: todo.text ? '': 'red', textDecoration: todo.completed ? 'line-through': '' })
            elementClose("input")
          elementClose("td")
          elementOpen("td")
            elementOpen("input", null, ["type", "checkbox"], "checked", todo.completed, "onchange", function ($event) {
              $event.preventDefault();
              var $element = this;
            todo.completed = this.checked})
            elementClose("input")
          elementClose("td")
        elementClose("tr")
      }, todos)
      elementOpen("tr")
      elementClose("tr")
    elementClose("tbody")
    elementOpen("tfoot")
      elementOpen("tr")
        elementOpen("td")
          text("Total " + (todos.length) + "")
        elementClose("td")
        elementOpen("td", null, ["colspan", "2"])
          if (totalCompleted()) {
            elementOpen("button", null, ["class", "btn btn-sm btn-danger pull-right"], "onclick", function ($event) {
              $event.preventDefault();
              var $element = this;
            clearCompleted()})
              text("Clear completed " + (totalCompleted()) + "")
            elementClose("button")
          }
        elementClose("td")
      elementClose("tr")
    elementClose("tfoot")
  elementClose("table")
};

},{"incremental-dom":12}],12:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : factory(global.IncrementalDOM = {});
})(this, function (exports) {
  'use strict';

  /**
   * @type {TreeWalker}
   */

  var _mutators2;

  var walker_;

  /**
   * @return {TreeWalker} the current TreeWalker
   */
  var getWalker = function () {
    return walker_;
  };

  /**
   * Sets the current TreeWalker
   * @param {TreeWalker} walker
   */
  var setWalker = function (walker) {
    walker_ = walker;
  };

  /**
   * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS-IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Keeps track of information needed to perform diffs for a given DOM node.
   * @param {!string} nodeName
   * @param {?string=} key
   * @constructor
   */
  function NodeData(nodeName, key) {
    /**
     * The attributes and their values.
     * @const
     */
    this.attrs = {};

    /**
     * An array of attribute name/value pairs, used for quickly diffing the
     * incomming attributes to see if the DOM node's attributes need to be
     * updated.
     * @const {Array<*>}
     */
    this.attrsArr = [];

    /**
     * The incoming attributes for this Node, before they are updated.
     * @const {!Object<string, *>}
     */
    this.newAttrs = {};

    /**
     * The key used to identify this node, used to preserve DOM nodes when they
     * move within their parent.
     * @const
     */
    this.key = key;

    /**
     * Keeps track of children within this node by their key.
     * {?Object<string, !Element>}
     */
    this.keyMap = null;

    /**
     * Whether or not the keyMap is currently valid.
     * {boolean}
     */
    this.keyMapValid = true;

    /**
     * The last child to have been visited within the current pass.
     * @type {?Node}
     */
    this.lastVisitedChild = null;

    /**
     * The node name for this node.
     * @const {string}
     */
    this.nodeName = nodeName;

    /**
     * @type {?string}
     */
    this.text = null;
  }

  /**
   * Initializes a NodeData object for a Node.
   *
   * @param {Node} node The node to initialize data for.
   * @param {string} nodeName The node name of node.
   * @param {?string=} key The key that identifies the node.
   * @return {!NodeData} The newly initialized data object
   */
  var initData = function (node, nodeName, key) {
    var data = new NodeData(nodeName, key);
    node['__incrementalDOMData'] = data;
    return data;
  };

  /**
   * Retrieves the NodeData object for a Node, creating it if necessary.
   *
   * @param {Node} node The node to retrieve the data for.
   * @return {!NodeData} The NodeData for this Node.
   */
  var getData = function (node) {
    var data = node['__incrementalDOMData'];

    if (!data) {
      var nodeName = node.nodeName.toLowerCase();
      var key = null;

      if (node instanceof Element) {
        key = node.getAttribute('key');
      }

      data = initData(node, nodeName, key);
    }

    return data;
  };

  /**
   * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS-IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  exports.symbols = {
    all: '__all'
  };

  /**
   * Applies an attribute or property to a given Element. If the value is null
   * or undefined, it is removed from the Element. Otherwise, the value is set
   * as an attribute.
   * @param {!Element} el
   * @param {string} name The attribute's name.
   * @param {?(boolean|number|string)=} value The attribute's value.
   */
  var applyAttr = function (el, name, value) {
    if (value == null) {
      el.removeAttribute(name);
    } else {
      el.setAttribute(name, value);
    }

    // If, after changing the attribute,
    // the corresponding property is not updated,
    // also update it.
    if (el[name] !== value) {
      el[name] = value;
    }
  };

  /**
   * Applies a property to a given Element.
   * @param {!Element} el
   * @param {string} name The property's name.
   * @param {*} value The property's value.
   */
  var applyProp = function (el, name, value) {
    el[name] = value;
  };

  /**
   * Applies a style to an Element. No vendor prefix expansion is done for
   * property names/values.
   * @param {!Element} el
   * @param {string} name The attribute's name.
   * @param {string|Object<string,string>} style The style to set. Either a
   *     string of css or an object containing property-value pairs.
   */
  var applyStyle = function (el, name, style) {
    if (typeof style === 'string') {
      el.style.cssText = style;
    } else {
      el.style.cssText = '';

      for (var prop in style) {
        el.style[prop] = style[prop];
      }
    }
  };

  /**
   * Updates a single attribute on an Element.
   * @param {!Element} el
   * @param {string} name The attribute's name.
   * @param {*} value The attribute's value. If the value is an object or
   *     function it is set on the Element, otherwise, it is set as an HTML
   *     attribute.
   */
  var applyAttributeTyped = function (el, name, value) {
    var type = typeof value;

    if (type === 'object' || type === 'function') {
      applyProp(el, name, value);
    } else {
      applyAttr(el, name, /** @type {?(boolean|number|string)} */value);
    }
  };

  /**
   * Calls the appropriate attribute mutator for this attribute.
   * @param {!Element} el
   * @param {string} name The attribute's name.
   * @param {*} value The attribute's value.
   */
  var updateAttribute = function (el, name, value) {
    var data = getData(el);
    var attrs = data.attrs;

    if (attrs[name] === value) {
      return;
    }

    var mutator = _mutators[name] || _mutators[exports.symbols.all];
    mutator(el, name, value);

    attrs[name] = value;
  };

  /**
   * Exposes our default attribute mutators publicly, so they may be used in
   * custom mutators.
   * @const {!Object<string, function(!Element, string, *)>}
   */
  var _defaults = {
    applyAttr: applyAttr,
    applyProp: applyProp,
    applyStyle: applyStyle
  };

  /**
   * A publicly mutable object to provide custom mutators for attributes.
   * @const {!Object<string, function(!Element, string, *)>}
   */
  var _mutators = (_mutators2 = {}, _mutators2[exports.symbols.all] = applyAttributeTyped, _mutators2['style'] = applyStyle, _mutators2);

  var SVG_NS = 'http://www.w3.org/2000/svg';

  /**
   * Enters a tag, checking to see if it is a namespace boundary, and if so,
   * updates the current namespace.
   * @param {string} tag The tag to enter.
   */
  var enterTag = function (tag) {
    if (tag === 'svg') {
      getWalker().enterNamespace(SVG_NS);
    } else if (tag === 'foreignObject') {
      getWalker().enterNamespace(undefined);
    }
  };

  /**
   * Exits a tag, checking to see if it is a namespace boundary, and if so,
   * updates the current namespace.
   * @param {string} tag The tag to enter.
   */
  var exitTag = function (tag) {
    if (tag === 'svg' || tag === 'foreignObject') {
      getWalker().exitNamespace();
    }
  };

  /**
   * Gets the namespace to create an element (of a given tag) in.
   * @param {string} tag The tag to get the namespace for.
   * @return {(string|undefined)} The namespace to create the tag in.
   */
  var getNamespaceForTag = function (tag) {
    if (tag === 'svg') {
      return SVG_NS;
    }

    return getWalker().getCurrentNamespace();
  };

  /**
   * Creates an Element.
   * @param {Document} doc The document with which to create the Element.
   * @param {string} tag The tag for the Element.
   * @param {?string=} key A key to identify the Element.
   * @param {?Array<*>=} statics An array of attribute name/value pairs of
   *     the static attributes for the Element.
   * @return {!Element}
   */
  var createElement = function (doc, tag, key, statics) {
    var namespace = getNamespaceForTag(tag);
    var el;

    if (namespace) {
      el = doc.createElementNS(namespace, tag);
    } else {
      el = doc.createElement(tag);
    }

    initData(el, tag, key);

    if (statics) {
      for (var i = 0; i < statics.length; i += 2) {
        updateAttribute(el, /** @type {!string}*/statics[i], statics[i + 1]);
      }
    }

    return el;
  };

  /**
   * Creates a Node, either a Text or an Element depending on the node name
   * provided.
   * @param {Document} doc The document with which to create the Node.
   * @param {string} nodeName The tag if creating an element or #text to create
   *     a Text.
   * @param {?string=} key A key to identify the Element.
   * @param {?Array<*>=} statics The static data to initialize the Node
   *     with. For an Element, an array of attribute name/value pairs of
   *     the static attributes for the Element.
   * @return {!Node}
   */
  var createNode = function (doc, nodeName, key, statics) {
    if (nodeName === '#text') {
      return doc.createTextNode('');
    }

    return createElement(doc, nodeName, key, statics);
  };

  /**
   * Creates a mapping that can be used to look up children using a key.
   * @param {!Node} el
   * @return {!Object<string, !Element>} A mapping of keys to the children of the
   *     Element.
   */
  var createKeyMap = function (el) {
    var map = {};
    var children = el.children;
    var count = children.length;

    for (var i = 0; i < count; i += 1) {
      var child = children[i];
      var key = getData(child).key;

      if (key) {
        map[key] = child;
      }
    }

    return map;
  };

  /**
   * Retrieves the mapping of key to child node for a given Element, creating it
   * if necessary.
   * @param {!Node} el
   * @return {!Object<string, !Node>} A mapping of keys to child Elements
   */
  var getKeyMap = function (el) {
    var data = getData(el);

    if (!data.keyMap) {
      data.keyMap = createKeyMap(el);
    }

    return data.keyMap;
  };

  /**
   * Retrieves a child from the parent with the given key.
   * @param {!Node} parent
   * @param {?string=} key
   * @return {?Element} The child corresponding to the key.
   */
  var getChild = function (parent, key) {
    return (/** @type {?Element} */key && getKeyMap(parent)[key]
    );
  };

  /**
   * Registers an element as being a child. The parent will keep track of the
   * child using the key. The child can be retrieved using the same key using
   * getKeyMap. The provided key should be unique within the parent Element.
   * @param {!Node} parent The parent of child.
   * @param {string} key A key to identify the child with.
   * @param {!Node} child The child to register.
   */
  var registerChild = function (parent, key, child) {
    getKeyMap(parent)[key] = child;
  };

  if ('production' !== 'production') {
    /**
    * Makes sure that keyed Element matches the tag name provided.
    * @param {!Element} node The node that is being matched.
    * @param {string=} tag The tag name of the Element.
    * @param {?string=} key The key of the Element.
    */
    var assertKeyedTagMatches = function (node, tag, key) {
      var nodeName = getData(node).nodeName;
      if (nodeName !== tag) {
        throw new Error('Was expecting node with key "' + key + '" to be a ' + tag + ', not a ' + nodeName + '.');
      }
    };
  }

  /**
   * Checks whether or not a given node matches the specified nodeName and key.
   *
   * @param {!Node} node An HTML node, typically an HTMLElement or Text.
   * @param {?string} nodeName The nodeName for this node.
   * @param {?string=} key An optional key that identifies a node.
   * @return {boolean} True if the node matches, false otherwise.
   */
  var matches = function (node, nodeName, key) {
    var data = getData(node);

    // Key check is done using double equals as we want to treat a null key the
    // same as undefined. This should be okay as the only values allowed are
    // strings, null and undefined so the == semantics are not too weird.
    return key == data.key && nodeName === data.nodeName;
  };

  /**
   * Aligns the virtual Element definition with the actual DOM, moving the
   * corresponding DOM node to the correct location or creating it if necessary.
   * @param {string} nodeName For an Element, this should be a valid tag string.
   *     For a Text, this should be #text.
   * @param {?string=} key The key used to identify this element.
   * @param {?Array<*>=} statics For an Element, this should be an array of
   *     name-value pairs.
   * @return {!Node} The matching node.
   */
  var alignWithDOM = function (nodeName, key, statics) {
    var walker = getWalker();
    var currentNode = walker.currentNode;
    var parent = walker.getCurrentParent();
    var matchingNode;

    // Check to see if we have a node to reuse
    if (currentNode && matches(currentNode, nodeName, key)) {
      matchingNode = currentNode;
    } else {
      var existingNode = getChild(parent, key);

      // Check to see if the node has moved within the parent or if a new one
      // should be created
      if (existingNode) {
        if ('production' !== 'production') {
          assertKeyedTagMatches(existingNode, nodeName, key);
        }

        matchingNode = existingNode;
      } else {
        matchingNode = createNode(walker.doc, nodeName, key, statics);

        if (key) {
          registerChild(parent, key, matchingNode);
        }
      }

      // If the node has a key, remove it from the DOM to prevent a large number
      // of re-orders in the case that it moved far or was completely removed.
      // Since we hold on to a reference through the keyMap, we can always add it
      // back.
      if (currentNode && getData(currentNode).key) {
        parent.replaceChild(matchingNode, currentNode);
        getData(parent).keyMapValid = false;
      } else {
        parent.insertBefore(matchingNode, currentNode);
      }

      walker.currentNode = matchingNode;
    }

    return matchingNode;
  };

  /**
   * Clears out any unvisited Nodes, as the corresponding virtual element
   * functions were never called for them.
   * @param {Node} node
   */
  var clearUnvisitedDOM = function (node) {
    var data = getData(node);
    var keyMap = data.keyMap;
    var keyMapValid = data.keyMapValid;
    var lastChild = node.lastChild;
    var lastVisitedChild = data.lastVisitedChild;

    data.lastVisitedChild = null;

    if (lastChild === lastVisitedChild && keyMapValid) {
      return;
    }

    while (lastChild !== lastVisitedChild) {
      node.removeChild(lastChild);
      lastChild = node.lastChild;
    }

    // Clean the keyMap, removing any unusued keys.
    for (var key in keyMap) {
      if (!keyMap[key].parentNode) {
        delete keyMap[key];
      }
    }

    data.keyMapValid = true;
  };

  /**
   * Enters an Element, setting the current namespace for nested elements.
   * @param {Node} node
   */
  var enterNode = function (node) {
    var data = getData(node);
    enterTag(data.nodeName);
  };

  /**
   * Exits an Element, unwinding the current namespace to the previous value.
   * @param {Node} node
   */
  var exitNode = function (node) {
    var data = getData(node);
    exitTag(data.nodeName);
  };

  /**
   * Marks node's parent as having visited node.
   * @param {Node} node
   */
  var markVisited = function (node) {
    var walker = getWalker();
    var parent = walker.getCurrentParent();
    var data = getData(parent);
    data.lastVisitedChild = node;
  };

  /**
   * Changes to the first child of the current node.
   */
  var firstChild = function () {
    var walker = getWalker();
    enterNode(walker.currentNode);
    walker.firstChild();
  };

  /**
   * Changes to the next sibling of the current node.
   */
  var nextSibling = function () {
    var walker = getWalker();
    markVisited(walker.currentNode);
    walker.nextSibling();
  };

  /**
   * Changes to the parent of the current node, removing any unvisited children.
   */
  var parentNode = function () {
    var walker = getWalker();
    walker.parentNode();
    exitNode(walker.currentNode);
  };

  /**
   * Copyright 2015 The Incremental DOM Authors. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *      http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS-IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  /**
   * Similar to the built-in Treewalker class, but simplified and allows direct
   * access to modify the currentNode property.
   * @param {!Element|!DocumentFragment} node The root Node of the subtree the
   *     walker should start traversing.
   * @constructor
   */
  function TreeWalker(node) {
    /**
     * Keeps track of the current parent node. This is necessary as the traversal
     * methods may traverse past the last child and we still need a way to get
     * back to the parent.
     * @const @private {!Array<!Node>}
     */
    this.stack_ = [];

    /**
     * @type {?Node}
     */
    this.currentNode = node;

    /**
     * @const {Document}
     */
    this.doc = node.ownerDocument;

    /**
     * Keeps track of what namespace to create new Elements in.
     * @private
     * @const {!Array<(string|undefined)>}
     */
    this.nsStack_ = [undefined];
  }

  /**
   * @return {!Node} The current parent of the current location in the subtree.
   */
  TreeWalker.prototype.getCurrentParent = function () {
    return this.stack_[this.stack_.length - 1];
  };

  /**
   * @return {(string|undefined)} The current namespace to create Elements in.
   */
  TreeWalker.prototype.getCurrentNamespace = function () {
    return this.nsStack_[this.nsStack_.length - 1];
  };

  /**
   * @param {string=} namespace The namespace to enter.
   */
  TreeWalker.prototype.enterNamespace = function (namespace) {
    this.nsStack_.push(namespace);
  };

  /**
   * Exits the current namespace
   */
  TreeWalker.prototype.exitNamespace = function () {
    this.nsStack_.pop();
  };

  /**
   * Changes the current location the firstChild of the current location.
   */
  TreeWalker.prototype.firstChild = function () {
    this.stack_.push(this.currentNode);
    this.currentNode = this.currentNode.firstChild;
  };

  /**
   * Changes the current location the nextSibling of the current location.
   */
  TreeWalker.prototype.nextSibling = function () {
    this.currentNode = this.currentNode.nextSibling;
  };

  /**
   * Changes the current location the parentNode of the current location.
   */
  TreeWalker.prototype.parentNode = function () {
    this.currentNode = this.stack_.pop();
  };

  if ('production' !== 'production') {
    var assertNoUnclosedTags = function (root) {
      var openElement = getWalker().getCurrentParent();
      if (!openElement) {
        return;
      }

      var openTags = [];
      while (openElement && openElement !== root) {
        openTags.push(openElement.nodeName.toLowerCase());
        openElement = openElement.parentNode;
      }

      throw new Error('One or more tags were not closed:\n' + openTags.join('\n'));
    };
  }

  /**
   * Patches the document starting at el with the provided function. This function
   * may be called during an existing patch operation.
   * @param {!Element|!DocumentFragment} node The Element or Document
   *     to patch.
   * @param {!function(T)} fn A function containing elementOpen/elementClose/etc.
   *     calls that describe the DOM.
   * @param {T=} data An argument passed to fn to represent DOM state.
   * @template T
   */
  exports.patch = function (node, fn, data) {
    var prevWalker = getWalker();
    setWalker(new TreeWalker(node));

    firstChild();
    fn(data);
    parentNode();
    clearUnvisitedDOM(node);

    if ('production' !== 'production') {
      assertNoUnclosedTags(node);
    }

    setWalker(prevWalker);
  };

  /**
   * The offset in the virtual element declaration where the attributes are
   * specified.
   * @const
   */
  var ATTRIBUTES_OFFSET = 3;

  /**
   * Builds an array of arguments for use with elementOpenStart, attr and
   * elementOpenEnd.
   * @const {Array<*>}
   */
  var argsBuilder = [];

  if ('production' !== 'production') {
    /**
     * Keeps track whether or not we are in an attributes declaration (after
     * elementOpenStart, but before elementOpenEnd).
     * @type {boolean}
     */
    var inAttributes = false;

    /** Makes sure that the caller is not where attributes are expected. */
    var assertNotInAttributes = function () {
      if (inAttributes) {
        throw new Error('Was not expecting a call to attr or elementOpenEnd, ' + 'they must follow a call to elementOpenStart.');
      }
    };

    /** Makes sure that the caller is where attributes are expected. */
    var assertInAttributes = function () {
      if (!inAttributes) {
        throw new Error('Was expecting a call to attr or elementOpenEnd. ' + 'elementOpenStart must be followed by zero or more calls to attr, ' + 'then one call to elementOpenEnd.');
      }
    };

    /**
     * Makes sure that tags are correctly nested.
     * @param {string} tag
     */
    var assertCloseMatchesOpenTag = function (tag) {
      var closingNode = getWalker().getCurrentParent();
      var data = getData(closingNode);

      if (tag !== data.nodeName) {
        throw new Error('Received a call to close ' + tag + ' but ' + data.nodeName + ' was open.');
      }
    };

    /** Updates the state to being in an attribute declaration. */
    var setInAttributes = function () {
      inAttributes = true;
    };

    /** Updates the state to not being in an attribute declaration. */
    var setNotInAttributes = function () {
      inAttributes = false;
    };
  }

  /**
   * @param {string} tag The element's tag.
   * @param {?string=} key The key used to identify this element. This can be an
   *     empty string, but performance may be better if a unique value is used
   *     when iterating over an array of items.
   * @param {?Array<*>=} statics An array of attribute name/value pairs of the
   *     static attributes for the Element. These will only be set once when the
   *     Element is created.
   * @param {...*} var_args Attribute name/value pairs of the dynamic attributes
   *     for the Element.
   * @return {!Element} The corresponding Element.
   */
  exports.elementOpen = function (tag, key, statics, var_args) {
    if ('production' !== 'production') {
      assertNotInAttributes();
    }

    var node = /** @type {!Element}*/alignWithDOM(tag, key, statics);
    var data = getData(node);

    /*
     * Checks to see if one or more attributes have changed for a given Element.
     * When no attributes have changed, this is much faster than checking each
     * individual argument. When attributes have changed, the overhead of this is
     * minimal.
     */
    var attrsArr = data.attrsArr;
    var attrsChanged = false;
    var i = ATTRIBUTES_OFFSET;
    var j = 0;

    for (; i < arguments.length; i += 1, j += 1) {
      if (attrsArr[j] !== arguments[i]) {
        attrsChanged = true;
        break;
      }
    }

    for (; i < arguments.length; i += 1, j += 1) {
      attrsArr[j] = arguments[i];
    }

    if (j < attrsArr.length) {
      attrsChanged = true;
      attrsArr.length = j;
    }

    /*
     * Actually perform the attribute update.
     */
    if (attrsChanged) {
      var attr,
          newAttrs = data.newAttrs;

      for (attr in newAttrs) {
        newAttrs[attr] = undefined;
      }

      for (i = ATTRIBUTES_OFFSET; i < arguments.length; i += 2) {
        newAttrs[arguments[i]] = arguments[i + 1];
      }

      for (attr in newAttrs) {
        updateAttribute(node, attr, newAttrs[attr]);
      }
    }

    firstChild();
    return node;
  };

  /**
   * Declares a virtual Element at the current location in the document. This
   * corresponds to an opening tag and a elementClose tag is required. This is
   * like elementOpen, but the attributes are defined using the attr function
   * rather than being passed as arguments. Must be folllowed by 0 or more calls
   * to attr, then a call to elementOpenEnd.
   * @param {string} tag The element's tag.
   * @param {?string=} key The key used to identify this element. This can be an
   *     empty string, but performance may be better if a unique value is used
   *     when iterating over an array of items.
   * @param {?Array<*>=} statics An array of attribute name/value pairs of the
   *     static attributes for the Element. These will only be set once when the
   *     Element is created.
   */
  exports.elementOpenStart = function (tag, key, statics) {
    if ('production' !== 'production') {
      assertNotInAttributes();
      setInAttributes();
    }

    argsBuilder[0] = tag;
    argsBuilder[1] = key;
    argsBuilder[2] = statics;
  };

  /***
   * Defines a virtual attribute at this point of the DOM. This is only valid
   * when called between elementOpenStart and elementOpenEnd.
   *
   * @param {string} name
   * @param {*} value
   */
  exports.attr = function (name, value) {
    if ('production' !== 'production') {
      assertInAttributes();
    }

    argsBuilder.push(name, value);
  };

  /**
   * Closes an open tag started with elementOpenStart.
   * @return {!Element} The corresponding Element.
   */
  exports.elementOpenEnd = function () {
    if ('production' !== 'production') {
      assertInAttributes();
      setNotInAttributes();
    }

    var node = exports.elementOpen.apply(null, argsBuilder);
    argsBuilder.length = 0;
    return node;
  };

  /**
   * Closes an open virtual Element.
   *
   * @param {string} tag The element's tag.
   * @return {!Element} The corresponding Element.
   */
  exports.elementClose = function (tag) {
    if ('production' !== 'production') {
      assertNotInAttributes();
      assertCloseMatchesOpenTag(tag);
    }

    parentNode();

    var node = /** @type {!Element} */getWalker().currentNode;
    clearUnvisitedDOM(node);

    nextSibling();
    return node;
  };

  /**
   * Declares a virtual Element at the current location in the document that has
   * no children.
   * @param {string} tag The element's tag.
   * @param {?string=} key The key used to identify this element. This can be an
   *     empty string, but performance may be better if a unique value is used
   *     when iterating over an array of items.
   * @param {?Array<*>=} statics An array of attribute name/value pairs of the
   *     static attributes for the Element. These will only be set once when the
   *     Element is created.
   * @param {...*} var_args Attribute name/value pairs of the dynamic attributes
   *     for the Element.
   * @return {!Element} The corresponding Element.
   */
  exports.elementVoid = function (tag, key, statics, var_args) {
    if ('production' !== 'production') {
      assertNotInAttributes();
    }

    var node = exports.elementOpen.apply(null, arguments);
    exports.elementClose.apply(null, arguments);
    return node;
  };

  /**
   * Declares a virtual Text at this point in the document.
   *
   * @param {string|number|boolean} value The value of the Text.
   * @param {...(function((string|number|boolean)):string)} var_args
   *     Functions to format the value which are called only when the value has
   *     changed.
   * @return {!Text} The corresponding text node.
   */
  exports.text = function (value, var_args) {
    if ('production' !== 'production') {
      assertNotInAttributes();
    }

    var node = /** @type {!Text}*/alignWithDOM('#text', null);
    var data = getData(node);

    if (data.text !== value) {
      data.text = /** @type {string} */value;

      var formatted = value;
      for (var i = 1; i < arguments.length; i += 1) {
        formatted = arguments[i](formatted);
      }

      node.data = formatted;
    }

    nextSibling();
    return node;
  };

  /**
   * Publicly exports the mutator hooks from various internal modules.
   * Note that mutating these objects will alter the behavior of the internal
   * code.
   * {Object<string, Object<string, function>>}
   */
  exports.mutators = {
    attributes: _mutators
  };

  /**
   * Publicly exports the default mutators from various internal modules.
   * Note that mutating these objects will have no affect on the internal code,
   * these are exposed only to be used by custom mutators.
   * {Object<string, Object<string, function>>}
   */
  exports.defaults = {
    attributes: _defaults
  };
});

// Special generic mutator that's called for any attribute that does not
// have a specific mutator.

// Special case the style attribute

},{}],13:[function(require,module,exports){
module.exports = require('./lib/supermodels');

},{"./lib/supermodels":23}],14:[function(require,module,exports){
'use strict'

var util = require('./util')
var createWrapperFactory = require('./factory')

function resolve (from) {
  var isCtor = util.isConstructor(from)
  var isSupermodelCtor = util.isSupermodelConstructor(from)
  var isArray = util.isArray(from)

  if (isCtor || isSupermodelCtor || isArray) {
    return {
      __type: from
    }
  }

  var isValue = !util.isObject(from)
  if (isValue) {
    return {
      __value: from
    }
  }

  return from
}

function createDef (from) {
  from = resolve(from)

  var __VALIDATORS = '__validators'
  var __VALUE = '__value'
  var __TYPE = '__type'
  var __DISPLAYNAME = '__displayName'
  var __GET = '__get'
  var __SET = '__set'
  var __ENUMERABLE = '__enumerable'
  var __CONFIGURABLE = '__configurable'
  var __WRITABLE = '__writable'
  var __SPECIAL_PROPS = [
    __VALIDATORS, __VALUE, __TYPE, __DISPLAYNAME,
    __GET, __SET, __ENUMERABLE, __CONFIGURABLE, __WRITABLE
  ]

  var def = {
    from: from,
    type: from[__TYPE],
    value: from[__VALUE],
    validators: from[__VALIDATORS] || [],
    enumerable: from[__ENUMERABLE] !== false,
    configurable: !!from[__CONFIGURABLE],
    writable: from[__WRITABLE] !== false,
    displayName: from[__DISPLAYNAME],
    getter: from[__GET],
    setter: from[__SET]
  }

  var type = def.type

  // Simple 'Constructor' Type
  if (util.isSimpleConstructor(type)) {
    def.isSimple = true

    def.cast = function (value) {
      return util.cast(value, type)
    }
  } else if (util.isSupermodelConstructor(type)) {
    def.isReference = true
  } else if (def.value) {
    // If a value is present, use
    // that and short-circuit the rest
    def.isSimple = true
  } else {
    // Otherwise look for other non-special
    // keys and also any item definition
    // in the case of Arrays

    var keys = Object.keys(from)
    var childKeys = keys.filter(function (item) {
      return __SPECIAL_PROPS.indexOf(item) === -1
    })

    if (childKeys.length) {
      var defs = {}
      var proto

      childKeys.forEach(function (key) {
        var descriptor = Object.getOwnPropertyDescriptor(from, key)
        var value

        if (descriptor.get || descriptor.set) {
          value = {
            __get: descriptor.get,
            __set: descriptor.set
          }
        } else {
          value = from[key]
        }

        if (!util.isConstructor(value) && !util.isSupermodelConstructor(value) && util.isFunction(value)) {
          if (!proto) {
            proto = {}
          }
          proto[key] = value
        } else {
          defs[key] = createDef(value)
        }
      })

      def.defs = defs
      def.proto = proto

    }

    // Check for Array
    if (type === Array || util.isArray(type)) {
      def.isArray = true

      if (type.length > 0) {
        def.def = createDef(type[0])
      }

    } else if (childKeys.length === 0) {
      def.isSimple = true
    }
  }

  def.create = createWrapperFactory(def)

  return def
}

module.exports = createDef

},{"./factory":18,"./util":24}],15:[function(require,module,exports){
'use strict'

module.exports = function (callback) {
  var arr = []

  /**
   * Proxied array mutators methods
   *
   * @param {Object} obj
   * @return {Object}
   * @api private
   */
  var pop = function () {
    var result = Array.prototype.pop.apply(arr)

    callback('pop', arr, {
      value: result
    })

    return result
  }
  var push = function () {
    var result = Array.prototype.push.apply(arr, arguments)

    callback('push', arr, {
      value: result
    })

    return result
  }
  var shift = function () {
    var result = Array.prototype.shift.apply(arr)

    callback('shift', arr, {
      value: result
    })

    return result
  }
  var sort = function () {
    var result = Array.prototype.sort.apply(arr, arguments)

    callback('sort', arr, {
      value: result
    })

    return result
  }
  var unshift = function () {
    var result = Array.prototype.unshift.apply(arr, arguments)

    callback('unshift', arr, {
      value: result
    })

    return result
  }
  var reverse = function () {
    var result = Array.prototype.reverse.apply(arr)

    callback('reverse', arr, {
      value: result
    })

    return result
  }
  var splice = function () {
    if (!arguments.length) {
      return
    }

    var result = Array.prototype.splice.apply(arr, arguments)

    callback('splice', arr, {
      value: result,
      removed: result,
      added: Array.prototype.slice.call(arguments, 2)
    })

    return result
  }

  /**
   * Proxy all Array.prototype mutator methods on this array instance
   */
  arr.pop = arr.pop && pop
  arr.push = arr.push && push
  arr.shift = arr.shift && shift
  arr.unshift = arr.unshift && unshift
  arr.sort = arr.sort && sort
  arr.reverse = arr.reverse && reverse
  arr.splice = arr.splice && splice

  /**
   * Special update function since we can't detect
   * assignment by index e.g. arr[0] = 'something'
   */
  arr.update = function (index, value) {
    var oldValue = arr[index]
    var newValue = arr[index] = value

    callback('update', arr, {
      index: index,
      value: newValue,
      oldValue: oldValue
    })

    return newValue
  }

  return arr
}

},{}],16:[function(require,module,exports){
'use strict'

module.exports = function EmitterEvent (name, path, target, detail) {
  this.name = name
  this.path = path
  this.target = target

  if (detail) {
    this.detail = detail
  }
}

},{}],17:[function(require,module,exports){
'use strict'

/**
 * Expose `Emitter`.
 */

module.exports = Emitter

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter (obj) {
  var ctx = obj || this

  if (obj) {
    ctx = mixin(obj)
    return ctx
  }
}

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin (obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key]
  }
  return obj
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
  (this.__callbacks[event] = this.__callbacks[event] || [])
    .push(fn)
  return this
}

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function (event, fn) {
  function on () {
    this.off(event, on)
    fn.apply(this, arguments)
  }

  on.fn = fn
  this.on(event, on)
  return this
}

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off = Emitter.prototype.removeEventListener = Emitter.prototype.removeAllListeners = function (event, fn) {
  // all
  if (arguments.length === 0) {
    this.__callbacks = {}
    return this
  }

  // specific event
  var callbacks = this.__callbacks[event]
  if (!callbacks) {
    return this
  }

  // remove all handlers
  if (arguments.length === 1) {
    delete this.__callbacks[event]
    return this
  }

  // remove specific handler
  var cb
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i]
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1)
      break
    }
  }
  return this
}

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function (event) {
  var args = [].slice.call(arguments, 1)
  var callbacks = this.__callbacks[event]

  if (callbacks) {
    callbacks = callbacks.slice(0)
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args)
    }
  }

  return this
}

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function (event) {
  return this.__callbacks[event] || []
}

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function (event) {
  return !!this.listeners(event).length
}

},{}],18:[function(require,module,exports){
'use strict'

var util = require('./util')
var createModelPrototype = require('./proto')
var Wrapper = require('./wrapper')

function createModelDescriptors (def, parent) {
  var __ = {}

  var desc = {
    __: {
      value: __
    },
    __def: {
      value: def
    },
    __parent: {
      value: parent,
      writable: true
    },
    __callbacks: {
      value: {},
      writable: true
    }
  }

  return desc
}

function defineProperties (model) {
  var defs = model.__def.defs
  for (var key in defs) {
    defineProperty(model, key, defs[key])
  }
}

function defineProperty (model, key, def) {
  var desc = {
    get: function () {
      return this.__get(key)
    },
    enumerable: def.enumerable,
    configurable: def.configurable
  }

  if (def.writable) {
    desc.set = function (value) {
      this.__setNotifyChange(key, value)
    }
  }

  Object.defineProperty(model, key, desc)

  // Silently initialize the property wrapper
  model.__[key] = def.create(model)
}

function createWrapperFactory (def) {
  var wrapper, defaultValue, assert

  if (def.isSimple) {
    wrapper = new Wrapper(def.value, def.writable, def.validators, def.getter, def.setter, def.cast, null)
  } else if (def.isReference) {
    // Hold a reference to the
    // refererenced types' definition
    var refDef = def.type.def

    if (refDef.isSimple) {
      // If the referenced type is itself simple,
      // we can set just return a wrapper and
      // the property will get initialized.
      wrapper = new Wrapper(refDef.value, refDef.writable, refDef.validators, def.getter, def.setter, refDef.cast, null)
    } else {
      // If we're not dealing with a simple reference model
      // we need to define an assertion that the instance
      // being set is of the correct type. We do this be
      // comparing the defs.

      assert = function (value) {
        // compare the defintions of the value instance
        // being passed and the def property attached
        // to the type SupermodelConstructor. Allow the
        // value to be undefined or null also.
        var isCorrectType = false

        if (util.isNullOrUndefined(value)) {
          isCorrectType = true
        } else {
          isCorrectType = refDef === value.__def
        }

        if (!isCorrectType) {
          throw new Error('Value should be an instance of the referenced model, null or undefined')
        }
      }

      wrapper = new Wrapper(def.value, def.writable, def.validators, def.getter, def.setter, null, assert)
    }
  } else if (def.isArray) {
    defaultValue = function (parent) {
      // for Arrays, we create a new Array and each
      // time, mix the model properties into it
      var model = createModelPrototype(def)
      Object.defineProperties(model, createModelDescriptors(def, parent))
      defineProperties(model)
      return model
    }

    assert = function (value) {
      // todo: further array type validation
      if (!util.isArray(value)) {
        throw new Error('Value should be an array')
      }
    }

    wrapper = new Wrapper(defaultValue, def.writable, def.validators, def.getter, def.setter, null, assert)
  } else {
    // for Objects, we can create and reuse
    // a prototype object. We then need to only
    // define the defs and the 'instance' properties
    // e.g. __, parent etc.
    var proto = createModelPrototype(def)

    defaultValue = function (parent) {
      var model = Object.create(proto, createModelDescriptors(def, parent))
      defineProperties(model)
      return model
    }

    assert = function (value) {
      if (!proto.isPrototypeOf(value)) {
        throw new Error('Invalid prototype')
      }
    }

    wrapper = new Wrapper(defaultValue, def.writable, def.validators, def.getter, def.setter, null, assert)
  }

  var factory = function (parent) {
    var wrap = Object.create(wrapper)
    // if (!wrap.isInitialized) {
    wrap.initialize(parent)
    // }
    return wrap
  }

  // expose the wrapper, this is used
  // for validating array items later
  factory.wrapper = wrapper

  return factory
}

module.exports = createWrapperFactory

},{"./proto":21,"./util":24,"./wrapper":26}],19:[function(require,module,exports){
'use strict'

function merge (model, obj) {
  var isArray = model.__def.isArray
  var defs = model.__def.defs
  var defKeys, def, key, i, isSimple,
    isSimpleReference, isInitializedReference

  if (defs) {
    defKeys = Object.keys(defs)
    for (i = 0; i < defKeys.length; i++) {
      key = defKeys[i]
      if (obj.hasOwnProperty(key)) {
        def = defs[key]

        isSimple = def.isSimple
        isSimpleReference = def.isReference && def.type.def.isSimple
        isInitializedReference = def.isReference && obj[key] && obj[key].__supermodel

        if (isSimple || isSimpleReference || isInitializedReference) {
          model[key] = obj[key]
        } else if (obj[key]) {
          if (def.isReference) {
            model[key] = def.type()
          }
          merge(model[key], obj[key])
        }
      }
    }
  }

  if (isArray && Array.isArray(obj)) {
    for (i = 0; i < obj.length; i++) {
      var item = model.create()
      model.push(item && item.__supermodel ? merge(item, obj[i]) : obj[i])
    }
  }

  return model
}

module.exports = merge

},{}],20:[function(require,module,exports){
'use strict'

var EmitterEvent = require('./emitter-event')
var ValidationError = require('./validation-error')
var Wrapper = require('./wrapper')
var merge = require('./merge')

var descriptors = {
  __supermodel: {
    value: true
  },
  __keys: {
    get: function () {
      var keys = Object.keys(this)

      if (Array.isArray(this)) {
        var omit = [
          'addEventListener', 'on', 'once', 'removeEventListener', 'removeAllListeners',
          'removeListener', 'off', 'emit', 'listeners', 'hasListeners', 'pop', 'push',
          'reverse', 'shift', 'sort', 'splice', 'update', 'unshift', 'create', '__merge',
          '__setNotifyChange', '__notifyChange', '__set', '__get', '__chain', '__relativePath'
        ]

        keys = keys.filter(function (item) {
          return omit.indexOf(item) < 0
        })
      }

      return keys
    }
  },
  __name: {
    get: function () {
      if (this.__isRoot) {
        return ''
      }

      // Work out the 'name' of the model
      // Look up to the parent and loop through it's keys,
      // Any value or array found to contain the value of this (this model)
      // then we return the key and index in the case we found the model in an array.
      var parentKeys = this.__parent.__keys
      var parentKey, parentValue

      for (var i = 0; i < parentKeys.length; i++) {
        parentKey = parentKeys[i]
        parentValue = this.__parent[parentKey]

        if (parentValue === this) {
          return parentKey
        }
      }
    }
  },
  __path: {
    get: function () {
      if (this.__hasAncestors && !this.__parent.__isRoot) {
        return this.__parent.__path + '.' + this.__name
      } else {
        return this.__name
      }
    }
  },
  __isRoot: {
    get: function () {
      return !this.__hasAncestors
    }
  },
  __children: {
    get: function () {
      var children = []

      var keys = this.__keys
      var key, value

      for (var i = 0; i < keys.length; i++) {
        key = keys[i]
        value = this[key]

        if (value && value.__supermodel) {
          children.push(value)
        }
      }

      return children
    }
  },
  __ancestors: {
    get: function () {
      var ancestors = []
      var r = this

      while (r.__parent) {
        ancestors.push(r.__parent)
        r = r.__parent
      }

      return ancestors
    }
  },
  __descendants: {
    get: function () {
      var descendants = []

      function checkAndAddDescendantIfModel (obj) {
        var keys = obj.__keys
        var key, value

        for (var i = 0; i < keys.length; i++) {
          key = keys[i]
          value = obj[key]

          if (value && value.__supermodel) {
            descendants.push(value)
            checkAndAddDescendantIfModel(value)

          }
        }

      }

      checkAndAddDescendantIfModel(this)

      return descendants
    }
  },
  __hasAncestors: {
    get: function () {
      return !!this.__ancestors.length
    }
  },
  __hasDescendants: {
    get: function () {
      return !!this.__descendants.length
    }
  },
  errors: {
    get: function () {
      var errors = []
      var def = this.__def
      var validator, error, i, j

      // Run own validators
      var own = def.validators.slice(0)
      for (i = 0; i < own.length; i++) {
        validator = own[i]
        error = validator.call(this, this)

        if (error) {
          errors.push(new ValidationError(this, error, validator))
        }
      }

      // Run through keys and evaluate validators
      var keys = this.__keys
      var value, key, itemDef

      for (i = 0; i < keys.length; i++) {
        key = keys[i]

        // If we are an Array with an item definition
        // then we have to look into the Array for our value
        // and also get hold of the wrapper. We only need to
        // do this if the key is not a property of the array.
        // We check the defs to work this out (i.e. 0, 1, 2).
        // todo: This could be better to check !NaN on the key?
        if (def.isArray && def.def && (!def.defs || !(key in def.defs))) {
          // If we are an Array with a simple item definition
          // or a reference to a simple type definition
          // substitute the value with the wrapper we get from the
          // create factory function. Otherwise set the value to
          // the real value of the property.
          itemDef = def.def

          if (itemDef.isSimple) {
            value = itemDef.create.wrapper
            value.setValue(this[key])
          } else if (itemDef.isReference && itemDef.type.def.isSimple) {
            value = itemDef.type.def.create.wrapper
            value.setValue(this[key])
          } else {
            value = this[key]
          }
        } else {
          // Set the value to the wrapped value of the property
          value = this.__[key]
        }

        if (value) {
          if (value.__supermodel) {
            Array.prototype.push.apply(errors, value.errors)
          } else if (value instanceof Wrapper) {
            var wrapperValue = value.getValue(this)

            if (wrapperValue && wrapperValue.__supermodel) {
              Array.prototype.push.apply(errors, wrapperValue.errors)
            } else {
              var simple = value.validators
              for (j = 0; j < simple.length; j++) {
                validator = simple[j]
                error = validator.call(this, wrapperValue, key)

                if (error) {
                  errors.push(new ValidationError(this, error, validator, key))
                }
              }
            }
          }
        }
      }

      return errors
    }
  }
}

var proto = {
  __get: function (key) {
    return this.__[key].getValue(this)
  },
  __set: function (key, value) {
    this.__[key].setValue(value, this)
  },
  __relativePath: function (to, key) {
    var relativePath = this.__path ? to.substr(this.__path.length + 1) : to

    if (relativePath) {
      return key ? relativePath + '.' + key : relativePath
    }
    return key
  },
  __chain: function (fn) {
    return [this].concat(this.__ancestors).forEach(fn)
  },
  __merge: function (data) {
    return merge(this, data)
  },
  __notifyChange: function (key, newValue, oldValue) {
    var target = this
    var targetPath = this.__path
    var eventName = 'set'
    var data = {
      oldValue: oldValue,
      newValue: newValue
    }

    this.emit(eventName, new EmitterEvent(eventName, key, target, data))
    this.emit('change', new EmitterEvent(eventName, key, target, data))
    this.emit('change:' + key, new EmitterEvent(eventName, key, target, data))

    this.__ancestors.forEach(function (item) {
      var path = item.__relativePath(targetPath, key)
      item.emit('change', new EmitterEvent(eventName, path, target, data))
    })
  },
  __setNotifyChange: function (key, value) {
    var oldValue = this.__get(key)
    this.__set(key, value)
    var newValue = this.__get(key)
    this.__notifyChange(key, newValue, oldValue)
  }
}

module.exports = {
  proto: proto,
  descriptors: descriptors
}

},{"./emitter-event":16,"./merge":19,"./validation-error":25,"./wrapper":26}],21:[function(require,module,exports){
'use strict'

var emitter = require('./emitter-object')
var emitterArray = require('./emitter-array')
var EmitterEvent = require('./emitter-event')

var extend = require('./util').extend
var model = require('./model')
var modelProto = model.proto
var modelDescriptors = model.descriptors

var modelPrototype = Object.create(modelProto, modelDescriptors)
var objectPrototype = (function () {
  var p = Object.create(modelPrototype)

  emitter(p)

  return p
})()

function createArrayPrototype () {
  var p = emitterArray(function (eventName, arr, e) {
    if (eventName === 'update') {
      /**
       * Forward the special array update
       * events as standard __notifyChange events
       */
      arr.__notifyChange(e.index, e.value, e.oldValue)
    } else {
      /**
       * All other events e.g. push, splice are relayed
       */
      var target = arr
      var path = arr.__path
      var data = e
      var key = e.index

      arr.emit(eventName, new EmitterEvent(eventName, '', target, data))
      arr.emit('change', new EmitterEvent(eventName, '', target, data))
      arr.__ancestors.forEach(function (item) {
        var name = item.__relativePath(path, key)
        item.emit('change', new EmitterEvent(eventName, name, target, data))
      })

    }
  })

  Object.defineProperties(p, modelDescriptors)

  emitter(p)

  extend(p, modelProto)

  return p
}

function createObjectModelPrototype (proto) {
  var p = Object.create(objectPrototype)

  if (proto) {
    extend(p, proto)
  }

  return p
}

function createArrayModelPrototype (proto, itemDef) {
  // We do not to attempt to subclass Array,
  // instead create a new instance each time
  // and mixin the proto object
  var p = createArrayPrototype()

  if (proto) {
    extend(p, proto)
  }

  if (itemDef) {
    // We have a definition for the items
    // that belong in this array.

    // Use the `wrapper` prototype property as a
    // virtual Wrapper object we can use
    // validate all the items in the array.
    var arrItemWrapper = itemDef.create.wrapper

    // Validate new models by overriding the emitter array
    // mutators that can cause new items to enter the array.
    overrideArrayAddingMutators(p, arrItemWrapper)

    // Provide a convenient model factory
    // for creating array item instances
    p.create = function () {
      return itemDef.isReference ? itemDef.type() : itemDef.create().getValue(this)
    }
  }

  return p
}

function overrideArrayAddingMutators (arr, itemWrapper) {
  function getArrayArgs (items) {
    var args = []
    for (var i = 0; i < items.length; i++) {
      itemWrapper.setValue(items[i], arr)
      args.push(itemWrapper.getValue(arr))
    }
    return args
  }

  var push = arr.push
  var unshift = arr.unshift
  var splice = arr.splice
  var update = arr.update

  if (push) {
    arr.push = function () {
      var args = getArrayArgs(arguments)
      return push.apply(arr, args)
    }
  }

  if (unshift) {
    arr.unshift = function () {
      var args = getArrayArgs(arguments)
      return unshift.apply(arr, args)
    }
  }

  if (splice) {
    arr.splice = function () {
      var args = getArrayArgs(Array.prototype.slice.call(arguments, 2))
      args.unshift(arguments[1])
      args.unshift(arguments[0])
      return splice.apply(arr, args)
    }
  }

  if (update) {
    arr.update = function () {
      var args = getArrayArgs([arguments[1]])
      args.unshift(arguments[0])
      return update.apply(arr, args)
    }
  }
}

function createModelPrototype (def) {
  return def.isArray ? createArrayModelPrototype(def.proto, def.def) : createObjectModelPrototype(def.proto)
}

module.exports = createModelPrototype

},{"./emitter-array":15,"./emitter-event":16,"./emitter-object":17,"./model":20,"./util":24}],22:[function(require,module,exports){
'use strict'

module.exports = {}

},{}],23:[function(require,module,exports){
'use strict'

// var merge = require('./merge')
var createDef = require('./def')
var Supermodel = require('./supermodel')

function supermodels (schema, initializer) {
  var def = createDef(schema)

  function SupermodelConstructor (data) {
    var model = def.isSimple ? def.create() : def.create().getValue({})

    // Call any initializer
    if (initializer) {
      initializer.apply(model, arguments)
    } else if (data) {
      // if there's no initializer
      // but we have been passed some
      // data, merge it into the model.
      model.__merge(data)
    }
    return model
  }
  Object.defineProperty(SupermodelConstructor, 'def', {
    value: def // this is used to validate referenced SupermodelConstructors
  })
  SupermodelConstructor.prototype = Supermodel // this shared object is used, as a prototype, to identify SupermodelConstructors
  SupermodelConstructor.constructor = SupermodelConstructor
  return SupermodelConstructor
}

module.exports = supermodels

},{"./def":14,"./supermodel":22}],24:[function(require,module,exports){
'use strict'

var Supermodel = require('./supermodel')

function extend (origin, add) {
  // Don't do anything if add isn't an object
  if (!add || typeof add !== 'object') {
    return origin
  }

  var keys = Object.keys(add)
  var i = keys.length
  while (i--) {
    origin[keys[i]] = add[keys[i]]
  }
  return origin
}

var util = {
  extend: extend,
  typeOf: function (obj) {
    return Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
  },
  isObject: function (value) {
    return this.typeOf(value) === 'object'
  },
  isArray: function (value) {
    return Array.isArray(value)
  },
  isSimple: function (value) {
    // 'Simple' here means anything
    // other than an Object or an Array
    // i.e. number, string, date, bool, null, undefined, regex...
    return !this.isObject(value) && !this.isArray(value)
  },
  isFunction: function (value) {
    return this.typeOf(value) === 'function'
  },
  isDate: function (value) {
    return this.typeOf(value) === 'date'
  },
  isNull: function (value) {
    return value === null
  },
  isUndefined: function (value) {
    return typeof (value) === 'undefined'
  },
  isNullOrUndefined: function (value) {
    return this.isNull(value) || this.isUndefined(value)
  },
  cast: function (value, type) {
    if (!type) {
      return value
    }

    switch (type) {
      case String:
        return util.castString(value)
      case Number:
        return util.castNumber(value)
      case Boolean:
        return util.castBoolean(value)
      case Date:
        return util.castDate(value)
      case Object:
      case Function:
        return value
      default:
        throw new Error('Invalid cast')
    }
  },
  castString: function (value) {
    if (value === undefined || value === null || util.typeOf(value) === 'string') {
      return value
    }
    return value.toString && value.toString()
  },
  castNumber: function (value) {
    if (value === undefined || value === null) {
      return NaN
    }
    if (util.typeOf(value) === 'number') {
      return value
    }
    return Number(value)
  },
  castBoolean: function (value) {
    if (!value) {
      return false
    }
    var falsey = ['0', 'false', 'off', 'no']
    return falsey.indexOf(value) === -1
  },
  castDate: function (value) {
    if (value === undefined || value === null || util.typeOf(value) === 'date') {
      return value
    }
    return new Date(value)
  },
  isConstructor: function (value) {
    return this.isSimpleConstructor(value) || [Array, Object].indexOf(value) > -1
  },
  isSimpleConstructor: function (value) {
    return [String, Number, Date, Boolean].indexOf(value) > -1
  },
  isSupermodelConstructor: function (value) {
    return this.isFunction(value) && value.prototype === Supermodel
  }
}

module.exports = util

},{"./supermodel":22}],25:[function(require,module,exports){
'use strict'

function ValidationError (target, error, validator, key) {
  this.target = target
  this.error = error
  this.validator = validator

  if (key) {
    this.key = key
  }
}

module.exports = ValidationError

},{}],26:[function(require,module,exports){
'use strict'

var util = require('./util')

function Wrapper (defaultValue, writable, validators, getter, setter, beforeSet, assert) {
  this.validators = validators

  this._defaultValue = defaultValue
  this._writable = writable
  this._getter = getter
  this._setter = setter
  this._beforeSet = beforeSet
  this._assert = assert
  this.isInitialized = false

  if (!util.isFunction(defaultValue)) {
    this.isInitialized = true

    if (!util.isUndefined(defaultValue)) {
      this._value = defaultValue
    }
  }
}
Wrapper.prototype.initialize = function (parent) {
  if (this.isInitialized) {
    return
  }

  this.setValue(this._defaultValue(parent), parent)
  this.isInitialized = true
}
Wrapper.prototype.getValue = function (model) {
  return this._getter ? this._getter.call(model) : this._value
}
Wrapper.prototype.setValue = function (value, model) {
  if (!this._writable) {
    throw new Error('Value is readonly')
  }

  // Hook up the parent ref if necessary
  if (value && value.__supermodel && model) {
    if (value.__parent !== model) {
      value.__parent = model
    }
  }

  var val
  if (this._setter) {
    this._setter.call(model, value)
    val = this.getValue(model)
  } else {
    val = this._beforeSet ? this._beforeSet(value) : value
  }

  if (this._assert) {
    this._assert(val)
  }

  this._value = val
}

module.exports = Wrapper

},{"./util":24}]},{},[8])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9iYXNrZXQvYmFza2V0LWRhdGEuanNvbiIsImV4YW1wbGVzL2Jhc2tldC9pbmRleC5qcyIsImV4YW1wbGVzL2Jhc2tldC9saW5lcy1zdW1tYXJ5Lmh0bWwiLCJleGFtcGxlcy9iYXNrZXQvcHJvZHVjdHMtZGF0YS5qc29uIiwiZXhhbXBsZXMvYmFza2V0L3RlbXBsYXRlLmh0bWwiLCJleGFtcGxlcy9iYXNrZXQvdG90YWwtc3VtbWFyeS5odG1sIiwiZXhhbXBsZXMvaGVscGVycy5qcyIsImV4YW1wbGVzL2luZGV4LmpzIiwiZXhhbXBsZXMvdG9kby9pbmRleC5odG1sIiwiZXhhbXBsZXMvdG9kby9pbmRleC5qcyIsImV4YW1wbGVzL3RvZG8vdG9kby5odG1sIiwibm9kZV9tb2R1bGVzL2luY3JlbWVudGFsLWRvbS9kaXN0L2luY3JlbWVudGFsLWRvbS5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvZGVmLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9lbWl0dGVyLWFycmF5LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9lbWl0dGVyLWV2ZW50LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9lbWl0dGVyLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvZmFjdG9yeS5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvbWVyZ2UuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL21vZGVsLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9wcm90by5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvc3VwZXJtb2RlbC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvc3VwZXJtb2RlbHMuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL3V0aWwuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL3ZhbGlkYXRpb24tZXJyb3IuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL3dyYXBwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZnQ0E7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIml0ZW1zXCI6IFtcbiAgICB7XG4gICAgICBcInByb2R1Y3RJZFwiOiBcImRzZjFmXCIsXG4gICAgICBcInF1YW50aXR5XCI6IDJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwicHJvZHVjdElkXCI6IFwiZHI2aGJcIixcbiAgICAgIFwicXVhbnRpdHlcIjogNVxuICAgIH0sXG4gICAge1xuICAgICAgXCJwcm9kdWN0SWRcIjogXCJzZHI0ZlwiLFxuICAgICAgXCJxdWFudGl0eVwiOiAxXG4gICAgfVxuICBdXG59XG4iLCJ2YXIgc3VwZXJtb2RlbHMgPSByZXF1aXJlKCdzdXBlcm1vZGVscy5qcycpXG52YXIgcGF0Y2ggPSByZXF1aXJlKCdpbmNyZW1lbnRhbC1kb20nKS5wYXRjaFxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJylcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUuaHRtbCcpXG52YXIgcHJvZHVjdHNEYXRhID0gcmVxdWlyZSgnLi9wcm9kdWN0cy1kYXRhJylcbnZhciBiYXNrZXREYXRhID0gcmVxdWlyZSgnLi9iYXNrZXQtZGF0YScpXG5cbnZhciBwcm9kdWN0U2NoZW1hID0ge1xuICBwcm9kdWN0SWQ6IGhlbHBlcnMucm5kc3RyLFxuICBwcm9kdWN0TmFtZTogU3RyaW5nLFxuICBwcmljZTogTnVtYmVyLFxuICBpbWFnZTogU3RyaW5nLFxuICBkaXNjb3VudFBlcmNlbnQ6IE51bWJlcixcbiAgZ2V0IGNvc3QgKCkge1xuICAgIHJldHVybiB0aGlzLnByaWNlIC0gKHRoaXMucHJpY2UgKiB0aGlzLmRpc2NvdW50UGVyY2VudClcbiAgfVxufVxudmFyIHByb2R1Y3RzU2NoZW1hID0gW3Byb2R1Y3RTY2hlbWFdXG52YXIgYmFza2V0U2NoZW1hID0ge1xuICBzb3J0Qnk6IFN0cmluZyxcbiAgaXRlbXM6IFt7XG4gICAgaWQ6IGhlbHBlcnMucm5kc3RyLFxuICAgIHByb2R1Y3RJZDogaGVscGVycy5ybmRzdHIsXG4gICAgcXVhbnRpdHk6IE51bWJlcixcbiAgICBnZXQgY29zdCAoKSB7XG4gICAgICB2YXIgcHJvZHVjdCA9IHRoaXMucHJvZHVjdFxuICAgICAgcmV0dXJuIHRoaXMucXVhbnRpdHkgKiAocHJvZHVjdC5wcmljZSAtIChwcm9kdWN0LnByaWNlICogcHJvZHVjdC5kaXNjb3VudFBlcmNlbnQpKVxuICAgIH0sXG4gICAgZ2V0IHByb2R1Y3QgKCkge1xuICAgICAgdmFyIGlkID0gdGhpcy5wcm9kdWN0SWRcblxuICAgICAgLy8gVGhpcyBmdW5jdGlvbiBsb29rcyB1cCB0aGUgcHJvZHVjdCBmcm9tIHRoZSBwcm9kdWN0cyBsaXN0LiBXZSBjYW4gZ2V0IHRoZSBsaXN0IG9mIHByb2R1Y3RzXG4gICAgICAvLyBieSBsb29raW5nIHVwIHRvIHRoZSByb290IG9mIHRoZSBvYmplY3QgKHRoZSBsYXN0IGFuY2VzdG9yKSB3aGljaCBpbiBvdXIgY2FzZSBpcyB0aGUgYGFwcGAgbW9kZWwgaW5zdGFuY2UuXG4gICAgICAvLyBXaGlsZSB0aGlzIG9iamVjdCB0cmF2ZXJzYWwgaXMgcG9zc2libGUgdXNpbmcgc3VwZXJtb2RlbHMuanMsIGl0J3Mgb25seSBoZXJlIGZvciB0aGUgcHVycG9zZXMgb2YgdGhlIGV4YW1wbGUuXG4gICAgICB2YXIgYXBwID0gdGhpcy5fX2FuY2VzdG9yc1t0aGlzLl9fYW5jZXN0b3JzLmxlbmd0aCAtIDFdXG4gICAgICByZXR1cm4gYXBwLnByb2R1Y3RzLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5wcm9kdWN0SWQgPT09IGlkXG4gICAgICB9KVswXVxuICAgIH1cbiAgfV0sXG4gIGdldCB0b3RhbENvc3QgKCkge1xuICAgIHZhciB0b3RhbCA9IDBcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLml0ZW1zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB0b3RhbCArPSB0aGlzLml0ZW1zW2ldLmNvc3RcbiAgICB9XG5cbiAgICByZXR1cm4gdG90YWxcbiAgfSxcbiAgZ2V0IHRvdGFsUXVhbnRpdHkgKCkge1xuICAgIHZhciB0b3RhbCA9IDBcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLml0ZW1zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB0b3RhbCArPSB0aGlzLml0ZW1zW2ldLnF1YW50aXR5XG4gICAgfVxuXG4gICAgcmV0dXJuIHRvdGFsXG4gIH0sXG4gIGdldCBzb3J0ZWRJdGVtcyAoKSB7XG4gICAgdmFyIGl0ZW1zID0gdGhpcy5pdGVtcy5zbGljZSgpXG4gICAgdmFyIHNvcnRCeSA9IHRoaXMuc29ydEJ5XG5cbiAgICBpdGVtcy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICBpZiAoYVtzb3J0QnldIDwgYltzb3J0QnldKSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfVxuICAgICAgaWYgKGFbc29ydEJ5XSA+IGJbc29ydEJ5XSkge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgICAgcmV0dXJuIDBcbiAgICB9KVxuXG4gICAgcmV0dXJuIGl0ZW1zXG4gIH1cbn1cblxudmFyIEJhc2tldCA9IHN1cGVybW9kZWxzKGJhc2tldFNjaGVtYSlcbnZhciBQcm9kdWN0cyA9IHN1cGVybW9kZWxzKHByb2R1Y3RzU2NoZW1hKVxuXG52YXIgYXBwU2NoZW1hID0ge1xuICBiYXNrZXQ6IEJhc2tldCxcbiAgcHJvZHVjdHM6IFByb2R1Y3RzXG59XG5cbnZhciBBcHAgPSBzdXBlcm1vZGVscyhhcHBTY2hlbWEpXG5cbndpbmRvdy5hcHBzID0gW11cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZWwpIHtcbiAgdmFyIGFwcCA9IG5ldyBBcHAoe1xuICAgIGJhc2tldDogbmV3IEJhc2tldChiYXNrZXREYXRhKSxcbiAgICBwcm9kdWN0czogbmV3IFByb2R1Y3RzKHByb2R1Y3RzRGF0YSlcbiAgfSlcblxuICBmdW5jdGlvbiByZW5kZXIgKCkge1xuICAgIHBhdGNoKGVsLCB0ZW1wbGF0ZSwgYXBwKVxuICB9XG4gIHJlbmRlcigpXG5cbiAgLyogcGF0Y2ggdGhlIGRvbSB3aGVuZXZlciB0aGUgYXBwIG1vZGVsIGNoYW5nZXMuICovXG4gIGFwcC5vbignY2hhbmdlJywgcmVuZGVyKVxuXG4gIHdpbmRvdy5hcHBzLnB1c2goYXBwKVxufVxuIiwidmFyIEluY3JlbWVudGFsRE9NID0gcmVxdWlyZSgnaW5jcmVtZW50YWwtZG9tJylcbnZhciBwYXRjaCA9IEluY3JlbWVudGFsRE9NLnBhdGNoXG52YXIgZWxlbWVudE9wZW4gPSBJbmNyZW1lbnRhbERPTS5lbGVtZW50T3BlblxudmFyIGVsZW1lbnRWb2lkID0gSW5jcmVtZW50YWxET00uZWxlbWVudFZvaWRcbnZhciBlbGVtZW50Q2xvc2UgPSBJbmNyZW1lbnRhbERPTS5lbGVtZW50Q2xvc2VcbnZhciB0ZXh0ID0gSW5jcmVtZW50YWxET00udGV4dFxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlc2NyaXB0aW9uIChkYXRhKSB7XG5lbGVtZW50T3BlbihcImgzXCIpXG4gIHRleHQoXCIgXFxcbiAgICBUb3RhbCBsaW5lcyBcIiArIChkYXRhLml0ZW1zLmxlbmd0aCkgKyBcIiwgdG90YWwgcXVhbnRpdHkgXCIgKyAoZGF0YS50b3RhbFF1YW50aXR5KSArIFwiIFxcXG4gIFwiKVxuZWxlbWVudENsb3NlKFwiaDNcIilcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz1bXG4gIHtcbiAgICBcInByb2R1Y3RJZFwiOiBcImRzZjFmXCIsXG4gICAgXCJwcm9kdWN0TmFtZVwiOiBcIkFwcGxlIGlQb2QgdG91Y2ggMzJHQiA1dGggR2VuZXJhdGlvbiAtIFdoaXRlXCIsXG4gICAgXCJwcmljZVwiOiAxOTAuNTAsXG4gICAgXCJkaXNjb3VudFBlcmNlbnRcIjogMCxcbiAgICBcImltYWdlXCI6IFwiYmFza2V0L2ltZy9hcHBsZS5qcGdcIlxuICB9LFxuICB7XG4gICAgXCJwcm9kdWN0SWRcIjogXCJkcjZoYlwiLFxuICAgIFwicHJvZHVjdE5hbWVcIjogXCJTYW1zdW5nIEdhbGF4eSBUYWIgMyA3LWluY2ggLSAoQmxhY2ssIFdpLUZpKVwiLFxuICAgIFwicHJpY2VcIjogMTEwLFxuICAgIFwiZGlzY291bnRQZXJjZW50XCI6IDAuMixcbiAgICBcImltYWdlXCI6IFwiYmFza2V0L2ltZy9zYW1zdW5nLmpwZ1wiXG4gIH0sXG4gIHtcbiAgICBcInByb2R1Y3RJZFwiOiBcInNkcjRmXCIsXG4gICAgXCJwcm9kdWN0TmFtZVwiOiBcIkJvc2UgUXVpZXRDb21mb3J0IDIwIEFjb3VzdGljIE5vaXNlIENhbmNlbGxpbmcgSGVhZHBob25lc1wiLFxuICAgIFwicHJpY2VcIjogMjUwLFxuICAgIFwiZGlzY291bnRQZXJjZW50XCI6IDAuMTI1LFxuICAgIFwiaW1hZ2VcIjogXCJiYXNrZXQvaW1nL2Jvc2UuanBnXCJcbiAgfVxuXVxuIiwidmFyIEluY3JlbWVudGFsRE9NID0gcmVxdWlyZSgnaW5jcmVtZW50YWwtZG9tJylcbnZhciBwYXRjaCA9IEluY3JlbWVudGFsRE9NLnBhdGNoXG52YXIgZWxlbWVudE9wZW4gPSBJbmNyZW1lbnRhbERPTS5lbGVtZW50T3BlblxudmFyIGVsZW1lbnRWb2lkID0gSW5jcmVtZW50YWxET00uZWxlbWVudFZvaWRcbnZhciBlbGVtZW50Q2xvc2UgPSBJbmNyZW1lbnRhbERPTS5lbGVtZW50Q2xvc2VcbnZhciB0ZXh0ID0gSW5jcmVtZW50YWxET00udGV4dFxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJhc2tldCAobW9kZWwpIHtcbiAgdmFyIGJhc2tldCA9IG1vZGVsLmJhc2tldFxuICAgICAgdmFyIHByb2R1Y3RzID0gbW9kZWwucHJvZHVjdHNcbiAgICAgIHZhciBsaW5lc1N1bW1hcnkgPSByZXF1aXJlKCcuL2xpbmVzLXN1bW1hcnkuaHRtbCcpXG4gICAgICB2YXIgdG90YWxTdW1tYXJ5ID0gcmVxdWlyZSgnLi90b3RhbC1zdW1tYXJ5Lmh0bWwnKVxuXG4gICAgICBmdW5jdGlvbiBhZGQgKHByb2R1Y3QpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gYmFza2V0Lml0ZW1zXG5cbiAgICAgICAgdmFyIGV4aXN0aW5nO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaVxuICA8IGJhc2tldC5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChiYXNrZXQuaXRlbXNbaV0ucHJvZHVjdElkID09PSBwcm9kdWN0LnByb2R1Y3RJZCkge1xuICAgICAgICAgICAgZXhpc3RpbmcgPSBiYXNrZXQuaXRlbXNbaV1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgICAgZXhpc3RpbmcucXVhbnRpdHkrK1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBpdGVtID0gaXRlbXMuY3JlYXRlKClcbiAgICAgICAgICBpdGVtLnByb2R1Y3RJZCA9IHByb2R1Y3QucHJvZHVjdElkXG4gICAgICAgICAgaXRlbS5xdWFudGl0eSA9IDFcbiAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmVtb3ZlICgkaW5kZXgpIHtcbiAgICAgICAgYmFza2V0Lml0ZW1zLnNwbGljZSgkaW5kZXgsIDEpXG4gICAgICB9XG5cbiAgICAgIHZhciBzb3J0QnkgPSBiYXNrZXQuc29ydEJ5XG4gICAgICB2YXIgc29ydEJ5VGVybXMgPSBbJ2Nvc3QnLCAncXVhbnRpdHknLCAncHJvZHVjdElkJ11cbiAgZWxlbWVudE9wZW4oXCJzZWxlY3RcIiwgbnVsbCwgW1wiY2xhc3NcIiwgXCJwdWxsLXJpZ2h0XCJdLCBcIm9uY2hhbmdlXCIsIGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgJGVsZW1lbnQgPSB0aGlzO1xuICBiYXNrZXQuc29ydEJ5ID0gdGhpcy52YWx1ZX0pXG4gICAgZWxlbWVudE9wZW4oXCJvcHRpb25cIilcbiAgICAgIHRleHQoXCJTb3J0IGJ5OlwiKVxuICAgIGVsZW1lbnRDbG9zZShcIm9wdGlvblwiKVxuICAgIDsoQXJyYXkuaXNBcnJheShzb3J0QnlUZXJtcykgPyBzb3J0QnlUZXJtcyA6IE9iamVjdC5rZXlzKHNvcnRCeVRlcm1zKSkuZm9yRWFjaChmdW5jdGlvbih0ZXJtLCAkaW5kZXgpIHtcbiAgICAgIGVsZW1lbnRPcGVuKFwib3B0aW9uXCIsICRpbmRleCwgbnVsbCwgXCJ2YWx1ZVwiLCB0ZXJtKVxuICAgICAgICB0ZXh0KFwiXCIgKyAodGVybSkgKyBcIlwiKVxuICAgICAgZWxlbWVudENsb3NlKFwib3B0aW9uXCIpXG4gICAgfSwgc29ydEJ5VGVybXMpXG4gIGVsZW1lbnRDbG9zZShcInNlbGVjdFwiKVxuICBsaW5lc1N1bW1hcnkoYmFza2V0KVxuICBpZiAoYmFza2V0Lml0ZW1zLmxlbmd0aCkge1xuICAgIGVsZW1lbnRPcGVuKFwidGFibGVcIiwgbnVsbCwgW1wiY2xhc3NcIiwgXCJ0YWJsZVwiXSlcbiAgICAgIGVsZW1lbnRPcGVuKFwidGhlYWRcIilcbiAgICAgICAgZWxlbWVudE9wZW4oXCJ0clwiKVxuICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGhcIilcbiAgICAgICAgICAgIHRleHQoXCJpZFwiKVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRoXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJ0aFwiKVxuICAgICAgICAgICAgdGV4dChcInByb2R1Y3RJZFwiKVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRoXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJ0aFwiKVxuICAgICAgICAgICAgdGV4dChcInByb2R1Y3ROYW1lXCIpXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwidGhcIilcbiAgICAgICAgICBlbGVtZW50T3BlbihcInRoXCIpXG4gICAgICAgICAgICB0ZXh0KFwicXVhbnRpdHlcIilcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0aFwiKVxuICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGhcIilcbiAgICAgICAgICAgIHRleHQoXCJwcmljZVwiKVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRoXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJ0aFwiKVxuICAgICAgICAgICAgdGV4dChcImRpc2NvdW50UGVyY2VudFwiKVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRoXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJ0aFwiKVxuICAgICAgICAgICAgdGV4dChcImNvc3RcIilcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0aFwiKVxuICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGhcIilcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0aFwiKVxuICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0clwiKVxuICAgICAgZWxlbWVudENsb3NlKFwidGhlYWRcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwidGJvZHlcIilcbiAgICAgICAgOyhBcnJheS5pc0FycmF5KGJhc2tldC5zb3J0ZWRJdGVtcykgPyBiYXNrZXQuc29ydGVkSXRlbXMgOiBPYmplY3Qua2V5cyhiYXNrZXQuc29ydGVkSXRlbXMpKS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sICRpbmRleCkge1xuICAgICAgICAgIGVsZW1lbnRPcGVuKFwidHJcIiwgaXRlbS5pZClcbiAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICAgICAgdGV4dChcIlwiICsgKGl0ZW0uaWQpICsgXCJcIilcbiAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgICAgIHRleHQoXCJcIiArIChpdGVtLnByb2R1Y3QucHJvZHVjdElkKSArIFwiXCIpXG4gICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgICAgICB0ZXh0KFwiXCIgKyAoaXRlbS5wcm9kdWN0LnByb2R1Y3ROYW1lKSArIFwiXCIpXG4gICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgICAgICBlbGVtZW50T3BlbihcImlucHV0XCIsIG51bGwsIFtcInR5cGVcIiwgXCJudW1iZXJcIl0sIFwidmFsdWVcIiwgaXRlbS5xdWFudGl0eSwgXCJvbmNoYW5nZVwiLCBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gdGhpcztcbiAgICAgICAgICAgICAgaXRlbS5xdWFudGl0eSA9IHRoaXMudmFsdWV9KVxuICAgICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJpbnB1dFwiKVxuICAgICAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICAgICAgdGV4dChcIlwiICsgKGl0ZW0ucHJvZHVjdC5wcmljZSkgKyBcIlwiKVxuICAgICAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICAgICAgdGV4dChcIlwiICsgKGl0ZW0ucHJvZHVjdC5kaXNjb3VudFBlcmNlbnQgKiAxMDAgKyAnICUnKSArIFwiXCIpXG4gICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgICAgICB0ZXh0KFwiXCIgKyAoaXRlbS5jb3N0LnRvRml4ZWQoMikpICsgXCJcIilcbiAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwiYnV0dG9uXCIsIG51bGwsIFtcImNsYXNzXCIsIFwiYnRuIGJ0bi1zbSBidG4tZGFuZ2VyXCJdLCBcIm9uY2xpY2tcIiwgZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHZhciAkZWxlbWVudCA9IHRoaXM7XG4gICAgICAgICAgICAgIHJlbW92ZSgkaW5kZXgpfSlcbiAgICAgICAgICAgICAgICB0ZXh0KFwiUmVtb3ZlXCIpXG4gICAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcImJ1dHRvblwiKVxuICAgICAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0clwiKVxuICAgICAgICB9LCBiYXNrZXQuc29ydGVkSXRlbXMpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJ0Ym9keVwiKVxuICAgICAgdG90YWxTdW1tYXJ5KGJhc2tldClcbiAgICBlbGVtZW50Q2xvc2UoXCJ0YWJsZVwiKVxuICB9XG4gIGlmICghYmFza2V0Lml0ZW1zLmxlbmd0aCkge1xuICAgIGVsZW1lbnRPcGVuKFwiZGl2XCIsIG51bGwsIFtcImNsYXNzXCIsIFwiYWxlcnQgYWxlcnQtaW5mb1wiXSlcbiAgICAgIHRleHQoXCJZb3UgaGF2ZSBubyBpdGVtcyBpbiB5b3VyIGJhc2tldCFcIilcbiAgICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbiAgfVxuICA7KEFycmF5LmlzQXJyYXkocHJvZHVjdHMpID8gcHJvZHVjdHMgOiBPYmplY3Qua2V5cyhwcm9kdWN0cykpLmZvckVhY2goZnVuY3Rpb24ocHJvZHVjdCwgJGluZGV4KSB7XG4gICAgZWxlbWVudE9wZW4oXCJkaXZcIiwgJGluZGV4LCBbXCJzdHlsZVwiLCBcIndpZHRoOiAzMyU7IGZsb2F0OiBsZWZ0O1wiXSlcbiAgICAgIGVsZW1lbnRPcGVuKFwiZGl2XCIpXG4gICAgICAgIHRleHQoXCJcIiArIChwcm9kdWN0LnByb2R1Y3RJZCkgKyBcIlwiKVxuICAgICAgZWxlbWVudENsb3NlKFwiZGl2XCIpXG4gICAgICBlbGVtZW50T3BlbihcImRpdlwiKVxuICAgICAgICB0ZXh0KFwiXCIgKyAocHJvZHVjdC5wcm9kdWN0TmFtZSkgKyBcIlwiKVxuICAgICAgZWxlbWVudENsb3NlKFwiZGl2XCIpXG4gICAgICBlbGVtZW50T3BlbihcImRpdlwiKVxuICAgICAgICB0ZXh0KFwiXCIgKyAocHJvZHVjdC5wcmljZSkgKyBcIlwiKVxuICAgICAgZWxlbWVudENsb3NlKFwiZGl2XCIpXG4gICAgICBlbGVtZW50T3BlbihcImRpdlwiKVxuICAgICAgICB0ZXh0KFwiXCIgKyAocHJvZHVjdC5kaXNjb3VudFBlcmNlbnQgKiAxMDAgKyAnICUnKSArIFwiXCIpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwiZGl2XCIpXG4gICAgICAgIHRleHQoXCJcIiArIChwcm9kdWN0LmNvc3QpICsgXCJcIilcbiAgICAgIGVsZW1lbnRDbG9zZShcImRpdlwiKVxuICAgICAgZWxlbWVudE9wZW4oXCJpbWdcIiwgbnVsbCwgW1wic3R5bGVcIiwgXCJtYXgtd2lkdGg6IDI0MHB4OyBtYXgtaGVpZ2h0OiAyMDBweDtcIl0sIFwic3JjXCIsIHByb2R1Y3QuaW1hZ2UpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJpbWdcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwiYnV0dG9uXCIsIG51bGwsIFtcImNsYXNzXCIsIFwiYnRuIGJ0bi1zbSBidG4tc3VjY2Vzc1wiXSwgXCJvbmNsaWNrXCIsIGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciAkZWxlbWVudCA9IHRoaXM7XG4gICAgICBhZGQocHJvZHVjdCl9KVxuICAgICAgICB0ZXh0KFwiQWRkIHRvIGJhc2tldFwiKVxuICAgICAgZWxlbWVudENsb3NlKFwiYnV0dG9uXCIpXG4gICAgZWxlbWVudENsb3NlKFwiZGl2XCIpXG4gIH0sIHByb2R1Y3RzKVxuICA7KEFycmF5LmlzQXJyYXkobW9kZWwpID8gbW9kZWwgOiBPYmplY3Qua2V5cyhtb2RlbCkpLmZvckVhY2goZnVuY3Rpb24oa2V5LCAkaW5kZXgpIHtcbiAgICBlbGVtZW50T3BlbihcImRpdlwiLCBrZXkpXG4gICAgICBlbGVtZW50T3BlbihcInNwYW5cIilcbiAgICAgICAgdGV4dChcIlwiICsgKGtleSkgKyBcIlwiKVxuICAgICAgZWxlbWVudENsb3NlKFwic3BhblwiKVxuICAgICAgZWxlbWVudE9wZW4oXCJzcGFuXCIpXG4gICAgICAgIHRleHQoXCJcIiArICgkaW5kZXgpICsgXCJcIilcbiAgICAgIGVsZW1lbnRDbG9zZShcInNwYW5cIilcbiAgICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbiAgfSwgbW9kZWwpXG4gIGVsZW1lbnRPcGVuKFwicHJlXCIpXG4gICAgZWxlbWVudE9wZW4oXCJjb2RlXCIpXG4gICAgICB0ZXh0KFwiIFxcXG4gICAgICAgICAgXCIgKyAoSlNPTi5zdHJpbmdpZnkobW9kZWwsIG51bGwsIDIpKSArIFwiIFxcXG4gICAgICAgICAgXCIpXG4gICAgZWxlbWVudENsb3NlKFwiY29kZVwiKVxuICAgIGVsZW1lbnRPcGVuKFwicHJlXCIpXG4gICAgZWxlbWVudENsb3NlKFwicHJlXCIpXG4gIGVsZW1lbnRDbG9zZShcInByZVwiKVxufTtcbiIsInZhciBJbmNyZW1lbnRhbERPTSA9IHJlcXVpcmUoJ2luY3JlbWVudGFsLWRvbScpXG52YXIgcGF0Y2ggPSBJbmNyZW1lbnRhbERPTS5wYXRjaFxudmFyIGVsZW1lbnRPcGVuID0gSW5jcmVtZW50YWxET00uZWxlbWVudE9wZW5cbnZhciBlbGVtZW50Vm9pZCA9IEluY3JlbWVudGFsRE9NLmVsZW1lbnRWb2lkXG52YXIgZWxlbWVudENsb3NlID0gSW5jcmVtZW50YWxET00uZWxlbWVudENsb3NlXG52YXIgdGV4dCA9IEluY3JlbWVudGFsRE9NLnRleHRcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZXNjcmlwdGlvbiAoZGF0YSkge1xuZWxlbWVudE9wZW4oXCJ0Zm9vdFwiKVxuICBlbGVtZW50T3BlbihcInRyXCIpXG4gICAgZWxlbWVudE9wZW4oXCJ0ZFwiLCBudWxsLCBbXCJjb2xzcGFuXCIsIFwiOFwiXSlcbiAgICAgIGVsZW1lbnRPcGVuKFwiaDNcIilcbiAgICAgICAgdGV4dChcIiBcXFxuICAgICAgICAgICAgICAgIFwiICsgKGRhdGEudG90YWxDb3N0KSArIFwiIFxcXG4gICAgICAgICAgICAgIFwiKVxuICAgICAgZWxlbWVudENsb3NlKFwiaDNcIilcbiAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICBlbGVtZW50Q2xvc2UoXCJ0clwiKVxuZWxlbWVudENsb3NlKFwidGZvb3RcIilcbn07XG4iLCJmdW5jdGlvbiBybmRzdHIgKCkge1xuICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDUpXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBybmRzdHI6IHtcbiAgICBfX3ZhbHVlOiBybmRzdHJcbiAgfVxufVxuIiwidmFyIGJhc2tldCA9IHJlcXVpcmUoJy4vYmFza2V0JylcbnZhciB0b2RvID0gcmVxdWlyZSgnLi90b2RvJylcblxud2luZG93LmJhc2tldCA9IGJhc2tldFxud2luZG93LnRvZG8gPSB0b2RvXG4iLCJ2YXIgSW5jcmVtZW50YWxET00gPSByZXF1aXJlKCdpbmNyZW1lbnRhbC1kb20nKVxudmFyIHBhdGNoID0gSW5jcmVtZW50YWxET00ucGF0Y2hcbnZhciBlbGVtZW50T3BlbiA9IEluY3JlbWVudGFsRE9NLmVsZW1lbnRPcGVuXG52YXIgZWxlbWVudFZvaWQgPSBJbmNyZW1lbnRhbERPTS5lbGVtZW50Vm9pZFxudmFyIGVsZW1lbnRDbG9zZSA9IEluY3JlbWVudGFsRE9NLmVsZW1lbnRDbG9zZVxudmFyIHRleHQgPSBJbmNyZW1lbnRhbERPTS50ZXh0XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9kb0xpc3RzIChsaXN0cykge1xuICB2YXIgdG9kbyA9IHJlcXVpcmUoJy4vdG9kby5odG1sJylcblxuICAgIGZ1bmN0aW9uIGFkZE5ld0xpc3QgKCkge1xuICAgICAgdmFyIG5ld0xpc3QgPSBsaXN0cy5jcmVhdGUoKVxuICAgICAgbGlzdHMucHVzaChuZXdMaXN0KVxuICAgIH1cbiAgZWxlbWVudE9wZW4oXCJkaXZcIiwgbnVsbCwgW1wiY2xhc3NcIiwgXCJjbGVhcmZpeFwiXSlcbiAgICA7KEFycmF5LmlzQXJyYXkobGlzdHMpID8gbGlzdHMgOiBPYmplY3Qua2V5cyhsaXN0cykpLmZvckVhY2goZnVuY3Rpb24obGlzdCwgJGluZGV4KSB7XG4gICAgICBlbGVtZW50T3BlbihcImRpdlwiLCAkaW5kZXgsIFtcInN0eWxlXCIsIFwid2lkdGg6IDMzJTsgZmxvYXQ6IGxlZnQ7IGhlaWdodDogMzAwcHg7IG92ZXJmbG93OiBhdXRvOyBwYWRkaW5nOiA1cHg7IGJvcmRlcjogMXB4IGRhc2hlZCAjNjY2O1wiXSlcbiAgICAgICAgdG9kbyhsaXN0KVxuICAgICAgZWxlbWVudENsb3NlKFwiZGl2XCIpXG4gICAgfSwgbGlzdHMpXG4gIGVsZW1lbnRDbG9zZShcImRpdlwiKVxuICBlbGVtZW50T3BlbihcImJ1dHRvblwiLCBudWxsLCBbXCJjbGFzc1wiLCBcImJ0biBidG4tc20gYnRuLXN1Y2Nlc3NcIl0sIFwib25jbGlja1wiLCBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdmFyICRlbGVtZW50ID0gdGhpcztcbiAgYWRkTmV3TGlzdCgpfSlcbiAgICB0ZXh0KFwiQWRkIG5ldyB0b2RvIGxpc3RcIilcbiAgZWxlbWVudENsb3NlKFwiYnV0dG9uXCIpXG4gIGVsZW1lbnRPcGVuKFwicHJlXCIpXG4gICAgdGV4dChcIlwiICsgKEpTT04uc3RyaW5naWZ5KGxpc3RzLCBudWxsLCAyKSkgKyBcIlwiKVxuICBlbGVtZW50Q2xvc2UoXCJwcmVcIilcbn07XG4iLCJ2YXIgbGlzdCA9IHJlcXVpcmUoJy4vaW5kZXguaHRtbCcpXG52YXIgcGF0Y2ggPSByZXF1aXJlKCdpbmNyZW1lbnRhbC1kb20nKS5wYXRjaFxudmFyIHN1cGVybW9kZWxzID0gcmVxdWlyZSgnc3VwZXJtb2RlbHMuanMnKVxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJylcblxudmFyIFRvZG8gPSBzdXBlcm1vZGVscyh7XG4gIGlkOiBoZWxwZXJzLnJuZHN0cixcbiAgdGV4dDogU3RyaW5nLFxuICBjb21wbGV0ZWQ6IEJvb2xlYW5cbn0pXG52YXIgVG9kb3MgPSBzdXBlcm1vZGVscyhbVG9kb10pXG52YXIgTGlzdHMgPSBzdXBlcm1vZGVscyhbVG9kb3NdKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbCkge1xuICB2YXIgbGlzdHMgPSBuZXcgTGlzdHMoW1tcbiAgICB7XG4gICAgICB0ZXh0OiAnUGhvbmUgbXVtJyxcbiAgICAgIGNvbXBsZXRlZDogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6ICdEbyBzaG9wcGluZycsXG4gICAgICBjb21wbGV0ZWQ6IHRydWVcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6ICdXcml0ZSBlbWFpbCB0byBCcmlhbicsXG4gICAgICBjb21wbGV0ZWQ6IHRydWVcbiAgICB9XG4gIF1dKVxuXG4gIGZ1bmN0aW9uIHJlbmRlciAoKSB7XG4gICAgcGF0Y2goZWwsIGxpc3QsIGxpc3RzKVxuICB9XG4gIHJlbmRlcigpXG5cbiAgbGlzdHMub24oJ2NoYW5nZScsIHJlbmRlcilcbn1cbiIsInZhciBJbmNyZW1lbnRhbERPTSA9IHJlcXVpcmUoJ2luY3JlbWVudGFsLWRvbScpXG52YXIgcGF0Y2ggPSBJbmNyZW1lbnRhbERPTS5wYXRjaFxudmFyIGVsZW1lbnRPcGVuID0gSW5jcmVtZW50YWxET00uZWxlbWVudE9wZW5cbnZhciBlbGVtZW50Vm9pZCA9IEluY3JlbWVudGFsRE9NLmVsZW1lbnRWb2lkXG52YXIgZWxlbWVudENsb3NlID0gSW5jcmVtZW50YWxET00uZWxlbWVudENsb3NlXG52YXIgdGV4dCA9IEluY3JlbWVudGFsRE9NLnRleHRcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b2RvcyAodG9kb3MpIHtcbiAgZnVuY3Rpb24gYWRkIChmb3JtKSB7XG4gICAgICB2YXIgbmV3VG9kbyA9IHRvZG9zLmNyZWF0ZSgpXG4gICAgICBuZXdUb2RvLnRleHQgPSBmb3JtLm5ld1RvZG8udmFsdWVcbiAgICAgIHRvZG9zLnB1c2gobmV3VG9kbylcbiAgICAgIGZvcm0ubmV3VG9kby5zZWxlY3QoKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFyQ29tcGxldGVkIChpbmRleCkge1xuICAgICAgdmFyIGxlbiA9IHRvZG9zLmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IGxlbiAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGlmICh0b2Rvc1tpXS5jb21wbGV0ZWQpIHtcbiAgICAgICAgICB0b2Rvcy5zcGxpY2UoaSwgMSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvZ2dsZUNvbXBsZXRlZCAoc3RhdGUpIHtcbiAgICAgIHRvZG9zLmZvckVhY2goZnVuY3Rpb24odG9kbykge1xuICAgICAgICB0b2RvLmNvbXBsZXRlZCA9IHN0YXRlXG4gICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvdGFsQ29tcGxldGVkICgpIHtcbiAgICAgIHJldHVybiB0b2Rvcy5maWx0ZXIoZnVuY3Rpb24gKHRvZG8pIHtcbiAgICAgICAgcmV0dXJuIHRvZG8uY29tcGxldGVkXG4gICAgICB9KS5sZW5ndGhcbiAgICB9XG4gIGVsZW1lbnRPcGVuKFwidGFibGVcIilcbiAgICBlbGVtZW50T3BlbihcInRoZWFkXCIpXG4gICAgICBlbGVtZW50T3BlbihcInRyXCIpXG4gICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgIGVsZW1lbnRPcGVuKFwiZm9ybVwiLCBudWxsLCBudWxsLCBcIm9uc3VibWl0XCIsIGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gdGhpcztcbiAgICAgICAgICBhZGQoJGVsZW1lbnQpfSlcbiAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwiaW5wdXRcIiwgbnVsbCwgW1widHlwZVwiLCBcInRleHRcIiwgXCJuYW1lXCIsIFwibmV3VG9kb1wiLCBcImNsYXNzXCIsIFwiZm9ybS1jb250cm9sXCIsIFwicGxhY2Vob2xkZXJcIiwgXCJFbnRlciBuZXcgdG9kb1wiXSlcbiAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcImlucHV0XCIpXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwiZm9ybVwiKVxuICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJpbnB1dFwiLCBudWxsLCBbXCJ0eXBlXCIsIFwiY2hlY2tib3hcIl0sIFwib25jaGFuZ2VcIiwgZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSB0aGlzO1xuICAgICAgICAgIHRvZ2dsZUNvbXBsZXRlZCh0aGlzLmNoZWNrZWQpfSlcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJpbnB1dFwiKVxuICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgZWxlbWVudENsb3NlKFwidHJcIilcbiAgICBlbGVtZW50Q2xvc2UoXCJ0aGVhZFwiKVxuICAgIGVsZW1lbnRPcGVuKFwidGJvZHlcIilcbiAgICAgIDsoQXJyYXkuaXNBcnJheSh0b2RvcykgPyB0b2RvcyA6IE9iamVjdC5rZXlzKHRvZG9zKSkuZm9yRWFjaChmdW5jdGlvbih0b2RvLCAkaW5kZXgpIHtcbiAgICAgICAgZWxlbWVudE9wZW4oXCJ0clwiLCB0b2RvLmlkKVxuICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICAgIHRleHQoXCJcIiArICgkaW5kZXggKyAxKSArIFwiLlwiKVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgICAgZWxlbWVudE9wZW4oXCJpbnB1dFwiLCBudWxsLCBbXCJ0eXBlXCIsIFwidGV4dFwiLCBcImNsYXNzXCIsIFwiZm9ybS1jb250cm9sXCJdLCBcInZhbHVlXCIsIHRvZG8udGV4dCwgXCJvbmtleXVwXCIsIGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIHZhciAkZWxlbWVudCA9IHRoaXM7XG4gICAgICAgICAgICB0b2RvLnRleHQgPSB0aGlzLnZhbHVlfSwgXCJzdHlsZVwiLCB7IGJvcmRlckNvbG9yOiB0b2RvLnRleHQgPyAnJzogJ3JlZCcsIHRleHREZWNvcmF0aW9uOiB0b2RvLmNvbXBsZXRlZCA/ICdsaW5lLXRocm91Z2gnOiAnJyB9KVxuICAgICAgICAgICAgZWxlbWVudENsb3NlKFwiaW5wdXRcIilcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwiaW5wdXRcIiwgbnVsbCwgW1widHlwZVwiLCBcImNoZWNrYm94XCJdLCBcImNoZWNrZWRcIiwgdG9kby5jb21wbGV0ZWQsIFwib25jaGFuZ2VcIiwgZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gdGhpcztcbiAgICAgICAgICAgIHRvZG8uY29tcGxldGVkID0gdGhpcy5jaGVja2VkfSlcbiAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcImlucHV0XCIpXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgZWxlbWVudENsb3NlKFwidHJcIilcbiAgICAgIH0sIHRvZG9zKVxuICAgICAgZWxlbWVudE9wZW4oXCJ0clwiKVxuICAgICAgZWxlbWVudENsb3NlKFwidHJcIilcbiAgICBlbGVtZW50Q2xvc2UoXCJ0Ym9keVwiKVxuICAgIGVsZW1lbnRPcGVuKFwidGZvb3RcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwidHJcIilcbiAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgIHRleHQoXCJUb3RhbCBcIiArICh0b2Rvcy5sZW5ndGgpICsgXCJcIilcbiAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiLCBudWxsLCBbXCJjb2xzcGFuXCIsIFwiMlwiXSlcbiAgICAgICAgICBpZiAodG90YWxDb21wbGV0ZWQoKSkge1xuICAgICAgICAgICAgZWxlbWVudE9wZW4oXCJidXR0b25cIiwgbnVsbCwgW1wiY2xhc3NcIiwgXCJidG4gYnRuLXNtIGJ0bi1kYW5nZXIgcHVsbC1yaWdodFwiXSwgXCJvbmNsaWNrXCIsIGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIHZhciAkZWxlbWVudCA9IHRoaXM7XG4gICAgICAgICAgICBjbGVhckNvbXBsZXRlZCgpfSlcbiAgICAgICAgICAgICAgdGV4dChcIkNsZWFyIGNvbXBsZXRlZCBcIiArICh0b3RhbENvbXBsZXRlZCgpKSArIFwiXCIpXG4gICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJidXR0b25cIilcbiAgICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJ0clwiKVxuICAgIGVsZW1lbnRDbG9zZShcInRmb290XCIpXG4gIGVsZW1lbnRDbG9zZShcInRhYmxlXCIpXG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6IHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOiBmYWN0b3J5KGdsb2JhbC5JbmNyZW1lbnRhbERPTSA9IHt9KTtcbn0pKHRoaXMsIGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogQHR5cGUge1RyZWVXYWxrZXJ9XG4gICAqL1xuXG4gIHZhciBfbXV0YXRvcnMyO1xuXG4gIHZhciB3YWxrZXJfO1xuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtUcmVlV2Fsa2VyfSB0aGUgY3VycmVudCBUcmVlV2Fsa2VyXG4gICAqL1xuICB2YXIgZ2V0V2Fsa2VyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB3YWxrZXJfO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjdXJyZW50IFRyZWVXYWxrZXJcbiAgICogQHBhcmFtIHtUcmVlV2Fsa2VyfSB3YWxrZXJcbiAgICovXG4gIHZhciBzZXRXYWxrZXIgPSBmdW5jdGlvbiAod2Fsa2VyKSB7XG4gICAgd2Fsa2VyXyA9IHdhbGtlcjtcbiAgfTtcblxuICAvKipcbiAgICogQ29weXJpZ2h0IDIwMTUgVGhlIEluY3JlbWVudGFsIERPTSBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICAgKlxuICAgKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAgKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gICAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAgKlxuICAgKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAgKlxuICAgKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gICAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAgICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gICAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBLZWVwcyB0cmFjayBvZiBpbmZvcm1hdGlvbiBuZWVkZWQgdG8gcGVyZm9ybSBkaWZmcyBmb3IgYSBnaXZlbiBET00gbm9kZS5cbiAgICogQHBhcmFtIHshc3RyaW5nfSBub2RlTmFtZVxuICAgKiBAcGFyYW0gez9zdHJpbmc9fSBrZXlcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBmdW5jdGlvbiBOb2RlRGF0YShub2RlTmFtZSwga2V5KSB7XG4gICAgLyoqXG4gICAgICogVGhlIGF0dHJpYnV0ZXMgYW5kIHRoZWlyIHZhbHVlcy5cbiAgICAgKiBAY29uc3RcbiAgICAgKi9cbiAgICB0aGlzLmF0dHJzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBBbiBhcnJheSBvZiBhdHRyaWJ1dGUgbmFtZS92YWx1ZSBwYWlycywgdXNlZCBmb3IgcXVpY2tseSBkaWZmaW5nIHRoZVxuICAgICAqIGluY29tbWluZyBhdHRyaWJ1dGVzIHRvIHNlZSBpZiB0aGUgRE9NIG5vZGUncyBhdHRyaWJ1dGVzIG5lZWQgdG8gYmVcbiAgICAgKiB1cGRhdGVkLlxuICAgICAqIEBjb25zdCB7QXJyYXk8Kj59XG4gICAgICovXG4gICAgdGhpcy5hdHRyc0FyciA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGluY29taW5nIGF0dHJpYnV0ZXMgZm9yIHRoaXMgTm9kZSwgYmVmb3JlIHRoZXkgYXJlIHVwZGF0ZWQuXG4gICAgICogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgKj59XG4gICAgICovXG4gICAgdGhpcy5uZXdBdHRycyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGtleSB1c2VkIHRvIGlkZW50aWZ5IHRoaXMgbm9kZSwgdXNlZCB0byBwcmVzZXJ2ZSBET00gbm9kZXMgd2hlbiB0aGV5XG4gICAgICogbW92ZSB3aXRoaW4gdGhlaXIgcGFyZW50LlxuICAgICAqIEBjb25zdFxuICAgICAqL1xuICAgIHRoaXMua2V5ID0ga2V5O1xuXG4gICAgLyoqXG4gICAgICogS2VlcHMgdHJhY2sgb2YgY2hpbGRyZW4gd2l0aGluIHRoaXMgbm9kZSBieSB0aGVpciBrZXkuXG4gICAgICogez9PYmplY3Q8c3RyaW5nLCAhRWxlbWVudD59XG4gICAgICovXG4gICAgdGhpcy5rZXlNYXAgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBvciBub3QgdGhlIGtleU1hcCBpcyBjdXJyZW50bHkgdmFsaWQuXG4gICAgICoge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5rZXlNYXBWYWxpZCA9IHRydWU7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbGFzdCBjaGlsZCB0byBoYXZlIGJlZW4gdmlzaXRlZCB3aXRoaW4gdGhlIGN1cnJlbnQgcGFzcy5cbiAgICAgKiBAdHlwZSB7P05vZGV9XG4gICAgICovXG4gICAgdGhpcy5sYXN0VmlzaXRlZENoaWxkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBub2RlIG5hbWUgZm9yIHRoaXMgbm9kZS5cbiAgICAgKiBAY29uc3Qge3N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLm5vZGVOYW1lID0gbm9kZU5hbWU7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7P3N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLnRleHQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGEgTm9kZURhdGEgb2JqZWN0IGZvciBhIE5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZSBUaGUgbm9kZSB0byBpbml0aWFsaXplIGRhdGEgZm9yLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbm9kZU5hbWUgVGhlIG5vZGUgbmFtZSBvZiBub2RlLlxuICAgKiBAcGFyYW0gez9zdHJpbmc9fSBrZXkgVGhlIGtleSB0aGF0IGlkZW50aWZpZXMgdGhlIG5vZGUuXG4gICAqIEByZXR1cm4geyFOb2RlRGF0YX0gVGhlIG5ld2x5IGluaXRpYWxpemVkIGRhdGEgb2JqZWN0XG4gICAqL1xuICB2YXIgaW5pdERhdGEgPSBmdW5jdGlvbiAobm9kZSwgbm9kZU5hbWUsIGtleSkge1xuICAgIHZhciBkYXRhID0gbmV3IE5vZGVEYXRhKG5vZGVOYW1lLCBrZXkpO1xuICAgIG5vZGVbJ19faW5jcmVtZW50YWxET01EYXRhJ10gPSBkYXRhO1xuICAgIHJldHVybiBkYXRhO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIE5vZGVEYXRhIG9iamVjdCBmb3IgYSBOb2RlLCBjcmVhdGluZyBpdCBpZiBuZWNlc3NhcnkuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZSBUaGUgbm9kZSB0byByZXRyaWV2ZSB0aGUgZGF0YSBmb3IuXG4gICAqIEByZXR1cm4geyFOb2RlRGF0YX0gVGhlIE5vZGVEYXRhIGZvciB0aGlzIE5vZGUuXG4gICAqL1xuICB2YXIgZ2V0RGF0YSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgdmFyIGRhdGEgPSBub2RlWydfX2luY3JlbWVudGFsRE9NRGF0YSddO1xuXG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICB2YXIgbm9kZU5hbWUgPSBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB2YXIga2V5ID0gbnVsbDtcblxuICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgIGtleSA9IG5vZGUuZ2V0QXR0cmlidXRlKCdrZXknKTtcbiAgICAgIH1cblxuICAgICAgZGF0YSA9IGluaXREYXRhKG5vZGUsIG5vZGVOYW1lLCBrZXkpO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb3B5cmlnaHQgMjAxNSBUaGUgSW5jcmVtZW50YWwgRE9NIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gICAqXG4gICAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gICAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gICAqXG4gICAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gICAqXG4gICAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICAgKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICAgKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAgICovXG5cbiAgZXhwb3J0cy5zeW1ib2xzID0ge1xuICAgIGFsbDogJ19fYWxsJ1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGFuIGF0dHJpYnV0ZSBvciBwcm9wZXJ0eSB0byBhIGdpdmVuIEVsZW1lbnQuIElmIHRoZSB2YWx1ZSBpcyBudWxsXG4gICAqIG9yIHVuZGVmaW5lZCwgaXQgaXMgcmVtb3ZlZCBmcm9tIHRoZSBFbGVtZW50LiBPdGhlcndpc2UsIHRoZSB2YWx1ZSBpcyBzZXRcbiAgICogYXMgYW4gYXR0cmlidXRlLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgYXR0cmlidXRlJ3MgbmFtZS5cbiAgICogQHBhcmFtIHs/KGJvb2xlYW58bnVtYmVyfHN0cmluZyk9fSB2YWx1ZSBUaGUgYXR0cmlidXRlJ3MgdmFsdWUuXG4gICAqL1xuICB2YXIgYXBwbHlBdHRyID0gZnVuY3Rpb24gKGVsLCBuYW1lLCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgLy8gSWYsIGFmdGVyIGNoYW5naW5nIHRoZSBhdHRyaWJ1dGUsXG4gICAgLy8gdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgaXMgbm90IHVwZGF0ZWQsXG4gICAgLy8gYWxzbyB1cGRhdGUgaXQuXG4gICAgaWYgKGVsW25hbWVdICE9PSB2YWx1ZSkge1xuICAgICAgZWxbbmFtZV0gPSB2YWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgYSBwcm9wZXJ0eSB0byBhIGdpdmVuIEVsZW1lbnQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBwcm9wZXJ0eSdzIG5hbWUuXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHByb3BlcnR5J3MgdmFsdWUuXG4gICAqL1xuICB2YXIgYXBwbHlQcm9wID0gZnVuY3Rpb24gKGVsLCBuYW1lLCB2YWx1ZSkge1xuICAgIGVsW25hbWVdID0gdmFsdWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgYSBzdHlsZSB0byBhbiBFbGVtZW50LiBObyB2ZW5kb3IgcHJlZml4IGV4cGFuc2lvbiBpcyBkb25lIGZvclxuICAgKiBwcm9wZXJ0eSBuYW1lcy92YWx1ZXMuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBhdHRyaWJ1dGUncyBuYW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3Q8c3RyaW5nLHN0cmluZz59IHN0eWxlIFRoZSBzdHlsZSB0byBzZXQuIEVpdGhlciBhXG4gICAqICAgICBzdHJpbmcgb2YgY3NzIG9yIGFuIG9iamVjdCBjb250YWluaW5nIHByb3BlcnR5LXZhbHVlIHBhaXJzLlxuICAgKi9cbiAgdmFyIGFwcGx5U3R5bGUgPSBmdW5jdGlvbiAoZWwsIG5hbWUsIHN0eWxlKSB7XG4gICAgaWYgKHR5cGVvZiBzdHlsZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVsLnN0eWxlLmNzc1RleHQgPSBzdHlsZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwuc3R5bGUuY3NzVGV4dCA9ICcnO1xuXG4gICAgICBmb3IgKHZhciBwcm9wIGluIHN0eWxlKSB7XG4gICAgICAgIGVsLnN0eWxlW3Byb3BdID0gc3R5bGVbcHJvcF07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBVcGRhdGVzIGEgc2luZ2xlIGF0dHJpYnV0ZSBvbiBhbiBFbGVtZW50LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgYXR0cmlidXRlJ3MgbmFtZS5cbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgYXR0cmlidXRlJ3MgdmFsdWUuIElmIHRoZSB2YWx1ZSBpcyBhbiBvYmplY3Qgb3JcbiAgICogICAgIGZ1bmN0aW9uIGl0IGlzIHNldCBvbiB0aGUgRWxlbWVudCwgb3RoZXJ3aXNlLCBpdCBpcyBzZXQgYXMgYW4gSFRNTFxuICAgKiAgICAgYXR0cmlidXRlLlxuICAgKi9cbiAgdmFyIGFwcGx5QXR0cmlidXRlVHlwZWQgPSBmdW5jdGlvbiAoZWwsIG5hbWUsIHZhbHVlKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG5cbiAgICBpZiAodHlwZSA9PT0gJ29iamVjdCcgfHwgdHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYXBwbHlQcm9wKGVsLCBuYW1lLCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwcGx5QXR0cihlbCwgbmFtZSwgLyoqIEB0eXBlIHs/KGJvb2xlYW58bnVtYmVyfHN0cmluZyl9ICovdmFsdWUpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2FsbHMgdGhlIGFwcHJvcHJpYXRlIGF0dHJpYnV0ZSBtdXRhdG9yIGZvciB0aGlzIGF0dHJpYnV0ZS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIGF0dHJpYnV0ZSdzIG5hbWUuXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIGF0dHJpYnV0ZSdzIHZhbHVlLlxuICAgKi9cbiAgdmFyIHVwZGF0ZUF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChlbCwgbmFtZSwgdmFsdWUpIHtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEoZWwpO1xuICAgIHZhciBhdHRycyA9IGRhdGEuYXR0cnM7XG5cbiAgICBpZiAoYXR0cnNbbmFtZV0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG11dGF0b3IgPSBfbXV0YXRvcnNbbmFtZV0gfHwgX211dGF0b3JzW2V4cG9ydHMuc3ltYm9scy5hbGxdO1xuICAgIG11dGF0b3IoZWwsIG5hbWUsIHZhbHVlKTtcblxuICAgIGF0dHJzW25hbWVdID0gdmFsdWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEV4cG9zZXMgb3VyIGRlZmF1bHQgYXR0cmlidXRlIG11dGF0b3JzIHB1YmxpY2x5LCBzbyB0aGV5IG1heSBiZSB1c2VkIGluXG4gICAqIGN1c3RvbSBtdXRhdG9ycy5cbiAgICogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgZnVuY3Rpb24oIUVsZW1lbnQsIHN0cmluZywgKik+fVxuICAgKi9cbiAgdmFyIF9kZWZhdWx0cyA9IHtcbiAgICBhcHBseUF0dHI6IGFwcGx5QXR0cixcbiAgICBhcHBseVByb3A6IGFwcGx5UHJvcCxcbiAgICBhcHBseVN0eWxlOiBhcHBseVN0eWxlXG4gIH07XG5cbiAgLyoqXG4gICAqIEEgcHVibGljbHkgbXV0YWJsZSBvYmplY3QgdG8gcHJvdmlkZSBjdXN0b20gbXV0YXRvcnMgZm9yIGF0dHJpYnV0ZXMuXG4gICAqIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsIGZ1bmN0aW9uKCFFbGVtZW50LCBzdHJpbmcsICopPn1cbiAgICovXG4gIHZhciBfbXV0YXRvcnMgPSAoX211dGF0b3JzMiA9IHt9LCBfbXV0YXRvcnMyW2V4cG9ydHMuc3ltYm9scy5hbGxdID0gYXBwbHlBdHRyaWJ1dGVUeXBlZCwgX211dGF0b3JzMlsnc3R5bGUnXSA9IGFwcGx5U3R5bGUsIF9tdXRhdG9yczIpO1xuXG4gIHZhciBTVkdfTlMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuXG4gIC8qKlxuICAgKiBFbnRlcnMgYSB0YWcsIGNoZWNraW5nIHRvIHNlZSBpZiBpdCBpcyBhIG5hbWVzcGFjZSBib3VuZGFyeSwgYW5kIGlmIHNvLFxuICAgKiB1cGRhdGVzIHRoZSBjdXJyZW50IG5hbWVzcGFjZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyBUaGUgdGFnIHRvIGVudGVyLlxuICAgKi9cbiAgdmFyIGVudGVyVGFnID0gZnVuY3Rpb24gKHRhZykge1xuICAgIGlmICh0YWcgPT09ICdzdmcnKSB7XG4gICAgICBnZXRXYWxrZXIoKS5lbnRlck5hbWVzcGFjZShTVkdfTlMpO1xuICAgIH0gZWxzZSBpZiAodGFnID09PSAnZm9yZWlnbk9iamVjdCcpIHtcbiAgICAgIGdldFdhbGtlcigpLmVudGVyTmFtZXNwYWNlKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBFeGl0cyBhIHRhZywgY2hlY2tpbmcgdG8gc2VlIGlmIGl0IGlzIGEgbmFtZXNwYWNlIGJvdW5kYXJ5LCBhbmQgaWYgc28sXG4gICAqIHVwZGF0ZXMgdGhlIGN1cnJlbnQgbmFtZXNwYWNlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSB0YWcgdG8gZW50ZXIuXG4gICAqL1xuICB2YXIgZXhpdFRhZyA9IGZ1bmN0aW9uICh0YWcpIHtcbiAgICBpZiAodGFnID09PSAnc3ZnJyB8fCB0YWcgPT09ICdmb3JlaWduT2JqZWN0Jykge1xuICAgICAgZ2V0V2Fsa2VyKCkuZXhpdE5hbWVzcGFjZSgpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogR2V0cyB0aGUgbmFtZXNwYWNlIHRvIGNyZWF0ZSBhbiBlbGVtZW50IChvZiBhIGdpdmVuIHRhZykgaW4uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIHRhZyB0byBnZXQgdGhlIG5hbWVzcGFjZSBmb3IuXG4gICAqIEByZXR1cm4geyhzdHJpbmd8dW5kZWZpbmVkKX0gVGhlIG5hbWVzcGFjZSB0byBjcmVhdGUgdGhlIHRhZyBpbi5cbiAgICovXG4gIHZhciBnZXROYW1lc3BhY2VGb3JUYWcgPSBmdW5jdGlvbiAodGFnKSB7XG4gICAgaWYgKHRhZyA9PT0gJ3N2ZycpIHtcbiAgICAgIHJldHVybiBTVkdfTlM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldFdhbGtlcigpLmdldEN1cnJlbnROYW1lc3BhY2UoKTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBFbGVtZW50LlxuICAgKiBAcGFyYW0ge0RvY3VtZW50fSBkb2MgVGhlIGRvY3VtZW50IHdpdGggd2hpY2ggdG8gY3JlYXRlIHRoZSBFbGVtZW50LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSB0YWcgZm9yIHRoZSBFbGVtZW50LlxuICAgKiBAcGFyYW0gez9zdHJpbmc9fSBrZXkgQSBrZXkgdG8gaWRlbnRpZnkgdGhlIEVsZW1lbnQuXG4gICAqIEBwYXJhbSB7P0FycmF5PCo+PX0gc3RhdGljcyBBbiBhcnJheSBvZiBhdHRyaWJ1dGUgbmFtZS92YWx1ZSBwYWlycyBvZlxuICAgKiAgICAgdGhlIHN0YXRpYyBhdHRyaWJ1dGVzIGZvciB0aGUgRWxlbWVudC5cbiAgICogQHJldHVybiB7IUVsZW1lbnR9XG4gICAqL1xuICB2YXIgY3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uIChkb2MsIHRhZywga2V5LCBzdGF0aWNzKSB7XG4gICAgdmFyIG5hbWVzcGFjZSA9IGdldE5hbWVzcGFjZUZvclRhZyh0YWcpO1xuICAgIHZhciBlbDtcblxuICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgIGVsID0gZG9jLmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2UsIHRhZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsID0gZG9jLmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICB9XG5cbiAgICBpbml0RGF0YShlbCwgdGFnLCBrZXkpO1xuXG4gICAgaWYgKHN0YXRpY3MpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhdGljcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICB1cGRhdGVBdHRyaWJ1dGUoZWwsIC8qKiBAdHlwZSB7IXN0cmluZ30qL3N0YXRpY3NbaV0sIHN0YXRpY3NbaSArIDFdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZWw7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBOb2RlLCBlaXRoZXIgYSBUZXh0IG9yIGFuIEVsZW1lbnQgZGVwZW5kaW5nIG9uIHRoZSBub2RlIG5hbWVcbiAgICogcHJvdmlkZWQuXG4gICAqIEBwYXJhbSB7RG9jdW1lbnR9IGRvYyBUaGUgZG9jdW1lbnQgd2l0aCB3aGljaCB0byBjcmVhdGUgdGhlIE5vZGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBub2RlTmFtZSBUaGUgdGFnIGlmIGNyZWF0aW5nIGFuIGVsZW1lbnQgb3IgI3RleHQgdG8gY3JlYXRlXG4gICAqICAgICBhIFRleHQuXG4gICAqIEBwYXJhbSB7P3N0cmluZz19IGtleSBBIGtleSB0byBpZGVudGlmeSB0aGUgRWxlbWVudC5cbiAgICogQHBhcmFtIHs/QXJyYXk8Kj49fSBzdGF0aWNzIFRoZSBzdGF0aWMgZGF0YSB0byBpbml0aWFsaXplIHRoZSBOb2RlXG4gICAqICAgICB3aXRoLiBGb3IgYW4gRWxlbWVudCwgYW4gYXJyYXkgb2YgYXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMgb2ZcbiAgICogICAgIHRoZSBzdGF0aWMgYXR0cmlidXRlcyBmb3IgdGhlIEVsZW1lbnQuXG4gICAqIEByZXR1cm4geyFOb2RlfVxuICAgKi9cbiAgdmFyIGNyZWF0ZU5vZGUgPSBmdW5jdGlvbiAoZG9jLCBub2RlTmFtZSwga2V5LCBzdGF0aWNzKSB7XG4gICAgaWYgKG5vZGVOYW1lID09PSAnI3RleHQnKSB7XG4gICAgICByZXR1cm4gZG9jLmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlRWxlbWVudChkb2MsIG5vZGVOYW1lLCBrZXksIHN0YXRpY3MpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbWFwcGluZyB0aGF0IGNhbiBiZSB1c2VkIHRvIGxvb2sgdXAgY2hpbGRyZW4gdXNpbmcgYSBrZXkuXG4gICAqIEBwYXJhbSB7IU5vZGV9IGVsXG4gICAqIEByZXR1cm4geyFPYmplY3Q8c3RyaW5nLCAhRWxlbWVudD59IEEgbWFwcGluZyBvZiBrZXlzIHRvIHRoZSBjaGlsZHJlbiBvZiB0aGVcbiAgICogICAgIEVsZW1lbnQuXG4gICAqL1xuICB2YXIgY3JlYXRlS2V5TWFwID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgdmFyIG1hcCA9IHt9O1xuICAgIHZhciBjaGlsZHJlbiA9IGVsLmNoaWxkcmVuO1xuICAgIHZhciBjb3VudCA9IGNoaWxkcmVuLmxlbmd0aDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkgKz0gMSkge1xuICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICB2YXIga2V5ID0gZ2V0RGF0YShjaGlsZCkua2V5O1xuXG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIG1hcFtrZXldID0gY2hpbGQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcDtcbiAgfTtcblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBtYXBwaW5nIG9mIGtleSB0byBjaGlsZCBub2RlIGZvciBhIGdpdmVuIEVsZW1lbnQsIGNyZWF0aW5nIGl0XG4gICAqIGlmIG5lY2Vzc2FyeS5cbiAgICogQHBhcmFtIHshTm9kZX0gZWxcbiAgICogQHJldHVybiB7IU9iamVjdDxzdHJpbmcsICFOb2RlPn0gQSBtYXBwaW5nIG9mIGtleXMgdG8gY2hpbGQgRWxlbWVudHNcbiAgICovXG4gIHZhciBnZXRLZXlNYXAgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEoZWwpO1xuXG4gICAgaWYgKCFkYXRhLmtleU1hcCkge1xuICAgICAgZGF0YS5rZXlNYXAgPSBjcmVhdGVLZXlNYXAoZWwpO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhLmtleU1hcDtcbiAgfTtcblxuICAvKipcbiAgICogUmV0cmlldmVzIGEgY2hpbGQgZnJvbSB0aGUgcGFyZW50IHdpdGggdGhlIGdpdmVuIGtleS5cbiAgICogQHBhcmFtIHshTm9kZX0gcGFyZW50XG4gICAqIEBwYXJhbSB7P3N0cmluZz19IGtleVxuICAgKiBAcmV0dXJuIHs/RWxlbWVudH0gVGhlIGNoaWxkIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGtleS5cbiAgICovXG4gIHZhciBnZXRDaGlsZCA9IGZ1bmN0aW9uIChwYXJlbnQsIGtleSkge1xuICAgIHJldHVybiAoLyoqIEB0eXBlIHs/RWxlbWVudH0gKi9rZXkgJiYgZ2V0S2V5TWFwKHBhcmVudClba2V5XVxuICAgICk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhbiBlbGVtZW50IGFzIGJlaW5nIGEgY2hpbGQuIFRoZSBwYXJlbnQgd2lsbCBrZWVwIHRyYWNrIG9mIHRoZVxuICAgKiBjaGlsZCB1c2luZyB0aGUga2V5LiBUaGUgY2hpbGQgY2FuIGJlIHJldHJpZXZlZCB1c2luZyB0aGUgc2FtZSBrZXkgdXNpbmdcbiAgICogZ2V0S2V5TWFwLiBUaGUgcHJvdmlkZWQga2V5IHNob3VsZCBiZSB1bmlxdWUgd2l0aGluIHRoZSBwYXJlbnQgRWxlbWVudC5cbiAgICogQHBhcmFtIHshTm9kZX0gcGFyZW50IFRoZSBwYXJlbnQgb2YgY2hpbGQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgQSBrZXkgdG8gaWRlbnRpZnkgdGhlIGNoaWxkIHdpdGguXG4gICAqIEBwYXJhbSB7IU5vZGV9IGNoaWxkIFRoZSBjaGlsZCB0byByZWdpc3Rlci5cbiAgICovXG4gIHZhciByZWdpc3RlckNoaWxkID0gZnVuY3Rpb24gKHBhcmVudCwga2V5LCBjaGlsZCkge1xuICAgIGdldEtleU1hcChwYXJlbnQpW2tleV0gPSBjaGlsZDtcbiAgfTtcblxuICBpZiAoJ3Byb2R1Y3Rpb24nICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAvKipcbiAgICAqIE1ha2VzIHN1cmUgdGhhdCBrZXllZCBFbGVtZW50IG1hdGNoZXMgdGhlIHRhZyBuYW1lIHByb3ZpZGVkLlxuICAgICogQHBhcmFtIHshRWxlbWVudH0gbm9kZSBUaGUgbm9kZSB0aGF0IGlzIGJlaW5nIG1hdGNoZWQuXG4gICAgKiBAcGFyYW0ge3N0cmluZz19IHRhZyBUaGUgdGFnIG5hbWUgb2YgdGhlIEVsZW1lbnQuXG4gICAgKiBAcGFyYW0gez9zdHJpbmc9fSBrZXkgVGhlIGtleSBvZiB0aGUgRWxlbWVudC5cbiAgICAqL1xuICAgIHZhciBhc3NlcnRLZXllZFRhZ01hdGNoZXMgPSBmdW5jdGlvbiAobm9kZSwgdGFnLCBrZXkpIHtcbiAgICAgIHZhciBub2RlTmFtZSA9IGdldERhdGEobm9kZSkubm9kZU5hbWU7XG4gICAgICBpZiAobm9kZU5hbWUgIT09IHRhZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dhcyBleHBlY3Rpbmcgbm9kZSB3aXRoIGtleSBcIicgKyBrZXkgKyAnXCIgdG8gYmUgYSAnICsgdGFnICsgJywgbm90IGEgJyArIG5vZGVOYW1lICsgJy4nKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIG9yIG5vdCBhIGdpdmVuIG5vZGUgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIG5vZGVOYW1lIGFuZCBrZXkuXG4gICAqXG4gICAqIEBwYXJhbSB7IU5vZGV9IG5vZGUgQW4gSFRNTCBub2RlLCB0eXBpY2FsbHkgYW4gSFRNTEVsZW1lbnQgb3IgVGV4dC5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSBub2RlTmFtZSBUaGUgbm9kZU5hbWUgZm9yIHRoaXMgbm9kZS5cbiAgICogQHBhcmFtIHs/c3RyaW5nPX0ga2V5IEFuIG9wdGlvbmFsIGtleSB0aGF0IGlkZW50aWZpZXMgYSBub2RlLlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBub2RlIG1hdGNoZXMsIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIHZhciBtYXRjaGVzID0gZnVuY3Rpb24gKG5vZGUsIG5vZGVOYW1lLCBrZXkpIHtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEobm9kZSk7XG5cbiAgICAvLyBLZXkgY2hlY2sgaXMgZG9uZSB1c2luZyBkb3VibGUgZXF1YWxzIGFzIHdlIHdhbnQgdG8gdHJlYXQgYSBudWxsIGtleSB0aGVcbiAgICAvLyBzYW1lIGFzIHVuZGVmaW5lZC4gVGhpcyBzaG91bGQgYmUgb2theSBhcyB0aGUgb25seSB2YWx1ZXMgYWxsb3dlZCBhcmVcbiAgICAvLyBzdHJpbmdzLCBudWxsIGFuZCB1bmRlZmluZWQgc28gdGhlID09IHNlbWFudGljcyBhcmUgbm90IHRvbyB3ZWlyZC5cbiAgICByZXR1cm4ga2V5ID09IGRhdGEua2V5ICYmIG5vZGVOYW1lID09PSBkYXRhLm5vZGVOYW1lO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBbGlnbnMgdGhlIHZpcnR1YWwgRWxlbWVudCBkZWZpbml0aW9uIHdpdGggdGhlIGFjdHVhbCBET00sIG1vdmluZyB0aGVcbiAgICogY29ycmVzcG9uZGluZyBET00gbm9kZSB0byB0aGUgY29ycmVjdCBsb2NhdGlvbiBvciBjcmVhdGluZyBpdCBpZiBuZWNlc3NhcnkuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBub2RlTmFtZSBGb3IgYW4gRWxlbWVudCwgdGhpcyBzaG91bGQgYmUgYSB2YWxpZCB0YWcgc3RyaW5nLlxuICAgKiAgICAgRm9yIGEgVGV4dCwgdGhpcyBzaG91bGQgYmUgI3RleHQuXG4gICAqIEBwYXJhbSB7P3N0cmluZz19IGtleSBUaGUga2V5IHVzZWQgdG8gaWRlbnRpZnkgdGhpcyBlbGVtZW50LlxuICAgKiBAcGFyYW0gez9BcnJheTwqPj19IHN0YXRpY3MgRm9yIGFuIEVsZW1lbnQsIHRoaXMgc2hvdWxkIGJlIGFuIGFycmF5IG9mXG4gICAqICAgICBuYW1lLXZhbHVlIHBhaXJzLlxuICAgKiBAcmV0dXJuIHshTm9kZX0gVGhlIG1hdGNoaW5nIG5vZGUuXG4gICAqL1xuICB2YXIgYWxpZ25XaXRoRE9NID0gZnVuY3Rpb24gKG5vZGVOYW1lLCBrZXksIHN0YXRpY3MpIHtcbiAgICB2YXIgd2Fsa2VyID0gZ2V0V2Fsa2VyKCk7XG4gICAgdmFyIGN1cnJlbnROb2RlID0gd2Fsa2VyLmN1cnJlbnROb2RlO1xuICAgIHZhciBwYXJlbnQgPSB3YWxrZXIuZ2V0Q3VycmVudFBhcmVudCgpO1xuICAgIHZhciBtYXRjaGluZ05vZGU7XG5cbiAgICAvLyBDaGVjayB0byBzZWUgaWYgd2UgaGF2ZSBhIG5vZGUgdG8gcmV1c2VcbiAgICBpZiAoY3VycmVudE5vZGUgJiYgbWF0Y2hlcyhjdXJyZW50Tm9kZSwgbm9kZU5hbWUsIGtleSkpIHtcbiAgICAgIG1hdGNoaW5nTm9kZSA9IGN1cnJlbnROb2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZXhpc3RpbmdOb2RlID0gZ2V0Q2hpbGQocGFyZW50LCBrZXkpO1xuXG4gICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlIG5vZGUgaGFzIG1vdmVkIHdpdGhpbiB0aGUgcGFyZW50IG9yIGlmIGEgbmV3IG9uZVxuICAgICAgLy8gc2hvdWxkIGJlIGNyZWF0ZWRcbiAgICAgIGlmIChleGlzdGluZ05vZGUpIHtcbiAgICAgICAgaWYgKCdwcm9kdWN0aW9uJyAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgYXNzZXJ0S2V5ZWRUYWdNYXRjaGVzKGV4aXN0aW5nTm9kZSwgbm9kZU5hbWUsIGtleSk7XG4gICAgICAgIH1cblxuICAgICAgICBtYXRjaGluZ05vZGUgPSBleGlzdGluZ05vZGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXRjaGluZ05vZGUgPSBjcmVhdGVOb2RlKHdhbGtlci5kb2MsIG5vZGVOYW1lLCBrZXksIHN0YXRpY3MpO1xuXG4gICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICByZWdpc3RlckNoaWxkKHBhcmVudCwga2V5LCBtYXRjaGluZ05vZGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBub2RlIGhhcyBhIGtleSwgcmVtb3ZlIGl0IGZyb20gdGhlIERPTSB0byBwcmV2ZW50IGEgbGFyZ2UgbnVtYmVyXG4gICAgICAvLyBvZiByZS1vcmRlcnMgaW4gdGhlIGNhc2UgdGhhdCBpdCBtb3ZlZCBmYXIgb3Igd2FzIGNvbXBsZXRlbHkgcmVtb3ZlZC5cbiAgICAgIC8vIFNpbmNlIHdlIGhvbGQgb24gdG8gYSByZWZlcmVuY2UgdGhyb3VnaCB0aGUga2V5TWFwLCB3ZSBjYW4gYWx3YXlzIGFkZCBpdFxuICAgICAgLy8gYmFjay5cbiAgICAgIGlmIChjdXJyZW50Tm9kZSAmJiBnZXREYXRhKGN1cnJlbnROb2RlKS5rZXkpIHtcbiAgICAgICAgcGFyZW50LnJlcGxhY2VDaGlsZChtYXRjaGluZ05vZGUsIGN1cnJlbnROb2RlKTtcbiAgICAgICAgZ2V0RGF0YShwYXJlbnQpLmtleU1hcFZhbGlkID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG1hdGNoaW5nTm9kZSwgY3VycmVudE5vZGUpO1xuICAgICAgfVxuXG4gICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBtYXRjaGluZ05vZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hdGNoaW5nTm9kZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2xlYXJzIG91dCBhbnkgdW52aXNpdGVkIE5vZGVzLCBhcyB0aGUgY29ycmVzcG9uZGluZyB2aXJ0dWFsIGVsZW1lbnRcbiAgICogZnVuY3Rpb25zIHdlcmUgbmV2ZXIgY2FsbGVkIGZvciB0aGVtLlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICovXG4gIHZhciBjbGVhclVudmlzaXRlZERPTSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgdmFyIGRhdGEgPSBnZXREYXRhKG5vZGUpO1xuICAgIHZhciBrZXlNYXAgPSBkYXRhLmtleU1hcDtcbiAgICB2YXIga2V5TWFwVmFsaWQgPSBkYXRhLmtleU1hcFZhbGlkO1xuICAgIHZhciBsYXN0Q2hpbGQgPSBub2RlLmxhc3RDaGlsZDtcbiAgICB2YXIgbGFzdFZpc2l0ZWRDaGlsZCA9IGRhdGEubGFzdFZpc2l0ZWRDaGlsZDtcblxuICAgIGRhdGEubGFzdFZpc2l0ZWRDaGlsZCA9IG51bGw7XG5cbiAgICBpZiAobGFzdENoaWxkID09PSBsYXN0VmlzaXRlZENoaWxkICYmIGtleU1hcFZhbGlkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgd2hpbGUgKGxhc3RDaGlsZCAhPT0gbGFzdFZpc2l0ZWRDaGlsZCkge1xuICAgICAgbm9kZS5yZW1vdmVDaGlsZChsYXN0Q2hpbGQpO1xuICAgICAgbGFzdENoaWxkID0gbm9kZS5sYXN0Q2hpbGQ7XG4gICAgfVxuXG4gICAgLy8gQ2xlYW4gdGhlIGtleU1hcCwgcmVtb3ZpbmcgYW55IHVudXN1ZWQga2V5cy5cbiAgICBmb3IgKHZhciBrZXkgaW4ga2V5TWFwKSB7XG4gICAgICBpZiAoIWtleU1hcFtrZXldLnBhcmVudE5vZGUpIHtcbiAgICAgICAgZGVsZXRlIGtleU1hcFtrZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRhdGEua2V5TWFwVmFsaWQgPSB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFbnRlcnMgYW4gRWxlbWVudCwgc2V0dGluZyB0aGUgY3VycmVudCBuYW1lc3BhY2UgZm9yIG5lc3RlZCBlbGVtZW50cy5cbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqL1xuICB2YXIgZW50ZXJOb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEobm9kZSk7XG4gICAgZW50ZXJUYWcoZGF0YS5ub2RlTmFtZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEV4aXRzIGFuIEVsZW1lbnQsIHVud2luZGluZyB0aGUgY3VycmVudCBuYW1lc3BhY2UgdG8gdGhlIHByZXZpb3VzIHZhbHVlLlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICovXG4gIHZhciBleGl0Tm9kZSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgdmFyIGRhdGEgPSBnZXREYXRhKG5vZGUpO1xuICAgIGV4aXRUYWcoZGF0YS5ub2RlTmFtZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIE1hcmtzIG5vZGUncyBwYXJlbnQgYXMgaGF2aW5nIHZpc2l0ZWQgbm9kZS5cbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqL1xuICB2YXIgbWFya1Zpc2l0ZWQgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIHZhciB3YWxrZXIgPSBnZXRXYWxrZXIoKTtcbiAgICB2YXIgcGFyZW50ID0gd2Fsa2VyLmdldEN1cnJlbnRQYXJlbnQoKTtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEocGFyZW50KTtcbiAgICBkYXRhLmxhc3RWaXNpdGVkQ2hpbGQgPSBub2RlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRvIHRoZSBmaXJzdCBjaGlsZCBvZiB0aGUgY3VycmVudCBub2RlLlxuICAgKi9cbiAgdmFyIGZpcnN0Q2hpbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHdhbGtlciA9IGdldFdhbGtlcigpO1xuICAgIGVudGVyTm9kZSh3YWxrZXIuY3VycmVudE5vZGUpO1xuICAgIHdhbGtlci5maXJzdENoaWxkKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdG8gdGhlIG5leHQgc2libGluZyBvZiB0aGUgY3VycmVudCBub2RlLlxuICAgKi9cbiAgdmFyIG5leHRTaWJsaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB3YWxrZXIgPSBnZXRXYWxrZXIoKTtcbiAgICBtYXJrVmlzaXRlZCh3YWxrZXIuY3VycmVudE5vZGUpO1xuICAgIHdhbGtlci5uZXh0U2libGluZygpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRvIHRoZSBwYXJlbnQgb2YgdGhlIGN1cnJlbnQgbm9kZSwgcmVtb3ZpbmcgYW55IHVudmlzaXRlZCBjaGlsZHJlbi5cbiAgICovXG4gIHZhciBwYXJlbnROb2RlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB3YWxrZXIgPSBnZXRXYWxrZXIoKTtcbiAgICB3YWxrZXIucGFyZW50Tm9kZSgpO1xuICAgIGV4aXROb2RlKHdhbGtlci5jdXJyZW50Tm9kZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENvcHlyaWdodCAyMDE1IFRoZSBJbmNyZW1lbnRhbCBET00gQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAgICpcbiAgICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAgICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAgICpcbiAgICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgICpcbiAgICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICAgKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gICAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICAgKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gICAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICAgKi9cblxuICAvKipcbiAgICogU2ltaWxhciB0byB0aGUgYnVpbHQtaW4gVHJlZXdhbGtlciBjbGFzcywgYnV0IHNpbXBsaWZpZWQgYW5kIGFsbG93cyBkaXJlY3RcbiAgICogYWNjZXNzIHRvIG1vZGlmeSB0aGUgY3VycmVudE5vZGUgcHJvcGVydHkuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IURvY3VtZW50RnJhZ21lbnR9IG5vZGUgVGhlIHJvb3QgTm9kZSBvZiB0aGUgc3VidHJlZSB0aGVcbiAgICogICAgIHdhbGtlciBzaG91bGQgc3RhcnQgdHJhdmVyc2luZy5cbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBmdW5jdGlvbiBUcmVlV2Fsa2VyKG5vZGUpIHtcbiAgICAvKipcbiAgICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgY3VycmVudCBwYXJlbnQgbm9kZS4gVGhpcyBpcyBuZWNlc3NhcnkgYXMgdGhlIHRyYXZlcnNhbFxuICAgICAqIG1ldGhvZHMgbWF5IHRyYXZlcnNlIHBhc3QgdGhlIGxhc3QgY2hpbGQgYW5kIHdlIHN0aWxsIG5lZWQgYSB3YXkgdG8gZ2V0XG4gICAgICogYmFjayB0byB0aGUgcGFyZW50LlxuICAgICAqIEBjb25zdCBAcHJpdmF0ZSB7IUFycmF5PCFOb2RlPn1cbiAgICAgKi9cbiAgICB0aGlzLnN0YWNrXyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQHR5cGUgez9Ob2RlfVxuICAgICAqL1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSBub2RlO1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0IHtEb2N1bWVudH1cbiAgICAgKi9cbiAgICB0aGlzLmRvYyA9IG5vZGUub3duZXJEb2N1bWVudDtcblxuICAgIC8qKlxuICAgICAqIEtlZXBzIHRyYWNrIG9mIHdoYXQgbmFtZXNwYWNlIHRvIGNyZWF0ZSBuZXcgRWxlbWVudHMgaW4uXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAY29uc3QgeyFBcnJheTwoc3RyaW5nfHVuZGVmaW5lZCk+fVxuICAgICAqL1xuICAgIHRoaXMubnNTdGFja18gPSBbdW5kZWZpbmVkXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshTm9kZX0gVGhlIGN1cnJlbnQgcGFyZW50IG9mIHRoZSBjdXJyZW50IGxvY2F0aW9uIGluIHRoZSBzdWJ0cmVlLlxuICAgKi9cbiAgVHJlZVdhbGtlci5wcm90b3R5cGUuZ2V0Q3VycmVudFBhcmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFja19bdGhpcy5zdGFja18ubGVuZ3RoIC0gMV07XG4gIH07XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyhzdHJpbmd8dW5kZWZpbmVkKX0gVGhlIGN1cnJlbnQgbmFtZXNwYWNlIHRvIGNyZWF0ZSBFbGVtZW50cyBpbi5cbiAgICovXG4gIFRyZWVXYWxrZXIucHJvdG90eXBlLmdldEN1cnJlbnROYW1lc3BhY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMubnNTdGFja19bdGhpcy5uc1N0YWNrXy5sZW5ndGggLSAxXTtcbiAgfTtcblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBuYW1lc3BhY2UgVGhlIG5hbWVzcGFjZSB0byBlbnRlci5cbiAgICovXG4gIFRyZWVXYWxrZXIucHJvdG90eXBlLmVudGVyTmFtZXNwYWNlID0gZnVuY3Rpb24gKG5hbWVzcGFjZSkge1xuICAgIHRoaXMubnNTdGFja18ucHVzaChuYW1lc3BhY2UpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFeGl0cyB0aGUgY3VycmVudCBuYW1lc3BhY2VcbiAgICovXG4gIFRyZWVXYWxrZXIucHJvdG90eXBlLmV4aXROYW1lc3BhY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5uc1N0YWNrXy5wb3AoKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgY3VycmVudCBsb2NhdGlvbiB0aGUgZmlyc3RDaGlsZCBvZiB0aGUgY3VycmVudCBsb2NhdGlvbi5cbiAgICovXG4gIFRyZWVXYWxrZXIucHJvdG90eXBlLmZpcnN0Q2hpbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zdGFja18ucHVzaCh0aGlzLmN1cnJlbnROb2RlKTtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0gdGhpcy5jdXJyZW50Tm9kZS5maXJzdENoaWxkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBjdXJyZW50IGxvY2F0aW9uIHRoZSBuZXh0U2libGluZyBvZiB0aGUgY3VycmVudCBsb2NhdGlvbi5cbiAgICovXG4gIFRyZWVXYWxrZXIucHJvdG90eXBlLm5leHRTaWJsaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSB0aGlzLmN1cnJlbnROb2RlLm5leHRTaWJsaW5nO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBjdXJyZW50IGxvY2F0aW9uIHRoZSBwYXJlbnROb2RlIG9mIHRoZSBjdXJyZW50IGxvY2F0aW9uLlxuICAgKi9cbiAgVHJlZVdhbGtlci5wcm90b3R5cGUucGFyZW50Tm9kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0gdGhpcy5zdGFja18ucG9wKCk7XG4gIH07XG5cbiAgaWYgKCdwcm9kdWN0aW9uJyAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgdmFyIGFzc2VydE5vVW5jbG9zZWRUYWdzID0gZnVuY3Rpb24gKHJvb3QpIHtcbiAgICAgIHZhciBvcGVuRWxlbWVudCA9IGdldFdhbGtlcigpLmdldEN1cnJlbnRQYXJlbnQoKTtcbiAgICAgIGlmICghb3BlbkVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3BlblRhZ3MgPSBbXTtcbiAgICAgIHdoaWxlIChvcGVuRWxlbWVudCAmJiBvcGVuRWxlbWVudCAhPT0gcm9vdCkge1xuICAgICAgICBvcGVuVGFncy5wdXNoKG9wZW5FbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICBvcGVuRWxlbWVudCA9IG9wZW5FbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICB9XG5cbiAgICAgIHRocm93IG5ldyBFcnJvcignT25lIG9yIG1vcmUgdGFncyB3ZXJlIG5vdCBjbG9zZWQ6XFxuJyArIG9wZW5UYWdzLmpvaW4oJ1xcbicpKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFBhdGNoZXMgdGhlIGRvY3VtZW50IHN0YXJ0aW5nIGF0IGVsIHdpdGggdGhlIHByb3ZpZGVkIGZ1bmN0aW9uLiBUaGlzIGZ1bmN0aW9uXG4gICAqIG1heSBiZSBjYWxsZWQgZHVyaW5nIGFuIGV4aXN0aW5nIHBhdGNoIG9wZXJhdGlvbi5cbiAgICogQHBhcmFtIHshRWxlbWVudHwhRG9jdW1lbnRGcmFnbWVudH0gbm9kZSBUaGUgRWxlbWVudCBvciBEb2N1bWVudFxuICAgKiAgICAgdG8gcGF0Y2guXG4gICAqIEBwYXJhbSB7IWZ1bmN0aW9uKFQpfSBmbiBBIGZ1bmN0aW9uIGNvbnRhaW5pbmcgZWxlbWVudE9wZW4vZWxlbWVudENsb3NlL2V0Yy5cbiAgICogICAgIGNhbGxzIHRoYXQgZGVzY3JpYmUgdGhlIERPTS5cbiAgICogQHBhcmFtIHtUPX0gZGF0YSBBbiBhcmd1bWVudCBwYXNzZWQgdG8gZm4gdG8gcmVwcmVzZW50IERPTSBzdGF0ZS5cbiAgICogQHRlbXBsYXRlIFRcbiAgICovXG4gIGV4cG9ydHMucGF0Y2ggPSBmdW5jdGlvbiAobm9kZSwgZm4sIGRhdGEpIHtcbiAgICB2YXIgcHJldldhbGtlciA9IGdldFdhbGtlcigpO1xuICAgIHNldFdhbGtlcihuZXcgVHJlZVdhbGtlcihub2RlKSk7XG5cbiAgICBmaXJzdENoaWxkKCk7XG4gICAgZm4oZGF0YSk7XG4gICAgcGFyZW50Tm9kZSgpO1xuICAgIGNsZWFyVW52aXNpdGVkRE9NKG5vZGUpO1xuXG4gICAgaWYgKCdwcm9kdWN0aW9uJyAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBhc3NlcnROb1VuY2xvc2VkVGFncyhub2RlKTtcbiAgICB9XG5cbiAgICBzZXRXYWxrZXIocHJldldhbGtlcik7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoZSBvZmZzZXQgaW4gdGhlIHZpcnR1YWwgZWxlbWVudCBkZWNsYXJhdGlvbiB3aGVyZSB0aGUgYXR0cmlidXRlcyBhcmVcbiAgICogc3BlY2lmaWVkLlxuICAgKiBAY29uc3RcbiAgICovXG4gIHZhciBBVFRSSUJVVEVTX09GRlNFVCA9IDM7XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhbiBhcnJheSBvZiBhcmd1bWVudHMgZm9yIHVzZSB3aXRoIGVsZW1lbnRPcGVuU3RhcnQsIGF0dHIgYW5kXG4gICAqIGVsZW1lbnRPcGVuRW5kLlxuICAgKiBAY29uc3Qge0FycmF5PCo+fVxuICAgKi9cbiAgdmFyIGFyZ3NCdWlsZGVyID0gW107XG5cbiAgaWYgKCdwcm9kdWN0aW9uJyAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgLyoqXG4gICAgICogS2VlcHMgdHJhY2sgd2hldGhlciBvciBub3Qgd2UgYXJlIGluIGFuIGF0dHJpYnV0ZXMgZGVjbGFyYXRpb24gKGFmdGVyXG4gICAgICogZWxlbWVudE9wZW5TdGFydCwgYnV0IGJlZm9yZSBlbGVtZW50T3BlbkVuZCkuXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdmFyIGluQXR0cmlidXRlcyA9IGZhbHNlO1xuXG4gICAgLyoqIE1ha2VzIHN1cmUgdGhhdCB0aGUgY2FsbGVyIGlzIG5vdCB3aGVyZSBhdHRyaWJ1dGVzIGFyZSBleHBlY3RlZC4gKi9cbiAgICB2YXIgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGluQXR0cmlidXRlcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dhcyBub3QgZXhwZWN0aW5nIGEgY2FsbCB0byBhdHRyIG9yIGVsZW1lbnRPcGVuRW5kLCAnICsgJ3RoZXkgbXVzdCBmb2xsb3cgYSBjYWxsIHRvIGVsZW1lbnRPcGVuU3RhcnQuJyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKiBNYWtlcyBzdXJlIHRoYXQgdGhlIGNhbGxlciBpcyB3aGVyZSBhdHRyaWJ1dGVzIGFyZSBleHBlY3RlZC4gKi9cbiAgICB2YXIgYXNzZXJ0SW5BdHRyaWJ1dGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCFpbkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXYXMgZXhwZWN0aW5nIGEgY2FsbCB0byBhdHRyIG9yIGVsZW1lbnRPcGVuRW5kLiAnICsgJ2VsZW1lbnRPcGVuU3RhcnQgbXVzdCBiZSBmb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgY2FsbHMgdG8gYXR0ciwgJyArICd0aGVuIG9uZSBjYWxsIHRvIGVsZW1lbnRPcGVuRW5kLicpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBNYWtlcyBzdXJlIHRoYXQgdGFncyBhcmUgY29ycmVjdGx5IG5lc3RlZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnXG4gICAgICovXG4gICAgdmFyIGFzc2VydENsb3NlTWF0Y2hlc09wZW5UYWcgPSBmdW5jdGlvbiAodGFnKSB7XG4gICAgICB2YXIgY2xvc2luZ05vZGUgPSBnZXRXYWxrZXIoKS5nZXRDdXJyZW50UGFyZW50KCk7XG4gICAgICB2YXIgZGF0YSA9IGdldERhdGEoY2xvc2luZ05vZGUpO1xuXG4gICAgICBpZiAodGFnICE9PSBkYXRhLm5vZGVOYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUmVjZWl2ZWQgYSBjYWxsIHRvIGNsb3NlICcgKyB0YWcgKyAnIGJ1dCAnICsgZGF0YS5ub2RlTmFtZSArICcgd2FzIG9wZW4uJyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKiBVcGRhdGVzIHRoZSBzdGF0ZSB0byBiZWluZyBpbiBhbiBhdHRyaWJ1dGUgZGVjbGFyYXRpb24uICovXG4gICAgdmFyIHNldEluQXR0cmlidXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGluQXR0cmlidXRlcyA9IHRydWU7XG4gICAgfTtcblxuICAgIC8qKiBVcGRhdGVzIHRoZSBzdGF0ZSB0byBub3QgYmVpbmcgaW4gYW4gYXR0cmlidXRlIGRlY2xhcmF0aW9uLiAqL1xuICAgIHZhciBzZXROb3RJbkF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpbkF0dHJpYnV0ZXMgPSBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIGVsZW1lbnQncyB0YWcuXG4gICAqIEBwYXJhbSB7P3N0cmluZz19IGtleSBUaGUga2V5IHVzZWQgdG8gaWRlbnRpZnkgdGhpcyBlbGVtZW50LiBUaGlzIGNhbiBiZSBhblxuICAgKiAgICAgZW1wdHkgc3RyaW5nLCBidXQgcGVyZm9ybWFuY2UgbWF5IGJlIGJldHRlciBpZiBhIHVuaXF1ZSB2YWx1ZSBpcyB1c2VkXG4gICAqICAgICB3aGVuIGl0ZXJhdGluZyBvdmVyIGFuIGFycmF5IG9mIGl0ZW1zLlxuICAgKiBAcGFyYW0gez9BcnJheTwqPj19IHN0YXRpY3MgQW4gYXJyYXkgb2YgYXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMgb2YgdGhlXG4gICAqICAgICBzdGF0aWMgYXR0cmlidXRlcyBmb3IgdGhlIEVsZW1lbnQuIFRoZXNlIHdpbGwgb25seSBiZSBzZXQgb25jZSB3aGVuIHRoZVxuICAgKiAgICAgRWxlbWVudCBpcyBjcmVhdGVkLlxuICAgKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzIEF0dHJpYnV0ZSBuYW1lL3ZhbHVlIHBhaXJzIG9mIHRoZSBkeW5hbWljIGF0dHJpYnV0ZXNcbiAgICogICAgIGZvciB0aGUgRWxlbWVudC5cbiAgICogQHJldHVybiB7IUVsZW1lbnR9IFRoZSBjb3JyZXNwb25kaW5nIEVsZW1lbnQuXG4gICAqL1xuICBleHBvcnRzLmVsZW1lbnRPcGVuID0gZnVuY3Rpb24gKHRhZywga2V5LCBzdGF0aWNzLCB2YXJfYXJncykge1xuICAgIGlmICgncHJvZHVjdGlvbicgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzKCk7XG4gICAgfVxuXG4gICAgdmFyIG5vZGUgPSAvKiogQHR5cGUgeyFFbGVtZW50fSovYWxpZ25XaXRoRE9NKHRhZywga2V5LCBzdGF0aWNzKTtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEobm9kZSk7XG5cbiAgICAvKlxuICAgICAqIENoZWNrcyB0byBzZWUgaWYgb25lIG9yIG1vcmUgYXR0cmlidXRlcyBoYXZlIGNoYW5nZWQgZm9yIGEgZ2l2ZW4gRWxlbWVudC5cbiAgICAgKiBXaGVuIG5vIGF0dHJpYnV0ZXMgaGF2ZSBjaGFuZ2VkLCB0aGlzIGlzIG11Y2ggZmFzdGVyIHRoYW4gY2hlY2tpbmcgZWFjaFxuICAgICAqIGluZGl2aWR1YWwgYXJndW1lbnQuIFdoZW4gYXR0cmlidXRlcyBoYXZlIGNoYW5nZWQsIHRoZSBvdmVyaGVhZCBvZiB0aGlzIGlzXG4gICAgICogbWluaW1hbC5cbiAgICAgKi9cbiAgICB2YXIgYXR0cnNBcnIgPSBkYXRhLmF0dHJzQXJyO1xuICAgIHZhciBhdHRyc0NoYW5nZWQgPSBmYWxzZTtcbiAgICB2YXIgaSA9IEFUVFJJQlVURVNfT0ZGU0VUO1xuICAgIHZhciBqID0gMDtcblxuICAgIGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSArPSAxLCBqICs9IDEpIHtcbiAgICAgIGlmIChhdHRyc0FycltqXSAhPT0gYXJndW1lbnRzW2ldKSB7XG4gICAgICAgIGF0dHJzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSArPSAxLCBqICs9IDEpIHtcbiAgICAgIGF0dHJzQXJyW2pdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGlmIChqIDwgYXR0cnNBcnIubGVuZ3RoKSB7XG4gICAgICBhdHRyc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgYXR0cnNBcnIubGVuZ3RoID0gajtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIEFjdHVhbGx5IHBlcmZvcm0gdGhlIGF0dHJpYnV0ZSB1cGRhdGUuXG4gICAgICovXG4gICAgaWYgKGF0dHJzQ2hhbmdlZCkge1xuICAgICAgdmFyIGF0dHIsXG4gICAgICAgICAgbmV3QXR0cnMgPSBkYXRhLm5ld0F0dHJzO1xuXG4gICAgICBmb3IgKGF0dHIgaW4gbmV3QXR0cnMpIHtcbiAgICAgICAgbmV3QXR0cnNbYXR0cl0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IEFUVFJJQlVURVNfT0ZGU0VUOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIG5ld0F0dHJzW2FyZ3VtZW50c1tpXV0gPSBhcmd1bWVudHNbaSArIDFdO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGF0dHIgaW4gbmV3QXR0cnMpIHtcbiAgICAgICAgdXBkYXRlQXR0cmlidXRlKG5vZGUsIGF0dHIsIG5ld0F0dHJzW2F0dHJdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmaXJzdENoaWxkKCk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH07XG5cbiAgLyoqXG4gICAqIERlY2xhcmVzIGEgdmlydHVhbCBFbGVtZW50IGF0IHRoZSBjdXJyZW50IGxvY2F0aW9uIGluIHRoZSBkb2N1bWVudC4gVGhpc1xuICAgKiBjb3JyZXNwb25kcyB0byBhbiBvcGVuaW5nIHRhZyBhbmQgYSBlbGVtZW50Q2xvc2UgdGFnIGlzIHJlcXVpcmVkLiBUaGlzIGlzXG4gICAqIGxpa2UgZWxlbWVudE9wZW4sIGJ1dCB0aGUgYXR0cmlidXRlcyBhcmUgZGVmaW5lZCB1c2luZyB0aGUgYXR0ciBmdW5jdGlvblxuICAgKiByYXRoZXIgdGhhbiBiZWluZyBwYXNzZWQgYXMgYXJndW1lbnRzLiBNdXN0IGJlIGZvbGxsb3dlZCBieSAwIG9yIG1vcmUgY2FsbHNcbiAgICogdG8gYXR0ciwgdGhlbiBhIGNhbGwgdG8gZWxlbWVudE9wZW5FbmQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIGVsZW1lbnQncyB0YWcuXG4gICAqIEBwYXJhbSB7P3N0cmluZz19IGtleSBUaGUga2V5IHVzZWQgdG8gaWRlbnRpZnkgdGhpcyBlbGVtZW50LiBUaGlzIGNhbiBiZSBhblxuICAgKiAgICAgZW1wdHkgc3RyaW5nLCBidXQgcGVyZm9ybWFuY2UgbWF5IGJlIGJldHRlciBpZiBhIHVuaXF1ZSB2YWx1ZSBpcyB1c2VkXG4gICAqICAgICB3aGVuIGl0ZXJhdGluZyBvdmVyIGFuIGFycmF5IG9mIGl0ZW1zLlxuICAgKiBAcGFyYW0gez9BcnJheTwqPj19IHN0YXRpY3MgQW4gYXJyYXkgb2YgYXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMgb2YgdGhlXG4gICAqICAgICBzdGF0aWMgYXR0cmlidXRlcyBmb3IgdGhlIEVsZW1lbnQuIFRoZXNlIHdpbGwgb25seSBiZSBzZXQgb25jZSB3aGVuIHRoZVxuICAgKiAgICAgRWxlbWVudCBpcyBjcmVhdGVkLlxuICAgKi9cbiAgZXhwb3J0cy5lbGVtZW50T3BlblN0YXJ0ID0gZnVuY3Rpb24gKHRhZywga2V5LCBzdGF0aWNzKSB7XG4gICAgaWYgKCdwcm9kdWN0aW9uJyAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBhc3NlcnROb3RJbkF0dHJpYnV0ZXMoKTtcbiAgICAgIHNldEluQXR0cmlidXRlcygpO1xuICAgIH1cblxuICAgIGFyZ3NCdWlsZGVyWzBdID0gdGFnO1xuICAgIGFyZ3NCdWlsZGVyWzFdID0ga2V5O1xuICAgIGFyZ3NCdWlsZGVyWzJdID0gc3RhdGljcztcbiAgfTtcblxuICAvKioqXG4gICAqIERlZmluZXMgYSB2aXJ0dWFsIGF0dHJpYnV0ZSBhdCB0aGlzIHBvaW50IG9mIHRoZSBET00uIFRoaXMgaXMgb25seSB2YWxpZFxuICAgKiB3aGVuIGNhbGxlZCBiZXR3ZWVuIGVsZW1lbnRPcGVuU3RhcnQgYW5kIGVsZW1lbnRPcGVuRW5kLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0geyp9IHZhbHVlXG4gICAqL1xuICBleHBvcnRzLmF0dHIgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICBpZiAoJ3Byb2R1Y3Rpb24nICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGFzc2VydEluQXR0cmlidXRlcygpO1xuICAgIH1cblxuICAgIGFyZ3NCdWlsZGVyLnB1c2gobmFtZSwgdmFsdWUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbG9zZXMgYW4gb3BlbiB0YWcgc3RhcnRlZCB3aXRoIGVsZW1lbnRPcGVuU3RhcnQuXG4gICAqIEByZXR1cm4geyFFbGVtZW50fSBUaGUgY29ycmVzcG9uZGluZyBFbGVtZW50LlxuICAgKi9cbiAgZXhwb3J0cy5lbGVtZW50T3BlbkVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoJ3Byb2R1Y3Rpb24nICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGFzc2VydEluQXR0cmlidXRlcygpO1xuICAgICAgc2V0Tm90SW5BdHRyaWJ1dGVzKCk7XG4gICAgfVxuXG4gICAgdmFyIG5vZGUgPSBleHBvcnRzLmVsZW1lbnRPcGVuLmFwcGx5KG51bGwsIGFyZ3NCdWlsZGVyKTtcbiAgICBhcmdzQnVpbGRlci5sZW5ndGggPSAwO1xuICAgIHJldHVybiBub2RlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbG9zZXMgYW4gb3BlbiB2aXJ0dWFsIEVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIGVsZW1lbnQncyB0YWcuXG4gICAqIEByZXR1cm4geyFFbGVtZW50fSBUaGUgY29ycmVzcG9uZGluZyBFbGVtZW50LlxuICAgKi9cbiAgZXhwb3J0cy5lbGVtZW50Q2xvc2UgPSBmdW5jdGlvbiAodGFnKSB7XG4gICAgaWYgKCdwcm9kdWN0aW9uJyAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBhc3NlcnROb3RJbkF0dHJpYnV0ZXMoKTtcbiAgICAgIGFzc2VydENsb3NlTWF0Y2hlc09wZW5UYWcodGFnKTtcbiAgICB9XG5cbiAgICBwYXJlbnROb2RlKCk7XG5cbiAgICB2YXIgbm9kZSA9IC8qKiBAdHlwZSB7IUVsZW1lbnR9ICovZ2V0V2Fsa2VyKCkuY3VycmVudE5vZGU7XG4gICAgY2xlYXJVbnZpc2l0ZWRET00obm9kZSk7XG5cbiAgICBuZXh0U2libGluZygpO1xuICAgIHJldHVybiBub2RlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEZWNsYXJlcyBhIHZpcnR1YWwgRWxlbWVudCBhdCB0aGUgY3VycmVudCBsb2NhdGlvbiBpbiB0aGUgZG9jdW1lbnQgdGhhdCBoYXNcbiAgICogbm8gY2hpbGRyZW4uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIGVsZW1lbnQncyB0YWcuXG4gICAqIEBwYXJhbSB7P3N0cmluZz19IGtleSBUaGUga2V5IHVzZWQgdG8gaWRlbnRpZnkgdGhpcyBlbGVtZW50LiBUaGlzIGNhbiBiZSBhblxuICAgKiAgICAgZW1wdHkgc3RyaW5nLCBidXQgcGVyZm9ybWFuY2UgbWF5IGJlIGJldHRlciBpZiBhIHVuaXF1ZSB2YWx1ZSBpcyB1c2VkXG4gICAqICAgICB3aGVuIGl0ZXJhdGluZyBvdmVyIGFuIGFycmF5IG9mIGl0ZW1zLlxuICAgKiBAcGFyYW0gez9BcnJheTwqPj19IHN0YXRpY3MgQW4gYXJyYXkgb2YgYXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMgb2YgdGhlXG4gICAqICAgICBzdGF0aWMgYXR0cmlidXRlcyBmb3IgdGhlIEVsZW1lbnQuIFRoZXNlIHdpbGwgb25seSBiZSBzZXQgb25jZSB3aGVuIHRoZVxuICAgKiAgICAgRWxlbWVudCBpcyBjcmVhdGVkLlxuICAgKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzIEF0dHJpYnV0ZSBuYW1lL3ZhbHVlIHBhaXJzIG9mIHRoZSBkeW5hbWljIGF0dHJpYnV0ZXNcbiAgICogICAgIGZvciB0aGUgRWxlbWVudC5cbiAgICogQHJldHVybiB7IUVsZW1lbnR9IFRoZSBjb3JyZXNwb25kaW5nIEVsZW1lbnQuXG4gICAqL1xuICBleHBvcnRzLmVsZW1lbnRWb2lkID0gZnVuY3Rpb24gKHRhZywga2V5LCBzdGF0aWNzLCB2YXJfYXJncykge1xuICAgIGlmICgncHJvZHVjdGlvbicgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzKCk7XG4gICAgfVxuXG4gICAgdmFyIG5vZGUgPSBleHBvcnRzLmVsZW1lbnRPcGVuLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgZXhwb3J0cy5lbGVtZW50Q2xvc2UuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfTtcblxuICAvKipcbiAgICogRGVjbGFyZXMgYSB2aXJ0dWFsIFRleHQgYXQgdGhpcyBwb2ludCBpbiB0aGUgZG9jdW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcnxib29sZWFufSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIFRleHQuXG4gICAqIEBwYXJhbSB7Li4uKGZ1bmN0aW9uKChzdHJpbmd8bnVtYmVyfGJvb2xlYW4pKTpzdHJpbmcpfSB2YXJfYXJnc1xuICAgKiAgICAgRnVuY3Rpb25zIHRvIGZvcm1hdCB0aGUgdmFsdWUgd2hpY2ggYXJlIGNhbGxlZCBvbmx5IHdoZW4gdGhlIHZhbHVlIGhhc1xuICAgKiAgICAgY2hhbmdlZC5cbiAgICogQHJldHVybiB7IVRleHR9IFRoZSBjb3JyZXNwb25kaW5nIHRleHQgbm9kZS5cbiAgICovXG4gIGV4cG9ydHMudGV4dCA9IGZ1bmN0aW9uICh2YWx1ZSwgdmFyX2FyZ3MpIHtcbiAgICBpZiAoJ3Byb2R1Y3Rpb24nICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGFzc2VydE5vdEluQXR0cmlidXRlcygpO1xuICAgIH1cblxuICAgIHZhciBub2RlID0gLyoqIEB0eXBlIHshVGV4dH0qL2FsaWduV2l0aERPTSgnI3RleHQnLCBudWxsKTtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEobm9kZSk7XG5cbiAgICBpZiAoZGF0YS50ZXh0ICE9PSB2YWx1ZSkge1xuICAgICAgZGF0YS50ZXh0ID0gLyoqIEB0eXBlIHtzdHJpbmd9ICovdmFsdWU7XG5cbiAgICAgIHZhciBmb3JtYXR0ZWQgPSB2YWx1ZTtcbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGZvcm1hdHRlZCA9IGFyZ3VtZW50c1tpXShmb3JtYXR0ZWQpO1xuICAgICAgfVxuXG4gICAgICBub2RlLmRhdGEgPSBmb3JtYXR0ZWQ7XG4gICAgfVxuXG4gICAgbmV4dFNpYmxpbmcoKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfTtcblxuICAvKipcbiAgICogUHVibGljbHkgZXhwb3J0cyB0aGUgbXV0YXRvciBob29rcyBmcm9tIHZhcmlvdXMgaW50ZXJuYWwgbW9kdWxlcy5cbiAgICogTm90ZSB0aGF0IG11dGF0aW5nIHRoZXNlIG9iamVjdHMgd2lsbCBhbHRlciB0aGUgYmVoYXZpb3Igb2YgdGhlIGludGVybmFsXG4gICAqIGNvZGUuXG4gICAqIHtPYmplY3Q8c3RyaW5nLCBPYmplY3Q8c3RyaW5nLCBmdW5jdGlvbj4+fVxuICAgKi9cbiAgZXhwb3J0cy5tdXRhdG9ycyA9IHtcbiAgICBhdHRyaWJ1dGVzOiBfbXV0YXRvcnNcbiAgfTtcblxuICAvKipcbiAgICogUHVibGljbHkgZXhwb3J0cyB0aGUgZGVmYXVsdCBtdXRhdG9ycyBmcm9tIHZhcmlvdXMgaW50ZXJuYWwgbW9kdWxlcy5cbiAgICogTm90ZSB0aGF0IG11dGF0aW5nIHRoZXNlIG9iamVjdHMgd2lsbCBoYXZlIG5vIGFmZmVjdCBvbiB0aGUgaW50ZXJuYWwgY29kZSxcbiAgICogdGhlc2UgYXJlIGV4cG9zZWQgb25seSB0byBiZSB1c2VkIGJ5IGN1c3RvbSBtdXRhdG9ycy5cbiAgICoge09iamVjdDxzdHJpbmcsIE9iamVjdDxzdHJpbmcsIGZ1bmN0aW9uPj59XG4gICAqL1xuICBleHBvcnRzLmRlZmF1bHRzID0ge1xuICAgIGF0dHJpYnV0ZXM6IF9kZWZhdWx0c1xuICB9O1xufSk7XG5cbi8vIFNwZWNpYWwgZ2VuZXJpYyBtdXRhdG9yIHRoYXQncyBjYWxsZWQgZm9yIGFueSBhdHRyaWJ1dGUgdGhhdCBkb2VzIG5vdFxuLy8gaGF2ZSBhIHNwZWNpZmljIG11dGF0b3IuXG5cbi8vIFNwZWNpYWwgY2FzZSB0aGUgc3R5bGUgYXR0cmlidXRlXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmNyZW1lbnRhbC1kb20uanMubWFwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9zdXBlcm1vZGVscycpO1xuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJylcbnZhciBjcmVhdGVXcmFwcGVyRmFjdG9yeSA9IHJlcXVpcmUoJy4vZmFjdG9yeScpXG5cbmZ1bmN0aW9uIHJlc29sdmUgKGZyb20pIHtcbiAgdmFyIGlzQ3RvciA9IHV0aWwuaXNDb25zdHJ1Y3Rvcihmcm9tKVxuICB2YXIgaXNTdXBlcm1vZGVsQ3RvciA9IHV0aWwuaXNTdXBlcm1vZGVsQ29uc3RydWN0b3IoZnJvbSlcbiAgdmFyIGlzQXJyYXkgPSB1dGlsLmlzQXJyYXkoZnJvbSlcblxuICBpZiAoaXNDdG9yIHx8IGlzU3VwZXJtb2RlbEN0b3IgfHwgaXNBcnJheSkge1xuICAgIHJldHVybiB7XG4gICAgICBfX3R5cGU6IGZyb21cbiAgICB9XG4gIH1cblxuICB2YXIgaXNWYWx1ZSA9ICF1dGlsLmlzT2JqZWN0KGZyb20pXG4gIGlmIChpc1ZhbHVlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIF9fdmFsdWU6IGZyb21cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnJvbVxufVxuXG5mdW5jdGlvbiBjcmVhdGVEZWYgKGZyb20pIHtcbiAgZnJvbSA9IHJlc29sdmUoZnJvbSlcblxuICB2YXIgX19WQUxJREFUT1JTID0gJ19fdmFsaWRhdG9ycydcbiAgdmFyIF9fVkFMVUUgPSAnX192YWx1ZSdcbiAgdmFyIF9fVFlQRSA9ICdfX3R5cGUnXG4gIHZhciBfX0RJU1BMQVlOQU1FID0gJ19fZGlzcGxheU5hbWUnXG4gIHZhciBfX0dFVCA9ICdfX2dldCdcbiAgdmFyIF9fU0VUID0gJ19fc2V0J1xuICB2YXIgX19FTlVNRVJBQkxFID0gJ19fZW51bWVyYWJsZSdcbiAgdmFyIF9fQ09ORklHVVJBQkxFID0gJ19fY29uZmlndXJhYmxlJ1xuICB2YXIgX19XUklUQUJMRSA9ICdfX3dyaXRhYmxlJ1xuICB2YXIgX19TUEVDSUFMX1BST1BTID0gW1xuICAgIF9fVkFMSURBVE9SUywgX19WQUxVRSwgX19UWVBFLCBfX0RJU1BMQVlOQU1FLFxuICAgIF9fR0VULCBfX1NFVCwgX19FTlVNRVJBQkxFLCBfX0NPTkZJR1VSQUJMRSwgX19XUklUQUJMRVxuICBdXG5cbiAgdmFyIGRlZiA9IHtcbiAgICBmcm9tOiBmcm9tLFxuICAgIHR5cGU6IGZyb21bX19UWVBFXSxcbiAgICB2YWx1ZTogZnJvbVtfX1ZBTFVFXSxcbiAgICB2YWxpZGF0b3JzOiBmcm9tW19fVkFMSURBVE9SU10gfHwgW10sXG4gICAgZW51bWVyYWJsZTogZnJvbVtfX0VOVU1FUkFCTEVdICE9PSBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6ICEhZnJvbVtfX0NPTkZJR1VSQUJMRV0sXG4gICAgd3JpdGFibGU6IGZyb21bX19XUklUQUJMRV0gIT09IGZhbHNlLFxuICAgIGRpc3BsYXlOYW1lOiBmcm9tW19fRElTUExBWU5BTUVdLFxuICAgIGdldHRlcjogZnJvbVtfX0dFVF0sXG4gICAgc2V0dGVyOiBmcm9tW19fU0VUXVxuICB9XG5cbiAgdmFyIHR5cGUgPSBkZWYudHlwZVxuXG4gIC8vIFNpbXBsZSAnQ29uc3RydWN0b3InIFR5cGVcbiAgaWYgKHV0aWwuaXNTaW1wbGVDb25zdHJ1Y3Rvcih0eXBlKSkge1xuICAgIGRlZi5pc1NpbXBsZSA9IHRydWVcblxuICAgIGRlZi5jYXN0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdXRpbC5jYXN0KHZhbHVlLCB0eXBlKVxuICAgIH1cbiAgfSBlbHNlIGlmICh1dGlsLmlzU3VwZXJtb2RlbENvbnN0cnVjdG9yKHR5cGUpKSB7XG4gICAgZGVmLmlzUmVmZXJlbmNlID0gdHJ1ZVxuICB9IGVsc2UgaWYgKGRlZi52YWx1ZSkge1xuICAgIC8vIElmIGEgdmFsdWUgaXMgcHJlc2VudCwgdXNlXG4gICAgLy8gdGhhdCBhbmQgc2hvcnQtY2lyY3VpdCB0aGUgcmVzdFxuICAgIGRlZi5pc1NpbXBsZSA9IHRydWVcbiAgfSBlbHNlIHtcbiAgICAvLyBPdGhlcndpc2UgbG9vayBmb3Igb3RoZXIgbm9uLXNwZWNpYWxcbiAgICAvLyBrZXlzIGFuZCBhbHNvIGFueSBpdGVtIGRlZmluaXRpb25cbiAgICAvLyBpbiB0aGUgY2FzZSBvZiBBcnJheXNcblxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZnJvbSlcbiAgICB2YXIgY2hpbGRLZXlzID0ga2V5cy5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHJldHVybiBfX1NQRUNJQUxfUFJPUFMuaW5kZXhPZihpdGVtKSA9PT0gLTFcbiAgICB9KVxuXG4gICAgaWYgKGNoaWxkS2V5cy5sZW5ndGgpIHtcbiAgICAgIHZhciBkZWZzID0ge31cbiAgICAgIHZhciBwcm90b1xuXG4gICAgICBjaGlsZEtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciBkZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihmcm9tLCBrZXkpXG4gICAgICAgIHZhciB2YWx1ZVxuXG4gICAgICAgIGlmIChkZXNjcmlwdG9yLmdldCB8fCBkZXNjcmlwdG9yLnNldCkge1xuICAgICAgICAgIHZhbHVlID0ge1xuICAgICAgICAgICAgX19nZXQ6IGRlc2NyaXB0b3IuZ2V0LFxuICAgICAgICAgICAgX19zZXQ6IGRlc2NyaXB0b3Iuc2V0XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gZnJvbVtrZXldXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXV0aWwuaXNDb25zdHJ1Y3Rvcih2YWx1ZSkgJiYgIXV0aWwuaXNTdXBlcm1vZGVsQ29uc3RydWN0b3IodmFsdWUpICYmIHV0aWwuaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgICAgICBpZiAoIXByb3RvKSB7XG4gICAgICAgICAgICBwcm90byA9IHt9XG4gICAgICAgICAgfVxuICAgICAgICAgIHByb3RvW2tleV0gPSB2YWx1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZnNba2V5XSA9IGNyZWF0ZURlZih2YWx1ZSlcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgZGVmLmRlZnMgPSBkZWZzXG4gICAgICBkZWYucHJvdG8gPSBwcm90b1xuXG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIEFycmF5XG4gICAgaWYgKHR5cGUgPT09IEFycmF5IHx8IHV0aWwuaXNBcnJheSh0eXBlKSkge1xuICAgICAgZGVmLmlzQXJyYXkgPSB0cnVlXG5cbiAgICAgIGlmICh0eXBlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZGVmLmRlZiA9IGNyZWF0ZURlZih0eXBlWzBdKVxuICAgICAgfVxuXG4gICAgfSBlbHNlIGlmIChjaGlsZEtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBkZWYuaXNTaW1wbGUgPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgZGVmLmNyZWF0ZSA9IGNyZWF0ZVdyYXBwZXJGYWN0b3J5KGRlZilcblxuICByZXR1cm4gZGVmXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlRGVmXG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgdmFyIGFyciA9IFtdXG5cbiAgLyoqXG4gICAqIFByb3hpZWQgYXJyYXkgbXV0YXRvcnMgbWV0aG9kc1xuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICB2YXIgcG9wID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXN1bHQgPSBBcnJheS5wcm90b3R5cGUucG9wLmFwcGx5KGFycilcblxuICAgIGNhbGxiYWNrKCdwb3AnLCBhcnIsIHtcbiAgICAgIHZhbHVlOiByZXN1bHRcbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIHZhciBwdXNoID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXN1bHQgPSBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShhcnIsIGFyZ3VtZW50cylcblxuICAgIGNhbGxiYWNrKCdwdXNoJywgYXJyLCB7XG4gICAgICB2YWx1ZTogcmVzdWx0XG4gICAgfSlcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICB2YXIgc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IEFycmF5LnByb3RvdHlwZS5zaGlmdC5hcHBseShhcnIpXG5cbiAgICBjYWxsYmFjaygnc2hpZnQnLCBhcnIsIHtcbiAgICAgIHZhbHVlOiByZXN1bHRcbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIHZhciBzb3J0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXN1bHQgPSBBcnJheS5wcm90b3R5cGUuc29ydC5hcHBseShhcnIsIGFyZ3VtZW50cylcblxuICAgIGNhbGxiYWNrKCdzb3J0JywgYXJyLCB7XG4gICAgICB2YWx1ZTogcmVzdWx0XG4gICAgfSlcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICB2YXIgdW5zaGlmdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuYXBwbHkoYXJyLCBhcmd1bWVudHMpXG5cbiAgICBjYWxsYmFjaygndW5zaGlmdCcsIGFyciwge1xuICAgICAgdmFsdWU6IHJlc3VsdFxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgdmFyIHJldmVyc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IEFycmF5LnByb3RvdHlwZS5yZXZlcnNlLmFwcGx5KGFycilcblxuICAgIGNhbGxiYWNrKCdyZXZlcnNlJywgYXJyLCB7XG4gICAgICB2YWx1ZTogcmVzdWx0XG4gICAgfSlcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICB2YXIgc3BsaWNlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9IEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkoYXJyLCBhcmd1bWVudHMpXG5cbiAgICBjYWxsYmFjaygnc3BsaWNlJywgYXJyLCB7XG4gICAgICB2YWx1ZTogcmVzdWx0LFxuICAgICAgcmVtb3ZlZDogcmVzdWx0LFxuICAgICAgYWRkZWQ6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMilcbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgLyoqXG4gICAqIFByb3h5IGFsbCBBcnJheS5wcm90b3R5cGUgbXV0YXRvciBtZXRob2RzIG9uIHRoaXMgYXJyYXkgaW5zdGFuY2VcbiAgICovXG4gIGFyci5wb3AgPSBhcnIucG9wICYmIHBvcFxuICBhcnIucHVzaCA9IGFyci5wdXNoICYmIHB1c2hcbiAgYXJyLnNoaWZ0ID0gYXJyLnNoaWZ0ICYmIHNoaWZ0XG4gIGFyci51bnNoaWZ0ID0gYXJyLnVuc2hpZnQgJiYgdW5zaGlmdFxuICBhcnIuc29ydCA9IGFyci5zb3J0ICYmIHNvcnRcbiAgYXJyLnJldmVyc2UgPSBhcnIucmV2ZXJzZSAmJiByZXZlcnNlXG4gIGFyci5zcGxpY2UgPSBhcnIuc3BsaWNlICYmIHNwbGljZVxuXG4gIC8qKlxuICAgKiBTcGVjaWFsIHVwZGF0ZSBmdW5jdGlvbiBzaW5jZSB3ZSBjYW4ndCBkZXRlY3RcbiAgICogYXNzaWdubWVudCBieSBpbmRleCBlLmcuIGFyclswXSA9ICdzb21ldGhpbmcnXG4gICAqL1xuICBhcnIudXBkYXRlID0gZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xuICAgIHZhciBvbGRWYWx1ZSA9IGFycltpbmRleF1cbiAgICB2YXIgbmV3VmFsdWUgPSBhcnJbaW5kZXhdID0gdmFsdWVcblxuICAgIGNhbGxiYWNrKCd1cGRhdGUnLCBhcnIsIHtcbiAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgIHZhbHVlOiBuZXdWYWx1ZSxcbiAgICAgIG9sZFZhbHVlOiBvbGRWYWx1ZVxuICAgIH0pXG5cbiAgICByZXR1cm4gbmV3VmFsdWVcbiAgfVxuXG4gIHJldHVybiBhcnJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEVtaXR0ZXJFdmVudCAobmFtZSwgcGF0aCwgdGFyZ2V0LCBkZXRhaWwpIHtcbiAgdGhpcy5uYW1lID0gbmFtZVxuICB0aGlzLnBhdGggPSBwYXRoXG4gIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XG5cbiAgaWYgKGRldGFpbCkge1xuICAgIHRoaXMuZGV0YWlsID0gZGV0YWlsXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyXG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyIChvYmopIHtcbiAgdmFyIGN0eCA9IG9iaiB8fCB0aGlzXG5cbiAgaWYgKG9iaikge1xuICAgIGN0eCA9IG1peGluKG9iailcbiAgICByZXR1cm4gY3R4XG4gIH1cbn1cblxuLyoqXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluIChvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldXG4gIH1cbiAgcmV0dXJuIG9ialxufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPSBFbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50LCBmbikge1xuICAodGhpcy5fX2NhbGxiYWNrc1tldmVudF0gPSB0aGlzLl9fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXSlcbiAgICAucHVzaChmbilcbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIChldmVudCwgZm4pIHtcbiAgZnVuY3Rpb24gb24gKCkge1xuICAgIHRoaXMub2ZmKGV2ZW50LCBvbilcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gIH1cblxuICBvbi5mbiA9IGZuXG4gIHRoaXMub24oZXZlbnQsIG9uKVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gKGV2ZW50LCBmbikge1xuICAvLyBhbGxcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICB0aGlzLl9fY2FsbGJhY2tzID0ge31cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX19jYWxsYmFja3NbZXZlbnRdXG4gIGlmICghY2FsbGJhY2tzKSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICBkZWxldGUgdGhpcy5fX2NhbGxiYWNrc1tldmVudF1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGNiXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2IgPSBjYWxsYmFja3NbaV1cbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9fY2FsbGJhY2tzW2V2ZW50XVxuXG4gIGlmIChjYWxsYmFja3MpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMClcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIHJldHVybiB0aGlzLl9fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXVxufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uIChldmVudCkge1xuICByZXR1cm4gISF0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoXG59XG4iLCIndXNlIHN0cmljdCdcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKVxudmFyIGNyZWF0ZU1vZGVsUHJvdG90eXBlID0gcmVxdWlyZSgnLi9wcm90bycpXG52YXIgV3JhcHBlciA9IHJlcXVpcmUoJy4vd3JhcHBlcicpXG5cbmZ1bmN0aW9uIGNyZWF0ZU1vZGVsRGVzY3JpcHRvcnMgKGRlZiwgcGFyZW50KSB7XG4gIHZhciBfXyA9IHt9XG5cbiAgdmFyIGRlc2MgPSB7XG4gICAgX186IHtcbiAgICAgIHZhbHVlOiBfX1xuICAgIH0sXG4gICAgX19kZWY6IHtcbiAgICAgIHZhbHVlOiBkZWZcbiAgICB9LFxuICAgIF9fcGFyZW50OiB7XG4gICAgICB2YWx1ZTogcGFyZW50LFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIF9fY2FsbGJhY2tzOiB7XG4gICAgICB2YWx1ZToge30sXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkZXNjXG59XG5cbmZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMgKG1vZGVsKSB7XG4gIHZhciBkZWZzID0gbW9kZWwuX19kZWYuZGVmc1xuICBmb3IgKHZhciBrZXkgaW4gZGVmcykge1xuICAgIGRlZmluZVByb3BlcnR5KG1vZGVsLCBrZXksIGRlZnNba2V5XSlcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eSAobW9kZWwsIGtleSwgZGVmKSB7XG4gIHZhciBkZXNjID0ge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX19nZXQoa2V5KVxuICAgIH0sXG4gICAgZW51bWVyYWJsZTogZGVmLmVudW1lcmFibGUsXG4gICAgY29uZmlndXJhYmxlOiBkZWYuY29uZmlndXJhYmxlXG4gIH1cblxuICBpZiAoZGVmLndyaXRhYmxlKSB7XG4gICAgZGVzYy5zZXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMuX19zZXROb3RpZnlDaGFuZ2Uoa2V5LCB2YWx1ZSlcbiAgICB9XG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kZWwsIGtleSwgZGVzYylcblxuICAvLyBTaWxlbnRseSBpbml0aWFsaXplIHRoZSBwcm9wZXJ0eSB3cmFwcGVyXG4gIG1vZGVsLl9fW2tleV0gPSBkZWYuY3JlYXRlKG1vZGVsKVxufVxuXG5mdW5jdGlvbiBjcmVhdGVXcmFwcGVyRmFjdG9yeSAoZGVmKSB7XG4gIHZhciB3cmFwcGVyLCBkZWZhdWx0VmFsdWUsIGFzc2VydFxuXG4gIGlmIChkZWYuaXNTaW1wbGUpIHtcbiAgICB3cmFwcGVyID0gbmV3IFdyYXBwZXIoZGVmLnZhbHVlLCBkZWYud3JpdGFibGUsIGRlZi52YWxpZGF0b3JzLCBkZWYuZ2V0dGVyLCBkZWYuc2V0dGVyLCBkZWYuY2FzdCwgbnVsbClcbiAgfSBlbHNlIGlmIChkZWYuaXNSZWZlcmVuY2UpIHtcbiAgICAvLyBIb2xkIGEgcmVmZXJlbmNlIHRvIHRoZVxuICAgIC8vIHJlZmVyZXJlbmNlZCB0eXBlcycgZGVmaW5pdGlvblxuICAgIHZhciByZWZEZWYgPSBkZWYudHlwZS5kZWZcblxuICAgIGlmIChyZWZEZWYuaXNTaW1wbGUpIHtcbiAgICAgIC8vIElmIHRoZSByZWZlcmVuY2VkIHR5cGUgaXMgaXRzZWxmIHNpbXBsZSxcbiAgICAgIC8vIHdlIGNhbiBzZXQganVzdCByZXR1cm4gYSB3cmFwcGVyIGFuZFxuICAgICAgLy8gdGhlIHByb3BlcnR5IHdpbGwgZ2V0IGluaXRpYWxpemVkLlxuICAgICAgd3JhcHBlciA9IG5ldyBXcmFwcGVyKHJlZkRlZi52YWx1ZSwgcmVmRGVmLndyaXRhYmxlLCByZWZEZWYudmFsaWRhdG9ycywgZGVmLmdldHRlciwgZGVmLnNldHRlciwgcmVmRGVmLmNhc3QsIG51bGwpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIHdlJ3JlIG5vdCBkZWFsaW5nIHdpdGggYSBzaW1wbGUgcmVmZXJlbmNlIG1vZGVsXG4gICAgICAvLyB3ZSBuZWVkIHRvIGRlZmluZSBhbiBhc3NlcnRpb24gdGhhdCB0aGUgaW5zdGFuY2VcbiAgICAgIC8vIGJlaW5nIHNldCBpcyBvZiB0aGUgY29ycmVjdCB0eXBlLiBXZSBkbyB0aGlzIGJlXG4gICAgICAvLyBjb21wYXJpbmcgdGhlIGRlZnMuXG5cbiAgICAgIGFzc2VydCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBjb21wYXJlIHRoZSBkZWZpbnRpb25zIG9mIHRoZSB2YWx1ZSBpbnN0YW5jZVxuICAgICAgICAvLyBiZWluZyBwYXNzZWQgYW5kIHRoZSBkZWYgcHJvcGVydHkgYXR0YWNoZWRcbiAgICAgICAgLy8gdG8gdGhlIHR5cGUgU3VwZXJtb2RlbENvbnN0cnVjdG9yLiBBbGxvdyB0aGVcbiAgICAgICAgLy8gdmFsdWUgdG8gYmUgdW5kZWZpbmVkIG9yIG51bGwgYWxzby5cbiAgICAgICAgdmFyIGlzQ29ycmVjdFR5cGUgPSBmYWxzZVxuXG4gICAgICAgIGlmICh1dGlsLmlzTnVsbE9yVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgICAgIGlzQ29ycmVjdFR5cGUgPSB0cnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXNDb3JyZWN0VHlwZSA9IHJlZkRlZiA9PT0gdmFsdWUuX19kZWZcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNDb3JyZWN0VHlwZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVmFsdWUgc2hvdWxkIGJlIGFuIGluc3RhbmNlIG9mIHRoZSByZWZlcmVuY2VkIG1vZGVsLCBudWxsIG9yIHVuZGVmaW5lZCcpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgd3JhcHBlciA9IG5ldyBXcmFwcGVyKGRlZi52YWx1ZSwgZGVmLndyaXRhYmxlLCBkZWYudmFsaWRhdG9ycywgZGVmLmdldHRlciwgZGVmLnNldHRlciwgbnVsbCwgYXNzZXJ0KVxuICAgIH1cbiAgfSBlbHNlIGlmIChkZWYuaXNBcnJheSkge1xuICAgIGRlZmF1bHRWYWx1ZSA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgICAgIC8vIGZvciBBcnJheXMsIHdlIGNyZWF0ZSBhIG5ldyBBcnJheSBhbmQgZWFjaFxuICAgICAgLy8gdGltZSwgbWl4IHRoZSBtb2RlbCBwcm9wZXJ0aWVzIGludG8gaXRcbiAgICAgIHZhciBtb2RlbCA9IGNyZWF0ZU1vZGVsUHJvdG90eXBlKGRlZilcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKG1vZGVsLCBjcmVhdGVNb2RlbERlc2NyaXB0b3JzKGRlZiwgcGFyZW50KSlcbiAgICAgIGRlZmluZVByb3BlcnRpZXMobW9kZWwpXG4gICAgICByZXR1cm4gbW9kZWxcbiAgICB9XG5cbiAgICBhc3NlcnQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIC8vIHRvZG86IGZ1cnRoZXIgYXJyYXkgdHlwZSB2YWxpZGF0aW9uXG4gICAgICBpZiAoIXV0aWwuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdWYWx1ZSBzaG91bGQgYmUgYW4gYXJyYXknKVxuICAgICAgfVxuICAgIH1cblxuICAgIHdyYXBwZXIgPSBuZXcgV3JhcHBlcihkZWZhdWx0VmFsdWUsIGRlZi53cml0YWJsZSwgZGVmLnZhbGlkYXRvcnMsIGRlZi5nZXR0ZXIsIGRlZi5zZXR0ZXIsIG51bGwsIGFzc2VydClcbiAgfSBlbHNlIHtcbiAgICAvLyBmb3IgT2JqZWN0cywgd2UgY2FuIGNyZWF0ZSBhbmQgcmV1c2VcbiAgICAvLyBhIHByb3RvdHlwZSBvYmplY3QuIFdlIHRoZW4gbmVlZCB0byBvbmx5XG4gICAgLy8gZGVmaW5lIHRoZSBkZWZzIGFuZCB0aGUgJ2luc3RhbmNlJyBwcm9wZXJ0aWVzXG4gICAgLy8gZS5nLiBfXywgcGFyZW50IGV0Yy5cbiAgICB2YXIgcHJvdG8gPSBjcmVhdGVNb2RlbFByb3RvdHlwZShkZWYpXG5cbiAgICBkZWZhdWx0VmFsdWUgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gICAgICB2YXIgbW9kZWwgPSBPYmplY3QuY3JlYXRlKHByb3RvLCBjcmVhdGVNb2RlbERlc2NyaXB0b3JzKGRlZiwgcGFyZW50KSlcbiAgICAgIGRlZmluZVByb3BlcnRpZXMobW9kZWwpXG4gICAgICByZXR1cm4gbW9kZWxcbiAgICB9XG5cbiAgICBhc3NlcnQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICghcHJvdG8uaXNQcm90b3R5cGVPZih2YWx1ZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHByb3RvdHlwZScpXG4gICAgICB9XG4gICAgfVxuXG4gICAgd3JhcHBlciA9IG5ldyBXcmFwcGVyKGRlZmF1bHRWYWx1ZSwgZGVmLndyaXRhYmxlLCBkZWYudmFsaWRhdG9ycywgZGVmLmdldHRlciwgZGVmLnNldHRlciwgbnVsbCwgYXNzZXJ0KVxuICB9XG5cbiAgdmFyIGZhY3RvcnkgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gICAgdmFyIHdyYXAgPSBPYmplY3QuY3JlYXRlKHdyYXBwZXIpXG4gICAgLy8gaWYgKCF3cmFwLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICB3cmFwLmluaXRpYWxpemUocGFyZW50KVxuICAgIC8vIH1cbiAgICByZXR1cm4gd3JhcFxuICB9XG5cbiAgLy8gZXhwb3NlIHRoZSB3cmFwcGVyLCB0aGlzIGlzIHVzZWRcbiAgLy8gZm9yIHZhbGlkYXRpbmcgYXJyYXkgaXRlbXMgbGF0ZXJcbiAgZmFjdG9yeS53cmFwcGVyID0gd3JhcHBlclxuXG4gIHJldHVybiBmYWN0b3J5XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlV3JhcHBlckZhY3RvcnlcbiIsIid1c2Ugc3RyaWN0J1xuXG5mdW5jdGlvbiBtZXJnZSAobW9kZWwsIG9iaikge1xuICB2YXIgaXNBcnJheSA9IG1vZGVsLl9fZGVmLmlzQXJyYXlcbiAgdmFyIGRlZnMgPSBtb2RlbC5fX2RlZi5kZWZzXG4gIHZhciBkZWZLZXlzLCBkZWYsIGtleSwgaSwgaXNTaW1wbGUsXG4gICAgaXNTaW1wbGVSZWZlcmVuY2UsIGlzSW5pdGlhbGl6ZWRSZWZlcmVuY2VcblxuICBpZiAoZGVmcykge1xuICAgIGRlZktleXMgPSBPYmplY3Qua2V5cyhkZWZzKVxuICAgIGZvciAoaSA9IDA7IGkgPCBkZWZLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBrZXkgPSBkZWZLZXlzW2ldXG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgZGVmID0gZGVmc1trZXldXG5cbiAgICAgICAgaXNTaW1wbGUgPSBkZWYuaXNTaW1wbGVcbiAgICAgICAgaXNTaW1wbGVSZWZlcmVuY2UgPSBkZWYuaXNSZWZlcmVuY2UgJiYgZGVmLnR5cGUuZGVmLmlzU2ltcGxlXG4gICAgICAgIGlzSW5pdGlhbGl6ZWRSZWZlcmVuY2UgPSBkZWYuaXNSZWZlcmVuY2UgJiYgb2JqW2tleV0gJiYgb2JqW2tleV0uX19zdXBlcm1vZGVsXG5cbiAgICAgICAgaWYgKGlzU2ltcGxlIHx8IGlzU2ltcGxlUmVmZXJlbmNlIHx8IGlzSW5pdGlhbGl6ZWRSZWZlcmVuY2UpIHtcbiAgICAgICAgICBtb2RlbFtrZXldID0gb2JqW2tleV1cbiAgICAgICAgfSBlbHNlIGlmIChvYmpba2V5XSkge1xuICAgICAgICAgIGlmIChkZWYuaXNSZWZlcmVuY2UpIHtcbiAgICAgICAgICAgIG1vZGVsW2tleV0gPSBkZWYudHlwZSgpXG4gICAgICAgICAgfVxuICAgICAgICAgIG1lcmdlKG1vZGVsW2tleV0sIG9ialtrZXldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGlzQXJyYXkgJiYgQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IG9iai5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGl0ZW0gPSBtb2RlbC5jcmVhdGUoKVxuICAgICAgbW9kZWwucHVzaChpdGVtICYmIGl0ZW0uX19zdXBlcm1vZGVsID8gbWVyZ2UoaXRlbSwgb2JqW2ldKSA6IG9ialtpXSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbW9kZWxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtZXJnZVxuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBFbWl0dGVyRXZlbnQgPSByZXF1aXJlKCcuL2VtaXR0ZXItZXZlbnQnKVxudmFyIFZhbGlkYXRpb25FcnJvciA9IHJlcXVpcmUoJy4vdmFsaWRhdGlvbi1lcnJvcicpXG52YXIgV3JhcHBlciA9IHJlcXVpcmUoJy4vd3JhcHBlcicpXG52YXIgbWVyZ2UgPSByZXF1aXJlKCcuL21lcmdlJylcblxudmFyIGRlc2NyaXB0b3JzID0ge1xuICBfX3N1cGVybW9kZWw6IHtcbiAgICB2YWx1ZTogdHJ1ZVxuICB9LFxuICBfX2tleXM6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcylcblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcykpIHtcbiAgICAgICAgdmFyIG9taXQgPSBbXG4gICAgICAgICAgJ2FkZEV2ZW50TGlzdGVuZXInLCAnb24nLCAnb25jZScsICdyZW1vdmVFdmVudExpc3RlbmVyJywgJ3JlbW92ZUFsbExpc3RlbmVycycsXG4gICAgICAgICAgJ3JlbW92ZUxpc3RlbmVyJywgJ29mZicsICdlbWl0JywgJ2xpc3RlbmVycycsICdoYXNMaXN0ZW5lcnMnLCAncG9wJywgJ3B1c2gnLFxuICAgICAgICAgICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3VwZGF0ZScsICd1bnNoaWZ0JywgJ2NyZWF0ZScsICdfX21lcmdlJyxcbiAgICAgICAgICAnX19zZXROb3RpZnlDaGFuZ2UnLCAnX19ub3RpZnlDaGFuZ2UnLCAnX19zZXQnLCAnX19nZXQnLCAnX19jaGFpbicsICdfX3JlbGF0aXZlUGF0aCdcbiAgICAgICAgXVxuXG4gICAgICAgIGtleXMgPSBrZXlzLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgIHJldHVybiBvbWl0LmluZGV4T2YoaXRlbSkgPCAwXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBrZXlzXG4gICAgfVxuICB9LFxuICBfX25hbWU6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLl9faXNSb290KSB7XG4gICAgICAgIHJldHVybiAnJ1xuICAgICAgfVxuXG4gICAgICAvLyBXb3JrIG91dCB0aGUgJ25hbWUnIG9mIHRoZSBtb2RlbFxuICAgICAgLy8gTG9vayB1cCB0byB0aGUgcGFyZW50IGFuZCBsb29wIHRocm91Z2ggaXQncyBrZXlzLFxuICAgICAgLy8gQW55IHZhbHVlIG9yIGFycmF5IGZvdW5kIHRvIGNvbnRhaW4gdGhlIHZhbHVlIG9mIHRoaXMgKHRoaXMgbW9kZWwpXG4gICAgICAvLyB0aGVuIHdlIHJldHVybiB0aGUga2V5IGFuZCBpbmRleCBpbiB0aGUgY2FzZSB3ZSBmb3VuZCB0aGUgbW9kZWwgaW4gYW4gYXJyYXkuXG4gICAgICB2YXIgcGFyZW50S2V5cyA9IHRoaXMuX19wYXJlbnQuX19rZXlzXG4gICAgICB2YXIgcGFyZW50S2V5LCBwYXJlbnRWYWx1ZVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmVudEtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGFyZW50S2V5ID0gcGFyZW50S2V5c1tpXVxuICAgICAgICBwYXJlbnRWYWx1ZSA9IHRoaXMuX19wYXJlbnRbcGFyZW50S2V5XVxuXG4gICAgICAgIGlmIChwYXJlbnRWYWx1ZSA9PT0gdGhpcykge1xuICAgICAgICAgIHJldHVybiBwYXJlbnRLZXlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX19wYXRoOiB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5fX2hhc0FuY2VzdG9ycyAmJiAhdGhpcy5fX3BhcmVudC5fX2lzUm9vdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX3BhcmVudC5fX3BhdGggKyAnLicgKyB0aGlzLl9fbmFtZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19uYW1lXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBfX2lzUm9vdDoge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICF0aGlzLl9faGFzQW5jZXN0b3JzXG4gICAgfVxuICB9LFxuICBfX2NoaWxkcmVuOiB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY2hpbGRyZW4gPSBbXVxuXG4gICAgICB2YXIga2V5cyA9IHRoaXMuX19rZXlzXG4gICAgICB2YXIga2V5LCB2YWx1ZVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAga2V5ID0ga2V5c1tpXVxuICAgICAgICB2YWx1ZSA9IHRoaXNba2V5XVxuXG4gICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5fX3N1cGVybW9kZWwpIHtcbiAgICAgICAgICBjaGlsZHJlbi5wdXNoKHZhbHVlKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjaGlsZHJlblxuICAgIH1cbiAgfSxcbiAgX19hbmNlc3RvcnM6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhbmNlc3RvcnMgPSBbXVxuICAgICAgdmFyIHIgPSB0aGlzXG5cbiAgICAgIHdoaWxlIChyLl9fcGFyZW50KSB7XG4gICAgICAgIGFuY2VzdG9ycy5wdXNoKHIuX19wYXJlbnQpXG4gICAgICAgIHIgPSByLl9fcGFyZW50XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhbmNlc3RvcnNcbiAgICB9XG4gIH0sXG4gIF9fZGVzY2VuZGFudHM6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkZXNjZW5kYW50cyA9IFtdXG5cbiAgICAgIGZ1bmN0aW9uIGNoZWNrQW5kQWRkRGVzY2VuZGFudElmTW9kZWwgKG9iaikge1xuICAgICAgICB2YXIga2V5cyA9IG9iai5fX2tleXNcbiAgICAgICAgdmFyIGtleSwgdmFsdWVcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBrZXkgPSBrZXlzW2ldXG4gICAgICAgICAgdmFsdWUgPSBvYmpba2V5XVxuXG4gICAgICAgICAgaWYgKHZhbHVlICYmIHZhbHVlLl9fc3VwZXJtb2RlbCkge1xuICAgICAgICAgICAgZGVzY2VuZGFudHMucHVzaCh2YWx1ZSlcbiAgICAgICAgICAgIGNoZWNrQW5kQWRkRGVzY2VuZGFudElmTW9kZWwodmFsdWUpXG5cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgfVxuXG4gICAgICBjaGVja0FuZEFkZERlc2NlbmRhbnRJZk1vZGVsKHRoaXMpXG5cbiAgICAgIHJldHVybiBkZXNjZW5kYW50c1xuICAgIH1cbiAgfSxcbiAgX19oYXNBbmNlc3RvcnM6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAhIXRoaXMuX19hbmNlc3RvcnMubGVuZ3RoXG4gICAgfVxuICB9LFxuICBfX2hhc0Rlc2NlbmRhbnRzOiB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gISF0aGlzLl9fZGVzY2VuZGFudHMubGVuZ3RoXG4gICAgfVxuICB9LFxuICBlcnJvcnM6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBlcnJvcnMgPSBbXVxuICAgICAgdmFyIGRlZiA9IHRoaXMuX19kZWZcbiAgICAgIHZhciB2YWxpZGF0b3IsIGVycm9yLCBpLCBqXG5cbiAgICAgIC8vIFJ1biBvd24gdmFsaWRhdG9yc1xuICAgICAgdmFyIG93biA9IGRlZi52YWxpZGF0b3JzLnNsaWNlKDApXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgb3duLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbGlkYXRvciA9IG93bltpXVxuICAgICAgICBlcnJvciA9IHZhbGlkYXRvci5jYWxsKHRoaXMsIHRoaXMpXG5cbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgZXJyb3JzLnB1c2gobmV3IFZhbGlkYXRpb25FcnJvcih0aGlzLCBlcnJvciwgdmFsaWRhdG9yKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBSdW4gdGhyb3VnaCBrZXlzIGFuZCBldmFsdWF0ZSB2YWxpZGF0b3JzXG4gICAgICB2YXIga2V5cyA9IHRoaXMuX19rZXlzXG4gICAgICB2YXIgdmFsdWUsIGtleSwgaXRlbURlZlxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBrZXkgPSBrZXlzW2ldXG5cbiAgICAgICAgLy8gSWYgd2UgYXJlIGFuIEFycmF5IHdpdGggYW4gaXRlbSBkZWZpbml0aW9uXG4gICAgICAgIC8vIHRoZW4gd2UgaGF2ZSB0byBsb29rIGludG8gdGhlIEFycmF5IGZvciBvdXIgdmFsdWVcbiAgICAgICAgLy8gYW5kIGFsc28gZ2V0IGhvbGQgb2YgdGhlIHdyYXBwZXIuIFdlIG9ubHkgbmVlZCB0b1xuICAgICAgICAvLyBkbyB0aGlzIGlmIHRoZSBrZXkgaXMgbm90IGEgcHJvcGVydHkgb2YgdGhlIGFycmF5LlxuICAgICAgICAvLyBXZSBjaGVjayB0aGUgZGVmcyB0byB3b3JrIHRoaXMgb3V0IChpLmUuIDAsIDEsIDIpLlxuICAgICAgICAvLyB0b2RvOiBUaGlzIGNvdWxkIGJlIGJldHRlciB0byBjaGVjayAhTmFOIG9uIHRoZSBrZXk/XG4gICAgICAgIGlmIChkZWYuaXNBcnJheSAmJiBkZWYuZGVmICYmICghZGVmLmRlZnMgfHwgIShrZXkgaW4gZGVmLmRlZnMpKSkge1xuICAgICAgICAgIC8vIElmIHdlIGFyZSBhbiBBcnJheSB3aXRoIGEgc2ltcGxlIGl0ZW0gZGVmaW5pdGlvblxuICAgICAgICAgIC8vIG9yIGEgcmVmZXJlbmNlIHRvIGEgc2ltcGxlIHR5cGUgZGVmaW5pdGlvblxuICAgICAgICAgIC8vIHN1YnN0aXR1dGUgdGhlIHZhbHVlIHdpdGggdGhlIHdyYXBwZXIgd2UgZ2V0IGZyb20gdGhlXG4gICAgICAgICAgLy8gY3JlYXRlIGZhY3RvcnkgZnVuY3Rpb24uIE90aGVyd2lzZSBzZXQgdGhlIHZhbHVlIHRvXG4gICAgICAgICAgLy8gdGhlIHJlYWwgdmFsdWUgb2YgdGhlIHByb3BlcnR5LlxuICAgICAgICAgIGl0ZW1EZWYgPSBkZWYuZGVmXG5cbiAgICAgICAgICBpZiAoaXRlbURlZi5pc1NpbXBsZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBpdGVtRGVmLmNyZWF0ZS53cmFwcGVyXG4gICAgICAgICAgICB2YWx1ZS5zZXRWYWx1ZSh0aGlzW2tleV0pXG4gICAgICAgICAgfSBlbHNlIGlmIChpdGVtRGVmLmlzUmVmZXJlbmNlICYmIGl0ZW1EZWYudHlwZS5kZWYuaXNTaW1wbGUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gaXRlbURlZi50eXBlLmRlZi5jcmVhdGUud3JhcHBlclxuICAgICAgICAgICAgdmFsdWUuc2V0VmFsdWUodGhpc1trZXldKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXNba2V5XVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBTZXQgdGhlIHZhbHVlIHRvIHRoZSB3cmFwcGVkIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxuICAgICAgICAgIHZhbHVlID0gdGhpcy5fX1trZXldXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICBpZiAodmFsdWUuX19zdXBlcm1vZGVsKSB7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShlcnJvcnMsIHZhbHVlLmVycm9ycylcbiAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgV3JhcHBlcikge1xuICAgICAgICAgICAgdmFyIHdyYXBwZXJWYWx1ZSA9IHZhbHVlLmdldFZhbHVlKHRoaXMpXG5cbiAgICAgICAgICAgIGlmICh3cmFwcGVyVmFsdWUgJiYgd3JhcHBlclZhbHVlLl9fc3VwZXJtb2RlbCkge1xuICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShlcnJvcnMsIHdyYXBwZXJWYWx1ZS5lcnJvcnMpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YXIgc2ltcGxlID0gdmFsdWUudmFsaWRhdG9yc1xuICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgc2ltcGxlLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdG9yID0gc2ltcGxlW2pdXG4gICAgICAgICAgICAgICAgZXJyb3IgPSB2YWxpZGF0b3IuY2FsbCh0aGlzLCB3cmFwcGVyVmFsdWUsIGtleSlcblxuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgZXJyb3JzLnB1c2gobmV3IFZhbGlkYXRpb25FcnJvcih0aGlzLCBlcnJvciwgdmFsaWRhdG9yLCBrZXkpKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZXJyb3JzXG4gICAgfVxuICB9XG59XG5cbnZhciBwcm90byA9IHtcbiAgX19nZXQ6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5fX1trZXldLmdldFZhbHVlKHRoaXMpXG4gIH0sXG4gIF9fc2V0OiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIHRoaXMuX19ba2V5XS5zZXRWYWx1ZSh2YWx1ZSwgdGhpcylcbiAgfSxcbiAgX19yZWxhdGl2ZVBhdGg6IGZ1bmN0aW9uICh0bywga2V5KSB7XG4gICAgdmFyIHJlbGF0aXZlUGF0aCA9IHRoaXMuX19wYXRoID8gdG8uc3Vic3RyKHRoaXMuX19wYXRoLmxlbmd0aCArIDEpIDogdG9cblxuICAgIGlmIChyZWxhdGl2ZVBhdGgpIHtcbiAgICAgIHJldHVybiBrZXkgPyByZWxhdGl2ZVBhdGggKyAnLicgKyBrZXkgOiByZWxhdGl2ZVBhdGhcbiAgICB9XG4gICAgcmV0dXJuIGtleVxuICB9LFxuICBfX2NoYWluOiBmdW5jdGlvbiAoZm4pIHtcbiAgICByZXR1cm4gW3RoaXNdLmNvbmNhdCh0aGlzLl9fYW5jZXN0b3JzKS5mb3JFYWNoKGZuKVxuICB9LFxuICBfX21lcmdlOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHJldHVybiBtZXJnZSh0aGlzLCBkYXRhKVxuICB9LFxuICBfX25vdGlmeUNoYW5nZTogZnVuY3Rpb24gKGtleSwgbmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgdmFyIHRhcmdldCA9IHRoaXNcbiAgICB2YXIgdGFyZ2V0UGF0aCA9IHRoaXMuX19wYXRoXG4gICAgdmFyIGV2ZW50TmFtZSA9ICdzZXQnXG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICBvbGRWYWx1ZTogb2xkVmFsdWUsXG4gICAgICBuZXdWYWx1ZTogbmV3VmFsdWVcbiAgICB9XG5cbiAgICB0aGlzLmVtaXQoZXZlbnROYW1lLCBuZXcgRW1pdHRlckV2ZW50KGV2ZW50TmFtZSwga2V5LCB0YXJnZXQsIGRhdGEpKVxuICAgIHRoaXMuZW1pdCgnY2hhbmdlJywgbmV3IEVtaXR0ZXJFdmVudChldmVudE5hbWUsIGtleSwgdGFyZ2V0LCBkYXRhKSlcbiAgICB0aGlzLmVtaXQoJ2NoYW5nZTonICsga2V5LCBuZXcgRW1pdHRlckV2ZW50KGV2ZW50TmFtZSwga2V5LCB0YXJnZXQsIGRhdGEpKVxuXG4gICAgdGhpcy5fX2FuY2VzdG9ycy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgcGF0aCA9IGl0ZW0uX19yZWxhdGl2ZVBhdGgodGFyZ2V0UGF0aCwga2V5KVxuICAgICAgaXRlbS5lbWl0KCdjaGFuZ2UnLCBuZXcgRW1pdHRlckV2ZW50KGV2ZW50TmFtZSwgcGF0aCwgdGFyZ2V0LCBkYXRhKSlcbiAgICB9KVxuICB9LFxuICBfX3NldE5vdGlmeUNoYW5nZTogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLl9fZ2V0KGtleSlcbiAgICB0aGlzLl9fc2V0KGtleSwgdmFsdWUpXG4gICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5fX2dldChrZXkpXG4gICAgdGhpcy5fX25vdGlmeUNoYW5nZShrZXksIG5ld1ZhbHVlLCBvbGRWYWx1ZSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcHJvdG86IHByb3RvLFxuICBkZXNjcmlwdG9yczogZGVzY3JpcHRvcnNcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG52YXIgZW1pdHRlciA9IHJlcXVpcmUoJy4vZW1pdHRlci1vYmplY3QnKVxudmFyIGVtaXR0ZXJBcnJheSA9IHJlcXVpcmUoJy4vZW1pdHRlci1hcnJheScpXG52YXIgRW1pdHRlckV2ZW50ID0gcmVxdWlyZSgnLi9lbWl0dGVyLWV2ZW50JylcblxudmFyIGV4dGVuZCA9IHJlcXVpcmUoJy4vdXRpbCcpLmV4dGVuZFxudmFyIG1vZGVsID0gcmVxdWlyZSgnLi9tb2RlbCcpXG52YXIgbW9kZWxQcm90byA9IG1vZGVsLnByb3RvXG52YXIgbW9kZWxEZXNjcmlwdG9ycyA9IG1vZGVsLmRlc2NyaXB0b3JzXG5cbnZhciBtb2RlbFByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUobW9kZWxQcm90bywgbW9kZWxEZXNjcmlwdG9ycylcbnZhciBvYmplY3RQcm90b3R5cGUgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgcCA9IE9iamVjdC5jcmVhdGUobW9kZWxQcm90b3R5cGUpXG5cbiAgZW1pdHRlcihwKVxuXG4gIHJldHVybiBwXG59KSgpXG5cbmZ1bmN0aW9uIGNyZWF0ZUFycmF5UHJvdG90eXBlICgpIHtcbiAgdmFyIHAgPSBlbWl0dGVyQXJyYXkoZnVuY3Rpb24gKGV2ZW50TmFtZSwgYXJyLCBlKSB7XG4gICAgaWYgKGV2ZW50TmFtZSA9PT0gJ3VwZGF0ZScpIHtcbiAgICAgIC8qKlxuICAgICAgICogRm9yd2FyZCB0aGUgc3BlY2lhbCBhcnJheSB1cGRhdGVcbiAgICAgICAqIGV2ZW50cyBhcyBzdGFuZGFyZCBfX25vdGlmeUNoYW5nZSBldmVudHNcbiAgICAgICAqL1xuICAgICAgYXJyLl9fbm90aWZ5Q2hhbmdlKGUuaW5kZXgsIGUudmFsdWUsIGUub2xkVmFsdWUpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8qKlxuICAgICAgICogQWxsIG90aGVyIGV2ZW50cyBlLmcuIHB1c2gsIHNwbGljZSBhcmUgcmVsYXllZFxuICAgICAgICovXG4gICAgICB2YXIgdGFyZ2V0ID0gYXJyXG4gICAgICB2YXIgcGF0aCA9IGFyci5fX3BhdGhcbiAgICAgIHZhciBkYXRhID0gZVxuICAgICAgdmFyIGtleSA9IGUuaW5kZXhcblxuICAgICAgYXJyLmVtaXQoZXZlbnROYW1lLCBuZXcgRW1pdHRlckV2ZW50KGV2ZW50TmFtZSwgJycsIHRhcmdldCwgZGF0YSkpXG4gICAgICBhcnIuZW1pdCgnY2hhbmdlJywgbmV3IEVtaXR0ZXJFdmVudChldmVudE5hbWUsICcnLCB0YXJnZXQsIGRhdGEpKVxuICAgICAgYXJyLl9fYW5jZXN0b3JzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgdmFyIG5hbWUgPSBpdGVtLl9fcmVsYXRpdmVQYXRoKHBhdGgsIGtleSlcbiAgICAgICAgaXRlbS5lbWl0KCdjaGFuZ2UnLCBuZXcgRW1pdHRlckV2ZW50KGV2ZW50TmFtZSwgbmFtZSwgdGFyZ2V0LCBkYXRhKSlcbiAgICAgIH0pXG5cbiAgICB9XG4gIH0pXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMocCwgbW9kZWxEZXNjcmlwdG9ycylcblxuICBlbWl0dGVyKHApXG5cbiAgZXh0ZW5kKHAsIG1vZGVsUHJvdG8pXG5cbiAgcmV0dXJuIHBcbn1cblxuZnVuY3Rpb24gY3JlYXRlT2JqZWN0TW9kZWxQcm90b3R5cGUgKHByb3RvKSB7XG4gIHZhciBwID0gT2JqZWN0LmNyZWF0ZShvYmplY3RQcm90b3R5cGUpXG5cbiAgaWYgKHByb3RvKSB7XG4gICAgZXh0ZW5kKHAsIHByb3RvKVxuICB9XG5cbiAgcmV0dXJuIHBcbn1cblxuZnVuY3Rpb24gY3JlYXRlQXJyYXlNb2RlbFByb3RvdHlwZSAocHJvdG8sIGl0ZW1EZWYpIHtcbiAgLy8gV2UgZG8gbm90IHRvIGF0dGVtcHQgdG8gc3ViY2xhc3MgQXJyYXksXG4gIC8vIGluc3RlYWQgY3JlYXRlIGEgbmV3IGluc3RhbmNlIGVhY2ggdGltZVxuICAvLyBhbmQgbWl4aW4gdGhlIHByb3RvIG9iamVjdFxuICB2YXIgcCA9IGNyZWF0ZUFycmF5UHJvdG90eXBlKClcblxuICBpZiAocHJvdG8pIHtcbiAgICBleHRlbmQocCwgcHJvdG8pXG4gIH1cblxuICBpZiAoaXRlbURlZikge1xuICAgIC8vIFdlIGhhdmUgYSBkZWZpbml0aW9uIGZvciB0aGUgaXRlbXNcbiAgICAvLyB0aGF0IGJlbG9uZyBpbiB0aGlzIGFycmF5LlxuXG4gICAgLy8gVXNlIHRoZSBgd3JhcHBlcmAgcHJvdG90eXBlIHByb3BlcnR5IGFzIGFcbiAgICAvLyB2aXJ0dWFsIFdyYXBwZXIgb2JqZWN0IHdlIGNhbiB1c2VcbiAgICAvLyB2YWxpZGF0ZSBhbGwgdGhlIGl0ZW1zIGluIHRoZSBhcnJheS5cbiAgICB2YXIgYXJySXRlbVdyYXBwZXIgPSBpdGVtRGVmLmNyZWF0ZS53cmFwcGVyXG5cbiAgICAvLyBWYWxpZGF0ZSBuZXcgbW9kZWxzIGJ5IG92ZXJyaWRpbmcgdGhlIGVtaXR0ZXIgYXJyYXlcbiAgICAvLyBtdXRhdG9ycyB0aGF0IGNhbiBjYXVzZSBuZXcgaXRlbXMgdG8gZW50ZXIgdGhlIGFycmF5LlxuICAgIG92ZXJyaWRlQXJyYXlBZGRpbmdNdXRhdG9ycyhwLCBhcnJJdGVtV3JhcHBlcilcblxuICAgIC8vIFByb3ZpZGUgYSBjb252ZW5pZW50IG1vZGVsIGZhY3RvcnlcbiAgICAvLyBmb3IgY3JlYXRpbmcgYXJyYXkgaXRlbSBpbnN0YW5jZXNcbiAgICBwLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpdGVtRGVmLmlzUmVmZXJlbmNlID8gaXRlbURlZi50eXBlKCkgOiBpdGVtRGVmLmNyZWF0ZSgpLmdldFZhbHVlKHRoaXMpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBcbn1cblxuZnVuY3Rpb24gb3ZlcnJpZGVBcnJheUFkZGluZ011dGF0b3JzIChhcnIsIGl0ZW1XcmFwcGVyKSB7XG4gIGZ1bmN0aW9uIGdldEFycmF5QXJncyAoaXRlbXMpIHtcbiAgICB2YXIgYXJncyA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgaXRlbVdyYXBwZXIuc2V0VmFsdWUoaXRlbXNbaV0sIGFycilcbiAgICAgIGFyZ3MucHVzaChpdGVtV3JhcHBlci5nZXRWYWx1ZShhcnIpKVxuICAgIH1cbiAgICByZXR1cm4gYXJnc1xuICB9XG5cbiAgdmFyIHB1c2ggPSBhcnIucHVzaFxuICB2YXIgdW5zaGlmdCA9IGFyci51bnNoaWZ0XG4gIHZhciBzcGxpY2UgPSBhcnIuc3BsaWNlXG4gIHZhciB1cGRhdGUgPSBhcnIudXBkYXRlXG5cbiAgaWYgKHB1c2gpIHtcbiAgICBhcnIucHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhcmdzID0gZ2V0QXJyYXlBcmdzKGFyZ3VtZW50cylcbiAgICAgIHJldHVybiBwdXNoLmFwcGx5KGFyciwgYXJncylcbiAgICB9XG4gIH1cblxuICBpZiAodW5zaGlmdCkge1xuICAgIGFyci51bnNoaWZ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGFyZ3MgPSBnZXRBcnJheUFyZ3MoYXJndW1lbnRzKVxuICAgICAgcmV0dXJuIHVuc2hpZnQuYXBwbHkoYXJyLCBhcmdzKVxuICAgIH1cbiAgfVxuXG4gIGlmIChzcGxpY2UpIHtcbiAgICBhcnIuc3BsaWNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGFyZ3MgPSBnZXRBcnJheUFyZ3MoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSlcbiAgICAgIGFyZ3MudW5zaGlmdChhcmd1bWVudHNbMV0pXG4gICAgICBhcmdzLnVuc2hpZnQoYXJndW1lbnRzWzBdKVxuICAgICAgcmV0dXJuIHNwbGljZS5hcHBseShhcnIsIGFyZ3MpXG4gICAgfVxuICB9XG5cbiAgaWYgKHVwZGF0ZSkge1xuICAgIGFyci51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYXJncyA9IGdldEFycmF5QXJncyhbYXJndW1lbnRzWzFdXSlcbiAgICAgIGFyZ3MudW5zaGlmdChhcmd1bWVudHNbMF0pXG4gICAgICByZXR1cm4gdXBkYXRlLmFwcGx5KGFyciwgYXJncylcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlTW9kZWxQcm90b3R5cGUgKGRlZikge1xuICByZXR1cm4gZGVmLmlzQXJyYXkgPyBjcmVhdGVBcnJheU1vZGVsUHJvdG90eXBlKGRlZi5wcm90bywgZGVmLmRlZikgOiBjcmVhdGVPYmplY3RNb2RlbFByb3RvdHlwZShkZWYucHJvdG8pXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlTW9kZWxQcm90b3R5cGVcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IHt9XG4iLCIndXNlIHN0cmljdCdcblxuLy8gdmFyIG1lcmdlID0gcmVxdWlyZSgnLi9tZXJnZScpXG52YXIgY3JlYXRlRGVmID0gcmVxdWlyZSgnLi9kZWYnKVxudmFyIFN1cGVybW9kZWwgPSByZXF1aXJlKCcuL3N1cGVybW9kZWwnKVxuXG5mdW5jdGlvbiBzdXBlcm1vZGVscyAoc2NoZW1hLCBpbml0aWFsaXplcikge1xuICB2YXIgZGVmID0gY3JlYXRlRGVmKHNjaGVtYSlcblxuICBmdW5jdGlvbiBTdXBlcm1vZGVsQ29uc3RydWN0b3IgKGRhdGEpIHtcbiAgICB2YXIgbW9kZWwgPSBkZWYuaXNTaW1wbGUgPyBkZWYuY3JlYXRlKCkgOiBkZWYuY3JlYXRlKCkuZ2V0VmFsdWUoe30pXG5cbiAgICAvLyBDYWxsIGFueSBpbml0aWFsaXplclxuICAgIGlmIChpbml0aWFsaXplcikge1xuICAgICAgaW5pdGlhbGl6ZXIuYXBwbHkobW9kZWwsIGFyZ3VtZW50cylcbiAgICB9IGVsc2UgaWYgKGRhdGEpIHtcbiAgICAgIC8vIGlmIHRoZXJlJ3Mgbm8gaW5pdGlhbGl6ZXJcbiAgICAgIC8vIGJ1dCB3ZSBoYXZlIGJlZW4gcGFzc2VkIHNvbWVcbiAgICAgIC8vIGRhdGEsIG1lcmdlIGl0IGludG8gdGhlIG1vZGVsLlxuICAgICAgbW9kZWwuX19tZXJnZShkYXRhKVxuICAgIH1cbiAgICByZXR1cm4gbW9kZWxcbiAgfVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU3VwZXJtb2RlbENvbnN0cnVjdG9yLCAnZGVmJywge1xuICAgIHZhbHVlOiBkZWYgLy8gdGhpcyBpcyB1c2VkIHRvIHZhbGlkYXRlIHJlZmVyZW5jZWQgU3VwZXJtb2RlbENvbnN0cnVjdG9yc1xuICB9KVxuICBTdXBlcm1vZGVsQ29uc3RydWN0b3IucHJvdG90eXBlID0gU3VwZXJtb2RlbCAvLyB0aGlzIHNoYXJlZCBvYmplY3QgaXMgdXNlZCwgYXMgYSBwcm90b3R5cGUsIHRvIGlkZW50aWZ5IFN1cGVybW9kZWxDb25zdHJ1Y3RvcnNcbiAgU3VwZXJtb2RlbENvbnN0cnVjdG9yLmNvbnN0cnVjdG9yID0gU3VwZXJtb2RlbENvbnN0cnVjdG9yXG4gIHJldHVybiBTdXBlcm1vZGVsQ29uc3RydWN0b3Jcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdXBlcm1vZGVsc1xuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBTdXBlcm1vZGVsID0gcmVxdWlyZSgnLi9zdXBlcm1vZGVsJylcblxuZnVuY3Rpb24gZXh0ZW5kIChvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8IHR5cGVvZiBhZGQgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG9yaWdpblxuICB9XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpXG4gIHZhciBpID0ga2V5cy5sZW5ndGhcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXVxuICB9XG4gIHJldHVybiBvcmlnaW5cbn1cblxudmFyIHV0aWwgPSB7XG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0eXBlT2Y6IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikubWF0Y2goL1xccyhbYS16QS1aXSspLylbMV0udG9Mb3dlckNhc2UoKVxuICB9LFxuICBpc09iamVjdDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMudHlwZU9mKHZhbHVlKSA9PT0gJ29iamVjdCdcbiAgfSxcbiAgaXNBcnJheTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpXG4gIH0sXG4gIGlzU2ltcGxlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyAnU2ltcGxlJyBoZXJlIG1lYW5zIGFueXRoaW5nXG4gICAgLy8gb3RoZXIgdGhhbiBhbiBPYmplY3Qgb3IgYW4gQXJyYXlcbiAgICAvLyBpLmUuIG51bWJlciwgc3RyaW5nLCBkYXRlLCBib29sLCBudWxsLCB1bmRlZmluZWQsIHJlZ2V4Li4uXG4gICAgcmV0dXJuICF0aGlzLmlzT2JqZWN0KHZhbHVlKSAmJiAhdGhpcy5pc0FycmF5KHZhbHVlKVxuICB9LFxuICBpc0Z1bmN0aW9uOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy50eXBlT2YodmFsdWUpID09PSAnZnVuY3Rpb24nXG4gIH0sXG4gIGlzRGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMudHlwZU9mKHZhbHVlKSA9PT0gJ2RhdGUnXG4gIH0sXG4gIGlzTnVsbDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBudWxsXG4gIH0sXG4gIGlzVW5kZWZpbmVkOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mICh2YWx1ZSkgPT09ICd1bmRlZmluZWQnXG4gIH0sXG4gIGlzTnVsbE9yVW5kZWZpbmVkOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5pc051bGwodmFsdWUpIHx8IHRoaXMuaXNVbmRlZmluZWQodmFsdWUpXG4gIH0sXG4gIGNhc3Q6IGZ1bmN0aW9uICh2YWx1ZSwgdHlwZSkge1xuICAgIGlmICghdHlwZSkge1xuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIFN0cmluZzpcbiAgICAgICAgcmV0dXJuIHV0aWwuY2FzdFN0cmluZyh2YWx1ZSlcbiAgICAgIGNhc2UgTnVtYmVyOlxuICAgICAgICByZXR1cm4gdXRpbC5jYXN0TnVtYmVyKHZhbHVlKVxuICAgICAgY2FzZSBCb29sZWFuOlxuICAgICAgICByZXR1cm4gdXRpbC5jYXN0Qm9vbGVhbih2YWx1ZSlcbiAgICAgIGNhc2UgRGF0ZTpcbiAgICAgICAgcmV0dXJuIHV0aWwuY2FzdERhdGUodmFsdWUpXG4gICAgICBjYXNlIE9iamVjdDpcbiAgICAgIGNhc2UgRnVuY3Rpb246XG4gICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNhc3QnKVxuICAgIH1cbiAgfSxcbiAgY2FzdFN0cmluZzogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwgfHwgdXRpbC50eXBlT2YodmFsdWUpID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZyAmJiB2YWx1ZS50b1N0cmluZygpXG4gIH0sXG4gIGNhc3ROdW1iZXI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gTmFOXG4gICAgfVxuICAgIGlmICh1dGlsLnR5cGVPZih2YWx1ZSkgPT09ICdudW1iZXInKSB7XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG4gICAgcmV0dXJuIE51bWJlcih2YWx1ZSlcbiAgfSxcbiAgY2FzdEJvb2xlYW46IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICB2YXIgZmFsc2V5ID0gWycwJywgJ2ZhbHNlJywgJ29mZicsICdubyddXG4gICAgcmV0dXJuIGZhbHNleS5pbmRleE9mKHZhbHVlKSA9PT0gLTFcbiAgfSxcbiAgY2FzdERhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsIHx8IHV0aWwudHlwZU9mKHZhbHVlKSA9PT0gJ2RhdGUnKSB7XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEYXRlKHZhbHVlKVxuICB9LFxuICBpc0NvbnN0cnVjdG9yOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5pc1NpbXBsZUNvbnN0cnVjdG9yKHZhbHVlKSB8fCBbQXJyYXksIE9iamVjdF0uaW5kZXhPZih2YWx1ZSkgPiAtMVxuICB9LFxuICBpc1NpbXBsZUNvbnN0cnVjdG9yOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gW1N0cmluZywgTnVtYmVyLCBEYXRlLCBCb29sZWFuXS5pbmRleE9mKHZhbHVlKSA+IC0xXG4gIH0sXG4gIGlzU3VwZXJtb2RlbENvbnN0cnVjdG9yOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5pc0Z1bmN0aW9uKHZhbHVlKSAmJiB2YWx1ZS5wcm90b3R5cGUgPT09IFN1cGVybW9kZWxcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxcbiIsIid1c2Ugc3RyaWN0J1xuXG5mdW5jdGlvbiBWYWxpZGF0aW9uRXJyb3IgKHRhcmdldCwgZXJyb3IsIHZhbGlkYXRvciwga2V5KSB7XG4gIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XG4gIHRoaXMuZXJyb3IgPSBlcnJvclxuICB0aGlzLnZhbGlkYXRvciA9IHZhbGlkYXRvclxuXG4gIGlmIChrZXkpIHtcbiAgICB0aGlzLmtleSA9IGtleVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVmFsaWRhdGlvbkVycm9yXG4iLCIndXNlIHN0cmljdCdcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKVxuXG5mdW5jdGlvbiBXcmFwcGVyIChkZWZhdWx0VmFsdWUsIHdyaXRhYmxlLCB2YWxpZGF0b3JzLCBnZXR0ZXIsIHNldHRlciwgYmVmb3JlU2V0LCBhc3NlcnQpIHtcbiAgdGhpcy52YWxpZGF0b3JzID0gdmFsaWRhdG9yc1xuXG4gIHRoaXMuX2RlZmF1bHRWYWx1ZSA9IGRlZmF1bHRWYWx1ZVxuICB0aGlzLl93cml0YWJsZSA9IHdyaXRhYmxlXG4gIHRoaXMuX2dldHRlciA9IGdldHRlclxuICB0aGlzLl9zZXR0ZXIgPSBzZXR0ZXJcbiAgdGhpcy5fYmVmb3JlU2V0ID0gYmVmb3JlU2V0XG4gIHRoaXMuX2Fzc2VydCA9IGFzc2VydFxuICB0aGlzLmlzSW5pdGlhbGl6ZWQgPSBmYWxzZVxuXG4gIGlmICghdXRpbC5pc0Z1bmN0aW9uKGRlZmF1bHRWYWx1ZSkpIHtcbiAgICB0aGlzLmlzSW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgICBpZiAoIXV0aWwuaXNVbmRlZmluZWQoZGVmYXVsdFZhbHVlKSkge1xuICAgICAgdGhpcy5fdmFsdWUgPSBkZWZhdWx0VmFsdWVcbiAgICB9XG4gIH1cbn1cbldyYXBwZXIucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gIGlmICh0aGlzLmlzSW5pdGlhbGl6ZWQpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHRoaXMuc2V0VmFsdWUodGhpcy5fZGVmYXVsdFZhbHVlKHBhcmVudCksIHBhcmVudClcbiAgdGhpcy5pc0luaXRpYWxpemVkID0gdHJ1ZVxufVxuV3JhcHBlci5wcm90b3R5cGUuZ2V0VmFsdWUgPSBmdW5jdGlvbiAobW9kZWwpIHtcbiAgcmV0dXJuIHRoaXMuX2dldHRlciA/IHRoaXMuX2dldHRlci5jYWxsKG1vZGVsKSA6IHRoaXMuX3ZhbHVlXG59XG5XcmFwcGVyLnByb3RvdHlwZS5zZXRWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSwgbW9kZWwpIHtcbiAgaWYgKCF0aGlzLl93cml0YWJsZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVmFsdWUgaXMgcmVhZG9ubHknKVxuICB9XG5cbiAgLy8gSG9vayB1cCB0aGUgcGFyZW50IHJlZiBpZiBuZWNlc3NhcnlcbiAgaWYgKHZhbHVlICYmIHZhbHVlLl9fc3VwZXJtb2RlbCAmJiBtb2RlbCkge1xuICAgIGlmICh2YWx1ZS5fX3BhcmVudCAhPT0gbW9kZWwpIHtcbiAgICAgIHZhbHVlLl9fcGFyZW50ID0gbW9kZWxcbiAgICB9XG4gIH1cblxuICB2YXIgdmFsXG4gIGlmICh0aGlzLl9zZXR0ZXIpIHtcbiAgICB0aGlzLl9zZXR0ZXIuY2FsbChtb2RlbCwgdmFsdWUpXG4gICAgdmFsID0gdGhpcy5nZXRWYWx1ZShtb2RlbClcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSB0aGlzLl9iZWZvcmVTZXQgPyB0aGlzLl9iZWZvcmVTZXQodmFsdWUpIDogdmFsdWVcbiAgfVxuXG4gIGlmICh0aGlzLl9hc3NlcnQpIHtcbiAgICB0aGlzLl9hc3NlcnQodmFsKVxuICB9XG5cbiAgdGhpcy5fdmFsdWUgPSB2YWxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBXcmFwcGVyXG4iXX0=
