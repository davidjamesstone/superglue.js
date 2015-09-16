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
var patch = require('../incremental-dom').patch
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

},{"../helpers":7,"../incremental-dom":8,"./basket-data":1,"./products-data":4,"./template.html":5,"supermodels.js":13}],3:[function(require,module,exports){
module.exports = function description (data) {
elementOpen("h3")
  text(" \
    Total lines " + (data.items.length) + ", total quantity " + (data.totalQuantity) + " \
  ")
elementClose("h3")
};

},{}],4:[function(require,module,exports){
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

},{"./lines-summary.html":3,"./total-summary.html":6}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
function rndstr () {
  return Math.random().toString(36).substr(2, 5)
}

module.exports = {
  rndstr: {
    __value: rndstr
  }
}

},{}],8:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : factory(global.IncrementalDOM = {});
})(this, function (exports) {
  'use strict';

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
   * @type {TreeWalker}
   */
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
   * @param {?string} nodeName
   * @param {?string} key
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
     * {?Node}
     */
    this.lastVisitedChild = null;

    /**
     * The node name for this node.
     * @const
     */
    this.nodeName = nodeName;

    /**
     * @const {string}
     */
    this.text = null;
  }

  /**
   * Initializes a NodeData object for a Node.
   *
   * @param {!Node} node The node to initialize data for.
   * @param {string} nodeName The node name of node.
   * @param {?string} key The key that identifies the node.
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
   * @param {!Node} node The node to retrieve the data for.
   * @return {NodeData} The NodeData for this Node.
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
   * Applies an attribute or property to a given Element. If the value is null
   * or undefined, it is removed from the Element. Otherwise, the value is set
   * as an attribute.
   * @param {!Element} el
   * @param {string} name The attribute's name.
   * @param {*} value The attribute's value.
   */
  var applyAttr = function (el, name, value) {
    if (value == null) {
      el.removeAttribute(name);
    } else {
      el.setAttribute(name, value);
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
      applyAttr(el, name, value);
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

    var mutator = _mutators[name] || _mutators.__all;
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
  var _mutators = {
    // Special generic mutator that's called for any attribute that does not
    // have a specific mutator.
    __all: applyAttributeTyped,

    // Special case the style attribute
    style: applyStyle
  };

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
   * @return {string} The namespace to create the tag in.
   */
  var getNamespaceForTag = function (tag) {
    if (tag === 'svg') {
      return SVG_NS;
    }

    return getWalker().getCurrentNamespace();
  };

  /**
   * Creates an Element.
   * @param {!Document} doc The document with which to create the Element.
   * @param {string} tag The tag for the Element.
   * @param {?string} key A key to identify the Element.
   * @param {?Array<*>} statics An array of attribute name/value pairs of
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
        updateAttribute(el, statics[i], statics[i + 1]);
      }
    }

    return el;
  };

  /**
   * Creates a Node, either a Text or an Element depending on the node name
   * provided.
   * @param {!Document} doc The document with which to create the Node.
   * @param {string} nodeName The tag if creating an element or #text to create
   *     a Text.
   * @param {?string} key A key to identify the Element.
   * @param {?Array<*>} statics The static data to initialize the Node
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
   * @param {!Element} el
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
   * @param {!Element} el
   * @return {!Object<string, !Element>} A mapping of keys to child Elements
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
   * @param {!Element} parent
   * @param {?string} key
   * @return {?Element} The child corresponding to the key.
   */
  var getChild = function (parent, key) {
    return getKeyMap(parent)[key];
  };

  /**
   * Registers an element as being a child. The parent will keep track of the
   * child using the key. The child can be retrieved using the same key using
   * getKeyMap. The provided key should be unique within the parent Element.
   * @param {!Element} parent The parent of child.
   * @param {string} key A key to identify the child with.
   * @param {!Element} child The child to register.
   */
  var registerChild = function (parent, key, child) {
    getKeyMap(parent)[key] = child;
  };

  if (undefined !== 'production') {
    /**
    * Makes sure that keyed Element matches the tag name provided.
    * @param {!Element} node The node that is being matched.
    * @param {string} tag The tag name of the Element.
    * @param {string} key The key of the Element.
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
   * @param {?string} key An optional key that identifies a node.
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
   * @param {?string} nodeName For an Element, this should be a valid tag string.
   *     For a Text, this should be #text.
   * @param {?string} key The key used to identify this element.
   * @param {?Array<*>} statics For an Element, this should be an array of
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
      var existingNode = key && getChild(parent, key);

      // Check to see if the node has moved within the parent or if a new one
      // should be created
      if (existingNode) {
        if (undefined !== 'production') {
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
   * @param {!Element} node
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
   * @param {!Element} node
   */
  var enterNode = function (node) {
    var data = getData(node);
    enterTag(data.nodeName);
  };

  /**
   * Exits an Element, unwinding the current namespace to the previous value.
   * @param {!Element} node
   */
  var exitNode = function (node) {
    var data = getData(node);
    exitTag(data.nodeName);
  };

  /**
   * Marks node's parent as having visited node.
   * @param {!Node} node
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
   * @param {!Node} node The root Node of the subtree the walker should start
   *     traversing.
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

    /** {?Node} */
    this.currentNode = node;

    /** {!Document} */
    this.doc = node.ownerDocument;

    /**
     * Keeps track of what namespace to create new Elements in.
     * @const @private {!Array<string>}
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
   * @return {string} The current namespace to create Elements in.
   */
  TreeWalker.prototype.getCurrentNamespace = function () {
    return this.nsStack_[this.nsStack_.length - 1];
  };

  /**
   * @param {string} namespace The namespace to enter.
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

  /**
   * @const {boolean}
   */
  if (undefined !== 'production') {
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
   * @param {!Element|!Document} node The Element or Document to patch.
   * @param {!function} fn A function containing elementOpen/elementClose/etc.
   *     calls that describe the DOM.
   * @param {*} data An argument passed to fn to represent DOM state.
   */
  exports.patch = function (node, fn, data) {
    var prevWalker = getWalker();
    setWalker(new TreeWalker(node));

    firstChild();
    fn(data);
    parentNode();
    clearUnvisitedDOM(node);

    if (undefined !== 'production') {
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

  if (undefined !== 'production') {
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

  exports.elementOpen = function (tag, key, statics, var_args) {
    if (undefined !== 'production') {
      assertNotInAttributes();
    }

    var node = alignWithDOM(tag, key, statics);
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
      var newAttrs = data.newAttrs;

      for (var attr in newAttrs) {
        newAttrs[attr] = undefined;
      }

      for (var i = ATTRIBUTES_OFFSET; i < arguments.length; i += 2) {
        newAttrs[arguments[i]] = arguments[i + 1];
      }

      for (var attr in newAttrs) {
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
   * @param {?string} key The key used to identify this element. This can be an
   *     empty string, but performance may be better if a unique value is used
   *     when iterating over an array of items.
   * @param {?Array<*>} statics An array of attribute name/value pairs of the
   *     static attributes for the Element. These will only be set once when the
   *     Element is created.
   */
  exports.elementOpenStart = function (tag, key, statics) {
    if (undefined !== 'production') {
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
    if (undefined !== 'production') {
      assertInAttributes();
    }

    argsBuilder.push(name, value);
  };

  /**
   * Closes an open tag started with elementOpenStart.
   * @return {!Element} The corresponding Element.
   */
  exports.elementOpenEnd = function () {
    if (undefined !== 'production') {
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
    if (undefined !== 'production') {
      assertNotInAttributes();
      assertCloseMatchesOpenTag(tag);
    }

    parentNode();

    var node = getWalker().currentNode;
    clearUnvisitedDOM(node);

    nextSibling();
    return node;
  };

  /**
   * Declares a virtual Element at the current location in the document that has
   * no children.
   * @param {string} tag The element's tag.
   * @param {?string} key The key used to identify this element. This can be an
   *     empty string, but performance may be better if a unique value is used
   *     when iterating over an array of items.
   * @param {?Array<*>} statics An array of attribute name/value pairs of the
   *     static attributes for the Element. These will only be set once when the
   *     Element is created.
   * @param {...*} var_args Attribute name/value pairs of the dynamic attributes
   *     for the Element.
   * @return {!Element} The corresponding Element.
   */
  exports.elementVoid = function (tag, key, statics, var_args) {
    if (undefined !== 'production') {
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
   * @param {...(function(string|number|boolean):string|number|boolean)} var_args
   *     Functions to format the value which are called only when the value has
   *     changed.
   */
  exports.text = function (value, var_args) {
    if (undefined !== 'production') {
      assertNotInAttributes();
    }

    var node = alignWithDOM('#text', null);
    var data = getData(node);

    if (data.text !== value) {
      data.text = value;

      var formatted = value;
      for (var i = 1; i < arguments.length; i += 1) {
        formatted = arguments[i](formatted);
      }

      node.data = formatted;
    }

    nextSibling();
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


},{}],9:[function(require,module,exports){
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

},{"./basket":2,"./incremental-dom":8,"./todo":11}],10:[function(require,module,exports){
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

},{"./todo.html":12}],11:[function(require,module,exports){
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

},{"../helpers":7,"../incremental-dom":8,"./index.html":10,"supermodels.js":13}],12:[function(require,module,exports){
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
            elementOpen("input", null, ["type", "checkbox"], "checked", todo.completed || undefined, "onchange", function ($event) {
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

},{"./util":24}]},{},[9])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9iYXNrZXQvYmFza2V0LWRhdGEuanNvbiIsImV4YW1wbGVzL2Jhc2tldC9pbmRleC5qcyIsImV4YW1wbGVzL2Jhc2tldC9saW5lcy1zdW1tYXJ5Lmh0bWwiLCJleGFtcGxlcy9iYXNrZXQvcHJvZHVjdHMtZGF0YS5qc29uIiwiZXhhbXBsZXMvYmFza2V0L3RlbXBsYXRlLmh0bWwiLCJleGFtcGxlcy9iYXNrZXQvdG90YWwtc3VtbWFyeS5odG1sIiwiZXhhbXBsZXMvaGVscGVycy5qcyIsImV4YW1wbGVzL2luY3JlbWVudGFsLWRvbS5qcyIsImV4YW1wbGVzL2luZGV4LmpzIiwiZXhhbXBsZXMvdG9kby9pbmRleC5odG1sIiwiZXhhbXBsZXMvdG9kby9pbmRleC5qcyIsImV4YW1wbGVzL3RvZG8vdG9kby5odG1sIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9kZWYuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL2VtaXR0ZXItYXJyYXkuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL2VtaXR0ZXItZXZlbnQuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL2VtaXR0ZXItb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9mYWN0b3J5LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9tZXJnZS5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvbW9kZWwuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL3Byb3RvLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9zdXBlcm1vZGVsLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9zdXBlcm1vZGVscy5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvdmFsaWRhdGlvbi1lcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvd3JhcHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeCtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIml0ZW1zXCI6IFtcbiAgICB7XG4gICAgICBcInByb2R1Y3RJZFwiOiBcImRzZjFmXCIsXG4gICAgICBcInF1YW50aXR5XCI6IDJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwicHJvZHVjdElkXCI6IFwiZHI2aGJcIixcbiAgICAgIFwicXVhbnRpdHlcIjogNVxuICAgIH0sXG4gICAge1xuICAgICAgXCJwcm9kdWN0SWRcIjogXCJzZHI0ZlwiLFxuICAgICAgXCJxdWFudGl0eVwiOiAxXG4gICAgfVxuICBdXG59XG4iLCJ2YXIgc3VwZXJtb2RlbHMgPSByZXF1aXJlKCdzdXBlcm1vZGVscy5qcycpXG52YXIgcGF0Y2ggPSByZXF1aXJlKCcuLi9pbmNyZW1lbnRhbC1kb20nKS5wYXRjaFxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJylcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUuaHRtbCcpXG52YXIgcHJvZHVjdHNEYXRhID0gcmVxdWlyZSgnLi9wcm9kdWN0cy1kYXRhJylcbnZhciBiYXNrZXREYXRhID0gcmVxdWlyZSgnLi9iYXNrZXQtZGF0YScpXG5cbnZhciBwcm9kdWN0U2NoZW1hID0ge1xuICBwcm9kdWN0SWQ6IGhlbHBlcnMucm5kc3RyLFxuICBwcm9kdWN0TmFtZTogU3RyaW5nLFxuICBwcmljZTogTnVtYmVyLFxuICBpbWFnZTogU3RyaW5nLFxuICBkaXNjb3VudFBlcmNlbnQ6IE51bWJlcixcbiAgZ2V0IGNvc3QgKCkge1xuICAgIHJldHVybiB0aGlzLnByaWNlIC0gKHRoaXMucHJpY2UgKiB0aGlzLmRpc2NvdW50UGVyY2VudClcbiAgfVxufVxudmFyIHByb2R1Y3RzU2NoZW1hID0gW3Byb2R1Y3RTY2hlbWFdXG52YXIgYmFza2V0U2NoZW1hID0ge1xuICBzb3J0Qnk6IFN0cmluZyxcbiAgaXRlbXM6IFt7XG4gICAgaWQ6IGhlbHBlcnMucm5kc3RyLFxuICAgIHByb2R1Y3RJZDogaGVscGVycy5ybmRzdHIsXG4gICAgcXVhbnRpdHk6IE51bWJlcixcbiAgICBnZXQgY29zdCAoKSB7XG4gICAgICB2YXIgcHJvZHVjdCA9IHRoaXMucHJvZHVjdFxuICAgICAgcmV0dXJuIHRoaXMucXVhbnRpdHkgKiAocHJvZHVjdC5wcmljZSAtIChwcm9kdWN0LnByaWNlICogcHJvZHVjdC5kaXNjb3VudFBlcmNlbnQpKVxuICAgIH0sXG4gICAgZ2V0IHByb2R1Y3QgKCkge1xuICAgICAgdmFyIGlkID0gdGhpcy5wcm9kdWN0SWRcblxuICAgICAgLy8gVGhpcyBmdW5jdGlvbiBsb29rcyB1cCB0aGUgcHJvZHVjdCBmcm9tIHRoZSBwcm9kdWN0cyBsaXN0LiBXZSBjYW4gZ2V0IHRoZSBsaXN0IG9mIHByb2R1Y3RzXG4gICAgICAvLyBieSBsb29raW5nIHVwIHRvIHRoZSByb290IG9mIHRoZSBvYmplY3QgKHRoZSBsYXN0IGFuY2VzdG9yKSB3aGljaCBpbiBvdXIgY2FzZSBpcyB0aGUgYGFwcGAgbW9kZWwgaW5zdGFuY2UuXG4gICAgICAvLyBXaGlsZSB0aGlzIG9iamVjdCB0cmF2ZXJzYWwgaXMgcG9zc2libGUgdXNpbmcgc3VwZXJtb2RlbHMuanMsIGl0J3Mgb25seSBoZXJlIGZvciB0aGUgcHVycG9zZXMgb2YgdGhlIGV4YW1wbGUuXG4gICAgICB2YXIgYXBwID0gdGhpcy5fX2FuY2VzdG9yc1t0aGlzLl9fYW5jZXN0b3JzLmxlbmd0aCAtIDFdXG4gICAgICByZXR1cm4gYXBwLnByb2R1Y3RzLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5wcm9kdWN0SWQgPT09IGlkXG4gICAgICB9KVswXVxuICAgIH1cbiAgfV0sXG4gIGdldCB0b3RhbENvc3QgKCkge1xuICAgIHZhciB0b3RhbCA9IDBcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLml0ZW1zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB0b3RhbCArPSB0aGlzLml0ZW1zW2ldLmNvc3RcbiAgICB9XG5cbiAgICByZXR1cm4gdG90YWxcbiAgfSxcbiAgZ2V0IHRvdGFsUXVhbnRpdHkgKCkge1xuICAgIHZhciB0b3RhbCA9IDBcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLml0ZW1zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB0b3RhbCArPSB0aGlzLml0ZW1zW2ldLnF1YW50aXR5XG4gICAgfVxuXG4gICAgcmV0dXJuIHRvdGFsXG4gIH0sXG4gIGdldCBzb3J0ZWRJdGVtcyAoKSB7XG4gICAgdmFyIGl0ZW1zID0gdGhpcy5pdGVtcy5zbGljZSgpXG4gICAgdmFyIHNvcnRCeSA9IHRoaXMuc29ydEJ5XG5cbiAgICBpdGVtcy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICBpZiAoYVtzb3J0QnldIDwgYltzb3J0QnldKSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfVxuICAgICAgaWYgKGFbc29ydEJ5XSA+IGJbc29ydEJ5XSkge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgICAgcmV0dXJuIDBcbiAgICB9KVxuXG4gICAgcmV0dXJuIGl0ZW1zXG4gIH1cbn1cblxudmFyIEJhc2tldCA9IHN1cGVybW9kZWxzKGJhc2tldFNjaGVtYSlcbnZhciBQcm9kdWN0cyA9IHN1cGVybW9kZWxzKHByb2R1Y3RzU2NoZW1hKVxuXG52YXIgYXBwU2NoZW1hID0ge1xuICBiYXNrZXQ6IEJhc2tldCxcbiAgcHJvZHVjdHM6IFByb2R1Y3RzXG59XG5cbnZhciBBcHAgPSBzdXBlcm1vZGVscyhhcHBTY2hlbWEpXG5cbndpbmRvdy5hcHBzID0gW11cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZWwpIHtcbiAgdmFyIGFwcCA9IG5ldyBBcHAoe1xuICAgIGJhc2tldDogbmV3IEJhc2tldChiYXNrZXREYXRhKSxcbiAgICBwcm9kdWN0czogbmV3IFByb2R1Y3RzKHByb2R1Y3RzRGF0YSlcbiAgfSlcblxuICBmdW5jdGlvbiByZW5kZXIgKCkge1xuICAgIHBhdGNoKGVsLCB0ZW1wbGF0ZSwgYXBwKVxuICB9XG4gIHJlbmRlcigpXG5cbiAgLyogcGF0Y2ggdGhlIGRvbSB3aGVuZXZlciB0aGUgYXBwIG1vZGVsIGNoYW5nZXMuICovXG4gIGFwcC5vbignY2hhbmdlJywgcmVuZGVyKVxuXG4gIHdpbmRvdy5hcHBzLnB1c2goYXBwKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZXNjcmlwdGlvbiAoZGF0YSkge1xuZWxlbWVudE9wZW4oXCJoM1wiKVxuICB0ZXh0KFwiIFxcXG4gICAgVG90YWwgbGluZXMgXCIgKyAoZGF0YS5pdGVtcy5sZW5ndGgpICsgXCIsIHRvdGFsIHF1YW50aXR5IFwiICsgKGRhdGEudG90YWxRdWFudGl0eSkgKyBcIiBcXFxuICBcIilcbmVsZW1lbnRDbG9zZShcImgzXCIpXG59O1xuIiwibW9kdWxlLmV4cG9ydHM9W1xuICB7XG4gICAgXCJwcm9kdWN0SWRcIjogXCJkc2YxZlwiLFxuICAgIFwicHJvZHVjdE5hbWVcIjogXCJBcHBsZSBpUG9kIHRvdWNoIDMyR0IgNXRoIEdlbmVyYXRpb24gLSBXaGl0ZVwiLFxuICAgIFwicHJpY2VcIjogMTkwLjUwLFxuICAgIFwiZGlzY291bnRQZXJjZW50XCI6IDAsXG4gICAgXCJpbWFnZVwiOiBcImJhc2tldC9pbWcvYXBwbGUuanBnXCJcbiAgfSxcbiAge1xuICAgIFwicHJvZHVjdElkXCI6IFwiZHI2aGJcIixcbiAgICBcInByb2R1Y3ROYW1lXCI6IFwiU2Ftc3VuZyBHYWxheHkgVGFiIDMgNy1pbmNoIC0gKEJsYWNrLCBXaS1GaSlcIixcbiAgICBcInByaWNlXCI6IDExMCxcbiAgICBcImRpc2NvdW50UGVyY2VudFwiOiAwLjIsXG4gICAgXCJpbWFnZVwiOiBcImJhc2tldC9pbWcvc2Ftc3VuZy5qcGdcIlxuICB9LFxuICB7XG4gICAgXCJwcm9kdWN0SWRcIjogXCJzZHI0ZlwiLFxuICAgIFwicHJvZHVjdE5hbWVcIjogXCJCb3NlIFF1aWV0Q29tZm9ydCAyMCBBY291c3RpYyBOb2lzZSBDYW5jZWxsaW5nIEhlYWRwaG9uZXNcIixcbiAgICBcInByaWNlXCI6IDI1MCxcbiAgICBcImRpc2NvdW50UGVyY2VudFwiOiAwLjEyNSxcbiAgICBcImltYWdlXCI6IFwiYmFza2V0L2ltZy9ib3NlLmpwZ1wiXG4gIH1cbl1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmFza2V0IChtb2RlbCkge1xuICB2YXIgYmFza2V0ID0gbW9kZWwuYmFza2V0XG4gICAgICB2YXIgcHJvZHVjdHMgPSBtb2RlbC5wcm9kdWN0c1xuICAgICAgdmFyIGxpbmVzU3VtbWFyeSA9IHJlcXVpcmUoJy4vbGluZXMtc3VtbWFyeS5odG1sJylcbiAgICAgIHZhciB0b3RhbFN1bW1hcnkgPSByZXF1aXJlKCcuL3RvdGFsLXN1bW1hcnkuaHRtbCcpXG5cbiAgICAgIGZ1bmN0aW9uIGFkZCAocHJvZHVjdCkge1xuICAgICAgICB2YXIgaXRlbXMgPSBiYXNrZXQuaXRlbXNcblxuICAgICAgICB2YXIgZXhpc3Rpbmc7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpXG4gIDwgYmFza2V0Lml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGJhc2tldC5pdGVtc1tpXS5wcm9kdWN0SWQgPT09IHByb2R1Y3QucHJvZHVjdElkKSB7XG4gICAgICAgICAgICBleGlzdGluZyA9IGJhc2tldC5pdGVtc1tpXVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgICBleGlzdGluZy5xdWFudGl0eSsrXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGl0ZW0gPSBpdGVtcy5jcmVhdGUoKVxuICAgICAgICAgIGl0ZW0ucHJvZHVjdElkID0gcHJvZHVjdC5wcm9kdWN0SWRcbiAgICAgICAgICBpdGVtLnF1YW50aXR5ID0gMVxuICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByZW1vdmUgKCRpbmRleCkge1xuICAgICAgICBiYXNrZXQuaXRlbXMuc3BsaWNlKCRpbmRleCwgMSlcbiAgICAgIH1cblxuICAgICAgdmFyIHNvcnRCeSA9IGJhc2tldC5zb3J0QnlcbiAgICAgIHZhciBzb3J0QnlUZXJtcyA9IFsnY29zdCcsICdxdWFudGl0eScsICdwcm9kdWN0SWQnXVxuICBlbGVtZW50T3BlbihcInNlbGVjdFwiLCBudWxsLCBbXCJjbGFzc1wiLCBcInB1bGwtcmlnaHRcIl0sIFwib25jaGFuZ2VcIiwgZnVuY3Rpb24gKCRldmVudCkge1xuICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciAkZWxlbWVudCA9IHRoaXM7XG4gIGJhc2tldC5zb3J0QnkgPSB0aGlzLnZhbHVlfSlcbiAgICBlbGVtZW50T3BlbihcIm9wdGlvblwiKVxuICAgICAgdGV4dChcIlNvcnQgYnk6XCIpXG4gICAgZWxlbWVudENsb3NlKFwib3B0aW9uXCIpXG4gICAgOyhBcnJheS5pc0FycmF5KHNvcnRCeVRlcm1zKSA/IHNvcnRCeVRlcm1zIDogT2JqZWN0LmtleXMoc29ydEJ5VGVybXMpKS5mb3JFYWNoKGZ1bmN0aW9uKHRlcm0sICRpbmRleCkge1xuICAgICAgZWxlbWVudE9wZW4oXCJvcHRpb25cIiwgJGluZGV4LCBudWxsLCBcInZhbHVlXCIsIHRlcm0pXG4gICAgICAgIHRleHQoXCJcIiArICh0ZXJtKSArIFwiXCIpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJvcHRpb25cIilcbiAgICB9LCBzb3J0QnlUZXJtcylcbiAgZWxlbWVudENsb3NlKFwic2VsZWN0XCIpXG4gIGxpbmVzU3VtbWFyeShiYXNrZXQpXG4gIGlmIChiYXNrZXQuaXRlbXMubGVuZ3RoKSB7XG4gICAgZWxlbWVudE9wZW4oXCJ0YWJsZVwiLCBudWxsLCBbXCJjbGFzc1wiLCBcInRhYmxlXCJdKVxuICAgICAgZWxlbWVudE9wZW4oXCJ0aGVhZFwiKVxuICAgICAgICBlbGVtZW50T3BlbihcInRyXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJ0aFwiKVxuICAgICAgICAgICAgdGV4dChcImlkXCIpXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwidGhcIilcbiAgICAgICAgICBlbGVtZW50T3BlbihcInRoXCIpXG4gICAgICAgICAgICB0ZXh0KFwicHJvZHVjdElkXCIpXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwidGhcIilcbiAgICAgICAgICBlbGVtZW50T3BlbihcInRoXCIpXG4gICAgICAgICAgICB0ZXh0KFwicHJvZHVjdE5hbWVcIilcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0aFwiKVxuICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGhcIilcbiAgICAgICAgICAgIHRleHQoXCJxdWFudGl0eVwiKVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRoXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJ0aFwiKVxuICAgICAgICAgICAgdGV4dChcInByaWNlXCIpXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwidGhcIilcbiAgICAgICAgICBlbGVtZW50T3BlbihcInRoXCIpXG4gICAgICAgICAgICB0ZXh0KFwiZGlzY291bnRQZXJjZW50XCIpXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwidGhcIilcbiAgICAgICAgICBlbGVtZW50T3BlbihcInRoXCIpXG4gICAgICAgICAgICB0ZXh0KFwiY29zdFwiKVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRoXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJ0aFwiKVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRoXCIpXG4gICAgICAgIGVsZW1lbnRDbG9zZShcInRyXCIpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJ0aGVhZFwiKVxuICAgICAgZWxlbWVudE9wZW4oXCJ0Ym9keVwiKVxuICAgICAgICA7KEFycmF5LmlzQXJyYXkoYmFza2V0LnNvcnRlZEl0ZW1zKSA/IGJhc2tldC5zb3J0ZWRJdGVtcyA6IE9iamVjdC5rZXlzKGJhc2tldC5zb3J0ZWRJdGVtcykpLmZvckVhY2goZnVuY3Rpb24oaXRlbSwgJGluZGV4KSB7XG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJ0clwiLCBpdGVtLmlkKVxuICAgICAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgICAgICB0ZXh0KFwiXCIgKyAoaXRlbS5pZCkgKyBcIlwiKVxuICAgICAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICAgICAgdGV4dChcIlwiICsgKGl0ZW0ucHJvZHVjdC5wcm9kdWN0SWQpICsgXCJcIilcbiAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgICAgIHRleHQoXCJcIiArIChpdGVtLnByb2R1Y3QucHJvZHVjdE5hbWUpICsgXCJcIilcbiAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwiaW5wdXRcIiwgbnVsbCwgW1widHlwZVwiLCBcIm51bWJlclwiXSwgXCJ2YWx1ZVwiLCBpdGVtLnF1YW50aXR5LCBcIm9uY2hhbmdlXCIsIGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSB0aGlzO1xuICAgICAgICAgICAgICBpdGVtLnF1YW50aXR5ID0gdGhpcy52YWx1ZX0pXG4gICAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcImlucHV0XCIpXG4gICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgICAgICB0ZXh0KFwiXCIgKyAoaXRlbS5wcm9kdWN0LnByaWNlKSArIFwiXCIpXG4gICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgICAgICB0ZXh0KFwiXCIgKyAoaXRlbS5wcm9kdWN0LmRpc2NvdW50UGVyY2VudCAqIDEwMCArICcgJScpICsgXCJcIilcbiAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgICAgIHRleHQoXCJcIiArIChpdGVtLmNvc3QudG9GaXhlZCgyKSkgKyBcIlwiKVxuICAgICAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICAgICAgZWxlbWVudE9wZW4oXCJidXR0b25cIiwgbnVsbCwgW1wiY2xhc3NcIiwgXCJidG4gYnRuLXNtIGJ0bi1kYW5nZXJcIl0sIFwib25jbGlja1wiLCBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gdGhpcztcbiAgICAgICAgICAgICAgcmVtb3ZlKCRpbmRleCl9KVxuICAgICAgICAgICAgICAgIHRleHQoXCJSZW1vdmVcIilcbiAgICAgICAgICAgICAgZWxlbWVudENsb3NlKFwiYnV0dG9uXCIpXG4gICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRyXCIpXG4gICAgICAgIH0sIGJhc2tldC5zb3J0ZWRJdGVtcylcbiAgICAgIGVsZW1lbnRDbG9zZShcInRib2R5XCIpXG4gICAgICB0b3RhbFN1bW1hcnkoYmFza2V0KVxuICAgIGVsZW1lbnRDbG9zZShcInRhYmxlXCIpXG4gIH1cbiAgaWYgKCFiYXNrZXQuaXRlbXMubGVuZ3RoKSB7XG4gICAgZWxlbWVudE9wZW4oXCJkaXZcIiwgbnVsbCwgW1wiY2xhc3NcIiwgXCJhbGVydCBhbGVydC1pbmZvXCJdKVxuICAgICAgdGV4dChcIllvdSBoYXZlIG5vIGl0ZW1zIGluIHlvdXIgYmFza2V0IVwiKVxuICAgIGVsZW1lbnRDbG9zZShcImRpdlwiKVxuICB9XG4gIDsoQXJyYXkuaXNBcnJheShwcm9kdWN0cykgPyBwcm9kdWN0cyA6IE9iamVjdC5rZXlzKHByb2R1Y3RzKSkuZm9yRWFjaChmdW5jdGlvbihwcm9kdWN0LCAkaW5kZXgpIHtcbiAgICBlbGVtZW50T3BlbihcImRpdlwiLCAkaW5kZXgsIFtcInN0eWxlXCIsIFwid2lkdGg6IDMzJTsgZmxvYXQ6IGxlZnQ7XCJdKVxuICAgICAgZWxlbWVudE9wZW4oXCJkaXZcIilcbiAgICAgICAgdGV4dChcIlwiICsgKHByb2R1Y3QucHJvZHVjdElkKSArIFwiXCIpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwiZGl2XCIpXG4gICAgICAgIHRleHQoXCJcIiArIChwcm9kdWN0LnByb2R1Y3ROYW1lKSArIFwiXCIpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwiZGl2XCIpXG4gICAgICAgIHRleHQoXCJcIiArIChwcm9kdWN0LnByaWNlKSArIFwiXCIpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwiZGl2XCIpXG4gICAgICAgIHRleHQoXCJcIiArIChwcm9kdWN0LmRpc2NvdW50UGVyY2VudCAqIDEwMCArICcgJScpICsgXCJcIilcbiAgICAgIGVsZW1lbnRDbG9zZShcImRpdlwiKVxuICAgICAgZWxlbWVudE9wZW4oXCJkaXZcIilcbiAgICAgICAgdGV4dChcIlwiICsgKHByb2R1Y3QuY29zdCkgKyBcIlwiKVxuICAgICAgZWxlbWVudENsb3NlKFwiZGl2XCIpXG4gICAgICBlbGVtZW50T3BlbihcImltZ1wiLCBudWxsLCBbXCJzdHlsZVwiLCBcIm1heC13aWR0aDogMjQwcHg7IG1heC1oZWlnaHQ6IDIwMHB4O1wiXSwgXCJzcmNcIiwgcHJvZHVjdC5pbWFnZSlcbiAgICAgIGVsZW1lbnRDbG9zZShcImltZ1wiKVxuICAgICAgZWxlbWVudE9wZW4oXCJidXR0b25cIiwgbnVsbCwgW1wiY2xhc3NcIiwgXCJidG4gYnRuLXNtIGJ0bi1zdWNjZXNzXCJdLCBcIm9uY2xpY2tcIiwgZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyICRlbGVtZW50ID0gdGhpcztcbiAgICAgIGFkZChwcm9kdWN0KX0pXG4gICAgICAgIHRleHQoXCJBZGQgdG8gYmFza2V0XCIpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJidXR0b25cIilcbiAgICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbiAgfSwgcHJvZHVjdHMpXG4gIDsoQXJyYXkuaXNBcnJheShtb2RlbCkgPyBtb2RlbCA6IE9iamVjdC5rZXlzKG1vZGVsKSkuZm9yRWFjaChmdW5jdGlvbihrZXksICRpbmRleCkge1xuICAgIGVsZW1lbnRPcGVuKFwiZGl2XCIsIGtleSlcbiAgICAgIGVsZW1lbnRPcGVuKFwic3BhblwiKVxuICAgICAgICB0ZXh0KFwiXCIgKyAoa2V5KSArIFwiXCIpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJzcGFuXCIpXG4gICAgICBlbGVtZW50T3BlbihcInNwYW5cIilcbiAgICAgICAgdGV4dChcIlwiICsgKCRpbmRleCkgKyBcIlwiKVxuICAgICAgZWxlbWVudENsb3NlKFwic3BhblwiKVxuICAgIGVsZW1lbnRDbG9zZShcImRpdlwiKVxuICB9LCBtb2RlbClcbiAgZWxlbWVudE9wZW4oXCJwcmVcIilcbiAgICBlbGVtZW50T3BlbihcImNvZGVcIilcbiAgICAgIHRleHQoXCIgXFxcbiAgICAgICAgICBcIiArIChKU09OLnN0cmluZ2lmeShtb2RlbCwgbnVsbCwgMikpICsgXCIgXFxcbiAgICAgICAgICBcIilcbiAgICBlbGVtZW50Q2xvc2UoXCJjb2RlXCIpXG4gICAgZWxlbWVudE9wZW4oXCJwcmVcIilcbiAgICBlbGVtZW50Q2xvc2UoXCJwcmVcIilcbiAgZWxlbWVudENsb3NlKFwicHJlXCIpXG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZXNjcmlwdGlvbiAoZGF0YSkge1xuZWxlbWVudE9wZW4oXCJ0Zm9vdFwiKVxuICBlbGVtZW50T3BlbihcInRyXCIpXG4gICAgZWxlbWVudE9wZW4oXCJ0ZFwiLCBudWxsLCBbXCJjb2xzcGFuXCIsIFwiOFwiXSlcbiAgICAgIGVsZW1lbnRPcGVuKFwiaDNcIilcbiAgICAgICAgdGV4dChcIiBcXFxuICAgICAgICAgICAgICAgIFwiICsgKGRhdGEudG90YWxDb3N0KSArIFwiIFxcXG4gICAgICAgICAgICAgIFwiKVxuICAgICAgZWxlbWVudENsb3NlKFwiaDNcIilcbiAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICBlbGVtZW50Q2xvc2UoXCJ0clwiKVxuZWxlbWVudENsb3NlKFwidGZvb3RcIilcbn07XG4iLCJmdW5jdGlvbiBybmRzdHIgKCkge1xuICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDUpXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBybmRzdHI6IHtcbiAgICBfX3ZhbHVlOiBybmRzdHJcbiAgfVxufVxuIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6IHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOiBmYWN0b3J5KGdsb2JhbC5JbmNyZW1lbnRhbERPTSA9IHt9KTtcbn0pKHRoaXMsIGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvKipcbiAgICogQ29weXJpZ2h0IDIwMTUgVGhlIEluY3JlbWVudGFsIERPTSBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICAgKlxuICAgKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAgKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gICAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAgKlxuICAgKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAgKlxuICAgKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gICAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAgICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gICAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBAdHlwZSB7VHJlZVdhbGtlcn1cbiAgICovXG4gIHZhciB3YWxrZXJfO1xuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtUcmVlV2Fsa2VyfSB0aGUgY3VycmVudCBUcmVlV2Fsa2VyXG4gICAqL1xuICB2YXIgZ2V0V2Fsa2VyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB3YWxrZXJfO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjdXJyZW50IFRyZWVXYWxrZXJcbiAgICogQHBhcmFtIHtUcmVlV2Fsa2VyfSB3YWxrZXJcbiAgICovXG4gIHZhciBzZXRXYWxrZXIgPSBmdW5jdGlvbiAod2Fsa2VyKSB7XG4gICAgd2Fsa2VyXyA9IHdhbGtlcjtcbiAgfTtcblxuICAvKipcbiAgICogQ29weXJpZ2h0IDIwMTUgVGhlIEluY3JlbWVudGFsIERPTSBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICAgKlxuICAgKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAgKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gICAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAgKlxuICAgKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAgKlxuICAgKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gICAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAgICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gICAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBLZWVwcyB0cmFjayBvZiBpbmZvcm1hdGlvbiBuZWVkZWQgdG8gcGVyZm9ybSBkaWZmcyBmb3IgYSBnaXZlbiBET00gbm9kZS5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSBub2RlTmFtZVxuICAgKiBAcGFyYW0gez9zdHJpbmd9IGtleVxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGZ1bmN0aW9uIE5vZGVEYXRhKG5vZGVOYW1lLCBrZXkpIHtcbiAgICAvKipcbiAgICAgKiBUaGUgYXR0cmlidXRlcyBhbmQgdGhlaXIgdmFsdWVzLlxuICAgICAqIEBjb25zdFxuICAgICAqL1xuICAgIHRoaXMuYXR0cnMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIEFuIGFycmF5IG9mIGF0dHJpYnV0ZSBuYW1lL3ZhbHVlIHBhaXJzLCB1c2VkIGZvciBxdWlja2x5IGRpZmZpbmcgdGhlXG4gICAgICogaW5jb21taW5nIGF0dHJpYnV0ZXMgdG8gc2VlIGlmIHRoZSBET00gbm9kZSdzIGF0dHJpYnV0ZXMgbmVlZCB0byBiZVxuICAgICAqIHVwZGF0ZWQuXG4gICAgICogQGNvbnN0IHtBcnJheTwqPn1cbiAgICAgKi9cbiAgICB0aGlzLmF0dHJzQXJyID0gW107XG5cbiAgICAvKipcbiAgICAgKiBUaGUgaW5jb21pbmcgYXR0cmlidXRlcyBmb3IgdGhpcyBOb2RlLCBiZWZvcmUgdGhleSBhcmUgdXBkYXRlZC5cbiAgICAgKiBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCAqPn1cbiAgICAgKi9cbiAgICB0aGlzLm5ld0F0dHJzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBUaGUga2V5IHVzZWQgdG8gaWRlbnRpZnkgdGhpcyBub2RlLCB1c2VkIHRvIHByZXNlcnZlIERPTSBub2RlcyB3aGVuIHRoZXlcbiAgICAgKiBtb3ZlIHdpdGhpbiB0aGVpciBwYXJlbnQuXG4gICAgICogQGNvbnN0XG4gICAgICovXG4gICAgdGhpcy5rZXkgPSBrZXk7XG5cbiAgICAvKipcbiAgICAgKiBLZWVwcyB0cmFjayBvZiBjaGlsZHJlbiB3aXRoaW4gdGhpcyBub2RlIGJ5IHRoZWlyIGtleS5cbiAgICAgKiB7P09iamVjdDxzdHJpbmcsICFFbGVtZW50Pn1cbiAgICAgKi9cbiAgICB0aGlzLmtleU1hcCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIG9yIG5vdCB0aGUga2V5TWFwIGlzIGN1cnJlbnRseSB2YWxpZC5cbiAgICAgKiB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmtleU1hcFZhbGlkID0gdHJ1ZTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBsYXN0IGNoaWxkIHRvIGhhdmUgYmVlbiB2aXNpdGVkIHdpdGhpbiB0aGUgY3VycmVudCBwYXNzLlxuICAgICAqIHs/Tm9kZX1cbiAgICAgKi9cbiAgICB0aGlzLmxhc3RWaXNpdGVkQ2hpbGQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG5vZGUgbmFtZSBmb3IgdGhpcyBub2RlLlxuICAgICAqIEBjb25zdFxuICAgICAqL1xuICAgIHRoaXMubm9kZU5hbWUgPSBub2RlTmFtZTtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdCB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMudGV4dCA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgYSBOb2RlRGF0YSBvYmplY3QgZm9yIGEgTm9kZS5cbiAgICpcbiAgICogQHBhcmFtIHshTm9kZX0gbm9kZSBUaGUgbm9kZSB0byBpbml0aWFsaXplIGRhdGEgZm9yLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbm9kZU5hbWUgVGhlIG5vZGUgbmFtZSBvZiBub2RlLlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IGtleSBUaGUga2V5IHRoYXQgaWRlbnRpZmllcyB0aGUgbm9kZS5cbiAgICogQHJldHVybiB7IU5vZGVEYXRhfSBUaGUgbmV3bHkgaW5pdGlhbGl6ZWQgZGF0YSBvYmplY3RcbiAgICovXG4gIHZhciBpbml0RGF0YSA9IGZ1bmN0aW9uIChub2RlLCBub2RlTmFtZSwga2V5KSB7XG4gICAgdmFyIGRhdGEgPSBuZXcgTm9kZURhdGEobm9kZU5hbWUsIGtleSk7XG4gICAgbm9kZVsnX19pbmNyZW1lbnRhbERPTURhdGEnXSA9IGRhdGE7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgTm9kZURhdGEgb2JqZWN0IGZvciBhIE5vZGUsIGNyZWF0aW5nIGl0IGlmIG5lY2Vzc2FyeS5cbiAgICpcbiAgICogQHBhcmFtIHshTm9kZX0gbm9kZSBUaGUgbm9kZSB0byByZXRyaWV2ZSB0aGUgZGF0YSBmb3IuXG4gICAqIEByZXR1cm4ge05vZGVEYXRhfSBUaGUgTm9kZURhdGEgZm9yIHRoaXMgTm9kZS5cbiAgICovXG4gIHZhciBnZXREYXRhID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICB2YXIgZGF0YSA9IG5vZGVbJ19faW5jcmVtZW50YWxET01EYXRhJ107XG5cbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIHZhciBub2RlTmFtZSA9IG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIHZhciBrZXkgPSBudWxsO1xuXG4gICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgICAga2V5ID0gbm9kZS5nZXRBdHRyaWJ1dGUoJ2tleScpO1xuICAgICAgfVxuXG4gICAgICBkYXRhID0gaW5pdERhdGEobm9kZSwgbm9kZU5hbWUsIGtleSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgYW4gYXR0cmlidXRlIG9yIHByb3BlcnR5IHRvIGEgZ2l2ZW4gRWxlbWVudC4gSWYgdGhlIHZhbHVlIGlzIG51bGxcbiAgICogb3IgdW5kZWZpbmVkLCBpdCBpcyByZW1vdmVkIGZyb20gdGhlIEVsZW1lbnQuIE90aGVyd2lzZSwgdGhlIHZhbHVlIGlzIHNldFxuICAgKiBhcyBhbiBhdHRyaWJ1dGUuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBhdHRyaWJ1dGUncyBuYW1lLlxuICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBhdHRyaWJ1dGUncyB2YWx1ZS5cbiAgICovXG4gIHZhciBhcHBseUF0dHIgPSBmdW5jdGlvbiAoZWwsIG5hbWUsIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgYSBwcm9wZXJ0eSB0byBhIGdpdmVuIEVsZW1lbnQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBwcm9wZXJ0eSdzIG5hbWUuXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHByb3BlcnR5J3MgdmFsdWUuXG4gICAqL1xuICB2YXIgYXBwbHlQcm9wID0gZnVuY3Rpb24gKGVsLCBuYW1lLCB2YWx1ZSkge1xuICAgIGVsW25hbWVdID0gdmFsdWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgYSBzdHlsZSB0byBhbiBFbGVtZW50LiBObyB2ZW5kb3IgcHJlZml4IGV4cGFuc2lvbiBpcyBkb25lIGZvclxuICAgKiBwcm9wZXJ0eSBuYW1lcy92YWx1ZXMuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBhdHRyaWJ1dGUncyBuYW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3Q8c3RyaW5nLHN0cmluZz59IHN0eWxlIFRoZSBzdHlsZSB0byBzZXQuIEVpdGhlciBhXG4gICAqICAgICBzdHJpbmcgb2YgY3NzIG9yIGFuIG9iamVjdCBjb250YWluaW5nIHByb3BlcnR5LXZhbHVlIHBhaXJzLlxuICAgKi9cbiAgdmFyIGFwcGx5U3R5bGUgPSBmdW5jdGlvbiAoZWwsIG5hbWUsIHN0eWxlKSB7XG4gICAgaWYgKHR5cGVvZiBzdHlsZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVsLnN0eWxlLmNzc1RleHQgPSBzdHlsZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwuc3R5bGUuY3NzVGV4dCA9ICcnO1xuXG4gICAgICBmb3IgKHZhciBwcm9wIGluIHN0eWxlKSB7XG4gICAgICAgIGVsLnN0eWxlW3Byb3BdID0gc3R5bGVbcHJvcF07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBVcGRhdGVzIGEgc2luZ2xlIGF0dHJpYnV0ZSBvbiBhbiBFbGVtZW50LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgYXR0cmlidXRlJ3MgbmFtZS5cbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgYXR0cmlidXRlJ3MgdmFsdWUuIElmIHRoZSB2YWx1ZSBpcyBhbiBvYmplY3Qgb3JcbiAgICogICAgIGZ1bmN0aW9uIGl0IGlzIHNldCBvbiB0aGUgRWxlbWVudCwgb3RoZXJ3aXNlLCBpdCBpcyBzZXQgYXMgYW4gSFRNTFxuICAgKiAgICAgYXR0cmlidXRlLlxuICAgKi9cbiAgdmFyIGFwcGx5QXR0cmlidXRlVHlwZWQgPSBmdW5jdGlvbiAoZWwsIG5hbWUsIHZhbHVlKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG5cbiAgICBpZiAodHlwZSA9PT0gJ29iamVjdCcgfHwgdHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYXBwbHlQcm9wKGVsLCBuYW1lLCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwcGx5QXR0cihlbCwgbmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2FsbHMgdGhlIGFwcHJvcHJpYXRlIGF0dHJpYnV0ZSBtdXRhdG9yIGZvciB0aGlzIGF0dHJpYnV0ZS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIGF0dHJpYnV0ZSdzIG5hbWUuXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIGF0dHJpYnV0ZSdzIHZhbHVlLlxuICAgKi9cbiAgdmFyIHVwZGF0ZUF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChlbCwgbmFtZSwgdmFsdWUpIHtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEoZWwpO1xuICAgIHZhciBhdHRycyA9IGRhdGEuYXR0cnM7XG5cbiAgICBpZiAoYXR0cnNbbmFtZV0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG11dGF0b3IgPSBfbXV0YXRvcnNbbmFtZV0gfHwgX211dGF0b3JzLl9fYWxsO1xuICAgIG11dGF0b3IoZWwsIG5hbWUsIHZhbHVlKTtcblxuICAgIGF0dHJzW25hbWVdID0gdmFsdWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEV4cG9zZXMgb3VyIGRlZmF1bHQgYXR0cmlidXRlIG11dGF0b3JzIHB1YmxpY2x5LCBzbyB0aGV5IG1heSBiZSB1c2VkIGluXG4gICAqIGN1c3RvbSBtdXRhdG9ycy5cbiAgICogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgZnVuY3Rpb24oIUVsZW1lbnQsIHN0cmluZywgKik+fVxuICAgKi9cbiAgdmFyIF9kZWZhdWx0cyA9IHtcbiAgICBhcHBseUF0dHI6IGFwcGx5QXR0cixcbiAgICBhcHBseVByb3A6IGFwcGx5UHJvcCxcbiAgICBhcHBseVN0eWxlOiBhcHBseVN0eWxlXG4gIH07XG5cbiAgLyoqXG4gICAqIEEgcHVibGljbHkgbXV0YWJsZSBvYmplY3QgdG8gcHJvdmlkZSBjdXN0b20gbXV0YXRvcnMgZm9yIGF0dHJpYnV0ZXMuXG4gICAqIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsIGZ1bmN0aW9uKCFFbGVtZW50LCBzdHJpbmcsICopPn1cbiAgICovXG4gIHZhciBfbXV0YXRvcnMgPSB7XG4gICAgLy8gU3BlY2lhbCBnZW5lcmljIG11dGF0b3IgdGhhdCdzIGNhbGxlZCBmb3IgYW55IGF0dHJpYnV0ZSB0aGF0IGRvZXMgbm90XG4gICAgLy8gaGF2ZSBhIHNwZWNpZmljIG11dGF0b3IuXG4gICAgX19hbGw6IGFwcGx5QXR0cmlidXRlVHlwZWQsXG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgdGhlIHN0eWxlIGF0dHJpYnV0ZVxuICAgIHN0eWxlOiBhcHBseVN0eWxlXG4gIH07XG5cbiAgdmFyIFNWR19OUyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG5cbiAgLyoqXG4gICAqIEVudGVycyBhIHRhZywgY2hlY2tpbmcgdG8gc2VlIGlmIGl0IGlzIGEgbmFtZXNwYWNlIGJvdW5kYXJ5LCBhbmQgaWYgc28sXG4gICAqIHVwZGF0ZXMgdGhlIGN1cnJlbnQgbmFtZXNwYWNlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSB0YWcgdG8gZW50ZXIuXG4gICAqL1xuICB2YXIgZW50ZXJUYWcgPSBmdW5jdGlvbiAodGFnKSB7XG4gICAgaWYgKHRhZyA9PT0gJ3N2ZycpIHtcbiAgICAgIGdldFdhbGtlcigpLmVudGVyTmFtZXNwYWNlKFNWR19OUyk7XG4gICAgfSBlbHNlIGlmICh0YWcgPT09ICdmb3JlaWduT2JqZWN0Jykge1xuICAgICAgZ2V0V2Fsa2VyKCkuZW50ZXJOYW1lc3BhY2UodW5kZWZpbmVkKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEV4aXRzIGEgdGFnLCBjaGVja2luZyB0byBzZWUgaWYgaXQgaXMgYSBuYW1lc3BhY2UgYm91bmRhcnksIGFuZCBpZiBzbyxcbiAgICogdXBkYXRlcyB0aGUgY3VycmVudCBuYW1lc3BhY2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIHRhZyB0byBlbnRlci5cbiAgICovXG4gIHZhciBleGl0VGFnID0gZnVuY3Rpb24gKHRhZykge1xuICAgIGlmICh0YWcgPT09ICdzdmcnIHx8IHRhZyA9PT0gJ2ZvcmVpZ25PYmplY3QnKSB7XG4gICAgICBnZXRXYWxrZXIoKS5leGl0TmFtZXNwYWNlKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBuYW1lc3BhY2UgdG8gY3JlYXRlIGFuIGVsZW1lbnQgKG9mIGEgZ2l2ZW4gdGFnKSBpbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyBUaGUgdGFnIHRvIGdldCB0aGUgbmFtZXNwYWNlIGZvci5cbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgbmFtZXNwYWNlIHRvIGNyZWF0ZSB0aGUgdGFnIGluLlxuICAgKi9cbiAgdmFyIGdldE5hbWVzcGFjZUZvclRhZyA9IGZ1bmN0aW9uICh0YWcpIHtcbiAgICBpZiAodGFnID09PSAnc3ZnJykge1xuICAgICAgcmV0dXJuIFNWR19OUztcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0V2Fsa2VyKCkuZ2V0Q3VycmVudE5hbWVzcGFjZSgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIEVsZW1lbnQuXG4gICAqIEBwYXJhbSB7IURvY3VtZW50fSBkb2MgVGhlIGRvY3VtZW50IHdpdGggd2hpY2ggdG8gY3JlYXRlIHRoZSBFbGVtZW50LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSB0YWcgZm9yIHRoZSBFbGVtZW50LlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IGtleSBBIGtleSB0byBpZGVudGlmeSB0aGUgRWxlbWVudC5cbiAgICogQHBhcmFtIHs/QXJyYXk8Kj59IHN0YXRpY3MgQW4gYXJyYXkgb2YgYXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMgb2ZcbiAgICogICAgIHRoZSBzdGF0aWMgYXR0cmlidXRlcyBmb3IgdGhlIEVsZW1lbnQuXG4gICAqIEByZXR1cm4geyFFbGVtZW50fVxuICAgKi9cbiAgdmFyIGNyZWF0ZUVsZW1lbnQgPSBmdW5jdGlvbiAoZG9jLCB0YWcsIGtleSwgc3RhdGljcykge1xuICAgIHZhciBuYW1lc3BhY2UgPSBnZXROYW1lc3BhY2VGb3JUYWcodGFnKTtcbiAgICB2YXIgZWw7XG5cbiAgICBpZiAobmFtZXNwYWNlKSB7XG4gICAgICBlbCA9IGRvYy5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlLCB0YWcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbCA9IGRvYy5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgfVxuXG4gICAgaW5pdERhdGEoZWwsIHRhZywga2V5KTtcblxuICAgIGlmIChzdGF0aWNzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YXRpY3MubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgdXBkYXRlQXR0cmlidXRlKGVsLCBzdGF0aWNzW2ldLCBzdGF0aWNzW2kgKyAxXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVsO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgTm9kZSwgZWl0aGVyIGEgVGV4dCBvciBhbiBFbGVtZW50IGRlcGVuZGluZyBvbiB0aGUgbm9kZSBuYW1lXG4gICAqIHByb3ZpZGVkLlxuICAgKiBAcGFyYW0geyFEb2N1bWVudH0gZG9jIFRoZSBkb2N1bWVudCB3aXRoIHdoaWNoIHRvIGNyZWF0ZSB0aGUgTm9kZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5vZGVOYW1lIFRoZSB0YWcgaWYgY3JlYXRpbmcgYW4gZWxlbWVudCBvciAjdGV4dCB0byBjcmVhdGVcbiAgICogICAgIGEgVGV4dC5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSBrZXkgQSBrZXkgdG8gaWRlbnRpZnkgdGhlIEVsZW1lbnQuXG4gICAqIEBwYXJhbSB7P0FycmF5PCo+fSBzdGF0aWNzIFRoZSBzdGF0aWMgZGF0YSB0byBpbml0aWFsaXplIHRoZSBOb2RlXG4gICAqICAgICB3aXRoLiBGb3IgYW4gRWxlbWVudCwgYW4gYXJyYXkgb2YgYXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMgb2ZcbiAgICogICAgIHRoZSBzdGF0aWMgYXR0cmlidXRlcyBmb3IgdGhlIEVsZW1lbnQuXG4gICAqIEByZXR1cm4geyFOb2RlfVxuICAgKi9cbiAgdmFyIGNyZWF0ZU5vZGUgPSBmdW5jdGlvbiAoZG9jLCBub2RlTmFtZSwga2V5LCBzdGF0aWNzKSB7XG4gICAgaWYgKG5vZGVOYW1lID09PSAnI3RleHQnKSB7XG4gICAgICByZXR1cm4gZG9jLmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlRWxlbWVudChkb2MsIG5vZGVOYW1lLCBrZXksIHN0YXRpY3MpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbWFwcGluZyB0aGF0IGNhbiBiZSB1c2VkIHRvIGxvb2sgdXAgY2hpbGRyZW4gdXNpbmcgYSBrZXkuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsXG4gICAqIEByZXR1cm4geyFPYmplY3Q8c3RyaW5nLCAhRWxlbWVudD59IEEgbWFwcGluZyBvZiBrZXlzIHRvIHRoZSBjaGlsZHJlbiBvZiB0aGVcbiAgICogICAgIEVsZW1lbnQuXG4gICAqL1xuICB2YXIgY3JlYXRlS2V5TWFwID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgdmFyIG1hcCA9IHt9O1xuICAgIHZhciBjaGlsZHJlbiA9IGVsLmNoaWxkcmVuO1xuICAgIHZhciBjb3VudCA9IGNoaWxkcmVuLmxlbmd0aDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkgKz0gMSkge1xuICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICB2YXIga2V5ID0gZ2V0RGF0YShjaGlsZCkua2V5O1xuXG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIG1hcFtrZXldID0gY2hpbGQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcDtcbiAgfTtcblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBtYXBwaW5nIG9mIGtleSB0byBjaGlsZCBub2RlIGZvciBhIGdpdmVuIEVsZW1lbnQsIGNyZWF0aW5nIGl0XG4gICAqIGlmIG5lY2Vzc2FyeS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxcbiAgICogQHJldHVybiB7IU9iamVjdDxzdHJpbmcsICFFbGVtZW50Pn0gQSBtYXBwaW5nIG9mIGtleXMgdG8gY2hpbGQgRWxlbWVudHNcbiAgICovXG4gIHZhciBnZXRLZXlNYXAgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEoZWwpO1xuXG4gICAgaWYgKCFkYXRhLmtleU1hcCkge1xuICAgICAgZGF0YS5rZXlNYXAgPSBjcmVhdGVLZXlNYXAoZWwpO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhLmtleU1hcDtcbiAgfTtcblxuICAvKipcbiAgICogUmV0cmlldmVzIGEgY2hpbGQgZnJvbSB0aGUgcGFyZW50IHdpdGggdGhlIGdpdmVuIGtleS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gcGFyZW50XG4gICAqIEBwYXJhbSB7P3N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4gez9FbGVtZW50fSBUaGUgY2hpbGQgY29ycmVzcG9uZGluZyB0byB0aGUga2V5LlxuICAgKi9cbiAgdmFyIGdldENoaWxkID0gZnVuY3Rpb24gKHBhcmVudCwga2V5KSB7XG4gICAgcmV0dXJuIGdldEtleU1hcChwYXJlbnQpW2tleV07XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhbiBlbGVtZW50IGFzIGJlaW5nIGEgY2hpbGQuIFRoZSBwYXJlbnQgd2lsbCBrZWVwIHRyYWNrIG9mIHRoZVxuICAgKiBjaGlsZCB1c2luZyB0aGUga2V5LiBUaGUgY2hpbGQgY2FuIGJlIHJldHJpZXZlZCB1c2luZyB0aGUgc2FtZSBrZXkgdXNpbmdcbiAgICogZ2V0S2V5TWFwLiBUaGUgcHJvdmlkZWQga2V5IHNob3VsZCBiZSB1bmlxdWUgd2l0aGluIHRoZSBwYXJlbnQgRWxlbWVudC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gcGFyZW50IFRoZSBwYXJlbnQgb2YgY2hpbGQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgQSBrZXkgdG8gaWRlbnRpZnkgdGhlIGNoaWxkIHdpdGguXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGNoaWxkIFRoZSBjaGlsZCB0byByZWdpc3Rlci5cbiAgICovXG4gIHZhciByZWdpc3RlckNoaWxkID0gZnVuY3Rpb24gKHBhcmVudCwga2V5LCBjaGlsZCkge1xuICAgIGdldEtleU1hcChwYXJlbnQpW2tleV0gPSBjaGlsZDtcbiAgfTtcblxuICBpZiAodW5kZWZpbmVkICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAvKipcbiAgICAqIE1ha2VzIHN1cmUgdGhhdCBrZXllZCBFbGVtZW50IG1hdGNoZXMgdGhlIHRhZyBuYW1lIHByb3ZpZGVkLlxuICAgICogQHBhcmFtIHshRWxlbWVudH0gbm9kZSBUaGUgbm9kZSB0aGF0IGlzIGJlaW5nIG1hdGNoZWQuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSB0YWcgbmFtZSBvZiB0aGUgRWxlbWVudC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgRWxlbWVudC5cbiAgICAqL1xuICAgIHZhciBhc3NlcnRLZXllZFRhZ01hdGNoZXMgPSBmdW5jdGlvbiAobm9kZSwgdGFnLCBrZXkpIHtcbiAgICAgIHZhciBub2RlTmFtZSA9IGdldERhdGEobm9kZSkubm9kZU5hbWU7XG4gICAgICBpZiAobm9kZU5hbWUgIT09IHRhZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dhcyBleHBlY3Rpbmcgbm9kZSB3aXRoIGtleSBcIicgKyBrZXkgKyAnXCIgdG8gYmUgYSAnICsgdGFnICsgJywgbm90IGEgJyArIG5vZGVOYW1lICsgJy4nKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIG9yIG5vdCBhIGdpdmVuIG5vZGUgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIG5vZGVOYW1lIGFuZCBrZXkuXG4gICAqXG4gICAqIEBwYXJhbSB7IU5vZGV9IG5vZGUgQW4gSFRNTCBub2RlLCB0eXBpY2FsbHkgYW4gSFRNTEVsZW1lbnQgb3IgVGV4dC5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSBub2RlTmFtZSBUaGUgbm9kZU5hbWUgZm9yIHRoaXMgbm9kZS5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSBrZXkgQW4gb3B0aW9uYWwga2V5IHRoYXQgaWRlbnRpZmllcyBhIG5vZGUuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIG5vZGUgbWF0Y2hlcywgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgdmFyIG1hdGNoZXMgPSBmdW5jdGlvbiAobm9kZSwgbm9kZU5hbWUsIGtleSkge1xuICAgIHZhciBkYXRhID0gZ2V0RGF0YShub2RlKTtcblxuICAgIC8vIEtleSBjaGVjayBpcyBkb25lIHVzaW5nIGRvdWJsZSBlcXVhbHMgYXMgd2Ugd2FudCB0byB0cmVhdCBhIG51bGwga2V5IHRoZVxuICAgIC8vIHNhbWUgYXMgdW5kZWZpbmVkLiBUaGlzIHNob3VsZCBiZSBva2F5IGFzIHRoZSBvbmx5IHZhbHVlcyBhbGxvd2VkIGFyZVxuICAgIC8vIHN0cmluZ3MsIG51bGwgYW5kIHVuZGVmaW5lZCBzbyB0aGUgPT0gc2VtYW50aWNzIGFyZSBub3QgdG9vIHdlaXJkLlxuICAgIHJldHVybiBrZXkgPT0gZGF0YS5rZXkgJiYgbm9kZU5hbWUgPT09IGRhdGEubm9kZU5hbWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFsaWducyB0aGUgdmlydHVhbCBFbGVtZW50IGRlZmluaXRpb24gd2l0aCB0aGUgYWN0dWFsIERPTSwgbW92aW5nIHRoZVxuICAgKiBjb3JyZXNwb25kaW5nIERPTSBub2RlIHRvIHRoZSBjb3JyZWN0IGxvY2F0aW9uIG9yIGNyZWF0aW5nIGl0IGlmIG5lY2Vzc2FyeS5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSBub2RlTmFtZSBGb3IgYW4gRWxlbWVudCwgdGhpcyBzaG91bGQgYmUgYSB2YWxpZCB0YWcgc3RyaW5nLlxuICAgKiAgICAgRm9yIGEgVGV4dCwgdGhpcyBzaG91bGQgYmUgI3RleHQuXG4gICAqIEBwYXJhbSB7P3N0cmluZ30ga2V5IFRoZSBrZXkgdXNlZCB0byBpZGVudGlmeSB0aGlzIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7P0FycmF5PCo+fSBzdGF0aWNzIEZvciBhbiBFbGVtZW50LCB0aGlzIHNob3VsZCBiZSBhbiBhcnJheSBvZlxuICAgKiAgICAgbmFtZS12YWx1ZSBwYWlycy5cbiAgICogQHJldHVybiB7IU5vZGV9IFRoZSBtYXRjaGluZyBub2RlLlxuICAgKi9cbiAgdmFyIGFsaWduV2l0aERPTSA9IGZ1bmN0aW9uIChub2RlTmFtZSwga2V5LCBzdGF0aWNzKSB7XG4gICAgdmFyIHdhbGtlciA9IGdldFdhbGtlcigpO1xuICAgIHZhciBjdXJyZW50Tm9kZSA9IHdhbGtlci5jdXJyZW50Tm9kZTtcbiAgICB2YXIgcGFyZW50ID0gd2Fsa2VyLmdldEN1cnJlbnRQYXJlbnQoKTtcbiAgICB2YXIgbWF0Y2hpbmdOb2RlO1xuXG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlIGhhdmUgYSBub2RlIHRvIHJldXNlXG4gICAgaWYgKGN1cnJlbnROb2RlICYmIG1hdGNoZXMoY3VycmVudE5vZGUsIG5vZGVOYW1lLCBrZXkpKSB7XG4gICAgICBtYXRjaGluZ05vZGUgPSBjdXJyZW50Tm9kZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGV4aXN0aW5nTm9kZSA9IGtleSAmJiBnZXRDaGlsZChwYXJlbnQsIGtleSk7XG5cbiAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgbm9kZSBoYXMgbW92ZWQgd2l0aGluIHRoZSBwYXJlbnQgb3IgaWYgYSBuZXcgb25lXG4gICAgICAvLyBzaG91bGQgYmUgY3JlYXRlZFxuICAgICAgaWYgKGV4aXN0aW5nTm9kZSkge1xuICAgICAgICBpZiAodW5kZWZpbmVkICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICBhc3NlcnRLZXllZFRhZ01hdGNoZXMoZXhpc3RpbmdOb2RlLCBub2RlTmFtZSwga2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1hdGNoaW5nTm9kZSA9IGV4aXN0aW5nTm9kZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hdGNoaW5nTm9kZSA9IGNyZWF0ZU5vZGUod2Fsa2VyLmRvYywgbm9kZU5hbWUsIGtleSwgc3RhdGljcyk7XG5cbiAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgIHJlZ2lzdGVyQ2hpbGQocGFyZW50LCBrZXksIG1hdGNoaW5nTm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIG5vZGUgaGFzIGEga2V5LCByZW1vdmUgaXQgZnJvbSB0aGUgRE9NIHRvIHByZXZlbnQgYSBsYXJnZSBudW1iZXJcbiAgICAgIC8vIG9mIHJlLW9yZGVycyBpbiB0aGUgY2FzZSB0aGF0IGl0IG1vdmVkIGZhciBvciB3YXMgY29tcGxldGVseSByZW1vdmVkLlxuICAgICAgLy8gU2luY2Ugd2UgaG9sZCBvbiB0byBhIHJlZmVyZW5jZSB0aHJvdWdoIHRoZSBrZXlNYXAsIHdlIGNhbiBhbHdheXMgYWRkIGl0XG4gICAgICAvLyBiYWNrLlxuICAgICAgaWYgKGN1cnJlbnROb2RlICYmIGdldERhdGEoY3VycmVudE5vZGUpLmtleSkge1xuICAgICAgICBwYXJlbnQucmVwbGFjZUNoaWxkKG1hdGNoaW5nTm9kZSwgY3VycmVudE5vZGUpO1xuICAgICAgICBnZXREYXRhKHBhcmVudCkua2V5TWFwVmFsaWQgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUobWF0Y2hpbmdOb2RlLCBjdXJyZW50Tm9kZSk7XG4gICAgICB9XG5cbiAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IG1hdGNoaW5nTm9kZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWF0Y2hpbmdOb2RlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbGVhcnMgb3V0IGFueSB1bnZpc2l0ZWQgTm9kZXMsIGFzIHRoZSBjb3JyZXNwb25kaW5nIHZpcnR1YWwgZWxlbWVudFxuICAgKiBmdW5jdGlvbnMgd2VyZSBuZXZlciBjYWxsZWQgZm9yIHRoZW0uXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IG5vZGVcbiAgICovXG4gIHZhciBjbGVhclVudmlzaXRlZERPTSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgdmFyIGRhdGEgPSBnZXREYXRhKG5vZGUpO1xuICAgIHZhciBrZXlNYXAgPSBkYXRhLmtleU1hcDtcbiAgICB2YXIga2V5TWFwVmFsaWQgPSBkYXRhLmtleU1hcFZhbGlkO1xuICAgIHZhciBsYXN0Q2hpbGQgPSBub2RlLmxhc3RDaGlsZDtcbiAgICB2YXIgbGFzdFZpc2l0ZWRDaGlsZCA9IGRhdGEubGFzdFZpc2l0ZWRDaGlsZDtcblxuICAgIGRhdGEubGFzdFZpc2l0ZWRDaGlsZCA9IG51bGw7XG5cbiAgICBpZiAobGFzdENoaWxkID09PSBsYXN0VmlzaXRlZENoaWxkICYmIGtleU1hcFZhbGlkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgd2hpbGUgKGxhc3RDaGlsZCAhPT0gbGFzdFZpc2l0ZWRDaGlsZCkge1xuICAgICAgbm9kZS5yZW1vdmVDaGlsZChsYXN0Q2hpbGQpO1xuICAgICAgbGFzdENoaWxkID0gbm9kZS5sYXN0Q2hpbGQ7XG4gICAgfVxuXG4gICAgLy8gQ2xlYW4gdGhlIGtleU1hcCwgcmVtb3ZpbmcgYW55IHVudXN1ZWQga2V5cy5cbiAgICBmb3IgKHZhciBrZXkgaW4ga2V5TWFwKSB7XG4gICAgICBpZiAoIWtleU1hcFtrZXldLnBhcmVudE5vZGUpIHtcbiAgICAgICAgZGVsZXRlIGtleU1hcFtrZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRhdGEua2V5TWFwVmFsaWQgPSB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFbnRlcnMgYW4gRWxlbWVudCwgc2V0dGluZyB0aGUgY3VycmVudCBuYW1lc3BhY2UgZm9yIG5lc3RlZCBlbGVtZW50cy5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gbm9kZVxuICAgKi9cbiAgdmFyIGVudGVyTm9kZSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgdmFyIGRhdGEgPSBnZXREYXRhKG5vZGUpO1xuICAgIGVudGVyVGFnKGRhdGEubm9kZU5hbWUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFeGl0cyBhbiBFbGVtZW50LCB1bndpbmRpbmcgdGhlIGN1cnJlbnQgbmFtZXNwYWNlIHRvIHRoZSBwcmV2aW91cyB2YWx1ZS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gbm9kZVxuICAgKi9cbiAgdmFyIGV4aXROb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEobm9kZSk7XG4gICAgZXhpdFRhZyhkYXRhLm5vZGVOYW1lKTtcbiAgfTtcblxuICAvKipcbiAgICogTWFya3Mgbm9kZSdzIHBhcmVudCBhcyBoYXZpbmcgdmlzaXRlZCBub2RlLlxuICAgKiBAcGFyYW0geyFOb2RlfSBub2RlXG4gICAqL1xuICB2YXIgbWFya1Zpc2l0ZWQgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIHZhciB3YWxrZXIgPSBnZXRXYWxrZXIoKTtcbiAgICB2YXIgcGFyZW50ID0gd2Fsa2VyLmdldEN1cnJlbnRQYXJlbnQoKTtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEocGFyZW50KTtcbiAgICBkYXRhLmxhc3RWaXNpdGVkQ2hpbGQgPSBub2RlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRvIHRoZSBmaXJzdCBjaGlsZCBvZiB0aGUgY3VycmVudCBub2RlLlxuICAgKi9cbiAgdmFyIGZpcnN0Q2hpbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHdhbGtlciA9IGdldFdhbGtlcigpO1xuICAgIGVudGVyTm9kZSh3YWxrZXIuY3VycmVudE5vZGUpO1xuICAgIHdhbGtlci5maXJzdENoaWxkKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdG8gdGhlIG5leHQgc2libGluZyBvZiB0aGUgY3VycmVudCBub2RlLlxuICAgKi9cbiAgdmFyIG5leHRTaWJsaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB3YWxrZXIgPSBnZXRXYWxrZXIoKTtcbiAgICBtYXJrVmlzaXRlZCh3YWxrZXIuY3VycmVudE5vZGUpO1xuICAgIHdhbGtlci5uZXh0U2libGluZygpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRvIHRoZSBwYXJlbnQgb2YgdGhlIGN1cnJlbnQgbm9kZSwgcmVtb3ZpbmcgYW55IHVudmlzaXRlZCBjaGlsZHJlbi5cbiAgICovXG4gIHZhciBwYXJlbnROb2RlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB3YWxrZXIgPSBnZXRXYWxrZXIoKTtcbiAgICB3YWxrZXIucGFyZW50Tm9kZSgpO1xuICAgIGV4aXROb2RlKHdhbGtlci5jdXJyZW50Tm9kZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENvcHlyaWdodCAyMDE1IFRoZSBJbmNyZW1lbnRhbCBET00gQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAgICpcbiAgICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAgICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAgICpcbiAgICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgICpcbiAgICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICAgKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gICAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICAgKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gICAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICAgKi9cblxuICAvKipcbiAgICogU2ltaWxhciB0byB0aGUgYnVpbHQtaW4gVHJlZXdhbGtlciBjbGFzcywgYnV0IHNpbXBsaWZpZWQgYW5kIGFsbG93cyBkaXJlY3RcbiAgICogYWNjZXNzIHRvIG1vZGlmeSB0aGUgY3VycmVudE5vZGUgcHJvcGVydHkuXG4gICAqIEBwYXJhbSB7IU5vZGV9IG5vZGUgVGhlIHJvb3QgTm9kZSBvZiB0aGUgc3VidHJlZSB0aGUgd2Fsa2VyIHNob3VsZCBzdGFydFxuICAgKiAgICAgdHJhdmVyc2luZy5cbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBmdW5jdGlvbiBUcmVlV2Fsa2VyKG5vZGUpIHtcbiAgICAvKipcbiAgICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgY3VycmVudCBwYXJlbnQgbm9kZS4gVGhpcyBpcyBuZWNlc3NhcnkgYXMgdGhlIHRyYXZlcnNhbFxuICAgICAqIG1ldGhvZHMgbWF5IHRyYXZlcnNlIHBhc3QgdGhlIGxhc3QgY2hpbGQgYW5kIHdlIHN0aWxsIG5lZWQgYSB3YXkgdG8gZ2V0XG4gICAgICogYmFjayB0byB0aGUgcGFyZW50LlxuICAgICAqIEBjb25zdCBAcHJpdmF0ZSB7IUFycmF5PCFOb2RlPn1cbiAgICAgKi9cbiAgICB0aGlzLnN0YWNrXyA9IFtdO1xuXG4gICAgLyoqIHs/Tm9kZX0gKi9cbiAgICB0aGlzLmN1cnJlbnROb2RlID0gbm9kZTtcblxuICAgIC8qKiB7IURvY3VtZW50fSAqL1xuICAgIHRoaXMuZG9jID0gbm9kZS5vd25lckRvY3VtZW50O1xuXG4gICAgLyoqXG4gICAgICogS2VlcHMgdHJhY2sgb2Ygd2hhdCBuYW1lc3BhY2UgdG8gY3JlYXRlIG5ldyBFbGVtZW50cyBpbi5cbiAgICAgKiBAY29uc3QgQHByaXZhdGUgeyFBcnJheTxzdHJpbmc+fVxuICAgICAqL1xuICAgIHRoaXMubnNTdGFja18gPSBbdW5kZWZpbmVkXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshTm9kZX0gVGhlIGN1cnJlbnQgcGFyZW50IG9mIHRoZSBjdXJyZW50IGxvY2F0aW9uIGluIHRoZSBzdWJ0cmVlLlxuICAgKi9cbiAgVHJlZVdhbGtlci5wcm90b3R5cGUuZ2V0Q3VycmVudFBhcmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFja19bdGhpcy5zdGFja18ubGVuZ3RoIC0gMV07XG4gIH07XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGN1cnJlbnQgbmFtZXNwYWNlIHRvIGNyZWF0ZSBFbGVtZW50cyBpbi5cbiAgICovXG4gIFRyZWVXYWxrZXIucHJvdG90eXBlLmdldEN1cnJlbnROYW1lc3BhY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMubnNTdGFja19bdGhpcy5uc1N0YWNrXy5sZW5ndGggLSAxXTtcbiAgfTtcblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVzcGFjZSBUaGUgbmFtZXNwYWNlIHRvIGVudGVyLlxuICAgKi9cbiAgVHJlZVdhbGtlci5wcm90b3R5cGUuZW50ZXJOYW1lc3BhY2UgPSBmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG4gICAgdGhpcy5uc1N0YWNrXy5wdXNoKG5hbWVzcGFjZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEV4aXRzIHRoZSBjdXJyZW50IG5hbWVzcGFjZVxuICAgKi9cbiAgVHJlZVdhbGtlci5wcm90b3R5cGUuZXhpdE5hbWVzcGFjZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm5zU3RhY2tfLnBvcCgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBjdXJyZW50IGxvY2F0aW9uIHRoZSBmaXJzdENoaWxkIG9mIHRoZSBjdXJyZW50IGxvY2F0aW9uLlxuICAgKi9cbiAgVHJlZVdhbGtlci5wcm90b3R5cGUuZmlyc3RDaGlsZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnN0YWNrXy5wdXNoKHRoaXMuY3VycmVudE5vZGUpO1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSB0aGlzLmN1cnJlbnROb2RlLmZpcnN0Q2hpbGQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdGhlIGN1cnJlbnQgbG9jYXRpb24gdGhlIG5leHRTaWJsaW5nIG9mIHRoZSBjdXJyZW50IGxvY2F0aW9uLlxuICAgKi9cbiAgVHJlZVdhbGtlci5wcm90b3R5cGUubmV4dFNpYmxpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IHRoaXMuY3VycmVudE5vZGUubmV4dFNpYmxpbmc7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdGhlIGN1cnJlbnQgbG9jYXRpb24gdGhlIHBhcmVudE5vZGUgb2YgdGhlIGN1cnJlbnQgbG9jYXRpb24uXG4gICAqL1xuICBUcmVlV2Fsa2VyLnByb3RvdHlwZS5wYXJlbnROb2RlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSB0aGlzLnN0YWNrXy5wb3AoKTtcbiAgfTtcblxuICAvKipcbiAgICogQGNvbnN0IHtib29sZWFufVxuICAgKi9cbiAgaWYgKHVuZGVmaW5lZCAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgdmFyIGFzc2VydE5vVW5jbG9zZWRUYWdzID0gZnVuY3Rpb24gKHJvb3QpIHtcbiAgICAgIHZhciBvcGVuRWxlbWVudCA9IGdldFdhbGtlcigpLmdldEN1cnJlbnRQYXJlbnQoKTtcbiAgICAgIGlmICghb3BlbkVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgb3BlblRhZ3MgPSBbXTtcbiAgICAgIHdoaWxlIChvcGVuRWxlbWVudCAmJiBvcGVuRWxlbWVudCAhPT0gcm9vdCkge1xuICAgICAgICBvcGVuVGFncy5wdXNoKG9wZW5FbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICBvcGVuRWxlbWVudCA9IG9wZW5FbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICB9XG5cbiAgICAgIHRocm93IG5ldyBFcnJvcignT25lIG9yIG1vcmUgdGFncyB3ZXJlIG5vdCBjbG9zZWQ6XFxuJyArIG9wZW5UYWdzLmpvaW4oJ1xcbicpKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFBhdGNoZXMgdGhlIGRvY3VtZW50IHN0YXJ0aW5nIGF0IGVsIHdpdGggdGhlIHByb3ZpZGVkIGZ1bmN0aW9uLiBUaGlzIGZ1bmN0aW9uXG4gICAqIG1heSBiZSBjYWxsZWQgZHVyaW5nIGFuIGV4aXN0aW5nIHBhdGNoIG9wZXJhdGlvbi5cbiAgICogQHBhcmFtIHshRWxlbWVudHwhRG9jdW1lbnR9IG5vZGUgVGhlIEVsZW1lbnQgb3IgRG9jdW1lbnQgdG8gcGF0Y2guXG4gICAqIEBwYXJhbSB7IWZ1bmN0aW9ufSBmbiBBIGZ1bmN0aW9uIGNvbnRhaW5pbmcgZWxlbWVudE9wZW4vZWxlbWVudENsb3NlL2V0Yy5cbiAgICogICAgIGNhbGxzIHRoYXQgZGVzY3JpYmUgdGhlIERPTS5cbiAgICogQHBhcmFtIHsqfSBkYXRhIEFuIGFyZ3VtZW50IHBhc3NlZCB0byBmbiB0byByZXByZXNlbnQgRE9NIHN0YXRlLlxuICAgKi9cbiAgZXhwb3J0cy5wYXRjaCA9IGZ1bmN0aW9uIChub2RlLCBmbiwgZGF0YSkge1xuICAgIHZhciBwcmV2V2Fsa2VyID0gZ2V0V2Fsa2VyKCk7XG4gICAgc2V0V2Fsa2VyKG5ldyBUcmVlV2Fsa2VyKG5vZGUpKTtcblxuICAgIGZpcnN0Q2hpbGQoKTtcbiAgICBmbihkYXRhKTtcbiAgICBwYXJlbnROb2RlKCk7XG4gICAgY2xlYXJVbnZpc2l0ZWRET00obm9kZSk7XG5cbiAgICBpZiAodW5kZWZpbmVkICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGFzc2VydE5vVW5jbG9zZWRUYWdzKG5vZGUpO1xuICAgIH1cblxuICAgIHNldFdhbGtlcihwcmV2V2Fsa2VyKTtcbiAgfTtcblxuICAvKipcbiAgICogVGhlIG9mZnNldCBpbiB0aGUgdmlydHVhbCBlbGVtZW50IGRlY2xhcmF0aW9uIHdoZXJlIHRoZSBhdHRyaWJ1dGVzIGFyZVxuICAgKiBzcGVjaWZpZWQuXG4gICAqIEBjb25zdFxuICAgKi9cbiAgdmFyIEFUVFJJQlVURVNfT0ZGU0VUID0gMztcblxuICAvKipcbiAgICogQnVpbGRzIGFuIGFycmF5IG9mIGFyZ3VtZW50cyBmb3IgdXNlIHdpdGggZWxlbWVudE9wZW5TdGFydCwgYXR0ciBhbmRcbiAgICogZWxlbWVudE9wZW5FbmQuXG4gICAqIEBjb25zdCB7QXJyYXk8Kj59XG4gICAqL1xuICB2YXIgYXJnc0J1aWxkZXIgPSBbXTtcblxuICBpZiAodW5kZWZpbmVkICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAvKipcbiAgICAgKiBLZWVwcyB0cmFjayB3aGV0aGVyIG9yIG5vdCB3ZSBhcmUgaW4gYW4gYXR0cmlidXRlcyBkZWNsYXJhdGlvbiAoYWZ0ZXJcbiAgICAgKiBlbGVtZW50T3BlblN0YXJ0LCBidXQgYmVmb3JlIGVsZW1lbnRPcGVuRW5kKS5cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB2YXIgaW5BdHRyaWJ1dGVzID0gZmFsc2U7XG5cbiAgICAvKiogTWFrZXMgc3VyZSB0aGF0IHRoZSBjYWxsZXIgaXMgbm90IHdoZXJlIGF0dHJpYnV0ZXMgYXJlIGV4cGVjdGVkLiAqL1xuICAgIHZhciBhc3NlcnROb3RJbkF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoaW5BdHRyaWJ1dGVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV2FzIG5vdCBleHBlY3RpbmcgYSBjYWxsIHRvIGF0dHIgb3IgZWxlbWVudE9wZW5FbmQsICcgKyAndGhleSBtdXN0IGZvbGxvdyBhIGNhbGwgdG8gZWxlbWVudE9wZW5TdGFydC4nKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqIE1ha2VzIHN1cmUgdGhhdCB0aGUgY2FsbGVyIGlzIHdoZXJlIGF0dHJpYnV0ZXMgYXJlIGV4cGVjdGVkLiAqL1xuICAgIHZhciBhc3NlcnRJbkF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIWluQXR0cmlidXRlcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dhcyBleHBlY3RpbmcgYSBjYWxsIHRvIGF0dHIgb3IgZWxlbWVudE9wZW5FbmQuICcgKyAnZWxlbWVudE9wZW5TdGFydCBtdXN0IGJlIGZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBjYWxscyB0byBhdHRyLCAnICsgJ3RoZW4gb25lIGNhbGwgdG8gZWxlbWVudE9wZW5FbmQuJyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE1ha2VzIHN1cmUgdGhhdCB0YWdzIGFyZSBjb3JyZWN0bHkgbmVzdGVkLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0YWdcbiAgICAgKi9cbiAgICB2YXIgYXNzZXJ0Q2xvc2VNYXRjaGVzT3BlblRhZyA9IGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgIHZhciBjbG9zaW5nTm9kZSA9IGdldFdhbGtlcigpLmdldEN1cnJlbnRQYXJlbnQoKTtcbiAgICAgIHZhciBkYXRhID0gZ2V0RGF0YShjbG9zaW5nTm9kZSk7XG5cbiAgICAgIGlmICh0YWcgIT09IGRhdGEubm9kZU5hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWNlaXZlZCBhIGNhbGwgdG8gY2xvc2UgJyArIHRhZyArICcgYnV0ICcgKyBkYXRhLm5vZGVOYW1lICsgJyB3YXMgb3Blbi4nKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqIFVwZGF0ZXMgdGhlIHN0YXRlIHRvIGJlaW5nIGluIGFuIGF0dHJpYnV0ZSBkZWNsYXJhdGlvbi4gKi9cbiAgICB2YXIgc2V0SW5BdHRyaWJ1dGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgaW5BdHRyaWJ1dGVzID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgLyoqIFVwZGF0ZXMgdGhlIHN0YXRlIHRvIG5vdCBiZWluZyBpbiBhbiBhdHRyaWJ1dGUgZGVjbGFyYXRpb24uICovXG4gICAgdmFyIHNldE5vdEluQXR0cmlidXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGluQXR0cmlidXRlcyA9IGZhbHNlO1xuICAgIH07XG4gIH1cblxuICBleHBvcnRzLmVsZW1lbnRPcGVuID0gZnVuY3Rpb24gKHRhZywga2V5LCBzdGF0aWNzLCB2YXJfYXJncykge1xuICAgIGlmICh1bmRlZmluZWQgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzKCk7XG4gICAgfVxuXG4gICAgdmFyIG5vZGUgPSBhbGlnbldpdGhET00odGFnLCBrZXksIHN0YXRpY3MpO1xuICAgIHZhciBkYXRhID0gZ2V0RGF0YShub2RlKTtcblxuICAgIC8qXG4gICAgICogQ2hlY2tzIHRvIHNlZSBpZiBvbmUgb3IgbW9yZSBhdHRyaWJ1dGVzIGhhdmUgY2hhbmdlZCBmb3IgYSBnaXZlbiBFbGVtZW50LlxuICAgICAqIFdoZW4gbm8gYXR0cmlidXRlcyBoYXZlIGNoYW5nZWQsIHRoaXMgaXMgbXVjaCBmYXN0ZXIgdGhhbiBjaGVja2luZyBlYWNoXG4gICAgICogaW5kaXZpZHVhbCBhcmd1bWVudC4gV2hlbiBhdHRyaWJ1dGVzIGhhdmUgY2hhbmdlZCwgdGhlIG92ZXJoZWFkIG9mIHRoaXMgaXNcbiAgICAgKiBtaW5pbWFsLlxuICAgICAqL1xuICAgIHZhciBhdHRyc0FyciA9IGRhdGEuYXR0cnNBcnI7XG4gICAgdmFyIGF0dHJzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHZhciBpID0gQVRUUklCVVRFU19PRkZTRVQ7XG4gICAgdmFyIGogPSAwO1xuXG4gICAgZm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpICs9IDEsIGogKz0gMSkge1xuICAgICAgaWYgKGF0dHJzQXJyW2pdICE9PSBhcmd1bWVudHNbaV0pIHtcbiAgICAgICAgYXR0cnNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpICs9IDEsIGogKz0gMSkge1xuICAgICAgYXR0cnNBcnJbal0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgaWYgKGogPCBhdHRyc0Fyci5sZW5ndGgpIHtcbiAgICAgIGF0dHJzQ2hhbmdlZCA9IHRydWU7XG4gICAgICBhdHRyc0Fyci5sZW5ndGggPSBqO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogQWN0dWFsbHkgcGVyZm9ybSB0aGUgYXR0cmlidXRlIHVwZGF0ZS5cbiAgICAgKi9cbiAgICBpZiAoYXR0cnNDaGFuZ2VkKSB7XG4gICAgICB2YXIgbmV3QXR0cnMgPSBkYXRhLm5ld0F0dHJzO1xuXG4gICAgICBmb3IgKHZhciBhdHRyIGluIG5ld0F0dHJzKSB7XG4gICAgICAgIG5ld0F0dHJzW2F0dHJdID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gQVRUUklCVVRFU19PRkZTRVQ7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgbmV3QXR0cnNbYXJndW1lbnRzW2ldXSA9IGFyZ3VtZW50c1tpICsgMV07XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGF0dHIgaW4gbmV3QXR0cnMpIHtcbiAgICAgICAgdXBkYXRlQXR0cmlidXRlKG5vZGUsIGF0dHIsIG5ld0F0dHJzW2F0dHJdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmaXJzdENoaWxkKCk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH07XG5cbiAgLyoqXG4gICAqIERlY2xhcmVzIGEgdmlydHVhbCBFbGVtZW50IGF0IHRoZSBjdXJyZW50IGxvY2F0aW9uIGluIHRoZSBkb2N1bWVudC4gVGhpc1xuICAgKiBjb3JyZXNwb25kcyB0byBhbiBvcGVuaW5nIHRhZyBhbmQgYSBlbGVtZW50Q2xvc2UgdGFnIGlzIHJlcXVpcmVkLiBUaGlzIGlzXG4gICAqIGxpa2UgZWxlbWVudE9wZW4sIGJ1dCB0aGUgYXR0cmlidXRlcyBhcmUgZGVmaW5lZCB1c2luZyB0aGUgYXR0ciBmdW5jdGlvblxuICAgKiByYXRoZXIgdGhhbiBiZWluZyBwYXNzZWQgYXMgYXJndW1lbnRzLiBNdXN0IGJlIGZvbGxsb3dlZCBieSAwIG9yIG1vcmUgY2FsbHNcbiAgICogdG8gYXR0ciwgdGhlbiBhIGNhbGwgdG8gZWxlbWVudE9wZW5FbmQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIGVsZW1lbnQncyB0YWcuXG4gICAqIEBwYXJhbSB7P3N0cmluZ30ga2V5IFRoZSBrZXkgdXNlZCB0byBpZGVudGlmeSB0aGlzIGVsZW1lbnQuIFRoaXMgY2FuIGJlIGFuXG4gICAqICAgICBlbXB0eSBzdHJpbmcsIGJ1dCBwZXJmb3JtYW5jZSBtYXkgYmUgYmV0dGVyIGlmIGEgdW5pcXVlIHZhbHVlIGlzIHVzZWRcbiAgICogICAgIHdoZW4gaXRlcmF0aW5nIG92ZXIgYW4gYXJyYXkgb2YgaXRlbXMuXG4gICAqIEBwYXJhbSB7P0FycmF5PCo+fSBzdGF0aWNzIEFuIGFycmF5IG9mIGF0dHJpYnV0ZSBuYW1lL3ZhbHVlIHBhaXJzIG9mIHRoZVxuICAgKiAgICAgc3RhdGljIGF0dHJpYnV0ZXMgZm9yIHRoZSBFbGVtZW50LiBUaGVzZSB3aWxsIG9ubHkgYmUgc2V0IG9uY2Ugd2hlbiB0aGVcbiAgICogICAgIEVsZW1lbnQgaXMgY3JlYXRlZC5cbiAgICovXG4gIGV4cG9ydHMuZWxlbWVudE9wZW5TdGFydCA9IGZ1bmN0aW9uICh0YWcsIGtleSwgc3RhdGljcykge1xuICAgIGlmICh1bmRlZmluZWQgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzKCk7XG4gICAgICBzZXRJbkF0dHJpYnV0ZXMoKTtcbiAgICB9XG5cbiAgICBhcmdzQnVpbGRlclswXSA9IHRhZztcbiAgICBhcmdzQnVpbGRlclsxXSA9IGtleTtcbiAgICBhcmdzQnVpbGRlclsyXSA9IHN0YXRpY3M7XG4gIH07XG5cbiAgLyoqKlxuICAgKiBEZWZpbmVzIGEgdmlydHVhbCBhdHRyaWJ1dGUgYXQgdGhpcyBwb2ludCBvZiB0aGUgRE9NLiBUaGlzIGlzIG9ubHkgdmFsaWRcbiAgICogd2hlbiBjYWxsZWQgYmV0d2VlbiBlbGVtZW50T3BlblN0YXJ0IGFuZCBlbGVtZW50T3BlbkVuZC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHsqfSB2YWx1ZVxuICAgKi9cbiAgZXhwb3J0cy5hdHRyID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgaWYgKHVuZGVmaW5lZCAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBhc3NlcnRJbkF0dHJpYnV0ZXMoKTtcbiAgICB9XG5cbiAgICBhcmdzQnVpbGRlci5wdXNoKG5hbWUsIHZhbHVlKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2xvc2VzIGFuIG9wZW4gdGFnIHN0YXJ0ZWQgd2l0aCBlbGVtZW50T3BlblN0YXJ0LlxuICAgKiBAcmV0dXJuIHshRWxlbWVudH0gVGhlIGNvcnJlc3BvbmRpbmcgRWxlbWVudC5cbiAgICovXG4gIGV4cG9ydHMuZWxlbWVudE9wZW5FbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHVuZGVmaW5lZCAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBhc3NlcnRJbkF0dHJpYnV0ZXMoKTtcbiAgICAgIHNldE5vdEluQXR0cmlidXRlcygpO1xuICAgIH1cblxuICAgIHZhciBub2RlID0gZXhwb3J0cy5lbGVtZW50T3Blbi5hcHBseShudWxsLCBhcmdzQnVpbGRlcik7XG4gICAgYXJnc0J1aWxkZXIubGVuZ3RoID0gMDtcbiAgICByZXR1cm4gbm9kZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2xvc2VzIGFuIG9wZW4gdmlydHVhbCBFbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSBlbGVtZW50J3MgdGFnLlxuICAgKiBAcmV0dXJuIHshRWxlbWVudH0gVGhlIGNvcnJlc3BvbmRpbmcgRWxlbWVudC5cbiAgICovXG4gIGV4cG9ydHMuZWxlbWVudENsb3NlID0gZnVuY3Rpb24gKHRhZykge1xuICAgIGlmICh1bmRlZmluZWQgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzKCk7XG4gICAgICBhc3NlcnRDbG9zZU1hdGNoZXNPcGVuVGFnKHRhZyk7XG4gICAgfVxuXG4gICAgcGFyZW50Tm9kZSgpO1xuXG4gICAgdmFyIG5vZGUgPSBnZXRXYWxrZXIoKS5jdXJyZW50Tm9kZTtcbiAgICBjbGVhclVudmlzaXRlZERPTShub2RlKTtcblxuICAgIG5leHRTaWJsaW5nKCk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH07XG5cbiAgLyoqXG4gICAqIERlY2xhcmVzIGEgdmlydHVhbCBFbGVtZW50IGF0IHRoZSBjdXJyZW50IGxvY2F0aW9uIGluIHRoZSBkb2N1bWVudCB0aGF0IGhhc1xuICAgKiBubyBjaGlsZHJlbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyBUaGUgZWxlbWVudCdzIHRhZy5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSBrZXkgVGhlIGtleSB1c2VkIHRvIGlkZW50aWZ5IHRoaXMgZWxlbWVudC4gVGhpcyBjYW4gYmUgYW5cbiAgICogICAgIGVtcHR5IHN0cmluZywgYnV0IHBlcmZvcm1hbmNlIG1heSBiZSBiZXR0ZXIgaWYgYSB1bmlxdWUgdmFsdWUgaXMgdXNlZFxuICAgKiAgICAgd2hlbiBpdGVyYXRpbmcgb3ZlciBhbiBhcnJheSBvZiBpdGVtcy5cbiAgICogQHBhcmFtIHs/QXJyYXk8Kj59IHN0YXRpY3MgQW4gYXJyYXkgb2YgYXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMgb2YgdGhlXG4gICAqICAgICBzdGF0aWMgYXR0cmlidXRlcyBmb3IgdGhlIEVsZW1lbnQuIFRoZXNlIHdpbGwgb25seSBiZSBzZXQgb25jZSB3aGVuIHRoZVxuICAgKiAgICAgRWxlbWVudCBpcyBjcmVhdGVkLlxuICAgKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzIEF0dHJpYnV0ZSBuYW1lL3ZhbHVlIHBhaXJzIG9mIHRoZSBkeW5hbWljIGF0dHJpYnV0ZXNcbiAgICogICAgIGZvciB0aGUgRWxlbWVudC5cbiAgICogQHJldHVybiB7IUVsZW1lbnR9IFRoZSBjb3JyZXNwb25kaW5nIEVsZW1lbnQuXG4gICAqL1xuICBleHBvcnRzLmVsZW1lbnRWb2lkID0gZnVuY3Rpb24gKHRhZywga2V5LCBzdGF0aWNzLCB2YXJfYXJncykge1xuICAgIGlmICh1bmRlZmluZWQgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzKCk7XG4gICAgfVxuXG4gICAgdmFyIG5vZGUgPSBleHBvcnRzLmVsZW1lbnRPcGVuLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgZXhwb3J0cy5lbGVtZW50Q2xvc2UuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfTtcblxuICAvKipcbiAgICogRGVjbGFyZXMgYSB2aXJ0dWFsIFRleHQgYXQgdGhpcyBwb2ludCBpbiB0aGUgZG9jdW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcnxib29sZWFufSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIFRleHQuXG4gICAqIEBwYXJhbSB7Li4uKGZ1bmN0aW9uKHN0cmluZ3xudW1iZXJ8Ym9vbGVhbik6c3RyaW5nfG51bWJlcnxib29sZWFuKX0gdmFyX2FyZ3NcbiAgICogICAgIEZ1bmN0aW9ucyB0byBmb3JtYXQgdGhlIHZhbHVlIHdoaWNoIGFyZSBjYWxsZWQgb25seSB3aGVuIHRoZSB2YWx1ZSBoYXNcbiAgICogICAgIGNoYW5nZWQuXG4gICAqL1xuICBleHBvcnRzLnRleHQgPSBmdW5jdGlvbiAodmFsdWUsIHZhcl9hcmdzKSB7XG4gICAgaWYgKHVuZGVmaW5lZCAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBhc3NlcnROb3RJbkF0dHJpYnV0ZXMoKTtcbiAgICB9XG5cbiAgICB2YXIgbm9kZSA9IGFsaWduV2l0aERPTSgnI3RleHQnLCBudWxsKTtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEobm9kZSk7XG5cbiAgICBpZiAoZGF0YS50ZXh0ICE9PSB2YWx1ZSkge1xuICAgICAgZGF0YS50ZXh0ID0gdmFsdWU7XG5cbiAgICAgIHZhciBmb3JtYXR0ZWQgPSB2YWx1ZTtcbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGZvcm1hdHRlZCA9IGFyZ3VtZW50c1tpXShmb3JtYXR0ZWQpO1xuICAgICAgfVxuXG4gICAgICBub2RlLmRhdGEgPSBmb3JtYXR0ZWQ7XG4gICAgfVxuXG4gICAgbmV4dFNpYmxpbmcoKTtcbiAgfTtcblxuICAvKipcbiAgICogUHVibGljbHkgZXhwb3J0cyB0aGUgbXV0YXRvciBob29rcyBmcm9tIHZhcmlvdXMgaW50ZXJuYWwgbW9kdWxlcy5cbiAgICogTm90ZSB0aGF0IG11dGF0aW5nIHRoZXNlIG9iamVjdHMgd2lsbCBhbHRlciB0aGUgYmVoYXZpb3Igb2YgdGhlIGludGVybmFsXG4gICAqIGNvZGUuXG4gICAqIHtPYmplY3Q8c3RyaW5nLCBPYmplY3Q8c3RyaW5nLCBmdW5jdGlvbj4+fVxuICAgKi9cbiAgZXhwb3J0cy5tdXRhdG9ycyA9IHtcbiAgICBhdHRyaWJ1dGVzOiBfbXV0YXRvcnNcbiAgfTtcblxuICAvKipcbiAgICogUHVibGljbHkgZXhwb3J0cyB0aGUgZGVmYXVsdCBtdXRhdG9ycyBmcm9tIHZhcmlvdXMgaW50ZXJuYWwgbW9kdWxlcy5cbiAgICogTm90ZSB0aGF0IG11dGF0aW5nIHRoZXNlIG9iamVjdHMgd2lsbCBoYXZlIG5vIGFmZmVjdCBvbiB0aGUgaW50ZXJuYWwgY29kZSxcbiAgICogdGhlc2UgYXJlIGV4cG9zZWQgb25seSB0byBiZSB1c2VkIGJ5IGN1c3RvbSBtdXRhdG9ycy5cbiAgICoge09iamVjdDxzdHJpbmcsIE9iamVjdDxzdHJpbmcsIGZ1bmN0aW9uPj59XG4gICAqL1xuICBleHBvcnRzLmRlZmF1bHRzID0ge1xuICAgIGF0dHJpYnV0ZXM6IF9kZWZhdWx0c1xuICB9O1xufSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmNyZW1lbnRhbC1kb20uanMubWFwXG4iLCJ2YXIgSW5jcmVtZW50YWxET00gPSByZXF1aXJlKCcuL2luY3JlbWVudGFsLWRvbScpXG5cbnZhciBwYXRjaCA9IEluY3JlbWVudGFsRE9NLnBhdGNoXG52YXIgZWxlbWVudE9wZW4gPSBJbmNyZW1lbnRhbERPTS5lbGVtZW50T3BlblxudmFyIGVsZW1lbnRWb2lkID0gSW5jcmVtZW50YWxET00uZWxlbWVudFZvaWRcbnZhciBlbGVtZW50Q2xvc2UgPSBJbmNyZW1lbnRhbERPTS5lbGVtZW50Q2xvc2VcbnZhciB0ZXh0ID0gSW5jcmVtZW50YWxET00udGV4dFxuXG52YXIgYmFza2V0ID0gcmVxdWlyZSgnLi9iYXNrZXQnKVxudmFyIHRvZG8gPSByZXF1aXJlKCcuL3RvZG8nKVxuXG53aW5kb3cucGF0Y2ggPSBwYXRjaFxud2luZG93LmVsZW1lbnRPcGVuID0gZWxlbWVudE9wZW5cbndpbmRvdy5lbGVtZW50Vm9pZCA9IGVsZW1lbnRWb2lkXG53aW5kb3cuZWxlbWVudENsb3NlID0gZWxlbWVudENsb3NlXG53aW5kb3cudGV4dCA9IHRleHRcblxud2luZG93LmJhc2tldCA9IGJhc2tldFxud2luZG93LnRvZG8gPSB0b2RvXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRvZG9MaXN0cyAobGlzdHMpIHtcbiAgdmFyIHRvZG8gPSByZXF1aXJlKCcuL3RvZG8uaHRtbCcpXG5cbiAgICBmdW5jdGlvbiBhZGROZXdMaXN0ICgpIHtcbiAgICAgIHZhciBuZXdMaXN0ID0gbGlzdHMuY3JlYXRlKClcbiAgICAgIGxpc3RzLnB1c2gobmV3TGlzdClcbiAgICB9XG4gIGVsZW1lbnRPcGVuKFwiZGl2XCIsIG51bGwsIFtcImNsYXNzXCIsIFwiY2xlYXJmaXhcIl0pXG4gICAgOyhBcnJheS5pc0FycmF5KGxpc3RzKSA/IGxpc3RzIDogT2JqZWN0LmtleXMobGlzdHMpKS5mb3JFYWNoKGZ1bmN0aW9uKGxpc3QsICRpbmRleCkge1xuICAgICAgZWxlbWVudE9wZW4oXCJkaXZcIiwgJGluZGV4LCBbXCJzdHlsZVwiLCBcIndpZHRoOiAzMyU7IGZsb2F0OiBsZWZ0OyBoZWlnaHQ6IDMwMHB4OyBvdmVyZmxvdzogYXV0bzsgcGFkZGluZzogNXB4OyBib3JkZXI6IDFweCBkYXNoZWQgIzY2NjtcIl0pXG4gICAgICAgIHRvZG8obGlzdClcbiAgICAgIGVsZW1lbnRDbG9zZShcImRpdlwiKVxuICAgIH0sIGxpc3RzKVxuICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbiAgZWxlbWVudE9wZW4oXCJidXR0b25cIiwgbnVsbCwgW1wiY2xhc3NcIiwgXCJidG4gYnRuLXNtIGJ0bi1zdWNjZXNzXCJdLCBcIm9uY2xpY2tcIiwgZnVuY3Rpb24gKCRldmVudCkge1xuICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHZhciAkZWxlbWVudCA9IHRoaXM7XG4gIGFkZE5ld0xpc3QoKX0pXG4gICAgdGV4dChcIkFkZCBuZXcgdG9kbyBsaXN0XCIpXG4gIGVsZW1lbnRDbG9zZShcImJ1dHRvblwiKVxuICBlbGVtZW50T3BlbihcInByZVwiKVxuICAgIHRleHQoXCJcIiArIChKU09OLnN0cmluZ2lmeShsaXN0cywgbnVsbCwgMikpICsgXCJcIilcbiAgZWxlbWVudENsb3NlKFwicHJlXCIpXG59O1xuIiwidmFyIGxpc3QgPSByZXF1aXJlKCcuL2luZGV4Lmh0bWwnKVxudmFyIHBhdGNoID0gcmVxdWlyZSgnLi4vaW5jcmVtZW50YWwtZG9tJykucGF0Y2hcbnZhciBzdXBlcm1vZGVscyA9IHJlcXVpcmUoJ3N1cGVybW9kZWxzLmpzJylcbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi4vaGVscGVycycpXG5cbnZhciBUb2RvID0gc3VwZXJtb2RlbHMoe1xuICBpZDogaGVscGVycy5ybmRzdHIsXG4gIHRleHQ6IFN0cmluZyxcbiAgY29tcGxldGVkOiBCb29sZWFuXG59KVxudmFyIFRvZG9zID0gc3VwZXJtb2RlbHMoW1RvZG9dKVxudmFyIExpc3RzID0gc3VwZXJtb2RlbHMoW1RvZG9zXSlcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZWwpIHtcbiAgLy92YXIgdG9kb3MgPSBuZXcgVG9kb3MoKVxuXG4gIHZhciBsaXN0cyA9IG5ldyBMaXN0cyhbW1xuICAgIHtcbiAgICAgIHRleHQ6ICdQaG9uZSBtdW0nLFxuICAgICAgY29tcGxldGVkOiBmYWxzZVxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogJ0RvIHNob3BwaW5nJyxcbiAgICAgIGNvbXBsZXRlZDogdHJ1ZVxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogJ1dyaXRlIGVtYWlsIHRvIEJyaWFuJyxcbiAgICAgIGNvbXBsZXRlZDogdHJ1ZVxuICAgIH1cbiAgXV0pXG4gIGZ1bmN0aW9uIHJlbmRlciAoKSB7XG4gICAgcGF0Y2goZWwsIGxpc3QsIGxpc3RzKVxuICB9XG4gIHJlbmRlcigpXG5cbiAgbGlzdHMub24oJ2NoYW5nZScsIHJlbmRlcilcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9kb3MgKHRvZG9zKSB7XG4gIGZ1bmN0aW9uIGFkZCAoZm9ybSkge1xuICAgICAgdmFyIG5ld1RvZG8gPSB0b2Rvcy5jcmVhdGUoKVxuICAgICAgbmV3VG9kby50ZXh0ID0gZm9ybS5uZXdUb2RvLnZhbHVlXG4gICAgICB0b2Rvcy5wdXNoKG5ld1RvZG8pXG4gICAgICBmb3JtLm5ld1RvZG8uc2VsZWN0KClcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGVhckNvbXBsZXRlZCAoaW5kZXgpIHtcbiAgICAgIHZhciBsZW4gPSB0b2Rvcy5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSBsZW4gLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpZiAodG9kb3NbaV0uY29tcGxldGVkKSB7XG4gICAgICAgICAgdG9kb3Muc3BsaWNlKGksIDEpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b2dnbGVDb21wbGV0ZWQgKHN0YXRlKSB7XG4gICAgICB0b2Rvcy5mb3JFYWNoKGZ1bmN0aW9uKHRvZG8pIHtcbiAgICAgICAgdG9kby5jb21wbGV0ZWQgPSBzdGF0ZVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b3RhbENvbXBsZXRlZCAoKSB7XG4gICAgICByZXR1cm4gdG9kb3MuZmlsdGVyKGZ1bmN0aW9uICh0b2RvKSB7XG4gICAgICAgIHJldHVybiB0b2RvLmNvbXBsZXRlZFxuICAgICAgfSkubGVuZ3RoXG4gICAgfVxuICBlbGVtZW50T3BlbihcInRhYmxlXCIpXG4gICAgZWxlbWVudE9wZW4oXCJ0aGVhZFwiKVxuICAgICAgZWxlbWVudE9wZW4oXCJ0clwiKVxuICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICBlbGVtZW50T3BlbihcImZvcm1cIiwgbnVsbCwgbnVsbCwgXCJvbnN1Ym1pdFwiLCBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHZhciAkZWxlbWVudCA9IHRoaXM7XG4gICAgICAgICAgYWRkKCRlbGVtZW50KX0pXG4gICAgICAgICAgICBlbGVtZW50T3BlbihcImlucHV0XCIsIG51bGwsIFtcInR5cGVcIiwgXCJ0ZXh0XCIsIFwibmFtZVwiLCBcIm5ld1RvZG9cIiwgXCJjbGFzc1wiLCBcImZvcm0tY29udHJvbFwiLCBcInBsYWNlaG9sZGVyXCIsIFwiRW50ZXIgbmV3IHRvZG9cIl0pXG4gICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJpbnB1dFwiKVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcImZvcm1cIilcbiAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgIGVsZW1lbnRDbG9zZShcInRyXCIpXG4gICAgZWxlbWVudENsb3NlKFwidGhlYWRcIilcbiAgICBlbGVtZW50T3BlbihcInRib2R5XCIpXG4gICAgICA7KEFycmF5LmlzQXJyYXkodG9kb3MpID8gdG9kb3MgOiBPYmplY3Qua2V5cyh0b2RvcykpLmZvckVhY2goZnVuY3Rpb24odG9kbywgJGluZGV4KSB7XG4gICAgICAgIGVsZW1lbnRPcGVuKFwidHJcIiwgdG9kby5pZClcbiAgICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgICB0ZXh0KFwiXCIgKyAoJGluZGV4ICsgMSkgKyBcIi5cIilcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwiaW5wdXRcIiwgbnVsbCwgW1widHlwZVwiLCBcInRleHRcIiwgXCJjbGFzc1wiLCBcImZvcm0tY29udHJvbFwiXSwgXCJ2YWx1ZVwiLCB0b2RvLnRleHQsIFwib25rZXl1cFwiLCBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSB0aGlzO1xuICAgICAgICAgICAgdG9kby50ZXh0ID0gdGhpcy52YWx1ZX0sIFwic3R5bGVcIiwgeyBib3JkZXJDb2xvcjogdG9kby50ZXh0ID8gJyc6ICdyZWQnLCB0ZXh0RGVjb3JhdGlvbjogdG9kby5jb21wbGV0ZWQgPyAnbGluZS10aHJvdWdoJzogJycgfSlcbiAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcImlucHV0XCIpXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgICBlbGVtZW50T3BlbihcImlucHV0XCIsIG51bGwsIFtcInR5cGVcIiwgXCJjaGVja2JveFwiXSwgXCJjaGVja2VkXCIsIHRvZG8uY29tcGxldGVkIHx8IHVuZGVmaW5lZCwgXCJvbmNoYW5nZVwiLCBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICB2YXIgJGVsZW1lbnQgPSB0aGlzO1xuICAgICAgICAgICAgdG9kby5jb21wbGV0ZWQgPSB0aGlzLmNoZWNrZWR9KVxuICAgICAgICAgICAgZWxlbWVudENsb3NlKFwiaW5wdXRcIilcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0clwiKVxuICAgICAgfSwgdG9kb3MpXG4gICAgICBlbGVtZW50T3BlbihcInRyXCIpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJ0clwiKVxuICAgIGVsZW1lbnRDbG9zZShcInRib2R5XCIpXG4gICAgZWxlbWVudE9wZW4oXCJ0Zm9vdFwiKVxuICAgICAgZWxlbWVudE9wZW4oXCJ0clwiKVxuICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgdGV4dChcIlRvdGFsIFwiICsgKHRvZG9zLmxlbmd0aCkgKyBcIlwiKVxuICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICBlbGVtZW50T3BlbihcInRkXCIsIG51bGwsIFtcImNvbHNwYW5cIiwgXCIyXCJdKVxuICAgICAgICAgIGlmICh0b3RhbENvbXBsZXRlZCgpKSB7XG4gICAgICAgICAgICBlbGVtZW50T3BlbihcImJ1dHRvblwiLCBudWxsLCBbXCJjbGFzc1wiLCBcImJ0biBidG4tc20gYnRuLWRhbmdlciBwdWxsLXJpZ2h0XCJdLCBcIm9uY2xpY2tcIiwgZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gdGhpcztcbiAgICAgICAgICAgIGNsZWFyQ29tcGxldGVkKCl9KVxuICAgICAgICAgICAgICB0ZXh0KFwiQ2xlYXIgY29tcGxldGVkIFwiICsgKHRvdGFsQ29tcGxldGVkKCkpICsgXCJcIilcbiAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcImJ1dHRvblwiKVxuICAgICAgICAgIH1cbiAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgIGVsZW1lbnRDbG9zZShcInRyXCIpXG4gICAgZWxlbWVudENsb3NlKFwidGZvb3RcIilcbiAgZWxlbWVudENsb3NlKFwidGFibGVcIilcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL3N1cGVybW9kZWxzJyk7XG4iLCIndXNlIHN0cmljdCdcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKVxudmFyIGNyZWF0ZVdyYXBwZXJGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3J5JylcblxuZnVuY3Rpb24gcmVzb2x2ZSAoZnJvbSkge1xuICB2YXIgaXNDdG9yID0gdXRpbC5pc0NvbnN0cnVjdG9yKGZyb20pXG4gIHZhciBpc1N1cGVybW9kZWxDdG9yID0gdXRpbC5pc1N1cGVybW9kZWxDb25zdHJ1Y3Rvcihmcm9tKVxuICB2YXIgaXNBcnJheSA9IHV0aWwuaXNBcnJheShmcm9tKVxuXG4gIGlmIChpc0N0b3IgfHwgaXNTdXBlcm1vZGVsQ3RvciB8fCBpc0FycmF5KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIF9fdHlwZTogZnJvbVxuICAgIH1cbiAgfVxuXG4gIHZhciBpc1ZhbHVlID0gIXV0aWwuaXNPYmplY3QoZnJvbSlcbiAgaWYgKGlzVmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgX192YWx1ZTogZnJvbVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmcm9tXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURlZiAoZnJvbSkge1xuICBmcm9tID0gcmVzb2x2ZShmcm9tKVxuXG4gIHZhciBfX1ZBTElEQVRPUlMgPSAnX192YWxpZGF0b3JzJ1xuICB2YXIgX19WQUxVRSA9ICdfX3ZhbHVlJ1xuICB2YXIgX19UWVBFID0gJ19fdHlwZSdcbiAgdmFyIF9fRElTUExBWU5BTUUgPSAnX19kaXNwbGF5TmFtZSdcbiAgdmFyIF9fR0VUID0gJ19fZ2V0J1xuICB2YXIgX19TRVQgPSAnX19zZXQnXG4gIHZhciBfX0VOVU1FUkFCTEUgPSAnX19lbnVtZXJhYmxlJ1xuICB2YXIgX19DT05GSUdVUkFCTEUgPSAnX19jb25maWd1cmFibGUnXG4gIHZhciBfX1dSSVRBQkxFID0gJ19fd3JpdGFibGUnXG4gIHZhciBfX1NQRUNJQUxfUFJPUFMgPSBbXG4gICAgX19WQUxJREFUT1JTLCBfX1ZBTFVFLCBfX1RZUEUsIF9fRElTUExBWU5BTUUsXG4gICAgX19HRVQsIF9fU0VULCBfX0VOVU1FUkFCTEUsIF9fQ09ORklHVVJBQkxFLCBfX1dSSVRBQkxFXG4gIF1cblxuICB2YXIgZGVmID0ge1xuICAgIGZyb206IGZyb20sXG4gICAgdHlwZTogZnJvbVtfX1RZUEVdLFxuICAgIHZhbHVlOiBmcm9tW19fVkFMVUVdLFxuICAgIHZhbGlkYXRvcnM6IGZyb21bX19WQUxJREFUT1JTXSB8fCBbXSxcbiAgICBlbnVtZXJhYmxlOiBmcm9tW19fRU5VTUVSQUJMRV0gIT09IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogISFmcm9tW19fQ09ORklHVVJBQkxFXSxcbiAgICB3cml0YWJsZTogZnJvbVtfX1dSSVRBQkxFXSAhPT0gZmFsc2UsXG4gICAgZGlzcGxheU5hbWU6IGZyb21bX19ESVNQTEFZTkFNRV0sXG4gICAgZ2V0dGVyOiBmcm9tW19fR0VUXSxcbiAgICBzZXR0ZXI6IGZyb21bX19TRVRdXG4gIH1cblxuICB2YXIgdHlwZSA9IGRlZi50eXBlXG5cbiAgLy8gU2ltcGxlICdDb25zdHJ1Y3RvcicgVHlwZVxuICBpZiAodXRpbC5pc1NpbXBsZUNvbnN0cnVjdG9yKHR5cGUpKSB7XG4gICAgZGVmLmlzU2ltcGxlID0gdHJ1ZVxuXG4gICAgZGVmLmNhc3QgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiB1dGlsLmNhc3QodmFsdWUsIHR5cGUpXG4gICAgfVxuICB9IGVsc2UgaWYgKHV0aWwuaXNTdXBlcm1vZGVsQ29uc3RydWN0b3IodHlwZSkpIHtcbiAgICBkZWYuaXNSZWZlcmVuY2UgPSB0cnVlXG4gIH0gZWxzZSBpZiAoZGVmLnZhbHVlKSB7XG4gICAgLy8gSWYgYSB2YWx1ZSBpcyBwcmVzZW50LCB1c2VcbiAgICAvLyB0aGF0IGFuZCBzaG9ydC1jaXJjdWl0IHRoZSByZXN0XG4gICAgZGVmLmlzU2ltcGxlID0gdHJ1ZVxuICB9IGVsc2Uge1xuICAgIC8vIE90aGVyd2lzZSBsb29rIGZvciBvdGhlciBub24tc3BlY2lhbFxuICAgIC8vIGtleXMgYW5kIGFsc28gYW55IGl0ZW0gZGVmaW5pdGlvblxuICAgIC8vIGluIHRoZSBjYXNlIG9mIEFycmF5c1xuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhmcm9tKVxuICAgIHZhciBjaGlsZEtleXMgPSBrZXlzLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIF9fU1BFQ0lBTF9QUk9QUy5pbmRleE9mKGl0ZW0pID09PSAtMVxuICAgIH0pXG5cbiAgICBpZiAoY2hpbGRLZXlzLmxlbmd0aCkge1xuICAgICAgdmFyIGRlZnMgPSB7fVxuICAgICAgdmFyIHByb3RvXG5cbiAgICAgIGNoaWxkS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGZyb20sIGtleSlcbiAgICAgICAgdmFyIHZhbHVlXG5cbiAgICAgICAgaWYgKGRlc2NyaXB0b3IuZ2V0IHx8IGRlc2NyaXB0b3Iuc2V0KSB7XG4gICAgICAgICAgdmFsdWUgPSB7XG4gICAgICAgICAgICBfX2dldDogZGVzY3JpcHRvci5nZXQsXG4gICAgICAgICAgICBfX3NldDogZGVzY3JpcHRvci5zZXRcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSBmcm9tW2tleV1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdXRpbC5pc0NvbnN0cnVjdG9yKHZhbHVlKSAmJiAhdXRpbC5pc1N1cGVybW9kZWxDb25zdHJ1Y3Rvcih2YWx1ZSkgJiYgdXRpbC5pc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgICAgIGlmICghcHJvdG8pIHtcbiAgICAgICAgICAgIHByb3RvID0ge31cbiAgICAgICAgICB9XG4gICAgICAgICAgcHJvdG9ba2V5XSA9IHZhbHVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmc1trZXldID0gY3JlYXRlRGVmKHZhbHVlKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBkZWYuZGVmcyA9IGRlZnNcbiAgICAgIGRlZi5wcm90byA9IHByb3RvXG5cbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgQXJyYXlcbiAgICBpZiAodHlwZSA9PT0gQXJyYXkgfHwgdXRpbC5pc0FycmF5KHR5cGUpKSB7XG4gICAgICBkZWYuaXNBcnJheSA9IHRydWVcblxuICAgICAgaWYgKHR5cGUubGVuZ3RoID4gMCkge1xuICAgICAgICBkZWYuZGVmID0gY3JlYXRlRGVmKHR5cGVbMF0pXG4gICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKGNoaWxkS2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgIGRlZi5pc1NpbXBsZSA9IHRydWVcbiAgICB9XG4gIH1cblxuICBkZWYuY3JlYXRlID0gY3JlYXRlV3JhcHBlckZhY3RvcnkoZGVmKVxuXG4gIHJldHVybiBkZWZcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVEZWZcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICB2YXIgYXJyID0gW11cblxuICAvKipcbiAgICogUHJveGllZCBhcnJheSBtdXRhdG9ycyBtZXRob2RzXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIHZhciBwb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IEFycmF5LnByb3RvdHlwZS5wb3AuYXBwbHkoYXJyKVxuXG4gICAgY2FsbGJhY2soJ3BvcCcsIGFyciwge1xuICAgICAgdmFsdWU6IHJlc3VsdFxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgdmFyIHB1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGFyciwgYXJndW1lbnRzKVxuXG4gICAgY2FsbGJhY2soJ3B1c2gnLCBhcnIsIHtcbiAgICAgIHZhbHVlOiByZXN1bHRcbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIHZhciBzaGlmdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gQXJyYXkucHJvdG90eXBlLnNoaWZ0LmFwcGx5KGFycilcblxuICAgIGNhbGxiYWNrKCdzaGlmdCcsIGFyciwge1xuICAgICAgdmFsdWU6IHJlc3VsdFxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgdmFyIHNvcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IEFycmF5LnByb3RvdHlwZS5zb3J0LmFwcGx5KGFyciwgYXJndW1lbnRzKVxuXG4gICAgY2FsbGJhY2soJ3NvcnQnLCBhcnIsIHtcbiAgICAgIHZhbHVlOiByZXN1bHRcbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIHZhciB1bnNoaWZ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXN1bHQgPSBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShhcnIsIGFyZ3VtZW50cylcblxuICAgIGNhbGxiYWNrKCd1bnNoaWZ0JywgYXJyLCB7XG4gICAgICB2YWx1ZTogcmVzdWx0XG4gICAgfSlcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICB2YXIgcmV2ZXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gQXJyYXkucHJvdG90eXBlLnJldmVyc2UuYXBwbHkoYXJyKVxuXG4gICAgY2FsbGJhY2soJ3JldmVyc2UnLCBhcnIsIHtcbiAgICAgIHZhbHVlOiByZXN1bHRcbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIHZhciBzcGxpY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0ID0gQXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseShhcnIsIGFyZ3VtZW50cylcblxuICAgIGNhbGxiYWNrKCdzcGxpY2UnLCBhcnIsIHtcbiAgICAgIHZhbHVlOiByZXN1bHQsXG4gICAgICByZW1vdmVkOiByZXN1bHQsXG4gICAgICBhZGRlZDogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKVxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogUHJveHkgYWxsIEFycmF5LnByb3RvdHlwZSBtdXRhdG9yIG1ldGhvZHMgb24gdGhpcyBhcnJheSBpbnN0YW5jZVxuICAgKi9cbiAgYXJyLnBvcCA9IGFyci5wb3AgJiYgcG9wXG4gIGFyci5wdXNoID0gYXJyLnB1c2ggJiYgcHVzaFxuICBhcnIuc2hpZnQgPSBhcnIuc2hpZnQgJiYgc2hpZnRcbiAgYXJyLnVuc2hpZnQgPSBhcnIudW5zaGlmdCAmJiB1bnNoaWZ0XG4gIGFyci5zb3J0ID0gYXJyLnNvcnQgJiYgc29ydFxuICBhcnIucmV2ZXJzZSA9IGFyci5yZXZlcnNlICYmIHJldmVyc2VcbiAgYXJyLnNwbGljZSA9IGFyci5zcGxpY2UgJiYgc3BsaWNlXG5cbiAgLyoqXG4gICAqIFNwZWNpYWwgdXBkYXRlIGZ1bmN0aW9uIHNpbmNlIHdlIGNhbid0IGRldGVjdFxuICAgKiBhc3NpZ25tZW50IGJ5IGluZGV4IGUuZy4gYXJyWzBdID0gJ3NvbWV0aGluZydcbiAgICovXG4gIGFyci51cGRhdGUgPSBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XG4gICAgdmFyIG9sZFZhbHVlID0gYXJyW2luZGV4XVxuICAgIHZhciBuZXdWYWx1ZSA9IGFycltpbmRleF0gPSB2YWx1ZVxuXG4gICAgY2FsbGJhY2soJ3VwZGF0ZScsIGFyciwge1xuICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgdmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgb2xkVmFsdWU6IG9sZFZhbHVlXG4gICAgfSlcblxuICAgIHJldHVybiBuZXdWYWx1ZVxuICB9XG5cbiAgcmV0dXJuIGFyclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRW1pdHRlckV2ZW50IChuYW1lLCBwYXRoLCB0YXJnZXQsIGRldGFpbCkge1xuICB0aGlzLm5hbWUgPSBuYW1lXG4gIHRoaXMucGF0aCA9IHBhdGhcbiAgdGhpcy50YXJnZXQgPSB0YXJnZXRcblxuICBpZiAoZGV0YWlsKSB7XG4gICAgdGhpcy5kZXRhaWwgPSBkZXRhaWxcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXJcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIEVtaXR0ZXIgKG9iaikge1xuICB2YXIgY3R4ID0gb2JqIHx8IHRoaXNcblxuICBpZiAob2JqKSB7XG4gICAgY3R4ID0gbWl4aW4ob2JqKVxuICAgIHJldHVybiBjdHhcbiAgfVxufVxuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4gKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV1cbiAgfVxuICByZXR1cm4gb2JqXG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9IEVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQsIGZuKSB7XG4gICh0aGlzLl9fY2FsbGJhY2tzW2V2ZW50XSA9IHRoaXMuX19jYWxsYmFja3NbZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gKGV2ZW50LCBmbikge1xuICBmdW5jdGlvbiBvbiAoKSB7XG4gICAgdGhpcy5vZmYoZXZlbnQsIG9uKVxuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgfVxuXG4gIG9uLmZuID0gZm5cbiAgdGhpcy5vbihldmVudCwgb24pXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoZXZlbnQsIGZuKSB7XG4gIC8vIGFsbFxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRoaXMuX19jYWxsYmFja3MgPSB7fVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fX2NhbGxiYWNrc1tldmVudF1cbiAgaWYgKCFjYWxsYmFja3MpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGRlbGV0ZSB0aGlzLl9fY2FsbGJhY2tzW2V2ZW50XVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxuICB2YXIgY2JcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXVxuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtNaXhlZH0gLi4uXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX19jYWxsYmFja3NbZXZlbnRdXG5cbiAgaWYgKGNhbGxiYWNrcykge1xuICAgIGNhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKVxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgcmV0dXJuIHRoaXMuX19jYWxsYmFja3NbZXZlbnRdIHx8IFtdXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIHJldHVybiAhIXRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGhcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG52YXIgY3JlYXRlTW9kZWxQcm90b3R5cGUgPSByZXF1aXJlKCcuL3Byb3RvJylcbnZhciBXcmFwcGVyID0gcmVxdWlyZSgnLi93cmFwcGVyJylcblxuZnVuY3Rpb24gY3JlYXRlTW9kZWxEZXNjcmlwdG9ycyAoZGVmLCBwYXJlbnQpIHtcbiAgdmFyIF9fID0ge31cblxuICB2YXIgZGVzYyA9IHtcbiAgICBfXzoge1xuICAgICAgdmFsdWU6IF9fXG4gICAgfSxcbiAgICBfX2RlZjoge1xuICAgICAgdmFsdWU6IGRlZlxuICAgIH0sXG4gICAgX19wYXJlbnQ6IHtcbiAgICAgIHZhbHVlOiBwYXJlbnQsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgX19jYWxsYmFja3M6IHtcbiAgICAgIHZhbHVlOiB7fSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlc2Ncbn1cblxuZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyAobW9kZWwpIHtcbiAgdmFyIGRlZnMgPSBtb2RlbC5fX2RlZi5kZWZzXG4gIGZvciAodmFyIGtleSBpbiBkZWZzKSB7XG4gICAgZGVmaW5lUHJvcGVydHkobW9kZWwsIGtleSwgZGVmc1trZXldKVxuICB9XG59XG5cbmZ1bmN0aW9uIGRlZmluZVByb3BlcnR5IChtb2RlbCwga2V5LCBkZWYpIHtcbiAgdmFyIGRlc2MgPSB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX2dldChrZXkpXG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBkZWYuZW51bWVyYWJsZSxcbiAgICBjb25maWd1cmFibGU6IGRlZi5jb25maWd1cmFibGVcbiAgfVxuXG4gIGlmIChkZWYud3JpdGFibGUpIHtcbiAgICBkZXNjLnNldCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5fX3NldE5vdGlmeUNoYW5nZShrZXksIHZhbHVlKVxuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2RlbCwga2V5LCBkZXNjKVxuXG4gIC8vIFNpbGVudGx5IGluaXRpYWxpemUgdGhlIHByb3BlcnR5IHdyYXBwZXJcbiAgbW9kZWwuX19ba2V5XSA9IGRlZi5jcmVhdGUobW9kZWwpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVdyYXBwZXJGYWN0b3J5IChkZWYpIHtcbiAgdmFyIHdyYXBwZXIsIGRlZmF1bHRWYWx1ZSwgYXNzZXJ0XG5cbiAgaWYgKGRlZi5pc1NpbXBsZSkge1xuICAgIHdyYXBwZXIgPSBuZXcgV3JhcHBlcihkZWYudmFsdWUsIGRlZi53cml0YWJsZSwgZGVmLnZhbGlkYXRvcnMsIGRlZi5nZXR0ZXIsIGRlZi5zZXR0ZXIsIGRlZi5jYXN0LCBudWxsKVxuICB9IGVsc2UgaWYgKGRlZi5pc1JlZmVyZW5jZSkge1xuICAgIC8vIEhvbGQgYSByZWZlcmVuY2UgdG8gdGhlXG4gICAgLy8gcmVmZXJlcmVuY2VkIHR5cGVzJyBkZWZpbml0aW9uXG4gICAgdmFyIHJlZkRlZiA9IGRlZi50eXBlLmRlZlxuXG4gICAgaWYgKHJlZkRlZi5pc1NpbXBsZSkge1xuICAgICAgLy8gSWYgdGhlIHJlZmVyZW5jZWQgdHlwZSBpcyBpdHNlbGYgc2ltcGxlLFxuICAgICAgLy8gd2UgY2FuIHNldCBqdXN0IHJldHVybiBhIHdyYXBwZXIgYW5kXG4gICAgICAvLyB0aGUgcHJvcGVydHkgd2lsbCBnZXQgaW5pdGlhbGl6ZWQuXG4gICAgICB3cmFwcGVyID0gbmV3IFdyYXBwZXIocmVmRGVmLnZhbHVlLCByZWZEZWYud3JpdGFibGUsIHJlZkRlZi52YWxpZGF0b3JzLCBkZWYuZ2V0dGVyLCBkZWYuc2V0dGVyLCByZWZEZWYuY2FzdCwgbnVsbClcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgd2UncmUgbm90IGRlYWxpbmcgd2l0aCBhIHNpbXBsZSByZWZlcmVuY2UgbW9kZWxcbiAgICAgIC8vIHdlIG5lZWQgdG8gZGVmaW5lIGFuIGFzc2VydGlvbiB0aGF0IHRoZSBpbnN0YW5jZVxuICAgICAgLy8gYmVpbmcgc2V0IGlzIG9mIHRoZSBjb3JyZWN0IHR5cGUuIFdlIGRvIHRoaXMgYmVcbiAgICAgIC8vIGNvbXBhcmluZyB0aGUgZGVmcy5cblxuICAgICAgYXNzZXJ0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIGNvbXBhcmUgdGhlIGRlZmludGlvbnMgb2YgdGhlIHZhbHVlIGluc3RhbmNlXG4gICAgICAgIC8vIGJlaW5nIHBhc3NlZCBhbmQgdGhlIGRlZiBwcm9wZXJ0eSBhdHRhY2hlZFxuICAgICAgICAvLyB0byB0aGUgdHlwZSBTdXBlcm1vZGVsQ29uc3RydWN0b3IuIEFsbG93IHRoZVxuICAgICAgICAvLyB2YWx1ZSB0byBiZSB1bmRlZmluZWQgb3IgbnVsbCBhbHNvLlxuICAgICAgICB2YXIgaXNDb3JyZWN0VHlwZSA9IGZhbHNlXG5cbiAgICAgICAgaWYgKHV0aWwuaXNOdWxsT3JVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgICAgaXNDb3JyZWN0VHlwZSA9IHRydWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpc0NvcnJlY3RUeXBlID0gcmVmRGVmID09PSB2YWx1ZS5fX2RlZlxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpc0NvcnJlY3RUeXBlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdWYWx1ZSBzaG91bGQgYmUgYW4gaW5zdGFuY2Ugb2YgdGhlIHJlZmVyZW5jZWQgbW9kZWwsIG51bGwgb3IgdW5kZWZpbmVkJylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB3cmFwcGVyID0gbmV3IFdyYXBwZXIoZGVmLnZhbHVlLCBkZWYud3JpdGFibGUsIGRlZi52YWxpZGF0b3JzLCBkZWYuZ2V0dGVyLCBkZWYuc2V0dGVyLCBudWxsLCBhc3NlcnQpXG4gICAgfVxuICB9IGVsc2UgaWYgKGRlZi5pc0FycmF5KSB7XG4gICAgZGVmYXVsdFZhbHVlID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICAgICAgLy8gZm9yIEFycmF5cywgd2UgY3JlYXRlIGEgbmV3IEFycmF5IGFuZCBlYWNoXG4gICAgICAvLyB0aW1lLCBtaXggdGhlIG1vZGVsIHByb3BlcnRpZXMgaW50byBpdFxuICAgICAgdmFyIG1vZGVsID0gY3JlYXRlTW9kZWxQcm90b3R5cGUoZGVmKVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMobW9kZWwsIGNyZWF0ZU1vZGVsRGVzY3JpcHRvcnMoZGVmLCBwYXJlbnQpKVxuICAgICAgZGVmaW5lUHJvcGVydGllcyhtb2RlbClcbiAgICAgIHJldHVybiBtb2RlbFxuICAgIH1cblxuICAgIGFzc2VydCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgLy8gdG9kbzogZnVydGhlciBhcnJheSB0eXBlIHZhbGlkYXRpb25cbiAgICAgIGlmICghdXRpbC5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZhbHVlIHNob3VsZCBiZSBhbiBhcnJheScpXG4gICAgICB9XG4gICAgfVxuXG4gICAgd3JhcHBlciA9IG5ldyBXcmFwcGVyKGRlZmF1bHRWYWx1ZSwgZGVmLndyaXRhYmxlLCBkZWYudmFsaWRhdG9ycywgZGVmLmdldHRlciwgZGVmLnNldHRlciwgbnVsbCwgYXNzZXJ0KVxuICB9IGVsc2Uge1xuICAgIC8vIGZvciBPYmplY3RzLCB3ZSBjYW4gY3JlYXRlIGFuZCByZXVzZVxuICAgIC8vIGEgcHJvdG90eXBlIG9iamVjdC4gV2UgdGhlbiBuZWVkIHRvIG9ubHlcbiAgICAvLyBkZWZpbmUgdGhlIGRlZnMgYW5kIHRoZSAnaW5zdGFuY2UnIHByb3BlcnRpZXNcbiAgICAvLyBlLmcuIF9fLCBwYXJlbnQgZXRjLlxuICAgIHZhciBwcm90byA9IGNyZWF0ZU1vZGVsUHJvdG90eXBlKGRlZilcblxuICAgIGRlZmF1bHRWYWx1ZSA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgICAgIHZhciBtb2RlbCA9IE9iamVjdC5jcmVhdGUocHJvdG8sIGNyZWF0ZU1vZGVsRGVzY3JpcHRvcnMoZGVmLCBwYXJlbnQpKVxuICAgICAgZGVmaW5lUHJvcGVydGllcyhtb2RlbClcbiAgICAgIHJldHVybiBtb2RlbFxuICAgIH1cblxuICAgIGFzc2VydCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKCFwcm90by5pc1Byb3RvdHlwZU9mKHZhbHVlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcHJvdG90eXBlJylcbiAgICAgIH1cbiAgICB9XG5cbiAgICB3cmFwcGVyID0gbmV3IFdyYXBwZXIoZGVmYXVsdFZhbHVlLCBkZWYud3JpdGFibGUsIGRlZi52YWxpZGF0b3JzLCBkZWYuZ2V0dGVyLCBkZWYuc2V0dGVyLCBudWxsLCBhc3NlcnQpXG4gIH1cblxuICB2YXIgZmFjdG9yeSA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgICB2YXIgd3JhcCA9IE9iamVjdC5jcmVhdGUod3JhcHBlcilcbiAgICAvLyBpZiAoIXdyYXAuaXNJbml0aWFsaXplZCkge1xuICAgIHdyYXAuaW5pdGlhbGl6ZShwYXJlbnQpXG4gICAgLy8gfVxuICAgIHJldHVybiB3cmFwXG4gIH1cblxuICAvLyBleHBvc2UgdGhlIHdyYXBwZXIsIHRoaXMgaXMgdXNlZFxuICAvLyBmb3IgdmFsaWRhdGluZyBhcnJheSBpdGVtcyBsYXRlclxuICBmYWN0b3J5LndyYXBwZXIgPSB3cmFwcGVyXG5cbiAgcmV0dXJuIGZhY3Rvcnlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVXcmFwcGVyRmFjdG9yeVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmZ1bmN0aW9uIG1lcmdlIChtb2RlbCwgb2JqKSB7XG4gIHZhciBpc0FycmF5ID0gbW9kZWwuX19kZWYuaXNBcnJheVxuICB2YXIgZGVmcyA9IG1vZGVsLl9fZGVmLmRlZnNcbiAgdmFyIGRlZktleXMsIGRlZiwga2V5LCBpLCBpc1NpbXBsZSxcbiAgICBpc1NpbXBsZVJlZmVyZW5jZSwgaXNJbml0aWFsaXplZFJlZmVyZW5jZVxuXG4gIGlmIChkZWZzKSB7XG4gICAgZGVmS2V5cyA9IE9iamVjdC5rZXlzKGRlZnMpXG4gICAgZm9yIChpID0gMDsgaSA8IGRlZktleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGtleSA9IGRlZktleXNbaV1cbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBkZWYgPSBkZWZzW2tleV1cblxuICAgICAgICBpc1NpbXBsZSA9IGRlZi5pc1NpbXBsZVxuICAgICAgICBpc1NpbXBsZVJlZmVyZW5jZSA9IGRlZi5pc1JlZmVyZW5jZSAmJiBkZWYudHlwZS5kZWYuaXNTaW1wbGVcbiAgICAgICAgaXNJbml0aWFsaXplZFJlZmVyZW5jZSA9IGRlZi5pc1JlZmVyZW5jZSAmJiBvYmpba2V5XSAmJiBvYmpba2V5XS5fX3N1cGVybW9kZWxcblxuICAgICAgICBpZiAoaXNTaW1wbGUgfHwgaXNTaW1wbGVSZWZlcmVuY2UgfHwgaXNJbml0aWFsaXplZFJlZmVyZW5jZSkge1xuICAgICAgICAgIG1vZGVsW2tleV0gPSBvYmpba2V5XVxuICAgICAgICB9IGVsc2UgaWYgKG9ialtrZXldKSB7XG4gICAgICAgICAgaWYgKGRlZi5pc1JlZmVyZW5jZSkge1xuICAgICAgICAgICAgbW9kZWxba2V5XSA9IGRlZi50eXBlKClcbiAgICAgICAgICB9XG4gICAgICAgICAgbWVyZ2UobW9kZWxba2V5XSwgb2JqW2tleV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoaXNBcnJheSAmJiBBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IG1vZGVsLmNyZWF0ZSgpXG4gICAgICBtb2RlbC5wdXNoKGl0ZW0gJiYgaXRlbS5fX3N1cGVybW9kZWwgPyBtZXJnZShpdGVtLCBvYmpbaV0pIDogb2JqW2ldKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtb2RlbFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1lcmdlXG4iLCIndXNlIHN0cmljdCdcblxudmFyIEVtaXR0ZXJFdmVudCA9IHJlcXVpcmUoJy4vZW1pdHRlci1ldmVudCcpXG52YXIgVmFsaWRhdGlvbkVycm9yID0gcmVxdWlyZSgnLi92YWxpZGF0aW9uLWVycm9yJylcbnZhciBXcmFwcGVyID0gcmVxdWlyZSgnLi93cmFwcGVyJylcbnZhciBtZXJnZSA9IHJlcXVpcmUoJy4vbWVyZ2UnKVxuXG52YXIgZGVzY3JpcHRvcnMgPSB7XG4gIF9fc3VwZXJtb2RlbDoge1xuICAgIHZhbHVlOiB0cnVlXG4gIH0sXG4gIF9fa2V5czoge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzKVxuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzKSkge1xuICAgICAgICB2YXIgb21pdCA9IFtcbiAgICAgICAgICAnYWRkRXZlbnRMaXN0ZW5lcicsICdvbicsICdvbmNlJywgJ3JlbW92ZUV2ZW50TGlzdGVuZXInLCAncmVtb3ZlQWxsTGlzdGVuZXJzJyxcbiAgICAgICAgICAncmVtb3ZlTGlzdGVuZXInLCAnb2ZmJywgJ2VtaXQnLCAnbGlzdGVuZXJzJywgJ2hhc0xpc3RlbmVycycsICdwb3AnLCAncHVzaCcsXG4gICAgICAgICAgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzcGxpY2UnLCAndXBkYXRlJywgJ3Vuc2hpZnQnLCAnY3JlYXRlJywgJ19fbWVyZ2UnLFxuICAgICAgICAgICdfX3NldE5vdGlmeUNoYW5nZScsICdfX25vdGlmeUNoYW5nZScsICdfX3NldCcsICdfX2dldCcsICdfX2NoYWluJywgJ19fcmVsYXRpdmVQYXRoJ1xuICAgICAgICBdXG5cbiAgICAgICAga2V5cyA9IGtleXMuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIG9taXQuaW5kZXhPZihpdGVtKSA8IDBcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGtleXNcbiAgICB9XG4gIH0sXG4gIF9fbmFtZToge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuX19pc1Jvb3QpIHtcbiAgICAgICAgcmV0dXJuICcnXG4gICAgICB9XG5cbiAgICAgIC8vIFdvcmsgb3V0IHRoZSAnbmFtZScgb2YgdGhlIG1vZGVsXG4gICAgICAvLyBMb29rIHVwIHRvIHRoZSBwYXJlbnQgYW5kIGxvb3AgdGhyb3VnaCBpdCdzIGtleXMsXG4gICAgICAvLyBBbnkgdmFsdWUgb3IgYXJyYXkgZm91bmQgdG8gY29udGFpbiB0aGUgdmFsdWUgb2YgdGhpcyAodGhpcyBtb2RlbClcbiAgICAgIC8vIHRoZW4gd2UgcmV0dXJuIHRoZSBrZXkgYW5kIGluZGV4IGluIHRoZSBjYXNlIHdlIGZvdW5kIHRoZSBtb2RlbCBpbiBhbiBhcnJheS5cbiAgICAgIHZhciBwYXJlbnRLZXlzID0gdGhpcy5fX3BhcmVudC5fX2tleXNcbiAgICAgIHZhciBwYXJlbnRLZXksIHBhcmVudFZhbHVlXG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyZW50S2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwYXJlbnRLZXkgPSBwYXJlbnRLZXlzW2ldXG4gICAgICAgIHBhcmVudFZhbHVlID0gdGhpcy5fX3BhcmVudFtwYXJlbnRLZXldXG5cbiAgICAgICAgaWYgKHBhcmVudFZhbHVlID09PSB0aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIHBhcmVudEtleVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBfX3BhdGg6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLl9faGFzQW5jZXN0b3JzICYmICF0aGlzLl9fcGFyZW50Ll9faXNSb290KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fcGFyZW50Ll9fcGF0aCArICcuJyArIHRoaXMuX19uYW1lXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fX25hbWVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIF9faXNSb290OiB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gIXRoaXMuX19oYXNBbmNlc3RvcnNcbiAgICB9XG4gIH0sXG4gIF9fY2hpbGRyZW46IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjaGlsZHJlbiA9IFtdXG5cbiAgICAgIHZhciBrZXlzID0gdGhpcy5fX2tleXNcbiAgICAgIHZhciBrZXksIHZhbHVlXG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBrZXkgPSBrZXlzW2ldXG4gICAgICAgIHZhbHVlID0gdGhpc1trZXldXG5cbiAgICAgICAgaWYgKHZhbHVlICYmIHZhbHVlLl9fc3VwZXJtb2RlbCkge1xuICAgICAgICAgIGNoaWxkcmVuLnB1c2godmFsdWUpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNoaWxkcmVuXG4gICAgfVxuICB9LFxuICBfX2FuY2VzdG9yczoge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGFuY2VzdG9ycyA9IFtdXG4gICAgICB2YXIgciA9IHRoaXNcblxuICAgICAgd2hpbGUgKHIuX19wYXJlbnQpIHtcbiAgICAgICAgYW5jZXN0b3JzLnB1c2goci5fX3BhcmVudClcbiAgICAgICAgciA9IHIuX19wYXJlbnRcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGFuY2VzdG9yc1xuICAgIH1cbiAgfSxcbiAgX19kZXNjZW5kYW50czoge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRlc2NlbmRhbnRzID0gW11cblxuICAgICAgZnVuY3Rpb24gY2hlY2tBbmRBZGREZXNjZW5kYW50SWZNb2RlbCAob2JqKSB7XG4gICAgICAgIHZhciBrZXlzID0gb2JqLl9fa2V5c1xuICAgICAgICB2YXIga2V5LCB2YWx1ZVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGtleSA9IGtleXNbaV1cbiAgICAgICAgICB2YWx1ZSA9IG9ialtrZXldXG5cbiAgICAgICAgICBpZiAodmFsdWUgJiYgdmFsdWUuX19zdXBlcm1vZGVsKSB7XG4gICAgICAgICAgICBkZXNjZW5kYW50cy5wdXNoKHZhbHVlKVxuICAgICAgICAgICAgY2hlY2tBbmRBZGREZXNjZW5kYW50SWZNb2RlbCh2YWx1ZSlcblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICAgIGNoZWNrQW5kQWRkRGVzY2VuZGFudElmTW9kZWwodGhpcylcblxuICAgICAgcmV0dXJuIGRlc2NlbmRhbnRzXG4gICAgfVxuICB9LFxuICBfX2hhc0FuY2VzdG9yczoge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICEhdGhpcy5fX2FuY2VzdG9ycy5sZW5ndGhcbiAgICB9XG4gIH0sXG4gIF9faGFzRGVzY2VuZGFudHM6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAhIXRoaXMuX19kZXNjZW5kYW50cy5sZW5ndGhcbiAgICB9XG4gIH0sXG4gIGVycm9yczoge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGVycm9ycyA9IFtdXG4gICAgICB2YXIgZGVmID0gdGhpcy5fX2RlZlxuICAgICAgdmFyIHZhbGlkYXRvciwgZXJyb3IsIGksIGpcblxuICAgICAgLy8gUnVuIG93biB2YWxpZGF0b3JzXG4gICAgICB2YXIgb3duID0gZGVmLnZhbGlkYXRvcnMuc2xpY2UoMClcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBvd24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsaWRhdG9yID0gb3duW2ldXG4gICAgICAgIGVycm9yID0gdmFsaWRhdG9yLmNhbGwodGhpcywgdGhpcylcblxuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICBlcnJvcnMucHVzaChuZXcgVmFsaWRhdGlvbkVycm9yKHRoaXMsIGVycm9yLCB2YWxpZGF0b3IpKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFJ1biB0aHJvdWdoIGtleXMgYW5kIGV2YWx1YXRlIHZhbGlkYXRvcnNcbiAgICAgIHZhciBrZXlzID0gdGhpcy5fX2tleXNcbiAgICAgIHZhciB2YWx1ZSwga2V5LCBpdGVtRGVmXG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGtleSA9IGtleXNbaV1cblxuICAgICAgICAvLyBJZiB3ZSBhcmUgYW4gQXJyYXkgd2l0aCBhbiBpdGVtIGRlZmluaXRpb25cbiAgICAgICAgLy8gdGhlbiB3ZSBoYXZlIHRvIGxvb2sgaW50byB0aGUgQXJyYXkgZm9yIG91ciB2YWx1ZVxuICAgICAgICAvLyBhbmQgYWxzbyBnZXQgaG9sZCBvZiB0aGUgd3JhcHBlci4gV2Ugb25seSBuZWVkIHRvXG4gICAgICAgIC8vIGRvIHRoaXMgaWYgdGhlIGtleSBpcyBub3QgYSBwcm9wZXJ0eSBvZiB0aGUgYXJyYXkuXG4gICAgICAgIC8vIFdlIGNoZWNrIHRoZSBkZWZzIHRvIHdvcmsgdGhpcyBvdXQgKGkuZS4gMCwgMSwgMikuXG4gICAgICAgIC8vIHRvZG86IFRoaXMgY291bGQgYmUgYmV0dGVyIHRvIGNoZWNrICFOYU4gb24gdGhlIGtleT9cbiAgICAgICAgaWYgKGRlZi5pc0FycmF5ICYmIGRlZi5kZWYgJiYgKCFkZWYuZGVmcyB8fCAhKGtleSBpbiBkZWYuZGVmcykpKSB7XG4gICAgICAgICAgLy8gSWYgd2UgYXJlIGFuIEFycmF5IHdpdGggYSBzaW1wbGUgaXRlbSBkZWZpbml0aW9uXG4gICAgICAgICAgLy8gb3IgYSByZWZlcmVuY2UgdG8gYSBzaW1wbGUgdHlwZSBkZWZpbml0aW9uXG4gICAgICAgICAgLy8gc3Vic3RpdHV0ZSB0aGUgdmFsdWUgd2l0aCB0aGUgd3JhcHBlciB3ZSBnZXQgZnJvbSB0aGVcbiAgICAgICAgICAvLyBjcmVhdGUgZmFjdG9yeSBmdW5jdGlvbi4gT3RoZXJ3aXNlIHNldCB0aGUgdmFsdWUgdG9cbiAgICAgICAgICAvLyB0aGUgcmVhbCB2YWx1ZSBvZiB0aGUgcHJvcGVydHkuXG4gICAgICAgICAgaXRlbURlZiA9IGRlZi5kZWZcblxuICAgICAgICAgIGlmIChpdGVtRGVmLmlzU2ltcGxlKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGl0ZW1EZWYuY3JlYXRlLndyYXBwZXJcbiAgICAgICAgICAgIHZhbHVlLnNldFZhbHVlKHRoaXNba2V5XSlcbiAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW1EZWYuaXNSZWZlcmVuY2UgJiYgaXRlbURlZi50eXBlLmRlZi5pc1NpbXBsZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBpdGVtRGVmLnR5cGUuZGVmLmNyZWF0ZS53cmFwcGVyXG4gICAgICAgICAgICB2YWx1ZS5zZXRWYWx1ZSh0aGlzW2tleV0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpc1trZXldXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFNldCB0aGUgdmFsdWUgdG8gdGhlIHdyYXBwZWQgdmFsdWUgb2YgdGhlIHByb3BlcnR5XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLl9fW2tleV1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgIGlmICh2YWx1ZS5fX3N1cGVybW9kZWwpIHtcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGVycm9ycywgdmFsdWUuZXJyb3JzKVxuICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBXcmFwcGVyKSB7XG4gICAgICAgICAgICB2YXIgd3JhcHBlclZhbHVlID0gdmFsdWUuZ2V0VmFsdWUodGhpcylcblxuICAgICAgICAgICAgaWYgKHdyYXBwZXJWYWx1ZSAmJiB3cmFwcGVyVmFsdWUuX19zdXBlcm1vZGVsKSB7XG4gICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGVycm9ycywgd3JhcHBlclZhbHVlLmVycm9ycylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHZhciBzaW1wbGUgPSB2YWx1ZS52YWxpZGF0b3JzXG4gICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBzaW1wbGUubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3IgPSBzaW1wbGVbal1cbiAgICAgICAgICAgICAgICBlcnJvciA9IHZhbGlkYXRvci5jYWxsKHRoaXMsIHdyYXBwZXJWYWx1ZSwga2V5KVxuXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICBlcnJvcnMucHVzaChuZXcgVmFsaWRhdGlvbkVycm9yKHRoaXMsIGVycm9yLCB2YWxpZGF0b3IsIGtleSkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBlcnJvcnNcbiAgICB9XG4gIH1cbn1cblxudmFyIHByb3RvID0ge1xuICBfX2dldDogZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLl9fW2tleV0uZ2V0VmFsdWUodGhpcylcbiAgfSxcbiAgX19zZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgdGhpcy5fX1trZXldLnNldFZhbHVlKHZhbHVlLCB0aGlzKVxuICB9LFxuICBfX3JlbGF0aXZlUGF0aDogZnVuY3Rpb24gKHRvLCBrZXkpIHtcbiAgICB2YXIgcmVsYXRpdmVQYXRoID0gdGhpcy5fX3BhdGggPyB0by5zdWJzdHIodGhpcy5fX3BhdGgubGVuZ3RoICsgMSkgOiB0b1xuXG4gICAgaWYgKHJlbGF0aXZlUGF0aCkge1xuICAgICAgcmV0dXJuIGtleSA/IHJlbGF0aXZlUGF0aCArICcuJyArIGtleSA6IHJlbGF0aXZlUGF0aFxuICAgIH1cbiAgICByZXR1cm4ga2V5XG4gIH0sXG4gIF9fY2hhaW46IGZ1bmN0aW9uIChmbikge1xuICAgIHJldHVybiBbdGhpc10uY29uY2F0KHRoaXMuX19hbmNlc3RvcnMpLmZvckVhY2goZm4pXG4gIH0sXG4gIF9fbWVyZ2U6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgcmV0dXJuIG1lcmdlKHRoaXMsIGRhdGEpXG4gIH0sXG4gIF9fbm90aWZ5Q2hhbmdlOiBmdW5jdGlvbiAoa2V5LCBuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpc1xuICAgIHZhciB0YXJnZXRQYXRoID0gdGhpcy5fX3BhdGhcbiAgICB2YXIgZXZlbnROYW1lID0gJ3NldCdcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG9sZFZhbHVlOiBvbGRWYWx1ZSxcbiAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZVxuICAgIH1cblxuICAgIHRoaXMuZW1pdChldmVudE5hbWUsIG5ldyBFbWl0dGVyRXZlbnQoZXZlbnROYW1lLCBrZXksIHRhcmdldCwgZGF0YSkpXG4gICAgdGhpcy5lbWl0KCdjaGFuZ2UnLCBuZXcgRW1pdHRlckV2ZW50KGV2ZW50TmFtZSwga2V5LCB0YXJnZXQsIGRhdGEpKVxuICAgIHRoaXMuZW1pdCgnY2hhbmdlOicgKyBrZXksIG5ldyBFbWl0dGVyRXZlbnQoZXZlbnROYW1lLCBrZXksIHRhcmdldCwgZGF0YSkpXG5cbiAgICB0aGlzLl9fYW5jZXN0b3JzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBwYXRoID0gaXRlbS5fX3JlbGF0aXZlUGF0aCh0YXJnZXRQYXRoLCBrZXkpXG4gICAgICBpdGVtLmVtaXQoJ2NoYW5nZScsIG5ldyBFbWl0dGVyRXZlbnQoZXZlbnROYW1lLCBwYXRoLCB0YXJnZXQsIGRhdGEpKVxuICAgIH0pXG4gIH0sXG4gIF9fc2V0Tm90aWZ5Q2hhbmdlOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMuX19nZXQoa2V5KVxuICAgIHRoaXMuX19zZXQoa2V5LCB2YWx1ZSlcbiAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLl9fZ2V0KGtleSlcbiAgICB0aGlzLl9fbm90aWZ5Q2hhbmdlKGtleSwgbmV3VmFsdWUsIG9sZFZhbHVlKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBwcm90bzogcHJvdG8sXG4gIGRlc2NyaXB0b3JzOiBkZXNjcmlwdG9yc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBlbWl0dGVyID0gcmVxdWlyZSgnLi9lbWl0dGVyLW9iamVjdCcpXG52YXIgZW1pdHRlckFycmF5ID0gcmVxdWlyZSgnLi9lbWl0dGVyLWFycmF5JylcbnZhciBFbWl0dGVyRXZlbnQgPSByZXF1aXJlKCcuL2VtaXR0ZXItZXZlbnQnKVxuXG52YXIgZXh0ZW5kID0gcmVxdWlyZSgnLi91dGlsJykuZXh0ZW5kXG52YXIgbW9kZWwgPSByZXF1aXJlKCcuL21vZGVsJylcbnZhciBtb2RlbFByb3RvID0gbW9kZWwucHJvdG9cbnZhciBtb2RlbERlc2NyaXB0b3JzID0gbW9kZWwuZGVzY3JpcHRvcnNcblxudmFyIG1vZGVsUHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShtb2RlbFByb3RvLCBtb2RlbERlc2NyaXB0b3JzKVxudmFyIG9iamVjdFByb3RvdHlwZSA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBwID0gT2JqZWN0LmNyZWF0ZShtb2RlbFByb3RvdHlwZSlcblxuICBlbWl0dGVyKHApXG5cbiAgcmV0dXJuIHBcbn0pKClcblxuZnVuY3Rpb24gY3JlYXRlQXJyYXlQcm90b3R5cGUgKCkge1xuICB2YXIgcCA9IGVtaXR0ZXJBcnJheShmdW5jdGlvbiAoZXZlbnROYW1lLCBhcnIsIGUpIHtcbiAgICBpZiAoZXZlbnROYW1lID09PSAndXBkYXRlJykge1xuICAgICAgLyoqXG4gICAgICAgKiBGb3J3YXJkIHRoZSBzcGVjaWFsIGFycmF5IHVwZGF0ZVxuICAgICAgICogZXZlbnRzIGFzIHN0YW5kYXJkIF9fbm90aWZ5Q2hhbmdlIGV2ZW50c1xuICAgICAgICovXG4gICAgICBhcnIuX19ub3RpZnlDaGFuZ2UoZS5pbmRleCwgZS52YWx1ZSwgZS5vbGRWYWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgLyoqXG4gICAgICAgKiBBbGwgb3RoZXIgZXZlbnRzIGUuZy4gcHVzaCwgc3BsaWNlIGFyZSByZWxheWVkXG4gICAgICAgKi9cbiAgICAgIHZhciB0YXJnZXQgPSBhcnJcbiAgICAgIHZhciBwYXRoID0gYXJyLl9fcGF0aFxuICAgICAgdmFyIGRhdGEgPSBlXG4gICAgICB2YXIga2V5ID0gZS5pbmRleFxuXG4gICAgICBhcnIuZW1pdChldmVudE5hbWUsIG5ldyBFbWl0dGVyRXZlbnQoZXZlbnROYW1lLCAnJywgdGFyZ2V0LCBkYXRhKSlcbiAgICAgIGFyci5lbWl0KCdjaGFuZ2UnLCBuZXcgRW1pdHRlckV2ZW50KGV2ZW50TmFtZSwgJycsIHRhcmdldCwgZGF0YSkpXG4gICAgICBhcnIuX19hbmNlc3RvcnMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICB2YXIgbmFtZSA9IGl0ZW0uX19yZWxhdGl2ZVBhdGgocGF0aCwga2V5KVxuICAgICAgICBpdGVtLmVtaXQoJ2NoYW5nZScsIG5ldyBFbWl0dGVyRXZlbnQoZXZlbnROYW1lLCBuYW1lLCB0YXJnZXQsIGRhdGEpKVxuICAgICAgfSlcblxuICAgIH1cbiAgfSlcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhwLCBtb2RlbERlc2NyaXB0b3JzKVxuXG4gIGVtaXR0ZXIocClcblxuICBleHRlbmQocCwgbW9kZWxQcm90bylcblxuICByZXR1cm4gcFxufVxuXG5mdW5jdGlvbiBjcmVhdGVPYmplY3RNb2RlbFByb3RvdHlwZSAocHJvdG8pIHtcbiAgdmFyIHAgPSBPYmplY3QuY3JlYXRlKG9iamVjdFByb3RvdHlwZSlcblxuICBpZiAocHJvdG8pIHtcbiAgICBleHRlbmQocCwgcHJvdG8pXG4gIH1cblxuICByZXR1cm4gcFxufVxuXG5mdW5jdGlvbiBjcmVhdGVBcnJheU1vZGVsUHJvdG90eXBlIChwcm90bywgaXRlbURlZikge1xuICAvLyBXZSBkbyBub3QgdG8gYXR0ZW1wdCB0byBzdWJjbGFzcyBBcnJheSxcbiAgLy8gaW5zdGVhZCBjcmVhdGUgYSBuZXcgaW5zdGFuY2UgZWFjaCB0aW1lXG4gIC8vIGFuZCBtaXhpbiB0aGUgcHJvdG8gb2JqZWN0XG4gIHZhciBwID0gY3JlYXRlQXJyYXlQcm90b3R5cGUoKVxuXG4gIGlmIChwcm90bykge1xuICAgIGV4dGVuZChwLCBwcm90bylcbiAgfVxuXG4gIGlmIChpdGVtRGVmKSB7XG4gICAgLy8gV2UgaGF2ZSBhIGRlZmluaXRpb24gZm9yIHRoZSBpdGVtc1xuICAgIC8vIHRoYXQgYmVsb25nIGluIHRoaXMgYXJyYXkuXG5cbiAgICAvLyBVc2UgdGhlIGB3cmFwcGVyYCBwcm90b3R5cGUgcHJvcGVydHkgYXMgYVxuICAgIC8vIHZpcnR1YWwgV3JhcHBlciBvYmplY3Qgd2UgY2FuIHVzZVxuICAgIC8vIHZhbGlkYXRlIGFsbCB0aGUgaXRlbXMgaW4gdGhlIGFycmF5LlxuICAgIHZhciBhcnJJdGVtV3JhcHBlciA9IGl0ZW1EZWYuY3JlYXRlLndyYXBwZXJcblxuICAgIC8vIFZhbGlkYXRlIG5ldyBtb2RlbHMgYnkgb3ZlcnJpZGluZyB0aGUgZW1pdHRlciBhcnJheVxuICAgIC8vIG11dGF0b3JzIHRoYXQgY2FuIGNhdXNlIG5ldyBpdGVtcyB0byBlbnRlciB0aGUgYXJyYXkuXG4gICAgb3ZlcnJpZGVBcnJheUFkZGluZ011dGF0b3JzKHAsIGFyckl0ZW1XcmFwcGVyKVxuXG4gICAgLy8gUHJvdmlkZSBhIGNvbnZlbmllbnQgbW9kZWwgZmFjdG9yeVxuICAgIC8vIGZvciBjcmVhdGluZyBhcnJheSBpdGVtIGluc3RhbmNlc1xuICAgIHAuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGl0ZW1EZWYuaXNSZWZlcmVuY2UgPyBpdGVtRGVmLnR5cGUoKSA6IGl0ZW1EZWYuY3JlYXRlKCkuZ2V0VmFsdWUodGhpcylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcFxufVxuXG5mdW5jdGlvbiBvdmVycmlkZUFycmF5QWRkaW5nTXV0YXRvcnMgKGFyciwgaXRlbVdyYXBwZXIpIHtcbiAgZnVuY3Rpb24gZ2V0QXJyYXlBcmdzIChpdGVtcykge1xuICAgIHZhciBhcmdzID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpdGVtV3JhcHBlci5zZXRWYWx1ZShpdGVtc1tpXSwgYXJyKVxuICAgICAgYXJncy5wdXNoKGl0ZW1XcmFwcGVyLmdldFZhbHVlKGFycikpXG4gICAgfVxuICAgIHJldHVybiBhcmdzXG4gIH1cblxuICB2YXIgcHVzaCA9IGFyci5wdXNoXG4gIHZhciB1bnNoaWZ0ID0gYXJyLnVuc2hpZnRcbiAgdmFyIHNwbGljZSA9IGFyci5zcGxpY2VcbiAgdmFyIHVwZGF0ZSA9IGFyci51cGRhdGVcblxuICBpZiAocHVzaCkge1xuICAgIGFyci5wdXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGFyZ3MgPSBnZXRBcnJheUFyZ3MoYXJndW1lbnRzKVxuICAgICAgcmV0dXJuIHB1c2guYXBwbHkoYXJyLCBhcmdzKVxuICAgIH1cbiAgfVxuXG4gIGlmICh1bnNoaWZ0KSB7XG4gICAgYXJyLnVuc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYXJncyA9IGdldEFycmF5QXJncyhhcmd1bWVudHMpXG4gICAgICByZXR1cm4gdW5zaGlmdC5hcHBseShhcnIsIGFyZ3MpXG4gICAgfVxuICB9XG5cbiAgaWYgKHNwbGljZSkge1xuICAgIGFyci5zcGxpY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYXJncyA9IGdldEFycmF5QXJncyhBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpKVxuICAgICAgYXJncy51bnNoaWZ0KGFyZ3VtZW50c1sxXSlcbiAgICAgIGFyZ3MudW5zaGlmdChhcmd1bWVudHNbMF0pXG4gICAgICByZXR1cm4gc3BsaWNlLmFwcGx5KGFyciwgYXJncylcbiAgICB9XG4gIH1cblxuICBpZiAodXBkYXRlKSB7XG4gICAgYXJyLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhcmdzID0gZ2V0QXJyYXlBcmdzKFthcmd1bWVudHNbMV1dKVxuICAgICAgYXJncy51bnNoaWZ0KGFyZ3VtZW50c1swXSlcbiAgICAgIHJldHVybiB1cGRhdGUuYXBwbHkoYXJyLCBhcmdzKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVNb2RlbFByb3RvdHlwZSAoZGVmKSB7XG4gIHJldHVybiBkZWYuaXNBcnJheSA/IGNyZWF0ZUFycmF5TW9kZWxQcm90b3R5cGUoZGVmLnByb3RvLCBkZWYuZGVmKSA6IGNyZWF0ZU9iamVjdE1vZGVsUHJvdG90eXBlKGRlZi5wcm90bylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVNb2RlbFByb3RvdHlwZVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0ge31cbiIsIid1c2Ugc3RyaWN0J1xuXG4vLyB2YXIgbWVyZ2UgPSByZXF1aXJlKCcuL21lcmdlJylcbnZhciBjcmVhdGVEZWYgPSByZXF1aXJlKCcuL2RlZicpXG52YXIgU3VwZXJtb2RlbCA9IHJlcXVpcmUoJy4vc3VwZXJtb2RlbCcpXG5cbmZ1bmN0aW9uIHN1cGVybW9kZWxzIChzY2hlbWEsIGluaXRpYWxpemVyKSB7XG4gIHZhciBkZWYgPSBjcmVhdGVEZWYoc2NoZW1hKVxuXG4gIGZ1bmN0aW9uIFN1cGVybW9kZWxDb25zdHJ1Y3RvciAoZGF0YSkge1xuICAgIHZhciBtb2RlbCA9IGRlZi5pc1NpbXBsZSA/IGRlZi5jcmVhdGUoKSA6IGRlZi5jcmVhdGUoKS5nZXRWYWx1ZSh7fSlcblxuICAgIC8vIENhbGwgYW55IGluaXRpYWxpemVyXG4gICAgaWYgKGluaXRpYWxpemVyKSB7XG4gICAgICBpbml0aWFsaXplci5hcHBseShtb2RlbCwgYXJndW1lbnRzKVxuICAgIH0gZWxzZSBpZiAoZGF0YSkge1xuICAgICAgLy8gaWYgdGhlcmUncyBubyBpbml0aWFsaXplclxuICAgICAgLy8gYnV0IHdlIGhhdmUgYmVlbiBwYXNzZWQgc29tZVxuICAgICAgLy8gZGF0YSwgbWVyZ2UgaXQgaW50byB0aGUgbW9kZWwuXG4gICAgICBtb2RlbC5fX21lcmdlKGRhdGEpXG4gICAgfVxuICAgIHJldHVybiBtb2RlbFxuICB9XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdXBlcm1vZGVsQ29uc3RydWN0b3IsICdkZWYnLCB7XG4gICAgdmFsdWU6IGRlZiAvLyB0aGlzIGlzIHVzZWQgdG8gdmFsaWRhdGUgcmVmZXJlbmNlZCBTdXBlcm1vZGVsQ29uc3RydWN0b3JzXG4gIH0pXG4gIFN1cGVybW9kZWxDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSBTdXBlcm1vZGVsIC8vIHRoaXMgc2hhcmVkIG9iamVjdCBpcyB1c2VkLCBhcyBhIHByb3RvdHlwZSwgdG8gaWRlbnRpZnkgU3VwZXJtb2RlbENvbnN0cnVjdG9yc1xuICBTdXBlcm1vZGVsQ29uc3RydWN0b3IuY29uc3RydWN0b3IgPSBTdXBlcm1vZGVsQ29uc3RydWN0b3JcbiAgcmV0dXJuIFN1cGVybW9kZWxDb25zdHJ1Y3RvclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN1cGVybW9kZWxzXG4iLCIndXNlIHN0cmljdCdcblxudmFyIFN1cGVybW9kZWwgPSByZXF1aXJlKCcuL3N1cGVybW9kZWwnKVxuXG5mdW5jdGlvbiBleHRlbmQgKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgdHlwZW9mIGFkZCAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gb3JpZ2luXG4gIH1cblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZClcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aFxuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dXG4gIH1cbiAgcmV0dXJuIG9yaWdpblxufVxuXG52YXIgdXRpbCA9IHtcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHR5cGVPZjogZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKS5tYXRjaCgvXFxzKFthLXpBLVpdKykvKVsxXS50b0xvd2VyQ2FzZSgpXG4gIH0sXG4gIGlzT2JqZWN0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy50eXBlT2YodmFsdWUpID09PSAnb2JqZWN0J1xuICB9LFxuICBpc0FycmF5OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSlcbiAgfSxcbiAgaXNTaW1wbGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vICdTaW1wbGUnIGhlcmUgbWVhbnMgYW55dGhpbmdcbiAgICAvLyBvdGhlciB0aGFuIGFuIE9iamVjdCBvciBhbiBBcnJheVxuICAgIC8vIGkuZS4gbnVtYmVyLCBzdHJpbmcsIGRhdGUsIGJvb2wsIG51bGwsIHVuZGVmaW5lZCwgcmVnZXguLi5cbiAgICByZXR1cm4gIXRoaXMuaXNPYmplY3QodmFsdWUpICYmICF0aGlzLmlzQXJyYXkodmFsdWUpXG4gIH0sXG4gIGlzRnVuY3Rpb246IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLnR5cGVPZih2YWx1ZSkgPT09ICdmdW5jdGlvbidcbiAgfSxcbiAgaXNEYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy50eXBlT2YodmFsdWUpID09PSAnZGF0ZSdcbiAgfSxcbiAgaXNOdWxsOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IG51bGxcbiAgfSxcbiAgaXNVbmRlZmluZWQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgKHZhbHVlKSA9PT0gJ3VuZGVmaW5lZCdcbiAgfSxcbiAgaXNOdWxsT3JVbmRlZmluZWQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmlzTnVsbCh2YWx1ZSkgfHwgdGhpcy5pc1VuZGVmaW5lZCh2YWx1ZSlcbiAgfSxcbiAgY2FzdDogZnVuY3Rpb24gKHZhbHVlLCB0eXBlKSB7XG4gICAgaWYgKCF0eXBlKSB7XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgU3RyaW5nOlxuICAgICAgICByZXR1cm4gdXRpbC5jYXN0U3RyaW5nKHZhbHVlKVxuICAgICAgY2FzZSBOdW1iZXI6XG4gICAgICAgIHJldHVybiB1dGlsLmNhc3ROdW1iZXIodmFsdWUpXG4gICAgICBjYXNlIEJvb2xlYW46XG4gICAgICAgIHJldHVybiB1dGlsLmNhc3RCb29sZWFuKHZhbHVlKVxuICAgICAgY2FzZSBEYXRlOlxuICAgICAgICByZXR1cm4gdXRpbC5jYXN0RGF0ZSh2YWx1ZSlcbiAgICAgIGNhc2UgT2JqZWN0OlxuICAgICAgY2FzZSBGdW5jdGlvbjpcbiAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY2FzdCcpXG4gICAgfVxuICB9LFxuICBjYXN0U3RyaW5nOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB1dGlsLnR5cGVPZih2YWx1ZSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nICYmIHZhbHVlLnRvU3RyaW5nKClcbiAgfSxcbiAgY2FzdE51bWJlcjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBOYU5cbiAgICB9XG4gICAgaWYgKHV0aWwudHlwZU9mKHZhbHVlKSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gTnVtYmVyKHZhbHVlKVxuICB9LFxuICBjYXN0Qm9vbGVhbjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHZhciBmYWxzZXkgPSBbJzAnLCAnZmFsc2UnLCAnb2ZmJywgJ25vJ11cbiAgICByZXR1cm4gZmFsc2V5LmluZGV4T2YodmFsdWUpID09PSAtMVxuICB9LFxuICBjYXN0RGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwgfHwgdXRpbC50eXBlT2YodmFsdWUpID09PSAnZGF0ZScpIHtcbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gbmV3IERhdGUodmFsdWUpXG4gIH0sXG4gIGlzQ29uc3RydWN0b3I6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmlzU2ltcGxlQ29uc3RydWN0b3IodmFsdWUpIHx8IFtBcnJheSwgT2JqZWN0XS5pbmRleE9mKHZhbHVlKSA+IC0xXG4gIH0sXG4gIGlzU2ltcGxlQ29uc3RydWN0b3I6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiBbU3RyaW5nLCBOdW1iZXIsIERhdGUsIEJvb2xlYW5dLmluZGV4T2YodmFsdWUpID4gLTFcbiAgfSxcbiAgaXNTdXBlcm1vZGVsQ29uc3RydWN0b3I6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmlzRnVuY3Rpb24odmFsdWUpICYmIHZhbHVlLnByb3RvdHlwZSA9PT0gU3VwZXJtb2RlbFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmZ1bmN0aW9uIFZhbGlkYXRpb25FcnJvciAodGFyZ2V0LCBlcnJvciwgdmFsaWRhdG9yLCBrZXkpIHtcbiAgdGhpcy50YXJnZXQgPSB0YXJnZXRcbiAgdGhpcy5lcnJvciA9IGVycm9yXG4gIHRoaXMudmFsaWRhdG9yID0gdmFsaWRhdG9yXG5cbiAgaWYgKGtleSkge1xuICAgIHRoaXMua2V5ID0ga2V5XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBWYWxpZGF0aW9uRXJyb3JcbiIsIid1c2Ugc3RyaWN0J1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG5cbmZ1bmN0aW9uIFdyYXBwZXIgKGRlZmF1bHRWYWx1ZSwgd3JpdGFibGUsIHZhbGlkYXRvcnMsIGdldHRlciwgc2V0dGVyLCBiZWZvcmVTZXQsIGFzc2VydCkge1xuICB0aGlzLnZhbGlkYXRvcnMgPSB2YWxpZGF0b3JzXG5cbiAgdGhpcy5fZGVmYXVsdFZhbHVlID0gZGVmYXVsdFZhbHVlXG4gIHRoaXMuX3dyaXRhYmxlID0gd3JpdGFibGVcbiAgdGhpcy5fZ2V0dGVyID0gZ2V0dGVyXG4gIHRoaXMuX3NldHRlciA9IHNldHRlclxuICB0aGlzLl9iZWZvcmVTZXQgPSBiZWZvcmVTZXRcbiAgdGhpcy5fYXNzZXJ0ID0gYXNzZXJ0XG4gIHRoaXMuaXNJbml0aWFsaXplZCA9IGZhbHNlXG5cbiAgaWYgKCF1dGlsLmlzRnVuY3Rpb24oZGVmYXVsdFZhbHVlKSkge1xuICAgIHRoaXMuaXNJbml0aWFsaXplZCA9IHRydWVcblxuICAgIGlmICghdXRpbC5pc1VuZGVmaW5lZChkZWZhdWx0VmFsdWUpKSB7XG4gICAgICB0aGlzLl92YWx1ZSA9IGRlZmF1bHRWYWx1ZVxuICAgIH1cbiAgfVxufVxuV3JhcHBlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKHRoaXMuaXNJbml0aWFsaXplZCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdGhpcy5zZXRWYWx1ZSh0aGlzLl9kZWZhdWx0VmFsdWUocGFyZW50KSwgcGFyZW50KVxuICB0aGlzLmlzSW5pdGlhbGl6ZWQgPSB0cnVlXG59XG5XcmFwcGVyLnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uIChtb2RlbCkge1xuICByZXR1cm4gdGhpcy5fZ2V0dGVyID8gdGhpcy5fZ2V0dGVyLmNhbGwobW9kZWwpIDogdGhpcy5fdmFsdWVcbn1cbldyYXBwZXIucHJvdG90eXBlLnNldFZhbHVlID0gZnVuY3Rpb24gKHZhbHVlLCBtb2RlbCkge1xuICBpZiAoIXRoaXMuX3dyaXRhYmxlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdWYWx1ZSBpcyByZWFkb25seScpXG4gIH1cblxuICAvLyBIb29rIHVwIHRoZSBwYXJlbnQgcmVmIGlmIG5lY2Vzc2FyeVxuICBpZiAodmFsdWUgJiYgdmFsdWUuX19zdXBlcm1vZGVsICYmIG1vZGVsKSB7XG4gICAgaWYgKHZhbHVlLl9fcGFyZW50ICE9PSBtb2RlbCkge1xuICAgICAgdmFsdWUuX19wYXJlbnQgPSBtb2RlbFxuICAgIH1cbiAgfVxuXG4gIHZhciB2YWxcbiAgaWYgKHRoaXMuX3NldHRlcikge1xuICAgIHRoaXMuX3NldHRlci5jYWxsKG1vZGVsLCB2YWx1ZSlcbiAgICB2YWwgPSB0aGlzLmdldFZhbHVlKG1vZGVsKVxuICB9IGVsc2Uge1xuICAgIHZhbCA9IHRoaXMuX2JlZm9yZVNldCA/IHRoaXMuX2JlZm9yZVNldCh2YWx1ZSkgOiB2YWx1ZVxuICB9XG5cbiAgaWYgKHRoaXMuX2Fzc2VydCkge1xuICAgIHRoaXMuX2Fzc2VydCh2YWwpXG4gIH1cblxuICB0aGlzLl92YWx1ZSA9IHZhbFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdyYXBwZXJcbiJdfQ==
