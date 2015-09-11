var supermodels = require('supermodels.js')
var patch = require('../incremental-dom').patch
var helpers = require('../helpers')
var template = require('./template.html')
var productsData = require('./products-data')
var basketData = require('./basket-data')

var productSchema = {
  id: helpers.rndstr,
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
    productId: String,
    quantity: Number,
    get cost () {
      var product = this.product
      return this.quantity * (product.price - (product.price * product.discountPercent))
    },
    get product () {
      var id = this.productId

      return this.__ancestors[this.__ancestors.length - 1].products.filter(function (item) {
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

  app.on('change', render)

  window.apps.push(app)
}
