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
