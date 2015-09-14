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

},{"../helpers":7,"../incremental-dom":8,"./basket-data":1,"./products-data":4,"./template.html":5,"supermodels.js":12}],3:[function(require,module,exports){
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

        var existing = items.find(function (item) {
          return item.productId === product.productId
        })

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
            linesSummary(basket)
          elementClose("th")
        elementClose("tr")
      elementClose("thead")
      elementOpen("tbody")
        ;(Array.isArray(basket.items) ? basket.items : Object.keys(basket.items)).forEach(function(item, $index) {
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
        }, basket.items)
      elementClose("tbody")
      totalSummary(basket)
    elementClose("table")
  }
  if (!basket.items.length) {
    text(" \
        You have no items in your basket! \
      ")
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

},{"./basket":2,"./incremental-dom":8,"./todo":10}],10:[function(require,module,exports){
var todo = require('./todo.html')
var patch = require('../incremental-dom').patch
var supermodels = require('supermodels.js')
var helpers = require('../helpers')

var Todo = supermodels({
  id: helpers.rndstr,
  text: String,
  completed: Boolean
})
var Todos = supermodels([Todo])

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

},{"../helpers":7,"../incremental-dom":8,"./todo.html":11,"supermodels.js":12}],11:[function(require,module,exports){
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
        elementOpen("td")
        elementClose("td")
        elementOpen("td")
          if (totalCompleted()) {
            elementOpen("button", null, ["class", "btn btn-sm btn-danger"], "onclick", function ($event) {
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
  elementOpen("pre")
    text("" + (JSON.stringify(todos, null, 2)) + "")
  elementClose("pre")
};

},{}],12:[function(require,module,exports){
module.exports = require('./lib/supermodels');

},{"./lib/supermodels":22}],13:[function(require,module,exports){
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

},{"./factory":17,"./util":23}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
'use strict'

module.exports = function EmitterEvent (name, path, target, detail) {
  this.name = name
  this.path = path
  this.target = target

  if (detail) {
    this.detail = detail
  }
}

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{"./proto":20,"./util":23,"./wrapper":25}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{"./emitter-event":15,"./merge":18,"./validation-error":24,"./wrapper":25}],20:[function(require,module,exports){
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

},{"./emitter-array":14,"./emitter-event":15,"./emitter-object":16,"./model":19,"./util":23}],21:[function(require,module,exports){
'use strict'

module.exports = {}

},{}],22:[function(require,module,exports){
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

},{"./def":13,"./supermodel":21}],23:[function(require,module,exports){
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

},{"./supermodel":21}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{"./util":23}]},{},[9])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlcy9iYXNrZXQvYmFza2V0LWRhdGEuanNvbiIsImV4YW1wbGVzL2Jhc2tldC9pbmRleC5qcyIsImV4YW1wbGVzL2Jhc2tldC9saW5lcy1zdW1tYXJ5Lmh0bWwiLCJleGFtcGxlcy9iYXNrZXQvcHJvZHVjdHMtZGF0YS5qc29uIiwiZXhhbXBsZXMvYmFza2V0L3RlbXBsYXRlLmh0bWwiLCJleGFtcGxlcy9iYXNrZXQvdG90YWwtc3VtbWFyeS5odG1sIiwiZXhhbXBsZXMvaGVscGVycy5qcyIsImV4YW1wbGVzL2luY3JlbWVudGFsLWRvbS5qcyIsImV4YW1wbGVzL2luZGV4LmpzIiwiZXhhbXBsZXMvdG9kby9pbmRleC5qcyIsImV4YW1wbGVzL3RvZG8vdG9kby5odG1sIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9kZWYuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL2VtaXR0ZXItYXJyYXkuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL2VtaXR0ZXItZXZlbnQuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL2VtaXR0ZXItb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9mYWN0b3J5LmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9tZXJnZS5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvbW9kZWwuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL3Byb3RvLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9zdXBlcm1vZGVsLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9zdXBlcm1vZGVscy5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvdmFsaWRhdGlvbi1lcnJvci5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvd3JhcHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4K0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIml0ZW1zXCI6IFtcbiAgICB7XG4gICAgICBcInByb2R1Y3RJZFwiOiBcImRzZjFmXCIsXG4gICAgICBcInF1YW50aXR5XCI6IDJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwicHJvZHVjdElkXCI6IFwiZHI2aGJcIixcbiAgICAgIFwicXVhbnRpdHlcIjogNVxuICAgIH0sXG4gICAge1xuICAgICAgXCJwcm9kdWN0SWRcIjogXCJzZHI0ZlwiLFxuICAgICAgXCJxdWFudGl0eVwiOiAxXG4gICAgfVxuICBdXG59XG4iLCJ2YXIgc3VwZXJtb2RlbHMgPSByZXF1aXJlKCdzdXBlcm1vZGVscy5qcycpXG52YXIgcGF0Y2ggPSByZXF1aXJlKCcuLi9pbmNyZW1lbnRhbC1kb20nKS5wYXRjaFxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLi9oZWxwZXJzJylcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUuaHRtbCcpXG52YXIgcHJvZHVjdHNEYXRhID0gcmVxdWlyZSgnLi9wcm9kdWN0cy1kYXRhJylcbnZhciBiYXNrZXREYXRhID0gcmVxdWlyZSgnLi9iYXNrZXQtZGF0YScpXG5cbnZhciBwcm9kdWN0U2NoZW1hID0ge1xuICBwcm9kdWN0SWQ6IGhlbHBlcnMucm5kc3RyLFxuICBwcm9kdWN0TmFtZTogU3RyaW5nLFxuICBwcmljZTogTnVtYmVyLFxuICBpbWFnZTogU3RyaW5nLFxuICBkaXNjb3VudFBlcmNlbnQ6IE51bWJlcixcbiAgZ2V0IGNvc3QgKCkge1xuICAgIHJldHVybiB0aGlzLnByaWNlIC0gKHRoaXMucHJpY2UgKiB0aGlzLmRpc2NvdW50UGVyY2VudClcbiAgfVxufVxudmFyIHByb2R1Y3RzU2NoZW1hID0gW3Byb2R1Y3RTY2hlbWFdXG52YXIgYmFza2V0U2NoZW1hID0ge1xuICBpdGVtczogW3tcbiAgICBpZDogaGVscGVycy5ybmRzdHIsXG4gICAgcHJvZHVjdElkOiBoZWxwZXJzLnJuZHN0cixcbiAgICBxdWFudGl0eTogTnVtYmVyLFxuICAgIGdldCBjb3N0ICgpIHtcbiAgICAgIHZhciBwcm9kdWN0ID0gdGhpcy5wcm9kdWN0XG4gICAgICByZXR1cm4gdGhpcy5xdWFudGl0eSAqIChwcm9kdWN0LnByaWNlIC0gKHByb2R1Y3QucHJpY2UgKiBwcm9kdWN0LmRpc2NvdW50UGVyY2VudCkpXG4gICAgfSxcbiAgICBnZXQgcHJvZHVjdCAoKSB7XG4gICAgICB2YXIgaWQgPSB0aGlzLnByb2R1Y3RJZFxuXG4gICAgICAvLyBUaGlzIGZ1bmN0aW9uIGxvb2tzIHVwIHRoZSBwcm9kdWN0IGZyb20gdGhlIHByb2R1Y3RzIGxpc3QuIFdlIGNhbiBnZXQgdGhlIGxpc3Qgb2YgcHJvZHVjdHNcbiAgICAgIC8vIGJ5IGxvb2tpbmcgdXAgdG8gdGhlIHJvb3Qgb2YgdGhlIG9iamVjdCAodGhlIGxhc3QgYW5jZXN0b3IpIHdoaWNoIGluIG91ciBjYXNlIGlzIHRoZSBgYXBwYCBtb2RlbCBpbnN0YW5jZS5cbiAgICAgIC8vIFdoaWxlIHRoaXMgb2JqZWN0IHRyYXZlcnNhbCBpcyBwb3NzaWJsZSB1c2luZyBzdXBlcm1vZGVscy5qcywgaXQncyBvbmx5IGhlcmUgZm9yIHRoZSBwdXJwb3NlcyBvZiB0aGUgZXhhbXBsZS5cbiAgICAgIHZhciBhcHAgPSB0aGlzLl9fYW5jZXN0b3JzW3RoaXMuX19hbmNlc3RvcnMubGVuZ3RoIC0gMV1cbiAgICAgIHJldHVybiBhcHAucHJvZHVjdHMuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLnByb2R1Y3RJZCA9PT0gaWRcbiAgICAgIH0pWzBdXG4gICAgfVxuICB9XSxcbiAgZ2V0IHRvdGFsQ29zdCAoKSB7XG4gICAgdmFyIHRvdGFsID0gMFxuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMuaXRlbXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHRvdGFsICs9IHRoaXMuaXRlbXNbaV0uY29zdFxuICAgIH1cblxuICAgIHJldHVybiB0b3RhbFxuICB9LFxuICBnZXQgdG90YWxRdWFudGl0eSAoKSB7XG4gICAgdmFyIHRvdGFsID0gMFxuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMuaXRlbXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHRvdGFsICs9IHRoaXMuaXRlbXNbaV0ucXVhbnRpdHlcbiAgICB9XG5cbiAgICByZXR1cm4gdG90YWxcbiAgfVxufVxuXG52YXIgQmFza2V0ID0gc3VwZXJtb2RlbHMoYmFza2V0U2NoZW1hKVxudmFyIFByb2R1Y3RzID0gc3VwZXJtb2RlbHMocHJvZHVjdHNTY2hlbWEpXG5cbnZhciBhcHBTY2hlbWEgPSB7XG4gIGJhc2tldDogQmFza2V0LFxuICBwcm9kdWN0czogUHJvZHVjdHNcbn1cblxudmFyIEFwcCA9IHN1cGVybW9kZWxzKGFwcFNjaGVtYSlcblxud2luZG93LmFwcHMgPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbCkge1xuICB2YXIgYXBwID0gbmV3IEFwcCh7XG4gICAgYmFza2V0OiBuZXcgQmFza2V0KGJhc2tldERhdGEpLFxuICAgIHByb2R1Y3RzOiBuZXcgUHJvZHVjdHMocHJvZHVjdHNEYXRhKVxuICB9KVxuXG4gIGZ1bmN0aW9uIHJlbmRlciAoKSB7XG4gICAgcGF0Y2goZWwsIHRlbXBsYXRlLCBhcHApXG4gIH1cbiAgcmVuZGVyKClcblxuICAvKiBwYXRjaCB0aGUgZG9tIHdoZW5ldmVyIHRoZSBhcHAgbW9kZWwgY2hhbmdlcy4gKi9cbiAgYXBwLm9uKCdjaGFuZ2UnLCByZW5kZXIpXG5cbiAgd2luZG93LmFwcHMucHVzaChhcHApXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlc2NyaXB0aW9uIChkYXRhKSB7XG5lbGVtZW50T3BlbihcImgzXCIpXG4gIHRleHQoXCIgXFxcbiAgICBUb3RhbCBsaW5lcyBcIiArIChkYXRhLml0ZW1zLmxlbmd0aCkgKyBcIiwgdG90YWwgcXVhbnRpdHkgXCIgKyAoZGF0YS50b3RhbFF1YW50aXR5KSArIFwiIFxcXG4gIFwiKVxuZWxlbWVudENsb3NlKFwiaDNcIilcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz1bXG4gIHtcbiAgICBcInByb2R1Y3RJZFwiOiBcImRzZjFmXCIsXG4gICAgXCJwcm9kdWN0TmFtZVwiOiBcIkFwcGxlIGlQb2QgdG91Y2ggMzJHQiA1dGggR2VuZXJhdGlvbiAtIFdoaXRlXCIsXG4gICAgXCJwcmljZVwiOiAxOTAuNTAsXG4gICAgXCJkaXNjb3VudFBlcmNlbnRcIjogMCxcbiAgICBcImltYWdlXCI6IFwiYmFza2V0L2ltZy9hcHBsZS5qcGdcIlxuICB9LFxuICB7XG4gICAgXCJwcm9kdWN0SWRcIjogXCJkcjZoYlwiLFxuICAgIFwicHJvZHVjdE5hbWVcIjogXCJTYW1zdW5nIEdhbGF4eSBUYWIgMyA3LWluY2ggLSAoQmxhY2ssIFdpLUZpKVwiLFxuICAgIFwicHJpY2VcIjogMTEwLFxuICAgIFwiZGlzY291bnRQZXJjZW50XCI6IDAuMixcbiAgICBcImltYWdlXCI6IFwiYmFza2V0L2ltZy9zYW1zdW5nLmpwZ1wiXG4gIH0sXG4gIHtcbiAgICBcInByb2R1Y3RJZFwiOiBcInNkcjRmXCIsXG4gICAgXCJwcm9kdWN0TmFtZVwiOiBcIkJvc2UgUXVpZXRDb21mb3J0IDIwIEFjb3VzdGljIE5vaXNlIENhbmNlbGxpbmcgSGVhZHBob25lc1wiLFxuICAgIFwicHJpY2VcIjogMjUwLFxuICAgIFwiZGlzY291bnRQZXJjZW50XCI6IDAuMTI1LFxuICAgIFwiaW1hZ2VcIjogXCJiYXNrZXQvaW1nL2Jvc2UuanBnXCJcbiAgfVxuXVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiYXNrZXQgKG1vZGVsKSB7XG4gIHZhciBiYXNrZXQgPSBtb2RlbC5iYXNrZXRcbiAgICAgIHZhciBwcm9kdWN0cyA9IG1vZGVsLnByb2R1Y3RzXG4gICAgICB2YXIgbGluZXNTdW1tYXJ5ID0gcmVxdWlyZSgnLi9saW5lcy1zdW1tYXJ5Lmh0bWwnKVxuICAgICAgdmFyIHRvdGFsU3VtbWFyeSA9IHJlcXVpcmUoJy4vdG90YWwtc3VtbWFyeS5odG1sJylcblxuICAgICAgZnVuY3Rpb24gYWRkIChwcm9kdWN0KSB7XG4gICAgICAgIHZhciBpdGVtcyA9IGJhc2tldC5pdGVtc1xuXG4gICAgICAgIHZhciBleGlzdGluZyA9IGl0ZW1zLmZpbmQoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gaXRlbS5wcm9kdWN0SWQgPT09IHByb2R1Y3QucHJvZHVjdElkXG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgICAgZXhpc3RpbmcucXVhbnRpdHkrK1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBpdGVtID0gaXRlbXMuY3JlYXRlKClcbiAgICAgICAgICBpdGVtLnByb2R1Y3RJZCA9IHByb2R1Y3QucHJvZHVjdElkXG4gICAgICAgICAgaXRlbS5xdWFudGl0eSA9IDFcbiAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmVtb3ZlICgkaW5kZXgpIHtcbiAgICAgICAgYmFza2V0Lml0ZW1zLnNwbGljZSgkaW5kZXgsIDEpXG4gICAgICB9XG4gIGlmIChiYXNrZXQuaXRlbXMubGVuZ3RoKSB7XG4gICAgZWxlbWVudE9wZW4oXCJ0YWJsZVwiLCBudWxsLCBbXCJjbGFzc1wiLCBcInRhYmxlXCJdKVxuICAgICAgZWxlbWVudE9wZW4oXCJ0aGVhZFwiKVxuICAgICAgICBlbGVtZW50T3BlbihcInRyXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJ0aFwiKVxuICAgICAgICAgICAgdGV4dChcImlkXCIpXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwidGhcIilcbiAgICAgICAgICBlbGVtZW50T3BlbihcInRoXCIpXG4gICAgICAgICAgICB0ZXh0KFwicHJvZHVjdElkXCIpXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwidGhcIilcbiAgICAgICAgICBlbGVtZW50T3BlbihcInRoXCIpXG4gICAgICAgICAgICB0ZXh0KFwicHJvZHVjdE5hbWVcIilcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0aFwiKVxuICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGhcIilcbiAgICAgICAgICAgIHRleHQoXCJxdWFudGl0eVwiKVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRoXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJ0aFwiKVxuICAgICAgICAgICAgdGV4dChcInByaWNlXCIpXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwidGhcIilcbiAgICAgICAgICBlbGVtZW50T3BlbihcInRoXCIpXG4gICAgICAgICAgICB0ZXh0KFwiZGlzY291bnRQZXJjZW50XCIpXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwidGhcIilcbiAgICAgICAgICBlbGVtZW50T3BlbihcInRoXCIpXG4gICAgICAgICAgICB0ZXh0KFwiY29zdFwiKVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRoXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJ0aFwiKVxuICAgICAgICAgICAgbGluZXNTdW1tYXJ5KGJhc2tldClcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0aFwiKVxuICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0clwiKVxuICAgICAgZWxlbWVudENsb3NlKFwidGhlYWRcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwidGJvZHlcIilcbiAgICAgICAgOyhBcnJheS5pc0FycmF5KGJhc2tldC5pdGVtcykgPyBiYXNrZXQuaXRlbXMgOiBPYmplY3Qua2V5cyhiYXNrZXQuaXRlbXMpKS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0sICRpbmRleCkge1xuICAgICAgICAgIGVsZW1lbnRPcGVuKFwidHJcIiwgaXRlbS5pZClcbiAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICAgICAgdGV4dChcIlwiICsgKGl0ZW0uaWQpICsgXCJcIilcbiAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgICAgIHRleHQoXCJcIiArIChpdGVtLnByb2R1Y3QucHJvZHVjdElkKSArIFwiXCIpXG4gICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgICAgICB0ZXh0KFwiXCIgKyAoaXRlbS5wcm9kdWN0LnByb2R1Y3ROYW1lKSArIFwiXCIpXG4gICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgICAgICBlbGVtZW50T3BlbihcImlucHV0XCIsIG51bGwsIFtcInR5cGVcIiwgXCJudW1iZXJcIl0sIFwidmFsdWVcIiwgaXRlbS5xdWFudGl0eSwgXCJvbmNoYW5nZVwiLCBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gdGhpcztcbiAgICAgICAgICAgICAgaXRlbS5xdWFudGl0eSA9IHRoaXMudmFsdWV9KVxuICAgICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJpbnB1dFwiKVxuICAgICAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICAgICAgdGV4dChcIlwiICsgKGl0ZW0ucHJvZHVjdC5wcmljZSkgKyBcIlwiKVxuICAgICAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICAgICAgdGV4dChcIlwiICsgKGl0ZW0ucHJvZHVjdC5kaXNjb3VudFBlcmNlbnQgKiAxMDAgKyAnICUnKSArIFwiXCIpXG4gICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgICAgICB0ZXh0KFwiXCIgKyAoaXRlbS5jb3N0LnRvRml4ZWQoMikpICsgXCJcIilcbiAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwiYnV0dG9uXCIsIG51bGwsIFtcImNsYXNzXCIsIFwiYnRuIGJ0bi1zbSBidG4tZGFuZ2VyXCJdLCBcIm9uY2xpY2tcIiwgZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHZhciAkZWxlbWVudCA9IHRoaXM7XG4gICAgICAgICAgICAgIHJlbW92ZSgkaW5kZXgpfSlcbiAgICAgICAgICAgICAgICB0ZXh0KFwiUmVtb3ZlXCIpXG4gICAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcImJ1dHRvblwiKVxuICAgICAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0clwiKVxuICAgICAgICB9LCBiYXNrZXQuaXRlbXMpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJ0Ym9keVwiKVxuICAgICAgdG90YWxTdW1tYXJ5KGJhc2tldClcbiAgICBlbGVtZW50Q2xvc2UoXCJ0YWJsZVwiKVxuICB9XG4gIGlmICghYmFza2V0Lml0ZW1zLmxlbmd0aCkge1xuICAgIHRleHQoXCIgXFxcbiAgICAgICAgWW91IGhhdmUgbm8gaXRlbXMgaW4geW91ciBiYXNrZXQhIFxcXG4gICAgICBcIilcbiAgfVxuICA7KEFycmF5LmlzQXJyYXkocHJvZHVjdHMpID8gcHJvZHVjdHMgOiBPYmplY3Qua2V5cyhwcm9kdWN0cykpLmZvckVhY2goZnVuY3Rpb24ocHJvZHVjdCwgJGluZGV4KSB7XG4gICAgZWxlbWVudE9wZW4oXCJkaXZcIiwgJGluZGV4LCBbXCJzdHlsZVwiLCBcIndpZHRoOiAzMyU7IGZsb2F0OiBsZWZ0O1wiXSlcbiAgICAgIGVsZW1lbnRPcGVuKFwiZGl2XCIpXG4gICAgICAgIHRleHQoXCJcIiArIChwcm9kdWN0LnByb2R1Y3RJZCkgKyBcIlwiKVxuICAgICAgZWxlbWVudENsb3NlKFwiZGl2XCIpXG4gICAgICBlbGVtZW50T3BlbihcImRpdlwiKVxuICAgICAgICB0ZXh0KFwiXCIgKyAocHJvZHVjdC5wcm9kdWN0TmFtZSkgKyBcIlwiKVxuICAgICAgZWxlbWVudENsb3NlKFwiZGl2XCIpXG4gICAgICBlbGVtZW50T3BlbihcImRpdlwiKVxuICAgICAgICB0ZXh0KFwiXCIgKyAocHJvZHVjdC5wcmljZSkgKyBcIlwiKVxuICAgICAgZWxlbWVudENsb3NlKFwiZGl2XCIpXG4gICAgICBlbGVtZW50T3BlbihcImRpdlwiKVxuICAgICAgICB0ZXh0KFwiXCIgKyAocHJvZHVjdC5kaXNjb3VudFBlcmNlbnQgKiAxMDAgKyAnICUnKSArIFwiXCIpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwiZGl2XCIpXG4gICAgICAgIHRleHQoXCJcIiArIChwcm9kdWN0LmNvc3QpICsgXCJcIilcbiAgICAgIGVsZW1lbnRDbG9zZShcImRpdlwiKVxuICAgICAgZWxlbWVudE9wZW4oXCJpbWdcIiwgbnVsbCwgW1wic3R5bGVcIiwgXCJtYXgtd2lkdGg6IDI0MHB4OyBtYXgtaGVpZ2h0OiAyMDBweDtcIl0sIFwic3JjXCIsIHByb2R1Y3QuaW1hZ2UpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJpbWdcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwiYnV0dG9uXCIsIG51bGwsIFtcImNsYXNzXCIsIFwiYnRuIGJ0bi1zbSBidG4tc3VjY2Vzc1wiXSwgXCJvbmNsaWNrXCIsIGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciAkZWxlbWVudCA9IHRoaXM7XG4gICAgICBhZGQocHJvZHVjdCl9KVxuICAgICAgICB0ZXh0KFwiQWRkIHRvIGJhc2tldFwiKVxuICAgICAgZWxlbWVudENsb3NlKFwiYnV0dG9uXCIpXG4gICAgZWxlbWVudENsb3NlKFwiZGl2XCIpXG4gIH0sIHByb2R1Y3RzKVxuICA7KEFycmF5LmlzQXJyYXkobW9kZWwpID8gbW9kZWwgOiBPYmplY3Qua2V5cyhtb2RlbCkpLmZvckVhY2goZnVuY3Rpb24oa2V5LCAkaW5kZXgpIHtcbiAgICBlbGVtZW50T3BlbihcImRpdlwiLCBrZXkpXG4gICAgICBlbGVtZW50T3BlbihcInNwYW5cIilcbiAgICAgICAgdGV4dChcIlwiICsgKGtleSkgKyBcIlwiKVxuICAgICAgZWxlbWVudENsb3NlKFwic3BhblwiKVxuICAgICAgZWxlbWVudE9wZW4oXCJzcGFuXCIpXG4gICAgICAgIHRleHQoXCJcIiArICgkaW5kZXgpICsgXCJcIilcbiAgICAgIGVsZW1lbnRDbG9zZShcInNwYW5cIilcbiAgICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbiAgfSwgbW9kZWwpXG4gIGVsZW1lbnRPcGVuKFwicHJlXCIpXG4gICAgZWxlbWVudE9wZW4oXCJjb2RlXCIpXG4gICAgICB0ZXh0KFwiIFxcXG4gICAgICAgICAgXCIgKyAoSlNPTi5zdHJpbmdpZnkobW9kZWwsIG51bGwsIDIpKSArIFwiIFxcXG4gICAgICAgICAgXCIpXG4gICAgZWxlbWVudENsb3NlKFwiY29kZVwiKVxuICAgIGVsZW1lbnRPcGVuKFwicHJlXCIpXG4gICAgZWxlbWVudENsb3NlKFwicHJlXCIpXG4gIGVsZW1lbnRDbG9zZShcInByZVwiKVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVzY3JpcHRpb24gKGRhdGEpIHtcbmVsZW1lbnRPcGVuKFwidGZvb3RcIilcbiAgZWxlbWVudE9wZW4oXCJ0clwiKVxuICAgIGVsZW1lbnRPcGVuKFwidGRcIiwgbnVsbCwgW1wiY29sc3BhblwiLCBcIjhcIl0pXG4gICAgICBlbGVtZW50T3BlbihcImgzXCIpXG4gICAgICAgIHRleHQoXCIgXFxcbiAgICAgICAgICAgICAgICBcIiArIChkYXRhLnRvdGFsQ29zdCkgKyBcIiBcXFxuICAgICAgICAgICAgICBcIilcbiAgICAgIGVsZW1lbnRDbG9zZShcImgzXCIpXG4gICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgZWxlbWVudENsb3NlKFwidHJcIilcbmVsZW1lbnRDbG9zZShcInRmb290XCIpXG59O1xuIiwiZnVuY3Rpb24gcm5kc3RyICgpIHtcbiAgcmV0dXJuIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA1KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcm5kc3RyOiB7XG4gICAgX192YWx1ZTogcm5kc3RyXG4gIH1cbn1cbiIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOiB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDogZmFjdG9yeShnbG9iYWwuSW5jcmVtZW50YWxET00gPSB7fSk7XG59KSh0aGlzLCBmdW5jdGlvbiAoZXhwb3J0cykge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIENvcHlyaWdodCAyMDE1IFRoZSBJbmNyZW1lbnRhbCBET00gQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAgICpcbiAgICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAgICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAgICpcbiAgICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgICpcbiAgICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICAgKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gICAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICAgKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gICAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICAgKi9cblxuICAvKipcbiAgICogQHR5cGUge1RyZWVXYWxrZXJ9XG4gICAqL1xuICB2YXIgd2Fsa2VyXztcblxuICAvKipcbiAgICogQHJldHVybiB7VHJlZVdhbGtlcn0gdGhlIGN1cnJlbnQgVHJlZVdhbGtlclxuICAgKi9cbiAgdmFyIGdldFdhbGtlciA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gd2Fsa2VyXztcbiAgfTtcblxuICAvKipcbiAgICogU2V0cyB0aGUgY3VycmVudCBUcmVlV2Fsa2VyXG4gICAqIEBwYXJhbSB7VHJlZVdhbGtlcn0gd2Fsa2VyXG4gICAqL1xuICB2YXIgc2V0V2Fsa2VyID0gZnVuY3Rpb24gKHdhbGtlcikge1xuICAgIHdhbGtlcl8gPSB3YWxrZXI7XG4gIH07XG5cbiAgLyoqXG4gICAqIENvcHlyaWdodCAyMDE1IFRoZSBJbmNyZW1lbnRhbCBET00gQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAgICpcbiAgICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAgICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAgICpcbiAgICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgICpcbiAgICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICAgKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gICAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICAgKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gICAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICAgKi9cblxuICAvKipcbiAgICogS2VlcHMgdHJhY2sgb2YgaW5mb3JtYXRpb24gbmVlZGVkIHRvIHBlcmZvcm0gZGlmZnMgZm9yIGEgZ2l2ZW4gRE9NIG5vZGUuXG4gICAqIEBwYXJhbSB7P3N0cmluZ30gbm9kZU5hbWVcbiAgICogQHBhcmFtIHs/c3RyaW5nfSBrZXlcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBmdW5jdGlvbiBOb2RlRGF0YShub2RlTmFtZSwga2V5KSB7XG4gICAgLyoqXG4gICAgICogVGhlIGF0dHJpYnV0ZXMgYW5kIHRoZWlyIHZhbHVlcy5cbiAgICAgKiBAY29uc3RcbiAgICAgKi9cbiAgICB0aGlzLmF0dHJzID0ge307XG5cbiAgICAvKipcbiAgICAgKiBBbiBhcnJheSBvZiBhdHRyaWJ1dGUgbmFtZS92YWx1ZSBwYWlycywgdXNlZCBmb3IgcXVpY2tseSBkaWZmaW5nIHRoZVxuICAgICAqIGluY29tbWluZyBhdHRyaWJ1dGVzIHRvIHNlZSBpZiB0aGUgRE9NIG5vZGUncyBhdHRyaWJ1dGVzIG5lZWQgdG8gYmVcbiAgICAgKiB1cGRhdGVkLlxuICAgICAqIEBjb25zdCB7QXJyYXk8Kj59XG4gICAgICovXG4gICAgdGhpcy5hdHRyc0FyciA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGluY29taW5nIGF0dHJpYnV0ZXMgZm9yIHRoaXMgTm9kZSwgYmVmb3JlIHRoZXkgYXJlIHVwZGF0ZWQuXG4gICAgICogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgKj59XG4gICAgICovXG4gICAgdGhpcy5uZXdBdHRycyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGtleSB1c2VkIHRvIGlkZW50aWZ5IHRoaXMgbm9kZSwgdXNlZCB0byBwcmVzZXJ2ZSBET00gbm9kZXMgd2hlbiB0aGV5XG4gICAgICogbW92ZSB3aXRoaW4gdGhlaXIgcGFyZW50LlxuICAgICAqIEBjb25zdFxuICAgICAqL1xuICAgIHRoaXMua2V5ID0ga2V5O1xuXG4gICAgLyoqXG4gICAgICogS2VlcHMgdHJhY2sgb2YgY2hpbGRyZW4gd2l0aGluIHRoaXMgbm9kZSBieSB0aGVpciBrZXkuXG4gICAgICogez9PYmplY3Q8c3RyaW5nLCAhRWxlbWVudD59XG4gICAgICovXG4gICAgdGhpcy5rZXlNYXAgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBvciBub3QgdGhlIGtleU1hcCBpcyBjdXJyZW50bHkgdmFsaWQuXG4gICAgICoge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5rZXlNYXBWYWxpZCA9IHRydWU7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbGFzdCBjaGlsZCB0byBoYXZlIGJlZW4gdmlzaXRlZCB3aXRoaW4gdGhlIGN1cnJlbnQgcGFzcy5cbiAgICAgKiB7P05vZGV9XG4gICAgICovXG4gICAgdGhpcy5sYXN0VmlzaXRlZENoaWxkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBub2RlIG5hbWUgZm9yIHRoaXMgbm9kZS5cbiAgICAgKiBAY29uc3RcbiAgICAgKi9cbiAgICB0aGlzLm5vZGVOYW1lID0gbm9kZU5hbWU7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3Qge3N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLnRleHQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGEgTm9kZURhdGEgb2JqZWN0IGZvciBhIE5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB7IU5vZGV9IG5vZGUgVGhlIG5vZGUgdG8gaW5pdGlhbGl6ZSBkYXRhIGZvci5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5vZGVOYW1lIFRoZSBub2RlIG5hbWUgb2Ygbm9kZS5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSBrZXkgVGhlIGtleSB0aGF0IGlkZW50aWZpZXMgdGhlIG5vZGUuXG4gICAqIEByZXR1cm4geyFOb2RlRGF0YX0gVGhlIG5ld2x5IGluaXRpYWxpemVkIGRhdGEgb2JqZWN0XG4gICAqL1xuICB2YXIgaW5pdERhdGEgPSBmdW5jdGlvbiAobm9kZSwgbm9kZU5hbWUsIGtleSkge1xuICAgIHZhciBkYXRhID0gbmV3IE5vZGVEYXRhKG5vZGVOYW1lLCBrZXkpO1xuICAgIG5vZGVbJ19faW5jcmVtZW50YWxET01EYXRhJ10gPSBkYXRhO1xuICAgIHJldHVybiBkYXRhO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIE5vZGVEYXRhIG9iamVjdCBmb3IgYSBOb2RlLCBjcmVhdGluZyBpdCBpZiBuZWNlc3NhcnkuXG4gICAqXG4gICAqIEBwYXJhbSB7IU5vZGV9IG5vZGUgVGhlIG5vZGUgdG8gcmV0cmlldmUgdGhlIGRhdGEgZm9yLlxuICAgKiBAcmV0dXJuIHtOb2RlRGF0YX0gVGhlIE5vZGVEYXRhIGZvciB0aGlzIE5vZGUuXG4gICAqL1xuICB2YXIgZ2V0RGF0YSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgdmFyIGRhdGEgPSBub2RlWydfX2luY3JlbWVudGFsRE9NRGF0YSddO1xuXG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICB2YXIgbm9kZU5hbWUgPSBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICB2YXIga2V5ID0gbnVsbDtcblxuICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgIGtleSA9IG5vZGUuZ2V0QXR0cmlidXRlKCdrZXknKTtcbiAgICAgIH1cblxuICAgICAgZGF0YSA9IGluaXREYXRhKG5vZGUsIG5vZGVOYW1lLCBrZXkpO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGFuIGF0dHJpYnV0ZSBvciBwcm9wZXJ0eSB0byBhIGdpdmVuIEVsZW1lbnQuIElmIHRoZSB2YWx1ZSBpcyBudWxsXG4gICAqIG9yIHVuZGVmaW5lZCwgaXQgaXMgcmVtb3ZlZCBmcm9tIHRoZSBFbGVtZW50LiBPdGhlcndpc2UsIHRoZSB2YWx1ZSBpcyBzZXRcbiAgICogYXMgYW4gYXR0cmlidXRlLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgYXR0cmlidXRlJ3MgbmFtZS5cbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgYXR0cmlidXRlJ3MgdmFsdWUuXG4gICAqL1xuICB2YXIgYXBwbHlBdHRyID0gZnVuY3Rpb24gKGVsLCBuYW1lLCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGEgcHJvcGVydHkgdG8gYSBnaXZlbiBFbGVtZW50LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgcHJvcGVydHkncyBuYW1lLlxuICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBwcm9wZXJ0eSdzIHZhbHVlLlxuICAgKi9cbiAgdmFyIGFwcGx5UHJvcCA9IGZ1bmN0aW9uIChlbCwgbmFtZSwgdmFsdWUpIHtcbiAgICBlbFtuYW1lXSA9IHZhbHVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGEgc3R5bGUgdG8gYW4gRWxlbWVudC4gTm8gdmVuZG9yIHByZWZpeCBleHBhbnNpb24gaXMgZG9uZSBmb3JcbiAgICogcHJvcGVydHkgbmFtZXMvdmFsdWVzLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgYXR0cmlidXRlJ3MgbmFtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd8T2JqZWN0PHN0cmluZyxzdHJpbmc+fSBzdHlsZSBUaGUgc3R5bGUgdG8gc2V0LiBFaXRoZXIgYVxuICAgKiAgICAgc3RyaW5nIG9mIGNzcyBvciBhbiBvYmplY3QgY29udGFpbmluZyBwcm9wZXJ0eS12YWx1ZSBwYWlycy5cbiAgICovXG4gIHZhciBhcHBseVN0eWxlID0gZnVuY3Rpb24gKGVsLCBuYW1lLCBzdHlsZSkge1xuICAgIGlmICh0eXBlb2Ygc3R5bGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbC5zdHlsZS5jc3NUZXh0ID0gc3R5bGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLnN0eWxlLmNzc1RleHQgPSAnJztcblxuICAgICAgZm9yICh2YXIgcHJvcCBpbiBzdHlsZSkge1xuICAgICAgICBlbC5zdHlsZVtwcm9wXSA9IHN0eWxlW3Byb3BdO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogVXBkYXRlcyBhIHNpbmdsZSBhdHRyaWJ1dGUgb24gYW4gRWxlbWVudC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIGF0dHJpYnV0ZSdzIG5hbWUuXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIGF0dHJpYnV0ZSdzIHZhbHVlLiBJZiB0aGUgdmFsdWUgaXMgYW4gb2JqZWN0IG9yXG4gICAqICAgICBmdW5jdGlvbiBpdCBpcyBzZXQgb24gdGhlIEVsZW1lbnQsIG90aGVyd2lzZSwgaXQgaXMgc2V0IGFzIGFuIEhUTUxcbiAgICogICAgIGF0dHJpYnV0ZS5cbiAgICovXG4gIHZhciBhcHBseUF0dHJpYnV0ZVR5cGVkID0gZnVuY3Rpb24gKGVsLCBuYW1lLCB2YWx1ZSkge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuXG4gICAgaWYgKHR5cGUgPT09ICdvYmplY3QnIHx8IHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFwcGx5UHJvcChlbCwgbmFtZSwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcHBseUF0dHIoZWwsIG5hbWUsIHZhbHVlKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxzIHRoZSBhcHByb3ByaWF0ZSBhdHRyaWJ1dGUgbXV0YXRvciBmb3IgdGhpcyBhdHRyaWJ1dGUuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBhdHRyaWJ1dGUncyBuYW1lLlxuICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBhdHRyaWJ1dGUncyB2YWx1ZS5cbiAgICovXG4gIHZhciB1cGRhdGVBdHRyaWJ1dGUgPSBmdW5jdGlvbiAoZWwsIG5hbWUsIHZhbHVlKSB7XG4gICAgdmFyIGRhdGEgPSBnZXREYXRhKGVsKTtcbiAgICB2YXIgYXR0cnMgPSBkYXRhLmF0dHJzO1xuXG4gICAgaWYgKGF0dHJzW25hbWVdID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBtdXRhdG9yID0gX211dGF0b3JzW25hbWVdIHx8IF9tdXRhdG9ycy5fX2FsbDtcbiAgICBtdXRhdG9yKGVsLCBuYW1lLCB2YWx1ZSk7XG5cbiAgICBhdHRyc1tuYW1lXSA9IHZhbHVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFeHBvc2VzIG91ciBkZWZhdWx0IGF0dHJpYnV0ZSBtdXRhdG9ycyBwdWJsaWNseSwgc28gdGhleSBtYXkgYmUgdXNlZCBpblxuICAgKiBjdXN0b20gbXV0YXRvcnMuXG4gICAqIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsIGZ1bmN0aW9uKCFFbGVtZW50LCBzdHJpbmcsICopPn1cbiAgICovXG4gIHZhciBfZGVmYXVsdHMgPSB7XG4gICAgYXBwbHlBdHRyOiBhcHBseUF0dHIsXG4gICAgYXBwbHlQcm9wOiBhcHBseVByb3AsXG4gICAgYXBwbHlTdHlsZTogYXBwbHlTdHlsZVxuICB9O1xuXG4gIC8qKlxuICAgKiBBIHB1YmxpY2x5IG11dGFibGUgb2JqZWN0IHRvIHByb3ZpZGUgY3VzdG9tIG11dGF0b3JzIGZvciBhdHRyaWJ1dGVzLlxuICAgKiBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCBmdW5jdGlvbighRWxlbWVudCwgc3RyaW5nLCAqKT59XG4gICAqL1xuICB2YXIgX211dGF0b3JzID0ge1xuICAgIC8vIFNwZWNpYWwgZ2VuZXJpYyBtdXRhdG9yIHRoYXQncyBjYWxsZWQgZm9yIGFueSBhdHRyaWJ1dGUgdGhhdCBkb2VzIG5vdFxuICAgIC8vIGhhdmUgYSBzcGVjaWZpYyBtdXRhdG9yLlxuICAgIF9fYWxsOiBhcHBseUF0dHJpYnV0ZVR5cGVkLFxuXG4gICAgLy8gU3BlY2lhbCBjYXNlIHRoZSBzdHlsZSBhdHRyaWJ1dGVcbiAgICBzdHlsZTogYXBwbHlTdHlsZVxuICB9O1xuXG4gIHZhciBTVkdfTlMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuXG4gIC8qKlxuICAgKiBFbnRlcnMgYSB0YWcsIGNoZWNraW5nIHRvIHNlZSBpZiBpdCBpcyBhIG5hbWVzcGFjZSBib3VuZGFyeSwgYW5kIGlmIHNvLFxuICAgKiB1cGRhdGVzIHRoZSBjdXJyZW50IG5hbWVzcGFjZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyBUaGUgdGFnIHRvIGVudGVyLlxuICAgKi9cbiAgdmFyIGVudGVyVGFnID0gZnVuY3Rpb24gKHRhZykge1xuICAgIGlmICh0YWcgPT09ICdzdmcnKSB7XG4gICAgICBnZXRXYWxrZXIoKS5lbnRlck5hbWVzcGFjZShTVkdfTlMpO1xuICAgIH0gZWxzZSBpZiAodGFnID09PSAnZm9yZWlnbk9iamVjdCcpIHtcbiAgICAgIGdldFdhbGtlcigpLmVudGVyTmFtZXNwYWNlKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBFeGl0cyBhIHRhZywgY2hlY2tpbmcgdG8gc2VlIGlmIGl0IGlzIGEgbmFtZXNwYWNlIGJvdW5kYXJ5LCBhbmQgaWYgc28sXG4gICAqIHVwZGF0ZXMgdGhlIGN1cnJlbnQgbmFtZXNwYWNlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSB0YWcgdG8gZW50ZXIuXG4gICAqL1xuICB2YXIgZXhpdFRhZyA9IGZ1bmN0aW9uICh0YWcpIHtcbiAgICBpZiAodGFnID09PSAnc3ZnJyB8fCB0YWcgPT09ICdmb3JlaWduT2JqZWN0Jykge1xuICAgICAgZ2V0V2Fsa2VyKCkuZXhpdE5hbWVzcGFjZSgpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogR2V0cyB0aGUgbmFtZXNwYWNlIHRvIGNyZWF0ZSBhbiBlbGVtZW50IChvZiBhIGdpdmVuIHRhZykgaW4uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIHRhZyB0byBnZXQgdGhlIG5hbWVzcGFjZSBmb3IuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIG5hbWVzcGFjZSB0byBjcmVhdGUgdGhlIHRhZyBpbi5cbiAgICovXG4gIHZhciBnZXROYW1lc3BhY2VGb3JUYWcgPSBmdW5jdGlvbiAodGFnKSB7XG4gICAgaWYgKHRhZyA9PT0gJ3N2ZycpIHtcbiAgICAgIHJldHVybiBTVkdfTlM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldFdhbGtlcigpLmdldEN1cnJlbnROYW1lc3BhY2UoKTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBFbGVtZW50LlxuICAgKiBAcGFyYW0geyFEb2N1bWVudH0gZG9jIFRoZSBkb2N1bWVudCB3aXRoIHdoaWNoIHRvIGNyZWF0ZSB0aGUgRWxlbWVudC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyBUaGUgdGFnIGZvciB0aGUgRWxlbWVudC5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSBrZXkgQSBrZXkgdG8gaWRlbnRpZnkgdGhlIEVsZW1lbnQuXG4gICAqIEBwYXJhbSB7P0FycmF5PCo+fSBzdGF0aWNzIEFuIGFycmF5IG9mIGF0dHJpYnV0ZSBuYW1lL3ZhbHVlIHBhaXJzIG9mXG4gICAqICAgICB0aGUgc3RhdGljIGF0dHJpYnV0ZXMgZm9yIHRoZSBFbGVtZW50LlxuICAgKiBAcmV0dXJuIHshRWxlbWVudH1cbiAgICovXG4gIHZhciBjcmVhdGVFbGVtZW50ID0gZnVuY3Rpb24gKGRvYywgdGFnLCBrZXksIHN0YXRpY3MpIHtcbiAgICB2YXIgbmFtZXNwYWNlID0gZ2V0TmFtZXNwYWNlRm9yVGFnKHRhZyk7XG4gICAgdmFyIGVsO1xuXG4gICAgaWYgKG5hbWVzcGFjZSkge1xuICAgICAgZWwgPSBkb2MuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZSwgdGFnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwgPSBkb2MuY3JlYXRlRWxlbWVudCh0YWcpO1xuICAgIH1cblxuICAgIGluaXREYXRhKGVsLCB0YWcsIGtleSk7XG5cbiAgICBpZiAoc3RhdGljcykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGF0aWNzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIHVwZGF0ZUF0dHJpYnV0ZShlbCwgc3RhdGljc1tpXSwgc3RhdGljc1tpICsgMV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBlbDtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIE5vZGUsIGVpdGhlciBhIFRleHQgb3IgYW4gRWxlbWVudCBkZXBlbmRpbmcgb24gdGhlIG5vZGUgbmFtZVxuICAgKiBwcm92aWRlZC5cbiAgICogQHBhcmFtIHshRG9jdW1lbnR9IGRvYyBUaGUgZG9jdW1lbnQgd2l0aCB3aGljaCB0byBjcmVhdGUgdGhlIE5vZGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBub2RlTmFtZSBUaGUgdGFnIGlmIGNyZWF0aW5nIGFuIGVsZW1lbnQgb3IgI3RleHQgdG8gY3JlYXRlXG4gICAqICAgICBhIFRleHQuXG4gICAqIEBwYXJhbSB7P3N0cmluZ30ga2V5IEEga2V5IHRvIGlkZW50aWZ5IHRoZSBFbGVtZW50LlxuICAgKiBAcGFyYW0gez9BcnJheTwqPn0gc3RhdGljcyBUaGUgc3RhdGljIGRhdGEgdG8gaW5pdGlhbGl6ZSB0aGUgTm9kZVxuICAgKiAgICAgd2l0aC4gRm9yIGFuIEVsZW1lbnQsIGFuIGFycmF5IG9mIGF0dHJpYnV0ZSBuYW1lL3ZhbHVlIHBhaXJzIG9mXG4gICAqICAgICB0aGUgc3RhdGljIGF0dHJpYnV0ZXMgZm9yIHRoZSBFbGVtZW50LlxuICAgKiBAcmV0dXJuIHshTm9kZX1cbiAgICovXG4gIHZhciBjcmVhdGVOb2RlID0gZnVuY3Rpb24gKGRvYywgbm9kZU5hbWUsIGtleSwgc3RhdGljcykge1xuICAgIGlmIChub2RlTmFtZSA9PT0gJyN0ZXh0Jykge1xuICAgICAgcmV0dXJuIGRvYy5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoZG9jLCBub2RlTmFtZSwga2V5LCBzdGF0aWNzKTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG1hcHBpbmcgdGhhdCBjYW4gYmUgdXNlZCB0byBsb29rIHVwIGNoaWxkcmVuIHVzaW5nIGEga2V5LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbFxuICAgKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZywgIUVsZW1lbnQ+fSBBIG1hcHBpbmcgb2Yga2V5cyB0byB0aGUgY2hpbGRyZW4gb2YgdGhlXG4gICAqICAgICBFbGVtZW50LlxuICAgKi9cbiAgdmFyIGNyZWF0ZUtleU1hcCA9IGZ1bmN0aW9uIChlbCkge1xuICAgIHZhciBtYXAgPSB7fTtcbiAgICB2YXIgY2hpbGRyZW4gPSBlbC5jaGlsZHJlbjtcbiAgICB2YXIgY291bnQgPSBjaGlsZHJlbi5sZW5ndGg7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpICs9IDEpIHtcbiAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgdmFyIGtleSA9IGdldERhdGEoY2hpbGQpLmtleTtcblxuICAgICAgaWYgKGtleSkge1xuICAgICAgICBtYXBba2V5XSA9IGNoaWxkO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXA7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgbWFwcGluZyBvZiBrZXkgdG8gY2hpbGQgbm9kZSBmb3IgYSBnaXZlbiBFbGVtZW50LCBjcmVhdGluZyBpdFxuICAgKiBpZiBuZWNlc3NhcnkuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsXG4gICAqIEByZXR1cm4geyFPYmplY3Q8c3RyaW5nLCAhRWxlbWVudD59IEEgbWFwcGluZyBvZiBrZXlzIHRvIGNoaWxkIEVsZW1lbnRzXG4gICAqL1xuICB2YXIgZ2V0S2V5TWFwID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgdmFyIGRhdGEgPSBnZXREYXRhKGVsKTtcblxuICAgIGlmICghZGF0YS5rZXlNYXApIHtcbiAgICAgIGRhdGEua2V5TWFwID0gY3JlYXRlS2V5TWFwKGVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YS5rZXlNYXA7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhIGNoaWxkIGZyb20gdGhlIHBhcmVudCB3aXRoIHRoZSBnaXZlbiBrZXkuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHBhcmVudFxuICAgKiBAcGFyYW0gez9zdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHs/RWxlbWVudH0gVGhlIGNoaWxkIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGtleS5cbiAgICovXG4gIHZhciBnZXRDaGlsZCA9IGZ1bmN0aW9uIChwYXJlbnQsIGtleSkge1xuICAgIHJldHVybiBnZXRLZXlNYXAocGFyZW50KVtrZXldO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gZWxlbWVudCBhcyBiZWluZyBhIGNoaWxkLiBUaGUgcGFyZW50IHdpbGwga2VlcCB0cmFjayBvZiB0aGVcbiAgICogY2hpbGQgdXNpbmcgdGhlIGtleS4gVGhlIGNoaWxkIGNhbiBiZSByZXRyaWV2ZWQgdXNpbmcgdGhlIHNhbWUga2V5IHVzaW5nXG4gICAqIGdldEtleU1hcC4gVGhlIHByb3ZpZGVkIGtleSBzaG91bGQgYmUgdW5pcXVlIHdpdGhpbiB0aGUgcGFyZW50IEVsZW1lbnQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IHBhcmVudCBUaGUgcGFyZW50IG9mIGNoaWxkLlxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IEEga2V5IHRvIGlkZW50aWZ5IHRoZSBjaGlsZCB3aXRoLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBjaGlsZCBUaGUgY2hpbGQgdG8gcmVnaXN0ZXIuXG4gICAqL1xuICB2YXIgcmVnaXN0ZXJDaGlsZCA9IGZ1bmN0aW9uIChwYXJlbnQsIGtleSwgY2hpbGQpIHtcbiAgICBnZXRLZXlNYXAocGFyZW50KVtrZXldID0gY2hpbGQ7XG4gIH07XG5cbiAgaWYgKHVuZGVmaW5lZCAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgLyoqXG4gICAgKiBNYWtlcyBzdXJlIHRoYXQga2V5ZWQgRWxlbWVudCBtYXRjaGVzIHRoZSB0YWcgbmFtZSBwcm92aWRlZC5cbiAgICAqIEBwYXJhbSB7IUVsZW1lbnR9IG5vZGUgVGhlIG5vZGUgdGhhdCBpcyBiZWluZyBtYXRjaGVkLlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyBUaGUgdGFnIG5hbWUgb2YgdGhlIEVsZW1lbnQuXG4gICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIEVsZW1lbnQuXG4gICAgKi9cbiAgICB2YXIgYXNzZXJ0S2V5ZWRUYWdNYXRjaGVzID0gZnVuY3Rpb24gKG5vZGUsIHRhZywga2V5KSB7XG4gICAgICB2YXIgbm9kZU5hbWUgPSBnZXREYXRhKG5vZGUpLm5vZGVOYW1lO1xuICAgICAgaWYgKG5vZGVOYW1lICE9PSB0YWcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXYXMgZXhwZWN0aW5nIG5vZGUgd2l0aCBrZXkgXCInICsga2V5ICsgJ1wiIHRvIGJlIGEgJyArIHRhZyArICcsIG5vdCBhICcgKyBub2RlTmFtZSArICcuJyk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciBvciBub3QgYSBnaXZlbiBub2RlIG1hdGNoZXMgdGhlIHNwZWNpZmllZCBub2RlTmFtZSBhbmQga2V5LlxuICAgKlxuICAgKiBAcGFyYW0geyFOb2RlfSBub2RlIEFuIEhUTUwgbm9kZSwgdHlwaWNhbGx5IGFuIEhUTUxFbGVtZW50IG9yIFRleHQuXG4gICAqIEBwYXJhbSB7P3N0cmluZ30gbm9kZU5hbWUgVGhlIG5vZGVOYW1lIGZvciB0aGlzIG5vZGUuXG4gICAqIEBwYXJhbSB7P3N0cmluZ30ga2V5IEFuIG9wdGlvbmFsIGtleSB0aGF0IGlkZW50aWZpZXMgYSBub2RlLlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBub2RlIG1hdGNoZXMsIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIHZhciBtYXRjaGVzID0gZnVuY3Rpb24gKG5vZGUsIG5vZGVOYW1lLCBrZXkpIHtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEobm9kZSk7XG5cbiAgICAvLyBLZXkgY2hlY2sgaXMgZG9uZSB1c2luZyBkb3VibGUgZXF1YWxzIGFzIHdlIHdhbnQgdG8gdHJlYXQgYSBudWxsIGtleSB0aGVcbiAgICAvLyBzYW1lIGFzIHVuZGVmaW5lZC4gVGhpcyBzaG91bGQgYmUgb2theSBhcyB0aGUgb25seSB2YWx1ZXMgYWxsb3dlZCBhcmVcbiAgICAvLyBzdHJpbmdzLCBudWxsIGFuZCB1bmRlZmluZWQgc28gdGhlID09IHNlbWFudGljcyBhcmUgbm90IHRvbyB3ZWlyZC5cbiAgICByZXR1cm4ga2V5ID09IGRhdGEua2V5ICYmIG5vZGVOYW1lID09PSBkYXRhLm5vZGVOYW1lO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBbGlnbnMgdGhlIHZpcnR1YWwgRWxlbWVudCBkZWZpbml0aW9uIHdpdGggdGhlIGFjdHVhbCBET00sIG1vdmluZyB0aGVcbiAgICogY29ycmVzcG9uZGluZyBET00gbm9kZSB0byB0aGUgY29ycmVjdCBsb2NhdGlvbiBvciBjcmVhdGluZyBpdCBpZiBuZWNlc3NhcnkuXG4gICAqIEBwYXJhbSB7P3N0cmluZ30gbm9kZU5hbWUgRm9yIGFuIEVsZW1lbnQsIHRoaXMgc2hvdWxkIGJlIGEgdmFsaWQgdGFnIHN0cmluZy5cbiAgICogICAgIEZvciBhIFRleHQsIHRoaXMgc2hvdWxkIGJlICN0ZXh0LlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IGtleSBUaGUga2V5IHVzZWQgdG8gaWRlbnRpZnkgdGhpcyBlbGVtZW50LlxuICAgKiBAcGFyYW0gez9BcnJheTwqPn0gc3RhdGljcyBGb3IgYW4gRWxlbWVudCwgdGhpcyBzaG91bGQgYmUgYW4gYXJyYXkgb2ZcbiAgICogICAgIG5hbWUtdmFsdWUgcGFpcnMuXG4gICAqIEByZXR1cm4geyFOb2RlfSBUaGUgbWF0Y2hpbmcgbm9kZS5cbiAgICovXG4gIHZhciBhbGlnbldpdGhET00gPSBmdW5jdGlvbiAobm9kZU5hbWUsIGtleSwgc3RhdGljcykge1xuICAgIHZhciB3YWxrZXIgPSBnZXRXYWxrZXIoKTtcbiAgICB2YXIgY3VycmVudE5vZGUgPSB3YWxrZXIuY3VycmVudE5vZGU7XG4gICAgdmFyIHBhcmVudCA9IHdhbGtlci5nZXRDdXJyZW50UGFyZW50KCk7XG4gICAgdmFyIG1hdGNoaW5nTm9kZTtcblxuICAgIC8vIENoZWNrIHRvIHNlZSBpZiB3ZSBoYXZlIGEgbm9kZSB0byByZXVzZVxuICAgIGlmIChjdXJyZW50Tm9kZSAmJiBtYXRjaGVzKGN1cnJlbnROb2RlLCBub2RlTmFtZSwga2V5KSkge1xuICAgICAgbWF0Y2hpbmdOb2RlID0gY3VycmVudE5vZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBleGlzdGluZ05vZGUgPSBrZXkgJiYgZ2V0Q2hpbGQocGFyZW50LCBrZXkpO1xuXG4gICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlIG5vZGUgaGFzIG1vdmVkIHdpdGhpbiB0aGUgcGFyZW50IG9yIGlmIGEgbmV3IG9uZVxuICAgICAgLy8gc2hvdWxkIGJlIGNyZWF0ZWRcbiAgICAgIGlmIChleGlzdGluZ05vZGUpIHtcbiAgICAgICAgaWYgKHVuZGVmaW5lZCAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgYXNzZXJ0S2V5ZWRUYWdNYXRjaGVzKGV4aXN0aW5nTm9kZSwgbm9kZU5hbWUsIGtleSk7XG4gICAgICAgIH1cblxuICAgICAgICBtYXRjaGluZ05vZGUgPSBleGlzdGluZ05vZGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXRjaGluZ05vZGUgPSBjcmVhdGVOb2RlKHdhbGtlci5kb2MsIG5vZGVOYW1lLCBrZXksIHN0YXRpY3MpO1xuXG4gICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICByZWdpc3RlckNoaWxkKHBhcmVudCwga2V5LCBtYXRjaGluZ05vZGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBub2RlIGhhcyBhIGtleSwgcmVtb3ZlIGl0IGZyb20gdGhlIERPTSB0byBwcmV2ZW50IGEgbGFyZ2UgbnVtYmVyXG4gICAgICAvLyBvZiByZS1vcmRlcnMgaW4gdGhlIGNhc2UgdGhhdCBpdCBtb3ZlZCBmYXIgb3Igd2FzIGNvbXBsZXRlbHkgcmVtb3ZlZC5cbiAgICAgIC8vIFNpbmNlIHdlIGhvbGQgb24gdG8gYSByZWZlcmVuY2UgdGhyb3VnaCB0aGUga2V5TWFwLCB3ZSBjYW4gYWx3YXlzIGFkZCBpdFxuICAgICAgLy8gYmFjay5cbiAgICAgIGlmIChjdXJyZW50Tm9kZSAmJiBnZXREYXRhKGN1cnJlbnROb2RlKS5rZXkpIHtcbiAgICAgICAgcGFyZW50LnJlcGxhY2VDaGlsZChtYXRjaGluZ05vZGUsIGN1cnJlbnROb2RlKTtcbiAgICAgICAgZ2V0RGF0YShwYXJlbnQpLmtleU1hcFZhbGlkID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG1hdGNoaW5nTm9kZSwgY3VycmVudE5vZGUpO1xuICAgICAgfVxuXG4gICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBtYXRjaGluZ05vZGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hdGNoaW5nTm9kZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2xlYXJzIG91dCBhbnkgdW52aXNpdGVkIE5vZGVzLCBhcyB0aGUgY29ycmVzcG9uZGluZyB2aXJ0dWFsIGVsZW1lbnRcbiAgICogZnVuY3Rpb25zIHdlcmUgbmV2ZXIgY2FsbGVkIGZvciB0aGVtLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBub2RlXG4gICAqL1xuICB2YXIgY2xlYXJVbnZpc2l0ZWRET00gPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIHZhciBkYXRhID0gZ2V0RGF0YShub2RlKTtcbiAgICB2YXIga2V5TWFwID0gZGF0YS5rZXlNYXA7XG4gICAgdmFyIGtleU1hcFZhbGlkID0gZGF0YS5rZXlNYXBWYWxpZDtcbiAgICB2YXIgbGFzdENoaWxkID0gbm9kZS5sYXN0Q2hpbGQ7XG4gICAgdmFyIGxhc3RWaXNpdGVkQ2hpbGQgPSBkYXRhLmxhc3RWaXNpdGVkQ2hpbGQ7XG5cbiAgICBkYXRhLmxhc3RWaXNpdGVkQ2hpbGQgPSBudWxsO1xuXG4gICAgaWYgKGxhc3RDaGlsZCA9PT0gbGFzdFZpc2l0ZWRDaGlsZCAmJiBrZXlNYXBWYWxpZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHdoaWxlIChsYXN0Q2hpbGQgIT09IGxhc3RWaXNpdGVkQ2hpbGQpIHtcbiAgICAgIG5vZGUucmVtb3ZlQ2hpbGQobGFzdENoaWxkKTtcbiAgICAgIGxhc3RDaGlsZCA9IG5vZGUubGFzdENoaWxkO1xuICAgIH1cblxuICAgIC8vIENsZWFuIHRoZSBrZXlNYXAsIHJlbW92aW5nIGFueSB1bnVzdWVkIGtleXMuXG4gICAgZm9yICh2YXIga2V5IGluIGtleU1hcCkge1xuICAgICAgaWYgKCFrZXlNYXBba2V5XS5wYXJlbnROb2RlKSB7XG4gICAgICAgIGRlbGV0ZSBrZXlNYXBba2V5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBkYXRhLmtleU1hcFZhbGlkID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogRW50ZXJzIGFuIEVsZW1lbnQsIHNldHRpbmcgdGhlIGN1cnJlbnQgbmFtZXNwYWNlIGZvciBuZXN0ZWQgZWxlbWVudHMuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IG5vZGVcbiAgICovXG4gIHZhciBlbnRlck5vZGUgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIHZhciBkYXRhID0gZ2V0RGF0YShub2RlKTtcbiAgICBlbnRlclRhZyhkYXRhLm5vZGVOYW1lKTtcbiAgfTtcblxuICAvKipcbiAgICogRXhpdHMgYW4gRWxlbWVudCwgdW53aW5kaW5nIHRoZSBjdXJyZW50IG5hbWVzcGFjZSB0byB0aGUgcHJldmlvdXMgdmFsdWUuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IG5vZGVcbiAgICovXG4gIHZhciBleGl0Tm9kZSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgdmFyIGRhdGEgPSBnZXREYXRhKG5vZGUpO1xuICAgIGV4aXRUYWcoZGF0YS5ub2RlTmFtZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIE1hcmtzIG5vZGUncyBwYXJlbnQgYXMgaGF2aW5nIHZpc2l0ZWQgbm9kZS5cbiAgICogQHBhcmFtIHshTm9kZX0gbm9kZVxuICAgKi9cbiAgdmFyIG1hcmtWaXNpdGVkID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICB2YXIgd2Fsa2VyID0gZ2V0V2Fsa2VyKCk7XG4gICAgdmFyIHBhcmVudCA9IHdhbGtlci5nZXRDdXJyZW50UGFyZW50KCk7XG4gICAgdmFyIGRhdGEgPSBnZXREYXRhKHBhcmVudCk7XG4gICAgZGF0YS5sYXN0VmlzaXRlZENoaWxkID0gbm9kZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hhbmdlcyB0byB0aGUgZmlyc3QgY2hpbGQgb2YgdGhlIGN1cnJlbnQgbm9kZS5cbiAgICovXG4gIHZhciBmaXJzdENoaWxkID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB3YWxrZXIgPSBnZXRXYWxrZXIoKTtcbiAgICBlbnRlck5vZGUod2Fsa2VyLmN1cnJlbnROb2RlKTtcbiAgICB3YWxrZXIuZmlyc3RDaGlsZCgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRvIHRoZSBuZXh0IHNpYmxpbmcgb2YgdGhlIGN1cnJlbnQgbm9kZS5cbiAgICovXG4gIHZhciBuZXh0U2libGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgd2Fsa2VyID0gZ2V0V2Fsa2VyKCk7XG4gICAgbWFya1Zpc2l0ZWQod2Fsa2VyLmN1cnJlbnROb2RlKTtcbiAgICB3YWxrZXIubmV4dFNpYmxpbmcoKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hhbmdlcyB0byB0aGUgcGFyZW50IG9mIHRoZSBjdXJyZW50IG5vZGUsIHJlbW92aW5nIGFueSB1bnZpc2l0ZWQgY2hpbGRyZW4uXG4gICAqL1xuICB2YXIgcGFyZW50Tm9kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgd2Fsa2VyID0gZ2V0V2Fsa2VyKCk7XG4gICAgd2Fsa2VyLnBhcmVudE5vZGUoKTtcbiAgICBleGl0Tm9kZSh3YWxrZXIuY3VycmVudE5vZGUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb3B5cmlnaHQgMjAxNSBUaGUgSW5jcmVtZW50YWwgRE9NIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gICAqXG4gICAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gICAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gICAqXG4gICAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gICAqXG4gICAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICAgKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICAgKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAgICovXG5cbiAgLyoqXG4gICAqIFNpbWlsYXIgdG8gdGhlIGJ1aWx0LWluIFRyZWV3YWxrZXIgY2xhc3MsIGJ1dCBzaW1wbGlmaWVkIGFuZCBhbGxvd3MgZGlyZWN0XG4gICAqIGFjY2VzcyB0byBtb2RpZnkgdGhlIGN1cnJlbnROb2RlIHByb3BlcnR5LlxuICAgKiBAcGFyYW0geyFOb2RlfSBub2RlIFRoZSByb290IE5vZGUgb2YgdGhlIHN1YnRyZWUgdGhlIHdhbGtlciBzaG91bGQgc3RhcnRcbiAgICogICAgIHRyYXZlcnNpbmcuXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgZnVuY3Rpb24gVHJlZVdhbGtlcihub2RlKSB7XG4gICAgLyoqXG4gICAgICogS2VlcHMgdHJhY2sgb2YgdGhlIGN1cnJlbnQgcGFyZW50IG5vZGUuIFRoaXMgaXMgbmVjZXNzYXJ5IGFzIHRoZSB0cmF2ZXJzYWxcbiAgICAgKiBtZXRob2RzIG1heSB0cmF2ZXJzZSBwYXN0IHRoZSBsYXN0IGNoaWxkIGFuZCB3ZSBzdGlsbCBuZWVkIGEgd2F5IHRvIGdldFxuICAgICAqIGJhY2sgdG8gdGhlIHBhcmVudC5cbiAgICAgKiBAY29uc3QgQHByaXZhdGUgeyFBcnJheTwhTm9kZT59XG4gICAgICovXG4gICAgdGhpcy5zdGFja18gPSBbXTtcblxuICAgIC8qKiB7P05vZGV9ICovXG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IG5vZGU7XG5cbiAgICAvKiogeyFEb2N1bWVudH0gKi9cbiAgICB0aGlzLmRvYyA9IG5vZGUub3duZXJEb2N1bWVudDtcblxuICAgIC8qKlxuICAgICAqIEtlZXBzIHRyYWNrIG9mIHdoYXQgbmFtZXNwYWNlIHRvIGNyZWF0ZSBuZXcgRWxlbWVudHMgaW4uXG4gICAgICogQGNvbnN0IEBwcml2YXRlIHshQXJyYXk8c3RyaW5nPn1cbiAgICAgKi9cbiAgICB0aGlzLm5zU3RhY2tfID0gW3VuZGVmaW5lZF07XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IU5vZGV9IFRoZSBjdXJyZW50IHBhcmVudCBvZiB0aGUgY3VycmVudCBsb2NhdGlvbiBpbiB0aGUgc3VidHJlZS5cbiAgICovXG4gIFRyZWVXYWxrZXIucHJvdG90eXBlLmdldEN1cnJlbnRQYXJlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhY2tfW3RoaXMuc3RhY2tfLmxlbmd0aCAtIDFdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBjdXJyZW50IG5hbWVzcGFjZSB0byBjcmVhdGUgRWxlbWVudHMgaW4uXG4gICAqL1xuICBUcmVlV2Fsa2VyLnByb3RvdHlwZS5nZXRDdXJyZW50TmFtZXNwYWNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLm5zU3RhY2tfW3RoaXMubnNTdGFja18ubGVuZ3RoIC0gMV07XG4gIH07XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lc3BhY2UgVGhlIG5hbWVzcGFjZSB0byBlbnRlci5cbiAgICovXG4gIFRyZWVXYWxrZXIucHJvdG90eXBlLmVudGVyTmFtZXNwYWNlID0gZnVuY3Rpb24gKG5hbWVzcGFjZSkge1xuICAgIHRoaXMubnNTdGFja18ucHVzaChuYW1lc3BhY2UpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFeGl0cyB0aGUgY3VycmVudCBuYW1lc3BhY2VcbiAgICovXG4gIFRyZWVXYWxrZXIucHJvdG90eXBlLmV4aXROYW1lc3BhY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5uc1N0YWNrXy5wb3AoKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgY3VycmVudCBsb2NhdGlvbiB0aGUgZmlyc3RDaGlsZCBvZiB0aGUgY3VycmVudCBsb2NhdGlvbi5cbiAgICovXG4gIFRyZWVXYWxrZXIucHJvdG90eXBlLmZpcnN0Q2hpbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zdGFja18ucHVzaCh0aGlzLmN1cnJlbnROb2RlKTtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0gdGhpcy5jdXJyZW50Tm9kZS5maXJzdENoaWxkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBjdXJyZW50IGxvY2F0aW9uIHRoZSBuZXh0U2libGluZyBvZiB0aGUgY3VycmVudCBsb2NhdGlvbi5cbiAgICovXG4gIFRyZWVXYWxrZXIucHJvdG90eXBlLm5leHRTaWJsaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSB0aGlzLmN1cnJlbnROb2RlLm5leHRTaWJsaW5nO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBjdXJyZW50IGxvY2F0aW9uIHRoZSBwYXJlbnROb2RlIG9mIHRoZSBjdXJyZW50IGxvY2F0aW9uLlxuICAgKi9cbiAgVHJlZVdhbGtlci5wcm90b3R5cGUucGFyZW50Tm9kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0gdGhpcy5zdGFja18ucG9wKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBjb25zdCB7Ym9vbGVhbn1cbiAgICovXG4gIGlmICh1bmRlZmluZWQgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIHZhciBhc3NlcnROb1VuY2xvc2VkVGFncyA9IGZ1bmN0aW9uIChyb290KSB7XG4gICAgICB2YXIgb3BlbkVsZW1lbnQgPSBnZXRXYWxrZXIoKS5nZXRDdXJyZW50UGFyZW50KCk7XG4gICAgICBpZiAoIW9wZW5FbGVtZW50KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIG9wZW5UYWdzID0gW107XG4gICAgICB3aGlsZSAob3BlbkVsZW1lbnQgJiYgb3BlbkVsZW1lbnQgIT09IHJvb3QpIHtcbiAgICAgICAgb3BlblRhZ3MucHVzaChvcGVuRWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgb3BlbkVsZW1lbnQgPSBvcGVuRWxlbWVudC5wYXJlbnROb2RlO1xuICAgICAgfVxuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ09uZSBvciBtb3JlIHRhZ3Mgd2VyZSBub3QgY2xvc2VkOlxcbicgKyBvcGVuVGFncy5qb2luKCdcXG4nKSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXRjaGVzIHRoZSBkb2N1bWVudCBzdGFydGluZyBhdCBlbCB3aXRoIHRoZSBwcm92aWRlZCBmdW5jdGlvbi4gVGhpcyBmdW5jdGlvblxuICAgKiBtYXkgYmUgY2FsbGVkIGR1cmluZyBhbiBleGlzdGluZyBwYXRjaCBvcGVyYXRpb24uXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR8IURvY3VtZW50fSBub2RlIFRoZSBFbGVtZW50IG9yIERvY3VtZW50IHRvIHBhdGNoLlxuICAgKiBAcGFyYW0geyFmdW5jdGlvbn0gZm4gQSBmdW5jdGlvbiBjb250YWluaW5nIGVsZW1lbnRPcGVuL2VsZW1lbnRDbG9zZS9ldGMuXG4gICAqICAgICBjYWxscyB0aGF0IGRlc2NyaWJlIHRoZSBET00uXG4gICAqIEBwYXJhbSB7Kn0gZGF0YSBBbiBhcmd1bWVudCBwYXNzZWQgdG8gZm4gdG8gcmVwcmVzZW50IERPTSBzdGF0ZS5cbiAgICovXG4gIGV4cG9ydHMucGF0Y2ggPSBmdW5jdGlvbiAobm9kZSwgZm4sIGRhdGEpIHtcbiAgICB2YXIgcHJldldhbGtlciA9IGdldFdhbGtlcigpO1xuICAgIHNldFdhbGtlcihuZXcgVHJlZVdhbGtlcihub2RlKSk7XG5cbiAgICBmaXJzdENoaWxkKCk7XG4gICAgZm4oZGF0YSk7XG4gICAgcGFyZW50Tm9kZSgpO1xuICAgIGNsZWFyVW52aXNpdGVkRE9NKG5vZGUpO1xuXG4gICAgaWYgKHVuZGVmaW5lZCAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBhc3NlcnROb1VuY2xvc2VkVGFncyhub2RlKTtcbiAgICB9XG5cbiAgICBzZXRXYWxrZXIocHJldldhbGtlcik7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoZSBvZmZzZXQgaW4gdGhlIHZpcnR1YWwgZWxlbWVudCBkZWNsYXJhdGlvbiB3aGVyZSB0aGUgYXR0cmlidXRlcyBhcmVcbiAgICogc3BlY2lmaWVkLlxuICAgKiBAY29uc3RcbiAgICovXG4gIHZhciBBVFRSSUJVVEVTX09GRlNFVCA9IDM7XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhbiBhcnJheSBvZiBhcmd1bWVudHMgZm9yIHVzZSB3aXRoIGVsZW1lbnRPcGVuU3RhcnQsIGF0dHIgYW5kXG4gICAqIGVsZW1lbnRPcGVuRW5kLlxuICAgKiBAY29uc3Qge0FycmF5PCo+fVxuICAgKi9cbiAgdmFyIGFyZ3NCdWlsZGVyID0gW107XG5cbiAgaWYgKHVuZGVmaW5lZCAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgLyoqXG4gICAgICogS2VlcHMgdHJhY2sgd2hldGhlciBvciBub3Qgd2UgYXJlIGluIGFuIGF0dHJpYnV0ZXMgZGVjbGFyYXRpb24gKGFmdGVyXG4gICAgICogZWxlbWVudE9wZW5TdGFydCwgYnV0IGJlZm9yZSBlbGVtZW50T3BlbkVuZCkuXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdmFyIGluQXR0cmlidXRlcyA9IGZhbHNlO1xuXG4gICAgLyoqIE1ha2VzIHN1cmUgdGhhdCB0aGUgY2FsbGVyIGlzIG5vdCB3aGVyZSBhdHRyaWJ1dGVzIGFyZSBleHBlY3RlZC4gKi9cbiAgICB2YXIgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGluQXR0cmlidXRlcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dhcyBub3QgZXhwZWN0aW5nIGEgY2FsbCB0byBhdHRyIG9yIGVsZW1lbnRPcGVuRW5kLCAnICsgJ3RoZXkgbXVzdCBmb2xsb3cgYSBjYWxsIHRvIGVsZW1lbnRPcGVuU3RhcnQuJyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKiBNYWtlcyBzdXJlIHRoYXQgdGhlIGNhbGxlciBpcyB3aGVyZSBhdHRyaWJ1dGVzIGFyZSBleHBlY3RlZC4gKi9cbiAgICB2YXIgYXNzZXJ0SW5BdHRyaWJ1dGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCFpbkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXYXMgZXhwZWN0aW5nIGEgY2FsbCB0byBhdHRyIG9yIGVsZW1lbnRPcGVuRW5kLiAnICsgJ2VsZW1lbnRPcGVuU3RhcnQgbXVzdCBiZSBmb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgY2FsbHMgdG8gYXR0ciwgJyArICd0aGVuIG9uZSBjYWxsIHRvIGVsZW1lbnRPcGVuRW5kLicpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBNYWtlcyBzdXJlIHRoYXQgdGFncyBhcmUgY29ycmVjdGx5IG5lc3RlZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnXG4gICAgICovXG4gICAgdmFyIGFzc2VydENsb3NlTWF0Y2hlc09wZW5UYWcgPSBmdW5jdGlvbiAodGFnKSB7XG4gICAgICB2YXIgY2xvc2luZ05vZGUgPSBnZXRXYWxrZXIoKS5nZXRDdXJyZW50UGFyZW50KCk7XG4gICAgICB2YXIgZGF0YSA9IGdldERhdGEoY2xvc2luZ05vZGUpO1xuXG4gICAgICBpZiAodGFnICE9PSBkYXRhLm5vZGVOYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUmVjZWl2ZWQgYSBjYWxsIHRvIGNsb3NlICcgKyB0YWcgKyAnIGJ1dCAnICsgZGF0YS5ub2RlTmFtZSArICcgd2FzIG9wZW4uJyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKiBVcGRhdGVzIHRoZSBzdGF0ZSB0byBiZWluZyBpbiBhbiBhdHRyaWJ1dGUgZGVjbGFyYXRpb24uICovXG4gICAgdmFyIHNldEluQXR0cmlidXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGluQXR0cmlidXRlcyA9IHRydWU7XG4gICAgfTtcblxuICAgIC8qKiBVcGRhdGVzIHRoZSBzdGF0ZSB0byBub3QgYmVpbmcgaW4gYW4gYXR0cmlidXRlIGRlY2xhcmF0aW9uLiAqL1xuICAgIHZhciBzZXROb3RJbkF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpbkF0dHJpYnV0ZXMgPSBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgZXhwb3J0cy5lbGVtZW50T3BlbiA9IGZ1bmN0aW9uICh0YWcsIGtleSwgc3RhdGljcywgdmFyX2FyZ3MpIHtcbiAgICBpZiAodW5kZWZpbmVkICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGFzc2VydE5vdEluQXR0cmlidXRlcygpO1xuICAgIH1cblxuICAgIHZhciBub2RlID0gYWxpZ25XaXRoRE9NKHRhZywga2V5LCBzdGF0aWNzKTtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEobm9kZSk7XG5cbiAgICAvKlxuICAgICAqIENoZWNrcyB0byBzZWUgaWYgb25lIG9yIG1vcmUgYXR0cmlidXRlcyBoYXZlIGNoYW5nZWQgZm9yIGEgZ2l2ZW4gRWxlbWVudC5cbiAgICAgKiBXaGVuIG5vIGF0dHJpYnV0ZXMgaGF2ZSBjaGFuZ2VkLCB0aGlzIGlzIG11Y2ggZmFzdGVyIHRoYW4gY2hlY2tpbmcgZWFjaFxuICAgICAqIGluZGl2aWR1YWwgYXJndW1lbnQuIFdoZW4gYXR0cmlidXRlcyBoYXZlIGNoYW5nZWQsIHRoZSBvdmVyaGVhZCBvZiB0aGlzIGlzXG4gICAgICogbWluaW1hbC5cbiAgICAgKi9cbiAgICB2YXIgYXR0cnNBcnIgPSBkYXRhLmF0dHJzQXJyO1xuICAgIHZhciBhdHRyc0NoYW5nZWQgPSBmYWxzZTtcbiAgICB2YXIgaSA9IEFUVFJJQlVURVNfT0ZGU0VUO1xuICAgIHZhciBqID0gMDtcblxuICAgIGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSArPSAxLCBqICs9IDEpIHtcbiAgICAgIGlmIChhdHRyc0FycltqXSAhPT0gYXJndW1lbnRzW2ldKSB7XG4gICAgICAgIGF0dHJzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSArPSAxLCBqICs9IDEpIHtcbiAgICAgIGF0dHJzQXJyW2pdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGlmIChqIDwgYXR0cnNBcnIubGVuZ3RoKSB7XG4gICAgICBhdHRyc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgYXR0cnNBcnIubGVuZ3RoID0gajtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIEFjdHVhbGx5IHBlcmZvcm0gdGhlIGF0dHJpYnV0ZSB1cGRhdGUuXG4gICAgICovXG4gICAgaWYgKGF0dHJzQ2hhbmdlZCkge1xuICAgICAgdmFyIG5ld0F0dHJzID0gZGF0YS5uZXdBdHRycztcblxuICAgICAgZm9yICh2YXIgYXR0ciBpbiBuZXdBdHRycykge1xuICAgICAgICBuZXdBdHRyc1thdHRyXSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IEFUVFJJQlVURVNfT0ZGU0VUOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIG5ld0F0dHJzW2FyZ3VtZW50c1tpXV0gPSBhcmd1bWVudHNbaSArIDFdO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBhdHRyIGluIG5ld0F0dHJzKSB7XG4gICAgICAgIHVwZGF0ZUF0dHJpYnV0ZShub2RlLCBhdHRyLCBuZXdBdHRyc1thdHRyXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZmlyc3RDaGlsZCgpO1xuICAgIHJldHVybiBub2RlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEZWNsYXJlcyBhIHZpcnR1YWwgRWxlbWVudCBhdCB0aGUgY3VycmVudCBsb2NhdGlvbiBpbiB0aGUgZG9jdW1lbnQuIFRoaXNcbiAgICogY29ycmVzcG9uZHMgdG8gYW4gb3BlbmluZyB0YWcgYW5kIGEgZWxlbWVudENsb3NlIHRhZyBpcyByZXF1aXJlZC4gVGhpcyBpc1xuICAgKiBsaWtlIGVsZW1lbnRPcGVuLCBidXQgdGhlIGF0dHJpYnV0ZXMgYXJlIGRlZmluZWQgdXNpbmcgdGhlIGF0dHIgZnVuY3Rpb25cbiAgICogcmF0aGVyIHRoYW4gYmVpbmcgcGFzc2VkIGFzIGFyZ3VtZW50cy4gTXVzdCBiZSBmb2xsbG93ZWQgYnkgMCBvciBtb3JlIGNhbGxzXG4gICAqIHRvIGF0dHIsIHRoZW4gYSBjYWxsIHRvIGVsZW1lbnRPcGVuRW5kLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSBlbGVtZW50J3MgdGFnLlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IGtleSBUaGUga2V5IHVzZWQgdG8gaWRlbnRpZnkgdGhpcyBlbGVtZW50LiBUaGlzIGNhbiBiZSBhblxuICAgKiAgICAgZW1wdHkgc3RyaW5nLCBidXQgcGVyZm9ybWFuY2UgbWF5IGJlIGJldHRlciBpZiBhIHVuaXF1ZSB2YWx1ZSBpcyB1c2VkXG4gICAqICAgICB3aGVuIGl0ZXJhdGluZyBvdmVyIGFuIGFycmF5IG9mIGl0ZW1zLlxuICAgKiBAcGFyYW0gez9BcnJheTwqPn0gc3RhdGljcyBBbiBhcnJheSBvZiBhdHRyaWJ1dGUgbmFtZS92YWx1ZSBwYWlycyBvZiB0aGVcbiAgICogICAgIHN0YXRpYyBhdHRyaWJ1dGVzIGZvciB0aGUgRWxlbWVudC4gVGhlc2Ugd2lsbCBvbmx5IGJlIHNldCBvbmNlIHdoZW4gdGhlXG4gICAqICAgICBFbGVtZW50IGlzIGNyZWF0ZWQuXG4gICAqL1xuICBleHBvcnRzLmVsZW1lbnRPcGVuU3RhcnQgPSBmdW5jdGlvbiAodGFnLCBrZXksIHN0YXRpY3MpIHtcbiAgICBpZiAodW5kZWZpbmVkICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGFzc2VydE5vdEluQXR0cmlidXRlcygpO1xuICAgICAgc2V0SW5BdHRyaWJ1dGVzKCk7XG4gICAgfVxuXG4gICAgYXJnc0J1aWxkZXJbMF0gPSB0YWc7XG4gICAgYXJnc0J1aWxkZXJbMV0gPSBrZXk7XG4gICAgYXJnc0J1aWxkZXJbMl0gPSBzdGF0aWNzO1xuICB9O1xuXG4gIC8qKipcbiAgICogRGVmaW5lcyBhIHZpcnR1YWwgYXR0cmlidXRlIGF0IHRoaXMgcG9pbnQgb2YgdGhlIERPTS4gVGhpcyBpcyBvbmx5IHZhbGlkXG4gICAqIHdoZW4gY2FsbGVkIGJldHdlZW4gZWxlbWVudE9wZW5TdGFydCBhbmQgZWxlbWVudE9wZW5FbmQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAgICovXG4gIGV4cG9ydHMuYXR0ciA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgIGlmICh1bmRlZmluZWQgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgYXNzZXJ0SW5BdHRyaWJ1dGVzKCk7XG4gICAgfVxuXG4gICAgYXJnc0J1aWxkZXIucHVzaChuYW1lLCB2YWx1ZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENsb3NlcyBhbiBvcGVuIHRhZyBzdGFydGVkIHdpdGggZWxlbWVudE9wZW5TdGFydC5cbiAgICogQHJldHVybiB7IUVsZW1lbnR9IFRoZSBjb3JyZXNwb25kaW5nIEVsZW1lbnQuXG4gICAqL1xuICBleHBvcnRzLmVsZW1lbnRPcGVuRW5kID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh1bmRlZmluZWQgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgYXNzZXJ0SW5BdHRyaWJ1dGVzKCk7XG4gICAgICBzZXROb3RJbkF0dHJpYnV0ZXMoKTtcbiAgICB9XG5cbiAgICB2YXIgbm9kZSA9IGV4cG9ydHMuZWxlbWVudE9wZW4uYXBwbHkobnVsbCwgYXJnc0J1aWxkZXIpO1xuICAgIGFyZ3NCdWlsZGVyLmxlbmd0aCA9IDA7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH07XG5cbiAgLyoqXG4gICAqIENsb3NlcyBhbiBvcGVuIHZpcnR1YWwgRWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyBUaGUgZWxlbWVudCdzIHRhZy5cbiAgICogQHJldHVybiB7IUVsZW1lbnR9IFRoZSBjb3JyZXNwb25kaW5nIEVsZW1lbnQuXG4gICAqL1xuICBleHBvcnRzLmVsZW1lbnRDbG9zZSA9IGZ1bmN0aW9uICh0YWcpIHtcbiAgICBpZiAodW5kZWZpbmVkICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGFzc2VydE5vdEluQXR0cmlidXRlcygpO1xuICAgICAgYXNzZXJ0Q2xvc2VNYXRjaGVzT3BlblRhZyh0YWcpO1xuICAgIH1cblxuICAgIHBhcmVudE5vZGUoKTtcblxuICAgIHZhciBub2RlID0gZ2V0V2Fsa2VyKCkuY3VycmVudE5vZGU7XG4gICAgY2xlYXJVbnZpc2l0ZWRET00obm9kZSk7XG5cbiAgICBuZXh0U2libGluZygpO1xuICAgIHJldHVybiBub2RlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEZWNsYXJlcyBhIHZpcnR1YWwgRWxlbWVudCBhdCB0aGUgY3VycmVudCBsb2NhdGlvbiBpbiB0aGUgZG9jdW1lbnQgdGhhdCBoYXNcbiAgICogbm8gY2hpbGRyZW4uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIGVsZW1lbnQncyB0YWcuXG4gICAqIEBwYXJhbSB7P3N0cmluZ30ga2V5IFRoZSBrZXkgdXNlZCB0byBpZGVudGlmeSB0aGlzIGVsZW1lbnQuIFRoaXMgY2FuIGJlIGFuXG4gICAqICAgICBlbXB0eSBzdHJpbmcsIGJ1dCBwZXJmb3JtYW5jZSBtYXkgYmUgYmV0dGVyIGlmIGEgdW5pcXVlIHZhbHVlIGlzIHVzZWRcbiAgICogICAgIHdoZW4gaXRlcmF0aW5nIG92ZXIgYW4gYXJyYXkgb2YgaXRlbXMuXG4gICAqIEBwYXJhbSB7P0FycmF5PCo+fSBzdGF0aWNzIEFuIGFycmF5IG9mIGF0dHJpYnV0ZSBuYW1lL3ZhbHVlIHBhaXJzIG9mIHRoZVxuICAgKiAgICAgc3RhdGljIGF0dHJpYnV0ZXMgZm9yIHRoZSBFbGVtZW50LiBUaGVzZSB3aWxsIG9ubHkgYmUgc2V0IG9uY2Ugd2hlbiB0aGVcbiAgICogICAgIEVsZW1lbnQgaXMgY3JlYXRlZC5cbiAgICogQHBhcmFtIHsuLi4qfSB2YXJfYXJncyBBdHRyaWJ1dGUgbmFtZS92YWx1ZSBwYWlycyBvZiB0aGUgZHluYW1pYyBhdHRyaWJ1dGVzXG4gICAqICAgICBmb3IgdGhlIEVsZW1lbnQuXG4gICAqIEByZXR1cm4geyFFbGVtZW50fSBUaGUgY29ycmVzcG9uZGluZyBFbGVtZW50LlxuICAgKi9cbiAgZXhwb3J0cy5lbGVtZW50Vm9pZCA9IGZ1bmN0aW9uICh0YWcsIGtleSwgc3RhdGljcywgdmFyX2FyZ3MpIHtcbiAgICBpZiAodW5kZWZpbmVkICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGFzc2VydE5vdEluQXR0cmlidXRlcygpO1xuICAgIH1cblxuICAgIHZhciBub2RlID0gZXhwb3J0cy5lbGVtZW50T3Blbi5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIGV4cG9ydHMuZWxlbWVudENsb3NlLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH07XG5cbiAgLyoqXG4gICAqIERlY2xhcmVzIGEgdmlydHVhbCBUZXh0IGF0IHRoaXMgcG9pbnQgaW4gdGhlIGRvY3VtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ8Ym9vbGVhbn0gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBUZXh0LlxuICAgKiBAcGFyYW0gey4uLihmdW5jdGlvbihzdHJpbmd8bnVtYmVyfGJvb2xlYW4pOnN0cmluZ3xudW1iZXJ8Ym9vbGVhbil9IHZhcl9hcmdzXG4gICAqICAgICBGdW5jdGlvbnMgdG8gZm9ybWF0IHRoZSB2YWx1ZSB3aGljaCBhcmUgY2FsbGVkIG9ubHkgd2hlbiB0aGUgdmFsdWUgaGFzXG4gICAqICAgICBjaGFuZ2VkLlxuICAgKi9cbiAgZXhwb3J0cy50ZXh0ID0gZnVuY3Rpb24gKHZhbHVlLCB2YXJfYXJncykge1xuICAgIGlmICh1bmRlZmluZWQgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgYXNzZXJ0Tm90SW5BdHRyaWJ1dGVzKCk7XG4gICAgfVxuXG4gICAgdmFyIG5vZGUgPSBhbGlnbldpdGhET00oJyN0ZXh0JywgbnVsbCk7XG4gICAgdmFyIGRhdGEgPSBnZXREYXRhKG5vZGUpO1xuXG4gICAgaWYgKGRhdGEudGV4dCAhPT0gdmFsdWUpIHtcbiAgICAgIGRhdGEudGV4dCA9IHZhbHVlO1xuXG4gICAgICB2YXIgZm9ybWF0dGVkID0gdmFsdWU7XG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBmb3JtYXR0ZWQgPSBhcmd1bWVudHNbaV0oZm9ybWF0dGVkKTtcbiAgICAgIH1cblxuICAgICAgbm9kZS5kYXRhID0gZm9ybWF0dGVkO1xuICAgIH1cblxuICAgIG5leHRTaWJsaW5nKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFB1YmxpY2x5IGV4cG9ydHMgdGhlIG11dGF0b3IgaG9va3MgZnJvbSB2YXJpb3VzIGludGVybmFsIG1vZHVsZXMuXG4gICAqIE5vdGUgdGhhdCBtdXRhdGluZyB0aGVzZSBvYmplY3RzIHdpbGwgYWx0ZXIgdGhlIGJlaGF2aW9yIG9mIHRoZSBpbnRlcm5hbFxuICAgKiBjb2RlLlxuICAgKiB7T2JqZWN0PHN0cmluZywgT2JqZWN0PHN0cmluZywgZnVuY3Rpb24+Pn1cbiAgICovXG4gIGV4cG9ydHMubXV0YXRvcnMgPSB7XG4gICAgYXR0cmlidXRlczogX211dGF0b3JzXG4gIH07XG5cbiAgLyoqXG4gICAqIFB1YmxpY2x5IGV4cG9ydHMgdGhlIGRlZmF1bHQgbXV0YXRvcnMgZnJvbSB2YXJpb3VzIGludGVybmFsIG1vZHVsZXMuXG4gICAqIE5vdGUgdGhhdCBtdXRhdGluZyB0aGVzZSBvYmplY3RzIHdpbGwgaGF2ZSBubyBhZmZlY3Qgb24gdGhlIGludGVybmFsIGNvZGUsXG4gICAqIHRoZXNlIGFyZSBleHBvc2VkIG9ubHkgdG8gYmUgdXNlZCBieSBjdXN0b20gbXV0YXRvcnMuXG4gICAqIHtPYmplY3Q8c3RyaW5nLCBPYmplY3Q8c3RyaW5nLCBmdW5jdGlvbj4+fVxuICAgKi9cbiAgZXhwb3J0cy5kZWZhdWx0cyA9IHtcbiAgICBhdHRyaWJ1dGVzOiBfZGVmYXVsdHNcbiAgfTtcbn0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5jcmVtZW50YWwtZG9tLmpzLm1hcFxuIiwidmFyIEluY3JlbWVudGFsRE9NID0gcmVxdWlyZSgnLi9pbmNyZW1lbnRhbC1kb20nKVxuXG52YXIgcGF0Y2ggPSBJbmNyZW1lbnRhbERPTS5wYXRjaFxudmFyIGVsZW1lbnRPcGVuID0gSW5jcmVtZW50YWxET00uZWxlbWVudE9wZW5cbnZhciBlbGVtZW50Vm9pZCA9IEluY3JlbWVudGFsRE9NLmVsZW1lbnRWb2lkXG52YXIgZWxlbWVudENsb3NlID0gSW5jcmVtZW50YWxET00uZWxlbWVudENsb3NlXG52YXIgdGV4dCA9IEluY3JlbWVudGFsRE9NLnRleHRcblxudmFyIGJhc2tldCA9IHJlcXVpcmUoJy4vYmFza2V0JylcbnZhciB0b2RvID0gcmVxdWlyZSgnLi90b2RvJylcblxuXG53aW5kb3cucGF0Y2ggPSBwYXRjaFxud2luZG93LmVsZW1lbnRPcGVuID0gZWxlbWVudE9wZW5cbndpbmRvdy5lbGVtZW50Vm9pZCA9IGVsZW1lbnRWb2lkXG53aW5kb3cuZWxlbWVudENsb3NlID0gZWxlbWVudENsb3NlXG53aW5kb3cudGV4dCA9IHRleHRcblxud2luZG93LmJhc2tldCA9IGJhc2tldFxud2luZG93LnRvZG8gPSB0b2RvXG4iLCJ2YXIgdG9kbyA9IHJlcXVpcmUoJy4vdG9kby5odG1sJylcbnZhciBwYXRjaCA9IHJlcXVpcmUoJy4uL2luY3JlbWVudGFsLWRvbScpLnBhdGNoXG52YXIgc3VwZXJtb2RlbHMgPSByZXF1aXJlKCdzdXBlcm1vZGVscy5qcycpXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMnKVxuXG52YXIgVG9kbyA9IHN1cGVybW9kZWxzKHtcbiAgaWQ6IGhlbHBlcnMucm5kc3RyLFxuICB0ZXh0OiBTdHJpbmcsXG4gIGNvbXBsZXRlZDogQm9vbGVhblxufSlcbnZhciBUb2RvcyA9IHN1cGVybW9kZWxzKFtUb2RvXSlcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZWwpIHtcbiAgdmFyIHRvZG9zID0gbmV3IFRvZG9zKFtcbiAgICB7XG4gICAgICB0ZXh0OiAnUGhvbmUgbXVtJyxcbiAgICAgIGNvbXBsZXRlZDogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6ICdEbyBzaG9wcGluZycsXG4gICAgICBjb21wbGV0ZWQ6IHRydWVcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6ICdXcml0ZSBlbWFpbCB0byBCcmlhbicsXG4gICAgICBjb21wbGV0ZWQ6IHRydWVcbiAgICB9XG4gIF0pXG5cbiAgZnVuY3Rpb24gcmVuZGVyICgpIHtcbiAgICBwYXRjaChlbCwgdG9kbywgdG9kb3MpXG4gIH1cbiAgcmVuZGVyKClcblxuICB0b2Rvcy5vbignY2hhbmdlJywgcmVuZGVyKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0b2RvcyAodG9kb3MpIHtcbiAgZnVuY3Rpb24gYWRkIChmb3JtKSB7XG4gICAgICB2YXIgbmV3VG9kbyA9IHRvZG9zLmNyZWF0ZSgpXG4gICAgICBuZXdUb2RvLnRleHQgPSBmb3JtLm5ld1RvZG8udmFsdWVcbiAgICAgIHRvZG9zLnB1c2gobmV3VG9kbylcbiAgICAgIGZvcm0ubmV3VG9kby5zZWxlY3QoKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFyQ29tcGxldGVkIChpbmRleCkge1xuICAgICAgdmFyIGxlbiA9IHRvZG9zLmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IGxlbiAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGlmICh0b2Rvc1tpXS5jb21wbGV0ZWQpIHtcbiAgICAgICAgICB0b2Rvcy5zcGxpY2UoaSwgMSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvZ2dsZUNvbXBsZXRlZCAoc3RhdGUpIHtcbiAgICAgIHRvZG9zLmZvckVhY2goZnVuY3Rpb24odG9kbykge1xuICAgICAgICB0b2RvLmNvbXBsZXRlZCA9IHN0YXRlXG4gICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvdGFsQ29tcGxldGVkICgpIHtcbiAgICAgIHJldHVybiB0b2Rvcy5maWx0ZXIoZnVuY3Rpb24gKHRvZG8pIHtcbiAgICAgICAgcmV0dXJuIHRvZG8uY29tcGxldGVkXG4gICAgICB9KS5sZW5ndGhcbiAgICB9XG4gIGVsZW1lbnRPcGVuKFwidGFibGVcIilcbiAgICBlbGVtZW50T3BlbihcInRoZWFkXCIpXG4gICAgICBlbGVtZW50T3BlbihcInRyXCIpXG4gICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgIGVsZW1lbnRPcGVuKFwiZm9ybVwiLCBudWxsLCBudWxsLCBcIm9uc3VibWl0XCIsIGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gdGhpcztcbiAgICAgICAgICBhZGQoJGVsZW1lbnQpfSlcbiAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwiaW5wdXRcIiwgbnVsbCwgW1widHlwZVwiLCBcInRleHRcIiwgXCJuYW1lXCIsIFwibmV3VG9kb1wiLCBcImNsYXNzXCIsIFwiZm9ybS1jb250cm9sXCIsIFwicGxhY2Vob2xkZXJcIiwgXCJFbnRlciBuZXcgdG9kb1wiXSlcbiAgICAgICAgICAgIGVsZW1lbnRDbG9zZShcImlucHV0XCIpXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwiZm9ybVwiKVxuICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgZWxlbWVudENsb3NlKFwidHJcIilcbiAgICBlbGVtZW50Q2xvc2UoXCJ0aGVhZFwiKVxuICAgIGVsZW1lbnRPcGVuKFwidGJvZHlcIilcbiAgICAgIDsoQXJyYXkuaXNBcnJheSh0b2RvcykgPyB0b2RvcyA6IE9iamVjdC5rZXlzKHRvZG9zKSkuZm9yRWFjaChmdW5jdGlvbih0b2RvLCAkaW5kZXgpIHtcbiAgICAgICAgZWxlbWVudE9wZW4oXCJ0clwiLCB0b2RvLmlkKVxuICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICAgIHRleHQoXCJcIiArICgkaW5kZXggKyAxKSArIFwiLlwiKVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgICAgZWxlbWVudE9wZW4oXCJpbnB1dFwiLCBudWxsLCBbXCJ0eXBlXCIsIFwidGV4dFwiLCBcImNsYXNzXCIsIFwiZm9ybS1jb250cm9sXCJdLCBcInZhbHVlXCIsIHRvZG8udGV4dCwgXCJvbmtleXVwXCIsIGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIHZhciAkZWxlbWVudCA9IHRoaXM7XG4gICAgICAgICAgICB0b2RvLnRleHQgPSB0aGlzLnZhbHVlfSwgXCJzdHlsZVwiLCB7IGJvcmRlckNvbG9yOiB0b2RvLnRleHQgPyAnJzogJ3JlZCcsIHRleHREZWNvcmF0aW9uOiB0b2RvLmNvbXBsZXRlZCA/ICdsaW5lLXRocm91Z2gnOiAnJyB9KVxuICAgICAgICAgICAgZWxlbWVudENsb3NlKFwiaW5wdXRcIilcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICAgIGVsZW1lbnRPcGVuKFwiaW5wdXRcIiwgbnVsbCwgW1widHlwZVwiLCBcImNoZWNrYm94XCJdLCBcImNoZWNrZWRcIiwgdG9kby5jb21wbGV0ZWQgfHwgdW5kZWZpbmVkLCBcIm9uY2hhbmdlXCIsIGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIHZhciAkZWxlbWVudCA9IHRoaXM7XG4gICAgICAgICAgICB0b2RvLmNvbXBsZXRlZCA9IHRoaXMuY2hlY2tlZH0pXG4gICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJpbnB1dFwiKVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgIGVsZW1lbnRDbG9zZShcInRyXCIpXG4gICAgICB9LCB0b2RvcylcbiAgICAgIGVsZW1lbnRPcGVuKFwidHJcIilcbiAgICAgIGVsZW1lbnRDbG9zZShcInRyXCIpXG4gICAgZWxlbWVudENsb3NlKFwidGJvZHlcIilcbiAgICBlbGVtZW50T3BlbihcInRmb290XCIpXG4gICAgICBlbGVtZW50T3BlbihcInRyXCIpXG4gICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICB0ZXh0KFwiVG90YWwgXCIgKyAodG9kb3MubGVuZ3RoKSArIFwiXCIpXG4gICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgIGlmICh0b3RhbENvbXBsZXRlZCgpKSB7XG4gICAgICAgICAgICBlbGVtZW50T3BlbihcImJ1dHRvblwiLCBudWxsLCBbXCJjbGFzc1wiLCBcImJ0biBidG4tc20gYnRuLWRhbmdlclwiXSwgXCJvbmNsaWNrXCIsIGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIHZhciAkZWxlbWVudCA9IHRoaXM7XG4gICAgICAgICAgICBjbGVhckNvbXBsZXRlZCgpfSlcbiAgICAgICAgICAgICAgdGV4dChcIkNsZWFyIGNvbXBsZXRlZCBcIiArICh0b3RhbENvbXBsZXRlZCgpKSArIFwiXCIpXG4gICAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJidXR0b25cIilcbiAgICAgICAgICB9XG4gICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJ0clwiKVxuICAgIGVsZW1lbnRDbG9zZShcInRmb290XCIpXG4gIGVsZW1lbnRDbG9zZShcInRhYmxlXCIpXG4gIGVsZW1lbnRPcGVuKFwicHJlXCIpXG4gICAgdGV4dChcIlwiICsgKEpTT04uc3RyaW5naWZ5KHRvZG9zLCBudWxsLCAyKSkgKyBcIlwiKVxuICBlbGVtZW50Q2xvc2UoXCJwcmVcIilcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL3N1cGVybW9kZWxzJyk7XG4iLCIndXNlIHN0cmljdCdcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKVxudmFyIGNyZWF0ZVdyYXBwZXJGYWN0b3J5ID0gcmVxdWlyZSgnLi9mYWN0b3J5JylcblxuZnVuY3Rpb24gcmVzb2x2ZSAoZnJvbSkge1xuICB2YXIgaXNDdG9yID0gdXRpbC5pc0NvbnN0cnVjdG9yKGZyb20pXG4gIHZhciBpc1N1cGVybW9kZWxDdG9yID0gdXRpbC5pc1N1cGVybW9kZWxDb25zdHJ1Y3Rvcihmcm9tKVxuICB2YXIgaXNBcnJheSA9IHV0aWwuaXNBcnJheShmcm9tKVxuXG4gIGlmIChpc0N0b3IgfHwgaXNTdXBlcm1vZGVsQ3RvciB8fCBpc0FycmF5KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIF9fdHlwZTogZnJvbVxuICAgIH1cbiAgfVxuXG4gIHZhciBpc1ZhbHVlID0gIXV0aWwuaXNPYmplY3QoZnJvbSlcbiAgaWYgKGlzVmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgX192YWx1ZTogZnJvbVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmcm9tXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURlZiAoZnJvbSkge1xuICBmcm9tID0gcmVzb2x2ZShmcm9tKVxuXG4gIHZhciBfX1ZBTElEQVRPUlMgPSAnX192YWxpZGF0b3JzJ1xuICB2YXIgX19WQUxVRSA9ICdfX3ZhbHVlJ1xuICB2YXIgX19UWVBFID0gJ19fdHlwZSdcbiAgdmFyIF9fRElTUExBWU5BTUUgPSAnX19kaXNwbGF5TmFtZSdcbiAgdmFyIF9fR0VUID0gJ19fZ2V0J1xuICB2YXIgX19TRVQgPSAnX19zZXQnXG4gIHZhciBfX0VOVU1FUkFCTEUgPSAnX19lbnVtZXJhYmxlJ1xuICB2YXIgX19DT05GSUdVUkFCTEUgPSAnX19jb25maWd1cmFibGUnXG4gIHZhciBfX1dSSVRBQkxFID0gJ19fd3JpdGFibGUnXG4gIHZhciBfX1NQRUNJQUxfUFJPUFMgPSBbXG4gICAgX19WQUxJREFUT1JTLCBfX1ZBTFVFLCBfX1RZUEUsIF9fRElTUExBWU5BTUUsXG4gICAgX19HRVQsIF9fU0VULCBfX0VOVU1FUkFCTEUsIF9fQ09ORklHVVJBQkxFLCBfX1dSSVRBQkxFXG4gIF1cblxuICB2YXIgZGVmID0ge1xuICAgIGZyb206IGZyb20sXG4gICAgdHlwZTogZnJvbVtfX1RZUEVdLFxuICAgIHZhbHVlOiBmcm9tW19fVkFMVUVdLFxuICAgIHZhbGlkYXRvcnM6IGZyb21bX19WQUxJREFUT1JTXSB8fCBbXSxcbiAgICBlbnVtZXJhYmxlOiBmcm9tW19fRU5VTUVSQUJMRV0gIT09IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogISFmcm9tW19fQ09ORklHVVJBQkxFXSxcbiAgICB3cml0YWJsZTogZnJvbVtfX1dSSVRBQkxFXSAhPT0gZmFsc2UsXG4gICAgZGlzcGxheU5hbWU6IGZyb21bX19ESVNQTEFZTkFNRV0sXG4gICAgZ2V0dGVyOiBmcm9tW19fR0VUXSxcbiAgICBzZXR0ZXI6IGZyb21bX19TRVRdXG4gIH1cblxuICB2YXIgdHlwZSA9IGRlZi50eXBlXG5cbiAgLy8gU2ltcGxlICdDb25zdHJ1Y3RvcicgVHlwZVxuICBpZiAodXRpbC5pc1NpbXBsZUNvbnN0cnVjdG9yKHR5cGUpKSB7XG4gICAgZGVmLmlzU2ltcGxlID0gdHJ1ZVxuXG4gICAgZGVmLmNhc3QgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiB1dGlsLmNhc3QodmFsdWUsIHR5cGUpXG4gICAgfVxuICB9IGVsc2UgaWYgKHV0aWwuaXNTdXBlcm1vZGVsQ29uc3RydWN0b3IodHlwZSkpIHtcbiAgICBkZWYuaXNSZWZlcmVuY2UgPSB0cnVlXG4gIH0gZWxzZSBpZiAoZGVmLnZhbHVlKSB7XG4gICAgLy8gSWYgYSB2YWx1ZSBpcyBwcmVzZW50LCB1c2VcbiAgICAvLyB0aGF0IGFuZCBzaG9ydC1jaXJjdWl0IHRoZSByZXN0XG4gICAgZGVmLmlzU2ltcGxlID0gdHJ1ZVxuICB9IGVsc2Uge1xuICAgIC8vIE90aGVyd2lzZSBsb29rIGZvciBvdGhlciBub24tc3BlY2lhbFxuICAgIC8vIGtleXMgYW5kIGFsc28gYW55IGl0ZW0gZGVmaW5pdGlvblxuICAgIC8vIGluIHRoZSBjYXNlIG9mIEFycmF5c1xuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhmcm9tKVxuICAgIHZhciBjaGlsZEtleXMgPSBrZXlzLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgcmV0dXJuIF9fU1BFQ0lBTF9QUk9QUy5pbmRleE9mKGl0ZW0pID09PSAtMVxuICAgIH0pXG5cbiAgICBpZiAoY2hpbGRLZXlzLmxlbmd0aCkge1xuICAgICAgdmFyIGRlZnMgPSB7fVxuICAgICAgdmFyIHByb3RvXG5cbiAgICAgIGNoaWxkS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGZyb20sIGtleSlcbiAgICAgICAgdmFyIHZhbHVlXG5cbiAgICAgICAgaWYgKGRlc2NyaXB0b3IuZ2V0IHx8IGRlc2NyaXB0b3Iuc2V0KSB7XG4gICAgICAgICAgdmFsdWUgPSB7XG4gICAgICAgICAgICBfX2dldDogZGVzY3JpcHRvci5nZXQsXG4gICAgICAgICAgICBfX3NldDogZGVzY3JpcHRvci5zZXRcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSBmcm9tW2tleV1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdXRpbC5pc0NvbnN0cnVjdG9yKHZhbHVlKSAmJiAhdXRpbC5pc1N1cGVybW9kZWxDb25zdHJ1Y3Rvcih2YWx1ZSkgJiYgdXRpbC5pc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgICAgIGlmICghcHJvdG8pIHtcbiAgICAgICAgICAgIHByb3RvID0ge31cbiAgICAgICAgICB9XG4gICAgICAgICAgcHJvdG9ba2V5XSA9IHZhbHVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmc1trZXldID0gY3JlYXRlRGVmKHZhbHVlKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBkZWYuZGVmcyA9IGRlZnNcbiAgICAgIGRlZi5wcm90byA9IHByb3RvXG5cbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgQXJyYXlcbiAgICBpZiAodHlwZSA9PT0gQXJyYXkgfHwgdXRpbC5pc0FycmF5KHR5cGUpKSB7XG4gICAgICBkZWYuaXNBcnJheSA9IHRydWVcblxuICAgICAgaWYgKHR5cGUubGVuZ3RoID4gMCkge1xuICAgICAgICBkZWYuZGVmID0gY3JlYXRlRGVmKHR5cGVbMF0pXG4gICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKGNoaWxkS2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgIGRlZi5pc1NpbXBsZSA9IHRydWVcbiAgICB9XG4gIH1cblxuICBkZWYuY3JlYXRlID0gY3JlYXRlV3JhcHBlckZhY3RvcnkoZGVmKVxuXG4gIHJldHVybiBkZWZcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVEZWZcbiIsIid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICB2YXIgYXJyID0gW11cblxuICAvKipcbiAgICogUHJveGllZCBhcnJheSBtdXRhdG9ycyBtZXRob2RzXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIHZhciBwb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IEFycmF5LnByb3RvdHlwZS5wb3AuYXBwbHkoYXJyKVxuXG4gICAgY2FsbGJhY2soJ3BvcCcsIGFyciwge1xuICAgICAgdmFsdWU6IHJlc3VsdFxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgdmFyIHB1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGFyciwgYXJndW1lbnRzKVxuXG4gICAgY2FsbGJhY2soJ3B1c2gnLCBhcnIsIHtcbiAgICAgIHZhbHVlOiByZXN1bHRcbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIHZhciBzaGlmdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gQXJyYXkucHJvdG90eXBlLnNoaWZ0LmFwcGx5KGFycilcblxuICAgIGNhbGxiYWNrKCdzaGlmdCcsIGFyciwge1xuICAgICAgdmFsdWU6IHJlc3VsdFxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgdmFyIHNvcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IEFycmF5LnByb3RvdHlwZS5zb3J0LmFwcGx5KGFyciwgYXJndW1lbnRzKVxuXG4gICAgY2FsbGJhY2soJ3NvcnQnLCBhcnIsIHtcbiAgICAgIHZhbHVlOiByZXN1bHRcbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIHZhciB1bnNoaWZ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXN1bHQgPSBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShhcnIsIGFyZ3VtZW50cylcblxuICAgIGNhbGxiYWNrKCd1bnNoaWZ0JywgYXJyLCB7XG4gICAgICB2YWx1ZTogcmVzdWx0XG4gICAgfSlcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICB2YXIgcmV2ZXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gQXJyYXkucHJvdG90eXBlLnJldmVyc2UuYXBwbHkoYXJyKVxuXG4gICAgY2FsbGJhY2soJ3JldmVyc2UnLCBhcnIsIHtcbiAgICAgIHZhbHVlOiByZXN1bHRcbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIHZhciBzcGxpY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0ID0gQXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseShhcnIsIGFyZ3VtZW50cylcblxuICAgIGNhbGxiYWNrKCdzcGxpY2UnLCBhcnIsIHtcbiAgICAgIHZhbHVlOiByZXN1bHQsXG4gICAgICByZW1vdmVkOiByZXN1bHQsXG4gICAgICBhZGRlZDogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKVxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogUHJveHkgYWxsIEFycmF5LnByb3RvdHlwZSBtdXRhdG9yIG1ldGhvZHMgb24gdGhpcyBhcnJheSBpbnN0YW5jZVxuICAgKi9cbiAgYXJyLnBvcCA9IGFyci5wb3AgJiYgcG9wXG4gIGFyci5wdXNoID0gYXJyLnB1c2ggJiYgcHVzaFxuICBhcnIuc2hpZnQgPSBhcnIuc2hpZnQgJiYgc2hpZnRcbiAgYXJyLnVuc2hpZnQgPSBhcnIudW5zaGlmdCAmJiB1bnNoaWZ0XG4gIGFyci5zb3J0ID0gYXJyLnNvcnQgJiYgc29ydFxuICBhcnIucmV2ZXJzZSA9IGFyci5yZXZlcnNlICYmIHJldmVyc2VcbiAgYXJyLnNwbGljZSA9IGFyci5zcGxpY2UgJiYgc3BsaWNlXG5cbiAgLyoqXG4gICAqIFNwZWNpYWwgdXBkYXRlIGZ1bmN0aW9uIHNpbmNlIHdlIGNhbid0IGRldGVjdFxuICAgKiBhc3NpZ25tZW50IGJ5IGluZGV4IGUuZy4gYXJyWzBdID0gJ3NvbWV0aGluZydcbiAgICovXG4gIGFyci51cGRhdGUgPSBmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XG4gICAgdmFyIG9sZFZhbHVlID0gYXJyW2luZGV4XVxuICAgIHZhciBuZXdWYWx1ZSA9IGFycltpbmRleF0gPSB2YWx1ZVxuXG4gICAgY2FsbGJhY2soJ3VwZGF0ZScsIGFyciwge1xuICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgdmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgb2xkVmFsdWU6IG9sZFZhbHVlXG4gICAgfSlcblxuICAgIHJldHVybiBuZXdWYWx1ZVxuICB9XG5cbiAgcmV0dXJuIGFyclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gRW1pdHRlckV2ZW50IChuYW1lLCBwYXRoLCB0YXJnZXQsIGRldGFpbCkge1xuICB0aGlzLm5hbWUgPSBuYW1lXG4gIHRoaXMucGF0aCA9IHBhdGhcbiAgdGhpcy50YXJnZXQgPSB0YXJnZXRcblxuICBpZiAoZGV0YWlsKSB7XG4gICAgdGhpcy5kZXRhaWwgPSBkZXRhaWxcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXJcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIEVtaXR0ZXIgKG9iaikge1xuICB2YXIgY3R4ID0gb2JqIHx8IHRoaXNcblxuICBpZiAob2JqKSB7XG4gICAgY3R4ID0gbWl4aW4ob2JqKVxuICAgIHJldHVybiBjdHhcbiAgfVxufVxuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4gKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV1cbiAgfVxuICByZXR1cm4gb2JqXG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9IEVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQsIGZuKSB7XG4gICh0aGlzLl9fY2FsbGJhY2tzW2V2ZW50XSA9IHRoaXMuX19jYWxsYmFja3NbZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gKGV2ZW50LCBmbikge1xuICBmdW5jdGlvbiBvbiAoKSB7XG4gICAgdGhpcy5vZmYoZXZlbnQsIG9uKVxuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgfVxuXG4gIG9uLmZuID0gZm5cbiAgdGhpcy5vbihldmVudCwgb24pXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoZXZlbnQsIGZuKSB7XG4gIC8vIGFsbFxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRoaXMuX19jYWxsYmFja3MgPSB7fVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fX2NhbGxiYWNrc1tldmVudF1cbiAgaWYgKCFjYWxsYmFja3MpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIGRlbGV0ZSB0aGlzLl9fY2FsbGJhY2tzW2V2ZW50XVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxuICB2YXIgY2JcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXVxuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtNaXhlZH0gLi4uXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX19jYWxsYmFja3NbZXZlbnRdXG5cbiAgaWYgKGNhbGxiYWNrcykge1xuICAgIGNhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKVxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgcmV0dXJuIHRoaXMuX19jYWxsYmFja3NbZXZlbnRdIHx8IFtdXG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIHJldHVybiAhIXRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGhcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG52YXIgY3JlYXRlTW9kZWxQcm90b3R5cGUgPSByZXF1aXJlKCcuL3Byb3RvJylcbnZhciBXcmFwcGVyID0gcmVxdWlyZSgnLi93cmFwcGVyJylcblxuZnVuY3Rpb24gY3JlYXRlTW9kZWxEZXNjcmlwdG9ycyAoZGVmLCBwYXJlbnQpIHtcbiAgdmFyIF9fID0ge31cblxuICB2YXIgZGVzYyA9IHtcbiAgICBfXzoge1xuICAgICAgdmFsdWU6IF9fXG4gICAgfSxcbiAgICBfX2RlZjoge1xuICAgICAgdmFsdWU6IGRlZlxuICAgIH0sXG4gICAgX19wYXJlbnQ6IHtcbiAgICAgIHZhbHVlOiBwYXJlbnQsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgX19jYWxsYmFja3M6IHtcbiAgICAgIHZhbHVlOiB7fSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlc2Ncbn1cblxuZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyAobW9kZWwpIHtcbiAgdmFyIGRlZnMgPSBtb2RlbC5fX2RlZi5kZWZzXG4gIGZvciAodmFyIGtleSBpbiBkZWZzKSB7XG4gICAgZGVmaW5lUHJvcGVydHkobW9kZWwsIGtleSwgZGVmc1trZXldKVxuICB9XG59XG5cbmZ1bmN0aW9uIGRlZmluZVByb3BlcnR5IChtb2RlbCwga2V5LCBkZWYpIHtcbiAgdmFyIGRlc2MgPSB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fX2dldChrZXkpXG4gICAgfSxcbiAgICBlbnVtZXJhYmxlOiBkZWYuZW51bWVyYWJsZSxcbiAgICBjb25maWd1cmFibGU6IGRlZi5jb25maWd1cmFibGVcbiAgfVxuXG4gIGlmIChkZWYud3JpdGFibGUpIHtcbiAgICBkZXNjLnNldCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5fX3NldE5vdGlmeUNoYW5nZShrZXksIHZhbHVlKVxuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2RlbCwga2V5LCBkZXNjKVxuXG4gIC8vIFNpbGVudGx5IGluaXRpYWxpemUgdGhlIHByb3BlcnR5IHdyYXBwZXJcbiAgbW9kZWwuX19ba2V5XSA9IGRlZi5jcmVhdGUobW9kZWwpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVdyYXBwZXJGYWN0b3J5IChkZWYpIHtcbiAgdmFyIHdyYXBwZXIsIGRlZmF1bHRWYWx1ZSwgYXNzZXJ0XG5cbiAgaWYgKGRlZi5pc1NpbXBsZSkge1xuICAgIHdyYXBwZXIgPSBuZXcgV3JhcHBlcihkZWYudmFsdWUsIGRlZi53cml0YWJsZSwgZGVmLnZhbGlkYXRvcnMsIGRlZi5nZXR0ZXIsIGRlZi5zZXR0ZXIsIGRlZi5jYXN0LCBudWxsKVxuICB9IGVsc2UgaWYgKGRlZi5pc1JlZmVyZW5jZSkge1xuICAgIC8vIEhvbGQgYSByZWZlcmVuY2UgdG8gdGhlXG4gICAgLy8gcmVmZXJlcmVuY2VkIHR5cGVzJyBkZWZpbml0aW9uXG4gICAgdmFyIHJlZkRlZiA9IGRlZi50eXBlLmRlZlxuXG4gICAgaWYgKHJlZkRlZi5pc1NpbXBsZSkge1xuICAgICAgLy8gSWYgdGhlIHJlZmVyZW5jZWQgdHlwZSBpcyBpdHNlbGYgc2ltcGxlLFxuICAgICAgLy8gd2UgY2FuIHNldCBqdXN0IHJldHVybiBhIHdyYXBwZXIgYW5kXG4gICAgICAvLyB0aGUgcHJvcGVydHkgd2lsbCBnZXQgaW5pdGlhbGl6ZWQuXG4gICAgICB3cmFwcGVyID0gbmV3IFdyYXBwZXIocmVmRGVmLnZhbHVlLCByZWZEZWYud3JpdGFibGUsIHJlZkRlZi52YWxpZGF0b3JzLCBkZWYuZ2V0dGVyLCBkZWYuc2V0dGVyLCByZWZEZWYuY2FzdCwgbnVsbClcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgd2UncmUgbm90IGRlYWxpbmcgd2l0aCBhIHNpbXBsZSByZWZlcmVuY2UgbW9kZWxcbiAgICAgIC8vIHdlIG5lZWQgdG8gZGVmaW5lIGFuIGFzc2VydGlvbiB0aGF0IHRoZSBpbnN0YW5jZVxuICAgICAgLy8gYmVpbmcgc2V0IGlzIG9mIHRoZSBjb3JyZWN0IHR5cGUuIFdlIGRvIHRoaXMgYmVcbiAgICAgIC8vIGNvbXBhcmluZyB0aGUgZGVmcy5cblxuICAgICAgYXNzZXJ0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIGNvbXBhcmUgdGhlIGRlZmludGlvbnMgb2YgdGhlIHZhbHVlIGluc3RhbmNlXG4gICAgICAgIC8vIGJlaW5nIHBhc3NlZCBhbmQgdGhlIGRlZiBwcm9wZXJ0eSBhdHRhY2hlZFxuICAgICAgICAvLyB0byB0aGUgdHlwZSBTdXBlcm1vZGVsQ29uc3RydWN0b3IuIEFsbG93IHRoZVxuICAgICAgICAvLyB2YWx1ZSB0byBiZSB1bmRlZmluZWQgb3IgbnVsbCBhbHNvLlxuICAgICAgICB2YXIgaXNDb3JyZWN0VHlwZSA9IGZhbHNlXG5cbiAgICAgICAgaWYgKHV0aWwuaXNOdWxsT3JVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgICAgaXNDb3JyZWN0VHlwZSA9IHRydWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpc0NvcnJlY3RUeXBlID0gcmVmRGVmID09PSB2YWx1ZS5fX2RlZlxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpc0NvcnJlY3RUeXBlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdWYWx1ZSBzaG91bGQgYmUgYW4gaW5zdGFuY2Ugb2YgdGhlIHJlZmVyZW5jZWQgbW9kZWwsIG51bGwgb3IgdW5kZWZpbmVkJylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB3cmFwcGVyID0gbmV3IFdyYXBwZXIoZGVmLnZhbHVlLCBkZWYud3JpdGFibGUsIGRlZi52YWxpZGF0b3JzLCBkZWYuZ2V0dGVyLCBkZWYuc2V0dGVyLCBudWxsLCBhc3NlcnQpXG4gICAgfVxuICB9IGVsc2UgaWYgKGRlZi5pc0FycmF5KSB7XG4gICAgZGVmYXVsdFZhbHVlID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICAgICAgLy8gZm9yIEFycmF5cywgd2UgY3JlYXRlIGEgbmV3IEFycmF5IGFuZCBlYWNoXG4gICAgICAvLyB0aW1lLCBtaXggdGhlIG1vZGVsIHByb3BlcnRpZXMgaW50byBpdFxuICAgICAgdmFyIG1vZGVsID0gY3JlYXRlTW9kZWxQcm90b3R5cGUoZGVmKVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMobW9kZWwsIGNyZWF0ZU1vZGVsRGVzY3JpcHRvcnMoZGVmLCBwYXJlbnQpKVxuICAgICAgZGVmaW5lUHJvcGVydGllcyhtb2RlbClcbiAgICAgIHJldHVybiBtb2RlbFxuICAgIH1cblxuICAgIGFzc2VydCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgLy8gdG9kbzogZnVydGhlciBhcnJheSB0eXBlIHZhbGlkYXRpb25cbiAgICAgIGlmICghdXRpbC5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZhbHVlIHNob3VsZCBiZSBhbiBhcnJheScpXG4gICAgICB9XG4gICAgfVxuXG4gICAgd3JhcHBlciA9IG5ldyBXcmFwcGVyKGRlZmF1bHRWYWx1ZSwgZGVmLndyaXRhYmxlLCBkZWYudmFsaWRhdG9ycywgZGVmLmdldHRlciwgZGVmLnNldHRlciwgbnVsbCwgYXNzZXJ0KVxuICB9IGVsc2Uge1xuICAgIC8vIGZvciBPYmplY3RzLCB3ZSBjYW4gY3JlYXRlIGFuZCByZXVzZVxuICAgIC8vIGEgcHJvdG90eXBlIG9iamVjdC4gV2UgdGhlbiBuZWVkIHRvIG9ubHlcbiAgICAvLyBkZWZpbmUgdGhlIGRlZnMgYW5kIHRoZSAnaW5zdGFuY2UnIHByb3BlcnRpZXNcbiAgICAvLyBlLmcuIF9fLCBwYXJlbnQgZXRjLlxuICAgIHZhciBwcm90byA9IGNyZWF0ZU1vZGVsUHJvdG90eXBlKGRlZilcblxuICAgIGRlZmF1bHRWYWx1ZSA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgICAgIHZhciBtb2RlbCA9IE9iamVjdC5jcmVhdGUocHJvdG8sIGNyZWF0ZU1vZGVsRGVzY3JpcHRvcnMoZGVmLCBwYXJlbnQpKVxuICAgICAgZGVmaW5lUHJvcGVydGllcyhtb2RlbClcbiAgICAgIHJldHVybiBtb2RlbFxuICAgIH1cblxuICAgIGFzc2VydCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKCFwcm90by5pc1Byb3RvdHlwZU9mKHZhbHVlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcHJvdG90eXBlJylcbiAgICAgIH1cbiAgICB9XG5cbiAgICB3cmFwcGVyID0gbmV3IFdyYXBwZXIoZGVmYXVsdFZhbHVlLCBkZWYud3JpdGFibGUsIGRlZi52YWxpZGF0b3JzLCBkZWYuZ2V0dGVyLCBkZWYuc2V0dGVyLCBudWxsLCBhc3NlcnQpXG4gIH1cblxuICB2YXIgZmFjdG9yeSA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgICB2YXIgd3JhcCA9IE9iamVjdC5jcmVhdGUod3JhcHBlcilcbiAgICAvLyBpZiAoIXdyYXAuaXNJbml0aWFsaXplZCkge1xuICAgIHdyYXAuaW5pdGlhbGl6ZShwYXJlbnQpXG4gICAgLy8gfVxuICAgIHJldHVybiB3cmFwXG4gIH1cblxuICAvLyBleHBvc2UgdGhlIHdyYXBwZXIsIHRoaXMgaXMgdXNlZFxuICAvLyBmb3IgdmFsaWRhdGluZyBhcnJheSBpdGVtcyBsYXRlclxuICBmYWN0b3J5LndyYXBwZXIgPSB3cmFwcGVyXG5cbiAgcmV0dXJuIGZhY3Rvcnlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVXcmFwcGVyRmFjdG9yeVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmZ1bmN0aW9uIG1lcmdlIChtb2RlbCwgb2JqKSB7XG4gIHZhciBpc0FycmF5ID0gbW9kZWwuX19kZWYuaXNBcnJheVxuICB2YXIgZGVmcyA9IG1vZGVsLl9fZGVmLmRlZnNcbiAgdmFyIGRlZktleXMsIGRlZiwga2V5LCBpLCBpc1NpbXBsZSxcbiAgICBpc1NpbXBsZVJlZmVyZW5jZSwgaXNJbml0aWFsaXplZFJlZmVyZW5jZVxuXG4gIGlmIChkZWZzKSB7XG4gICAgZGVmS2V5cyA9IE9iamVjdC5rZXlzKGRlZnMpXG4gICAgZm9yIChpID0gMDsgaSA8IGRlZktleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGtleSA9IGRlZktleXNbaV1cbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBkZWYgPSBkZWZzW2tleV1cblxuICAgICAgICBpc1NpbXBsZSA9IGRlZi5pc1NpbXBsZVxuICAgICAgICBpc1NpbXBsZVJlZmVyZW5jZSA9IGRlZi5pc1JlZmVyZW5jZSAmJiBkZWYudHlwZS5kZWYuaXNTaW1wbGVcbiAgICAgICAgaXNJbml0aWFsaXplZFJlZmVyZW5jZSA9IGRlZi5pc1JlZmVyZW5jZSAmJiBvYmpba2V5XSAmJiBvYmpba2V5XS5fX3N1cGVybW9kZWxcblxuICAgICAgICBpZiAoaXNTaW1wbGUgfHwgaXNTaW1wbGVSZWZlcmVuY2UgfHwgaXNJbml0aWFsaXplZFJlZmVyZW5jZSkge1xuICAgICAgICAgIG1vZGVsW2tleV0gPSBvYmpba2V5XVxuICAgICAgICB9IGVsc2UgaWYgKG9ialtrZXldKSB7XG4gICAgICAgICAgaWYgKGRlZi5pc1JlZmVyZW5jZSkge1xuICAgICAgICAgICAgbW9kZWxba2V5XSA9IGRlZi50eXBlKClcbiAgICAgICAgICB9XG4gICAgICAgICAgbWVyZ2UobW9kZWxba2V5XSwgb2JqW2tleV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoaXNBcnJheSAmJiBBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IG1vZGVsLmNyZWF0ZSgpXG4gICAgICBtb2RlbC5wdXNoKGl0ZW0gJiYgaXRlbS5fX3N1cGVybW9kZWwgPyBtZXJnZShpdGVtLCBvYmpbaV0pIDogb2JqW2ldKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtb2RlbFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1lcmdlXG4iLCIndXNlIHN0cmljdCdcblxudmFyIEVtaXR0ZXJFdmVudCA9IHJlcXVpcmUoJy4vZW1pdHRlci1ldmVudCcpXG52YXIgVmFsaWRhdGlvbkVycm9yID0gcmVxdWlyZSgnLi92YWxpZGF0aW9uLWVycm9yJylcbnZhciBXcmFwcGVyID0gcmVxdWlyZSgnLi93cmFwcGVyJylcbnZhciBtZXJnZSA9IHJlcXVpcmUoJy4vbWVyZ2UnKVxuXG52YXIgZGVzY3JpcHRvcnMgPSB7XG4gIF9fc3VwZXJtb2RlbDoge1xuICAgIHZhbHVlOiB0cnVlXG4gIH0sXG4gIF9fa2V5czoge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzKVxuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzKSkge1xuICAgICAgICB2YXIgb21pdCA9IFtcbiAgICAgICAgICAnYWRkRXZlbnRMaXN0ZW5lcicsICdvbicsICdvbmNlJywgJ3JlbW92ZUV2ZW50TGlzdGVuZXInLCAncmVtb3ZlQWxsTGlzdGVuZXJzJyxcbiAgICAgICAgICAncmVtb3ZlTGlzdGVuZXInLCAnb2ZmJywgJ2VtaXQnLCAnbGlzdGVuZXJzJywgJ2hhc0xpc3RlbmVycycsICdwb3AnLCAncHVzaCcsXG4gICAgICAgICAgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzcGxpY2UnLCAndXBkYXRlJywgJ3Vuc2hpZnQnLCAnY3JlYXRlJywgJ19fbWVyZ2UnLFxuICAgICAgICAgICdfX3NldE5vdGlmeUNoYW5nZScsICdfX25vdGlmeUNoYW5nZScsICdfX3NldCcsICdfX2dldCcsICdfX2NoYWluJywgJ19fcmVsYXRpdmVQYXRoJ1xuICAgICAgICBdXG5cbiAgICAgICAga2V5cyA9IGtleXMuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIG9taXQuaW5kZXhPZihpdGVtKSA8IDBcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGtleXNcbiAgICB9XG4gIH0sXG4gIF9fbmFtZToge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuX19pc1Jvb3QpIHtcbiAgICAgICAgcmV0dXJuICcnXG4gICAgICB9XG5cbiAgICAgIC8vIFdvcmsgb3V0IHRoZSAnbmFtZScgb2YgdGhlIG1vZGVsXG4gICAgICAvLyBMb29rIHVwIHRvIHRoZSBwYXJlbnQgYW5kIGxvb3AgdGhyb3VnaCBpdCdzIGtleXMsXG4gICAgICAvLyBBbnkgdmFsdWUgb3IgYXJyYXkgZm91bmQgdG8gY29udGFpbiB0aGUgdmFsdWUgb2YgdGhpcyAodGhpcyBtb2RlbClcbiAgICAgIC8vIHRoZW4gd2UgcmV0dXJuIHRoZSBrZXkgYW5kIGluZGV4IGluIHRoZSBjYXNlIHdlIGZvdW5kIHRoZSBtb2RlbCBpbiBhbiBhcnJheS5cbiAgICAgIHZhciBwYXJlbnRLZXlzID0gdGhpcy5fX3BhcmVudC5fX2tleXNcbiAgICAgIHZhciBwYXJlbnRLZXksIHBhcmVudFZhbHVlXG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyZW50S2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwYXJlbnRLZXkgPSBwYXJlbnRLZXlzW2ldXG4gICAgICAgIHBhcmVudFZhbHVlID0gdGhpcy5fX3BhcmVudFtwYXJlbnRLZXldXG5cbiAgICAgICAgaWYgKHBhcmVudFZhbHVlID09PSB0aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIHBhcmVudEtleVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBfX3BhdGg6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLl9faGFzQW5jZXN0b3JzICYmICF0aGlzLl9fcGFyZW50Ll9faXNSb290KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fcGFyZW50Ll9fcGF0aCArICcuJyArIHRoaXMuX19uYW1lXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5fX25hbWVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIF9faXNSb290OiB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gIXRoaXMuX19oYXNBbmNlc3RvcnNcbiAgICB9XG4gIH0sXG4gIF9fY2hpbGRyZW46IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjaGlsZHJlbiA9IFtdXG5cbiAgICAgIHZhciBrZXlzID0gdGhpcy5fX2tleXNcbiAgICAgIHZhciBrZXksIHZhbHVlXG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBrZXkgPSBrZXlzW2ldXG4gICAgICAgIHZhbHVlID0gdGhpc1trZXldXG5cbiAgICAgICAgaWYgKHZhbHVlICYmIHZhbHVlLl9fc3VwZXJtb2RlbCkge1xuICAgICAgICAgIGNoaWxkcmVuLnB1c2godmFsdWUpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNoaWxkcmVuXG4gICAgfVxuICB9LFxuICBfX2FuY2VzdG9yczoge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGFuY2VzdG9ycyA9IFtdXG4gICAgICB2YXIgciA9IHRoaXNcblxuICAgICAgd2hpbGUgKHIuX19wYXJlbnQpIHtcbiAgICAgICAgYW5jZXN0b3JzLnB1c2goci5fX3BhcmVudClcbiAgICAgICAgciA9IHIuX19wYXJlbnRcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGFuY2VzdG9yc1xuICAgIH1cbiAgfSxcbiAgX19kZXNjZW5kYW50czoge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRlc2NlbmRhbnRzID0gW11cblxuICAgICAgZnVuY3Rpb24gY2hlY2tBbmRBZGREZXNjZW5kYW50SWZNb2RlbCAob2JqKSB7XG4gICAgICAgIHZhciBrZXlzID0gb2JqLl9fa2V5c1xuICAgICAgICB2YXIga2V5LCB2YWx1ZVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGtleSA9IGtleXNbaV1cbiAgICAgICAgICB2YWx1ZSA9IG9ialtrZXldXG5cbiAgICAgICAgICBpZiAodmFsdWUgJiYgdmFsdWUuX19zdXBlcm1vZGVsKSB7XG4gICAgICAgICAgICBkZXNjZW5kYW50cy5wdXNoKHZhbHVlKVxuICAgICAgICAgICAgY2hlY2tBbmRBZGREZXNjZW5kYW50SWZNb2RlbCh2YWx1ZSlcblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICB9XG5cbiAgICAgIGNoZWNrQW5kQWRkRGVzY2VuZGFudElmTW9kZWwodGhpcylcblxuICAgICAgcmV0dXJuIGRlc2NlbmRhbnRzXG4gICAgfVxuICB9LFxuICBfX2hhc0FuY2VzdG9yczoge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICEhdGhpcy5fX2FuY2VzdG9ycy5sZW5ndGhcbiAgICB9XG4gIH0sXG4gIF9faGFzRGVzY2VuZGFudHM6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAhIXRoaXMuX19kZXNjZW5kYW50cy5sZW5ndGhcbiAgICB9XG4gIH0sXG4gIGVycm9yczoge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGVycm9ycyA9IFtdXG4gICAgICB2YXIgZGVmID0gdGhpcy5fX2RlZlxuICAgICAgdmFyIHZhbGlkYXRvciwgZXJyb3IsIGksIGpcblxuICAgICAgLy8gUnVuIG93biB2YWxpZGF0b3JzXG4gICAgICB2YXIgb3duID0gZGVmLnZhbGlkYXRvcnMuc2xpY2UoMClcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBvd24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsaWRhdG9yID0gb3duW2ldXG4gICAgICAgIGVycm9yID0gdmFsaWRhdG9yLmNhbGwodGhpcywgdGhpcylcblxuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICBlcnJvcnMucHVzaChuZXcgVmFsaWRhdGlvbkVycm9yKHRoaXMsIGVycm9yLCB2YWxpZGF0b3IpKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFJ1biB0aHJvdWdoIGtleXMgYW5kIGV2YWx1YXRlIHZhbGlkYXRvcnNcbiAgICAgIHZhciBrZXlzID0gdGhpcy5fX2tleXNcbiAgICAgIHZhciB2YWx1ZSwga2V5LCBpdGVtRGVmXG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGtleSA9IGtleXNbaV1cblxuICAgICAgICAvLyBJZiB3ZSBhcmUgYW4gQXJyYXkgd2l0aCBhbiBpdGVtIGRlZmluaXRpb25cbiAgICAgICAgLy8gdGhlbiB3ZSBoYXZlIHRvIGxvb2sgaW50byB0aGUgQXJyYXkgZm9yIG91ciB2YWx1ZVxuICAgICAgICAvLyBhbmQgYWxzbyBnZXQgaG9sZCBvZiB0aGUgd3JhcHBlci4gV2Ugb25seSBuZWVkIHRvXG4gICAgICAgIC8vIGRvIHRoaXMgaWYgdGhlIGtleSBpcyBub3QgYSBwcm9wZXJ0eSBvZiB0aGUgYXJyYXkuXG4gICAgICAgIC8vIFdlIGNoZWNrIHRoZSBkZWZzIHRvIHdvcmsgdGhpcyBvdXQgKGkuZS4gMCwgMSwgMikuXG4gICAgICAgIC8vIHRvZG86IFRoaXMgY291bGQgYmUgYmV0dGVyIHRvIGNoZWNrICFOYU4gb24gdGhlIGtleT9cbiAgICAgICAgaWYgKGRlZi5pc0FycmF5ICYmIGRlZi5kZWYgJiYgKCFkZWYuZGVmcyB8fCAhKGtleSBpbiBkZWYuZGVmcykpKSB7XG4gICAgICAgICAgLy8gSWYgd2UgYXJlIGFuIEFycmF5IHdpdGggYSBzaW1wbGUgaXRlbSBkZWZpbml0aW9uXG4gICAgICAgICAgLy8gb3IgYSByZWZlcmVuY2UgdG8gYSBzaW1wbGUgdHlwZSBkZWZpbml0aW9uXG4gICAgICAgICAgLy8gc3Vic3RpdHV0ZSB0aGUgdmFsdWUgd2l0aCB0aGUgd3JhcHBlciB3ZSBnZXQgZnJvbSB0aGVcbiAgICAgICAgICAvLyBjcmVhdGUgZmFjdG9yeSBmdW5jdGlvbi4gT3RoZXJ3aXNlIHNldCB0aGUgdmFsdWUgdG9cbiAgICAgICAgICAvLyB0aGUgcmVhbCB2YWx1ZSBvZiB0aGUgcHJvcGVydHkuXG4gICAgICAgICAgaXRlbURlZiA9IGRlZi5kZWZcblxuICAgICAgICAgIGlmIChpdGVtRGVmLmlzU2ltcGxlKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGl0ZW1EZWYuY3JlYXRlLndyYXBwZXJcbiAgICAgICAgICAgIHZhbHVlLnNldFZhbHVlKHRoaXNba2V5XSlcbiAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW1EZWYuaXNSZWZlcmVuY2UgJiYgaXRlbURlZi50eXBlLmRlZi5pc1NpbXBsZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBpdGVtRGVmLnR5cGUuZGVmLmNyZWF0ZS53cmFwcGVyXG4gICAgICAgICAgICB2YWx1ZS5zZXRWYWx1ZSh0aGlzW2tleV0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpc1trZXldXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFNldCB0aGUgdmFsdWUgdG8gdGhlIHdyYXBwZWQgdmFsdWUgb2YgdGhlIHByb3BlcnR5XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLl9fW2tleV1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgIGlmICh2YWx1ZS5fX3N1cGVybW9kZWwpIHtcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGVycm9ycywgdmFsdWUuZXJyb3JzKVxuICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBXcmFwcGVyKSB7XG4gICAgICAgICAgICB2YXIgd3JhcHBlclZhbHVlID0gdmFsdWUuZ2V0VmFsdWUodGhpcylcblxuICAgICAgICAgICAgaWYgKHdyYXBwZXJWYWx1ZSAmJiB3cmFwcGVyVmFsdWUuX19zdXBlcm1vZGVsKSB7XG4gICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGVycm9ycywgd3JhcHBlclZhbHVlLmVycm9ycylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHZhciBzaW1wbGUgPSB2YWx1ZS52YWxpZGF0b3JzXG4gICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBzaW1wbGUubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3IgPSBzaW1wbGVbal1cbiAgICAgICAgICAgICAgICBlcnJvciA9IHZhbGlkYXRvci5jYWxsKHRoaXMsIHdyYXBwZXJWYWx1ZSwga2V5KVxuXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICBlcnJvcnMucHVzaChuZXcgVmFsaWRhdGlvbkVycm9yKHRoaXMsIGVycm9yLCB2YWxpZGF0b3IsIGtleSkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBlcnJvcnNcbiAgICB9XG4gIH1cbn1cblxudmFyIHByb3RvID0ge1xuICBfX2dldDogZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiB0aGlzLl9fW2tleV0uZ2V0VmFsdWUodGhpcylcbiAgfSxcbiAgX19zZXQ6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgdGhpcy5fX1trZXldLnNldFZhbHVlKHZhbHVlLCB0aGlzKVxuICB9LFxuICBfX3JlbGF0aXZlUGF0aDogZnVuY3Rpb24gKHRvLCBrZXkpIHtcbiAgICB2YXIgcmVsYXRpdmVQYXRoID0gdGhpcy5fX3BhdGggPyB0by5zdWJzdHIodGhpcy5fX3BhdGgubGVuZ3RoICsgMSkgOiB0b1xuXG4gICAgaWYgKHJlbGF0aXZlUGF0aCkge1xuICAgICAgcmV0dXJuIGtleSA/IHJlbGF0aXZlUGF0aCArICcuJyArIGtleSA6IHJlbGF0aXZlUGF0aFxuICAgIH1cbiAgICByZXR1cm4ga2V5XG4gIH0sXG4gIF9fY2hhaW46IGZ1bmN0aW9uIChmbikge1xuICAgIHJldHVybiBbdGhpc10uY29uY2F0KHRoaXMuX19hbmNlc3RvcnMpLmZvckVhY2goZm4pXG4gIH0sXG4gIF9fbWVyZ2U6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgcmV0dXJuIG1lcmdlKHRoaXMsIGRhdGEpXG4gIH0sXG4gIF9fbm90aWZ5Q2hhbmdlOiBmdW5jdGlvbiAoa2V5LCBuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpc1xuICAgIHZhciB0YXJnZXRQYXRoID0gdGhpcy5fX3BhdGhcbiAgICB2YXIgZXZlbnROYW1lID0gJ3NldCdcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIG9sZFZhbHVlOiBvbGRWYWx1ZSxcbiAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZVxuICAgIH1cblxuICAgIHRoaXMuZW1pdChldmVudE5hbWUsIG5ldyBFbWl0dGVyRXZlbnQoZXZlbnROYW1lLCBrZXksIHRhcmdldCwgZGF0YSkpXG4gICAgdGhpcy5lbWl0KCdjaGFuZ2UnLCBuZXcgRW1pdHRlckV2ZW50KGV2ZW50TmFtZSwga2V5LCB0YXJnZXQsIGRhdGEpKVxuICAgIHRoaXMuZW1pdCgnY2hhbmdlOicgKyBrZXksIG5ldyBFbWl0dGVyRXZlbnQoZXZlbnROYW1lLCBrZXksIHRhcmdldCwgZGF0YSkpXG5cbiAgICB0aGlzLl9fYW5jZXN0b3JzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBwYXRoID0gaXRlbS5fX3JlbGF0aXZlUGF0aCh0YXJnZXRQYXRoLCBrZXkpXG4gICAgICBpdGVtLmVtaXQoJ2NoYW5nZScsIG5ldyBFbWl0dGVyRXZlbnQoZXZlbnROYW1lLCBwYXRoLCB0YXJnZXQsIGRhdGEpKVxuICAgIH0pXG4gIH0sXG4gIF9fc2V0Tm90aWZ5Q2hhbmdlOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMuX19nZXQoa2V5KVxuICAgIHRoaXMuX19zZXQoa2V5LCB2YWx1ZSlcbiAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLl9fZ2V0KGtleSlcbiAgICB0aGlzLl9fbm90aWZ5Q2hhbmdlKGtleSwgbmV3VmFsdWUsIG9sZFZhbHVlKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBwcm90bzogcHJvdG8sXG4gIGRlc2NyaXB0b3JzOiBkZXNjcmlwdG9yc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciBlbWl0dGVyID0gcmVxdWlyZSgnLi9lbWl0dGVyLW9iamVjdCcpXG52YXIgZW1pdHRlckFycmF5ID0gcmVxdWlyZSgnLi9lbWl0dGVyLWFycmF5JylcbnZhciBFbWl0dGVyRXZlbnQgPSByZXF1aXJlKCcuL2VtaXR0ZXItZXZlbnQnKVxuXG52YXIgZXh0ZW5kID0gcmVxdWlyZSgnLi91dGlsJykuZXh0ZW5kXG52YXIgbW9kZWwgPSByZXF1aXJlKCcuL21vZGVsJylcbnZhciBtb2RlbFByb3RvID0gbW9kZWwucHJvdG9cbnZhciBtb2RlbERlc2NyaXB0b3JzID0gbW9kZWwuZGVzY3JpcHRvcnNcblxudmFyIG1vZGVsUHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShtb2RlbFByb3RvLCBtb2RlbERlc2NyaXB0b3JzKVxudmFyIG9iamVjdFByb3RvdHlwZSA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBwID0gT2JqZWN0LmNyZWF0ZShtb2RlbFByb3RvdHlwZSlcblxuICBlbWl0dGVyKHApXG5cbiAgcmV0dXJuIHBcbn0pKClcblxuZnVuY3Rpb24gY3JlYXRlQXJyYXlQcm90b3R5cGUgKCkge1xuICB2YXIgcCA9IGVtaXR0ZXJBcnJheShmdW5jdGlvbiAoZXZlbnROYW1lLCBhcnIsIGUpIHtcbiAgICBpZiAoZXZlbnROYW1lID09PSAndXBkYXRlJykge1xuICAgICAgLyoqXG4gICAgICAgKiBGb3J3YXJkIHRoZSBzcGVjaWFsIGFycmF5IHVwZGF0ZVxuICAgICAgICogZXZlbnRzIGFzIHN0YW5kYXJkIF9fbm90aWZ5Q2hhbmdlIGV2ZW50c1xuICAgICAgICovXG4gICAgICBhcnIuX19ub3RpZnlDaGFuZ2UoZS5pbmRleCwgZS52YWx1ZSwgZS5vbGRWYWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgLyoqXG4gICAgICAgKiBBbGwgb3RoZXIgZXZlbnRzIGUuZy4gcHVzaCwgc3BsaWNlIGFyZSByZWxheWVkXG4gICAgICAgKi9cbiAgICAgIHZhciB0YXJnZXQgPSBhcnJcbiAgICAgIHZhciBwYXRoID0gYXJyLl9fcGF0aFxuICAgICAgdmFyIGRhdGEgPSBlXG4gICAgICB2YXIga2V5ID0gZS5pbmRleFxuXG4gICAgICBhcnIuZW1pdChldmVudE5hbWUsIG5ldyBFbWl0dGVyRXZlbnQoZXZlbnROYW1lLCAnJywgdGFyZ2V0LCBkYXRhKSlcbiAgICAgIGFyci5lbWl0KCdjaGFuZ2UnLCBuZXcgRW1pdHRlckV2ZW50KGV2ZW50TmFtZSwgJycsIHRhcmdldCwgZGF0YSkpXG4gICAgICBhcnIuX19hbmNlc3RvcnMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICB2YXIgbmFtZSA9IGl0ZW0uX19yZWxhdGl2ZVBhdGgocGF0aCwga2V5KVxuICAgICAgICBpdGVtLmVtaXQoJ2NoYW5nZScsIG5ldyBFbWl0dGVyRXZlbnQoZXZlbnROYW1lLCBuYW1lLCB0YXJnZXQsIGRhdGEpKVxuICAgICAgfSlcblxuICAgIH1cbiAgfSlcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhwLCBtb2RlbERlc2NyaXB0b3JzKVxuXG4gIGVtaXR0ZXIocClcblxuICBleHRlbmQocCwgbW9kZWxQcm90bylcblxuICByZXR1cm4gcFxufVxuXG5mdW5jdGlvbiBjcmVhdGVPYmplY3RNb2RlbFByb3RvdHlwZSAocHJvdG8pIHtcbiAgdmFyIHAgPSBPYmplY3QuY3JlYXRlKG9iamVjdFByb3RvdHlwZSlcblxuICBpZiAocHJvdG8pIHtcbiAgICBleHRlbmQocCwgcHJvdG8pXG4gIH1cblxuICByZXR1cm4gcFxufVxuXG5mdW5jdGlvbiBjcmVhdGVBcnJheU1vZGVsUHJvdG90eXBlIChwcm90bywgaXRlbURlZikge1xuICAvLyBXZSBkbyBub3QgdG8gYXR0ZW1wdCB0byBzdWJjbGFzcyBBcnJheSxcbiAgLy8gaW5zdGVhZCBjcmVhdGUgYSBuZXcgaW5zdGFuY2UgZWFjaCB0aW1lXG4gIC8vIGFuZCBtaXhpbiB0aGUgcHJvdG8gb2JqZWN0XG4gIHZhciBwID0gY3JlYXRlQXJyYXlQcm90b3R5cGUoKVxuXG4gIGlmIChwcm90bykge1xuICAgIGV4dGVuZChwLCBwcm90bylcbiAgfVxuXG4gIGlmIChpdGVtRGVmKSB7XG4gICAgLy8gV2UgaGF2ZSBhIGRlZmluaXRpb24gZm9yIHRoZSBpdGVtc1xuICAgIC8vIHRoYXQgYmVsb25nIGluIHRoaXMgYXJyYXkuXG5cbiAgICAvLyBVc2UgdGhlIGB3cmFwcGVyYCBwcm90b3R5cGUgcHJvcGVydHkgYXMgYVxuICAgIC8vIHZpcnR1YWwgV3JhcHBlciBvYmplY3Qgd2UgY2FuIHVzZVxuICAgIC8vIHZhbGlkYXRlIGFsbCB0aGUgaXRlbXMgaW4gdGhlIGFycmF5LlxuICAgIHZhciBhcnJJdGVtV3JhcHBlciA9IGl0ZW1EZWYuY3JlYXRlLndyYXBwZXJcblxuICAgIC8vIFZhbGlkYXRlIG5ldyBtb2RlbHMgYnkgb3ZlcnJpZGluZyB0aGUgZW1pdHRlciBhcnJheVxuICAgIC8vIG11dGF0b3JzIHRoYXQgY2FuIGNhdXNlIG5ldyBpdGVtcyB0byBlbnRlciB0aGUgYXJyYXkuXG4gICAgb3ZlcnJpZGVBcnJheUFkZGluZ011dGF0b3JzKHAsIGFyckl0ZW1XcmFwcGVyKVxuXG4gICAgLy8gUHJvdmlkZSBhIGNvbnZlbmllbnQgbW9kZWwgZmFjdG9yeVxuICAgIC8vIGZvciBjcmVhdGluZyBhcnJheSBpdGVtIGluc3RhbmNlc1xuICAgIHAuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGl0ZW1EZWYuaXNSZWZlcmVuY2UgPyBpdGVtRGVmLnR5cGUoKSA6IGl0ZW1EZWYuY3JlYXRlKCkuZ2V0VmFsdWUodGhpcylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcFxufVxuXG5mdW5jdGlvbiBvdmVycmlkZUFycmF5QWRkaW5nTXV0YXRvcnMgKGFyciwgaXRlbVdyYXBwZXIpIHtcbiAgZnVuY3Rpb24gZ2V0QXJyYXlBcmdzIChpdGVtcykge1xuICAgIHZhciBhcmdzID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpdGVtV3JhcHBlci5zZXRWYWx1ZShpdGVtc1tpXSwgYXJyKVxuICAgICAgYXJncy5wdXNoKGl0ZW1XcmFwcGVyLmdldFZhbHVlKGFycikpXG4gICAgfVxuICAgIHJldHVybiBhcmdzXG4gIH1cblxuICB2YXIgcHVzaCA9IGFyci5wdXNoXG4gIHZhciB1bnNoaWZ0ID0gYXJyLnVuc2hpZnRcbiAgdmFyIHNwbGljZSA9IGFyci5zcGxpY2VcbiAgdmFyIHVwZGF0ZSA9IGFyci51cGRhdGVcblxuICBpZiAocHVzaCkge1xuICAgIGFyci5wdXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGFyZ3MgPSBnZXRBcnJheUFyZ3MoYXJndW1lbnRzKVxuICAgICAgcmV0dXJuIHB1c2guYXBwbHkoYXJyLCBhcmdzKVxuICAgIH1cbiAgfVxuXG4gIGlmICh1bnNoaWZ0KSB7XG4gICAgYXJyLnVuc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYXJncyA9IGdldEFycmF5QXJncyhhcmd1bWVudHMpXG4gICAgICByZXR1cm4gdW5zaGlmdC5hcHBseShhcnIsIGFyZ3MpXG4gICAgfVxuICB9XG5cbiAgaWYgKHNwbGljZSkge1xuICAgIGFyci5zcGxpY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYXJncyA9IGdldEFycmF5QXJncyhBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpKVxuICAgICAgYXJncy51bnNoaWZ0KGFyZ3VtZW50c1sxXSlcbiAgICAgIGFyZ3MudW5zaGlmdChhcmd1bWVudHNbMF0pXG4gICAgICByZXR1cm4gc3BsaWNlLmFwcGx5KGFyciwgYXJncylcbiAgICB9XG4gIH1cblxuICBpZiAodXBkYXRlKSB7XG4gICAgYXJyLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhcmdzID0gZ2V0QXJyYXlBcmdzKFthcmd1bWVudHNbMV1dKVxuICAgICAgYXJncy51bnNoaWZ0KGFyZ3VtZW50c1swXSlcbiAgICAgIHJldHVybiB1cGRhdGUuYXBwbHkoYXJyLCBhcmdzKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVNb2RlbFByb3RvdHlwZSAoZGVmKSB7XG4gIHJldHVybiBkZWYuaXNBcnJheSA/IGNyZWF0ZUFycmF5TW9kZWxQcm90b3R5cGUoZGVmLnByb3RvLCBkZWYuZGVmKSA6IGNyZWF0ZU9iamVjdE1vZGVsUHJvdG90eXBlKGRlZi5wcm90bylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVNb2RlbFByb3RvdHlwZVxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0ge31cbiIsIid1c2Ugc3RyaWN0J1xuXG4vLyB2YXIgbWVyZ2UgPSByZXF1aXJlKCcuL21lcmdlJylcbnZhciBjcmVhdGVEZWYgPSByZXF1aXJlKCcuL2RlZicpXG52YXIgU3VwZXJtb2RlbCA9IHJlcXVpcmUoJy4vc3VwZXJtb2RlbCcpXG5cbmZ1bmN0aW9uIHN1cGVybW9kZWxzIChzY2hlbWEsIGluaXRpYWxpemVyKSB7XG4gIHZhciBkZWYgPSBjcmVhdGVEZWYoc2NoZW1hKVxuXG4gIGZ1bmN0aW9uIFN1cGVybW9kZWxDb25zdHJ1Y3RvciAoZGF0YSkge1xuICAgIHZhciBtb2RlbCA9IGRlZi5pc1NpbXBsZSA/IGRlZi5jcmVhdGUoKSA6IGRlZi5jcmVhdGUoKS5nZXRWYWx1ZSh7fSlcblxuICAgIC8vIENhbGwgYW55IGluaXRpYWxpemVyXG4gICAgaWYgKGluaXRpYWxpemVyKSB7XG4gICAgICBpbml0aWFsaXplci5hcHBseShtb2RlbCwgYXJndW1lbnRzKVxuICAgIH0gZWxzZSBpZiAoZGF0YSkge1xuICAgICAgLy8gaWYgdGhlcmUncyBubyBpbml0aWFsaXplclxuICAgICAgLy8gYnV0IHdlIGhhdmUgYmVlbiBwYXNzZWQgc29tZVxuICAgICAgLy8gZGF0YSwgbWVyZ2UgaXQgaW50byB0aGUgbW9kZWwuXG4gICAgICBtb2RlbC5fX21lcmdlKGRhdGEpXG4gICAgfVxuICAgIHJldHVybiBtb2RlbFxuICB9XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdXBlcm1vZGVsQ29uc3RydWN0b3IsICdkZWYnLCB7XG4gICAgdmFsdWU6IGRlZiAvLyB0aGlzIGlzIHVzZWQgdG8gdmFsaWRhdGUgcmVmZXJlbmNlZCBTdXBlcm1vZGVsQ29uc3RydWN0b3JzXG4gIH0pXG4gIFN1cGVybW9kZWxDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSBTdXBlcm1vZGVsIC8vIHRoaXMgc2hhcmVkIG9iamVjdCBpcyB1c2VkLCBhcyBhIHByb3RvdHlwZSwgdG8gaWRlbnRpZnkgU3VwZXJtb2RlbENvbnN0cnVjdG9yc1xuICBTdXBlcm1vZGVsQ29uc3RydWN0b3IuY29uc3RydWN0b3IgPSBTdXBlcm1vZGVsQ29uc3RydWN0b3JcbiAgcmV0dXJuIFN1cGVybW9kZWxDb25zdHJ1Y3RvclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN1cGVybW9kZWxzXG4iLCIndXNlIHN0cmljdCdcblxudmFyIFN1cGVybW9kZWwgPSByZXF1aXJlKCcuL3N1cGVybW9kZWwnKVxuXG5mdW5jdGlvbiBleHRlbmQgKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgdHlwZW9mIGFkZCAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gb3JpZ2luXG4gIH1cblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZClcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aFxuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dXG4gIH1cbiAgcmV0dXJuIG9yaWdpblxufVxuXG52YXIgdXRpbCA9IHtcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHR5cGVPZjogZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKS5tYXRjaCgvXFxzKFthLXpBLVpdKykvKVsxXS50b0xvd2VyQ2FzZSgpXG4gIH0sXG4gIGlzT2JqZWN0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy50eXBlT2YodmFsdWUpID09PSAnb2JqZWN0J1xuICB9LFxuICBpc0FycmF5OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSlcbiAgfSxcbiAgaXNTaW1wbGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vICdTaW1wbGUnIGhlcmUgbWVhbnMgYW55dGhpbmdcbiAgICAvLyBvdGhlciB0aGFuIGFuIE9iamVjdCBvciBhbiBBcnJheVxuICAgIC8vIGkuZS4gbnVtYmVyLCBzdHJpbmcsIGRhdGUsIGJvb2wsIG51bGwsIHVuZGVmaW5lZCwgcmVnZXguLi5cbiAgICByZXR1cm4gIXRoaXMuaXNPYmplY3QodmFsdWUpICYmICF0aGlzLmlzQXJyYXkodmFsdWUpXG4gIH0sXG4gIGlzRnVuY3Rpb246IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLnR5cGVPZih2YWx1ZSkgPT09ICdmdW5jdGlvbidcbiAgfSxcbiAgaXNEYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy50eXBlT2YodmFsdWUpID09PSAnZGF0ZSdcbiAgfSxcbiAgaXNOdWxsOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IG51bGxcbiAgfSxcbiAgaXNVbmRlZmluZWQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgKHZhbHVlKSA9PT0gJ3VuZGVmaW5lZCdcbiAgfSxcbiAgaXNOdWxsT3JVbmRlZmluZWQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmlzTnVsbCh2YWx1ZSkgfHwgdGhpcy5pc1VuZGVmaW5lZCh2YWx1ZSlcbiAgfSxcbiAgY2FzdDogZnVuY3Rpb24gKHZhbHVlLCB0eXBlKSB7XG4gICAgaWYgKCF0eXBlKSB7XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgU3RyaW5nOlxuICAgICAgICByZXR1cm4gdXRpbC5jYXN0U3RyaW5nKHZhbHVlKVxuICAgICAgY2FzZSBOdW1iZXI6XG4gICAgICAgIHJldHVybiB1dGlsLmNhc3ROdW1iZXIodmFsdWUpXG4gICAgICBjYXNlIEJvb2xlYW46XG4gICAgICAgIHJldHVybiB1dGlsLmNhc3RCb29sZWFuKHZhbHVlKVxuICAgICAgY2FzZSBEYXRlOlxuICAgICAgICByZXR1cm4gdXRpbC5jYXN0RGF0ZSh2YWx1ZSlcbiAgICAgIGNhc2UgT2JqZWN0OlxuICAgICAgY2FzZSBGdW5jdGlvbjpcbiAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY2FzdCcpXG4gICAgfVxuICB9LFxuICBjYXN0U3RyaW5nOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB1dGlsLnR5cGVPZih2YWx1ZSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nICYmIHZhbHVlLnRvU3RyaW5nKClcbiAgfSxcbiAgY2FzdE51bWJlcjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBOYU5cbiAgICB9XG4gICAgaWYgKHV0aWwudHlwZU9mKHZhbHVlKSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gTnVtYmVyKHZhbHVlKVxuICB9LFxuICBjYXN0Qm9vbGVhbjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHZhciBmYWxzZXkgPSBbJzAnLCAnZmFsc2UnLCAnb2ZmJywgJ25vJ11cbiAgICByZXR1cm4gZmFsc2V5LmluZGV4T2YodmFsdWUpID09PSAtMVxuICB9LFxuICBjYXN0RGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwgfHwgdXRpbC50eXBlT2YodmFsdWUpID09PSAnZGF0ZScpIHtcbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gbmV3IERhdGUodmFsdWUpXG4gIH0sXG4gIGlzQ29uc3RydWN0b3I6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmlzU2ltcGxlQ29uc3RydWN0b3IodmFsdWUpIHx8IFtBcnJheSwgT2JqZWN0XS5pbmRleE9mKHZhbHVlKSA+IC0xXG4gIH0sXG4gIGlzU2ltcGxlQ29uc3RydWN0b3I6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiBbU3RyaW5nLCBOdW1iZXIsIERhdGUsIEJvb2xlYW5dLmluZGV4T2YodmFsdWUpID4gLTFcbiAgfSxcbiAgaXNTdXBlcm1vZGVsQ29uc3RydWN0b3I6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmlzRnVuY3Rpb24odmFsdWUpICYmIHZhbHVlLnByb3RvdHlwZSA9PT0gU3VwZXJtb2RlbFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmZ1bmN0aW9uIFZhbGlkYXRpb25FcnJvciAodGFyZ2V0LCBlcnJvciwgdmFsaWRhdG9yLCBrZXkpIHtcbiAgdGhpcy50YXJnZXQgPSB0YXJnZXRcbiAgdGhpcy5lcnJvciA9IGVycm9yXG4gIHRoaXMudmFsaWRhdG9yID0gdmFsaWRhdG9yXG5cbiAgaWYgKGtleSkge1xuICAgIHRoaXMua2V5ID0ga2V5XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBWYWxpZGF0aW9uRXJyb3JcbiIsIid1c2Ugc3RyaWN0J1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG5cbmZ1bmN0aW9uIFdyYXBwZXIgKGRlZmF1bHRWYWx1ZSwgd3JpdGFibGUsIHZhbGlkYXRvcnMsIGdldHRlciwgc2V0dGVyLCBiZWZvcmVTZXQsIGFzc2VydCkge1xuICB0aGlzLnZhbGlkYXRvcnMgPSB2YWxpZGF0b3JzXG5cbiAgdGhpcy5fZGVmYXVsdFZhbHVlID0gZGVmYXVsdFZhbHVlXG4gIHRoaXMuX3dyaXRhYmxlID0gd3JpdGFibGVcbiAgdGhpcy5fZ2V0dGVyID0gZ2V0dGVyXG4gIHRoaXMuX3NldHRlciA9IHNldHRlclxuICB0aGlzLl9iZWZvcmVTZXQgPSBiZWZvcmVTZXRcbiAgdGhpcy5fYXNzZXJ0ID0gYXNzZXJ0XG4gIHRoaXMuaXNJbml0aWFsaXplZCA9IGZhbHNlXG5cbiAgaWYgKCF1dGlsLmlzRnVuY3Rpb24oZGVmYXVsdFZhbHVlKSkge1xuICAgIHRoaXMuaXNJbml0aWFsaXplZCA9IHRydWVcblxuICAgIGlmICghdXRpbC5pc1VuZGVmaW5lZChkZWZhdWx0VmFsdWUpKSB7XG4gICAgICB0aGlzLl92YWx1ZSA9IGRlZmF1bHRWYWx1ZVxuICAgIH1cbiAgfVxufVxuV3JhcHBlci5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgaWYgKHRoaXMuaXNJbml0aWFsaXplZCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdGhpcy5zZXRWYWx1ZSh0aGlzLl9kZWZhdWx0VmFsdWUocGFyZW50KSwgcGFyZW50KVxuICB0aGlzLmlzSW5pdGlhbGl6ZWQgPSB0cnVlXG59XG5XcmFwcGVyLnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uIChtb2RlbCkge1xuICByZXR1cm4gdGhpcy5fZ2V0dGVyID8gdGhpcy5fZ2V0dGVyLmNhbGwobW9kZWwpIDogdGhpcy5fdmFsdWVcbn1cbldyYXBwZXIucHJvdG90eXBlLnNldFZhbHVlID0gZnVuY3Rpb24gKHZhbHVlLCBtb2RlbCkge1xuICBpZiAoIXRoaXMuX3dyaXRhYmxlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdWYWx1ZSBpcyByZWFkb25seScpXG4gIH1cblxuICAvLyBIb29rIHVwIHRoZSBwYXJlbnQgcmVmIGlmIG5lY2Vzc2FyeVxuICBpZiAodmFsdWUgJiYgdmFsdWUuX19zdXBlcm1vZGVsICYmIG1vZGVsKSB7XG4gICAgaWYgKHZhbHVlLl9fcGFyZW50ICE9PSBtb2RlbCkge1xuICAgICAgdmFsdWUuX19wYXJlbnQgPSBtb2RlbFxuICAgIH1cbiAgfVxuXG4gIHZhciB2YWxcbiAgaWYgKHRoaXMuX3NldHRlcikge1xuICAgIHRoaXMuX3NldHRlci5jYWxsKG1vZGVsLCB2YWx1ZSlcbiAgICB2YWwgPSB0aGlzLmdldFZhbHVlKG1vZGVsKVxuICB9IGVsc2Uge1xuICAgIHZhbCA9IHRoaXMuX2JlZm9yZVNldCA/IHRoaXMuX2JlZm9yZVNldCh2YWx1ZSkgOiB2YWx1ZVxuICB9XG5cbiAgaWYgKHRoaXMuX2Fzc2VydCkge1xuICAgIHRoaXMuX2Fzc2VydCh2YWwpXG4gIH1cblxuICB0aGlzLl92YWx1ZSA9IHZhbFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdyYXBwZXJcbiJdfQ==
