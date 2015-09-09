(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./lib/supermodels');

},{"./lib/supermodels":11}],2:[function(require,module,exports){
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

},{"./factory":6,"./util":12}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
'use strict'

module.exports = function EmitterEvent (name, path, target, detail) {
  this.name = name
  this.path = path
  this.target = target

  if (detail) {
    this.detail = detail
  }
}

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./proto":9,"./util":12,"./wrapper":14}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{"./emitter-event":4,"./merge":7,"./validation-error":13,"./wrapper":14}],9:[function(require,module,exports){
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

},{"./emitter-array":3,"./emitter-event":4,"./emitter-object":5,"./model":8,"./util":12}],10:[function(require,module,exports){
'use strict'

module.exports = {}

},{}],11:[function(require,module,exports){
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

},{"./def":2,"./supermodel":10}],12:[function(require,module,exports){
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

},{"./supermodel":10}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"./util":12}],15:[function(require,module,exports){
module.exports={
  "items": [
    {
      "productId": "1",
      "quantity": 2
    },
    {
      "productId": "2",
      "quantity": 5
    },
    {
      "productId": "3",
      "quantity": 1
    }
  ]
}

},{}],16:[function(require,module,exports){
var supermodels = require('supermodels.js')
var patch = require('../incremental-dom').patch
var template = require('./template.html')
var productsData = require('./products-data')
var basketData = require('./basket-data')

var productSchema = {
  productId: String,
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

},{"../incremental-dom":21,"./basket-data":15,"./products-data":18,"./template.html":19,"supermodels.js":1}],17:[function(require,module,exports){
module.exports = function (model) {
elementOpen("h3")
  text(" \
    Total lines " + (model.items.length) + ", total quantity " + (model.totalQuantity) + " \
  ")
elementClose("h3")
};

},{}],18:[function(require,module,exports){
module.exports=[
  {
    "productId": "1",
    "productName": "Apple iPod touch 32GB 5th Generation - White",
    "price": 190.50,
    "discountPercent": 0,
    "image": "http://ecx.images-amazon.com/images/I/31Y0DrM4ZNL._SY355_.jpg"
  },
  {
    "productId": "2",
    "productName": "Samsung Galaxy Tab 3 7-inch - (Black, Wi-Fi)",
    "price": 110,
    "discountPercent": 0.2,
    "image": "http://ecx.images-amazon.com/images/I/81aaDjlcU4L._SL1500_.jpg"
  },
  {
    "productId": "3",
    "productName": "Bose QuietComfort 20 Acoustic Noise Cancelling Headphones",
    "price": 250,
    "discountPercent": 0.125,
    "image": "http://ecx.images-amazon.com/images/I/61XaVWVyNNL._SL1500_.jpg"
  }
]

},{}],19:[function(require,module,exports){
module.exports = function (model) {
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
elementOpen("table")
  elementOpen("thead")
    elementOpen("tr")
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
        elementOpen("td", null, null, "onclick", add)
          text("" + (item.product.productId) + "")
        elementClose("td")
        elementOpen("td")
          text("" + (item.product.productName) + "")
        elementClose("td")
        elementOpen("td")
          elementOpen("input", null, ["type", "number", "onchange", function (e) { item.quantity = this.value}], "value", item.quantity)
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
          elementOpen("button", null, ["onclick", function (e) { remove($index) }])
            text("Remove")
          elementClose("button")
        elementClose("td")
      elementClose("tr")
    }, basket.items)
    elementOpen("tbody")
      totalSummary(basket)
      if (basket.items.length) {
        text(" \
            I'm in an `if` attribute " + (basket.totalCost) + " \
          ")
      }
    elementClose("tbody")
  elementClose("tbody")
elementClose("table")
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
    elementOpen("button", null, ["onclick", function (e) { add(product) }])
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
  text(" \
    " + (JSON.stringify(model, null, 2)) + " \
  ")
  elementOpen("pre")
  elementClose("pre")
elementClose("pre")
};

},{"./lines-summary.html":17,"./total-summary.html":20}],20:[function(require,module,exports){
module.exports = function (model) {
elementOpen("tfoot")
  elementOpen("tr")
    elementOpen("td")
      elementOpen("h3")
        text(" \
                " + (model.totalCost) + " \
              ")
      elementClose("h3")
    elementClose("td")
  elementClose("tr")
elementClose("tfoot")
};

},{}],21:[function(require,module,exports){
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


},{}],22:[function(require,module,exports){
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
var todo = require('./todo')

window.basket = basket
window.todo = todo

},{"./basket":16,"./incremental-dom":21,"./todo":23}],23:[function(require,module,exports){
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

},{"../incremental-dom":21,"./todo.html":24,"supermodels.js":1}],24:[function(require,module,exports){
module.exports = function (model) {
var todos = model

function add (e) {
  e.preventDefault();
  var newTodo = todos.create()
  newTodo.text = this.newTodo.value;
  todos.push(newTodo)
  this.newTodo.select()
}

function clearCompleted (index) {
  var len = todos.length
  for (var i = len - 1; i >= 0; i--) {
    if (todos[i].completed) {
      todos.splice(i, 1)
    }
  }
}

// function toggleCompleted () {
//   var state = this.checked
//   todos.forEach(function(todo) {
//     todo.completed = state
//   })
// }

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
        elementOpen("form", null, null, "onsubmit", add)
          elementOpen("input", null, ["type", "text", "name", "newTodo", "placeholder", "Enter new todo"])
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
          elementOpen("input", null, ["type", "text", "onkeyup", function (e) { todo.text = this.value}], "value", todo.text, "style", { borderColor: todo.text ? '': 'red', textDecoration: todo.completed ? 'line-through': '' })
          elementClose("input")
        elementClose("td")
        elementOpen("td")
          elementOpen("input", null, ["type", "checkbox", "onchange", function (e) { todo.completed = this.checked}], "checked", todo.completed || undefined)
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
        elementOpen("button", null, null, "onclick", clearCompleted)
          text("Clear completed " + (totalCompleted()) + "")
        elementClose("button")
      elementClose("td")
    elementClose("tr")
  elementClose("tfoot")
elementClose("table")
elementOpen("pre")
  text("" + (JSON.stringify(todos, null, 2)) + "")
elementClose("pre")
};

},{}]},{},[22])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL2RlZi5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvZW1pdHRlci1hcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvZW1pdHRlci1ldmVudC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvZW1pdHRlci1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL2ZhY3RvcnkuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL21lcmdlLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi9tb2RlbC5qcyIsIm5vZGVfbW9kdWxlcy9zdXBlcm1vZGVscy5qcy9saWIvcHJvdG8uanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL3N1cGVybW9kZWwuanMiLCJub2RlX21vZHVsZXMvc3VwZXJtb2RlbHMuanMvbGliL3N1cGVybW9kZWxzLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi91dGlsLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi92YWxpZGF0aW9uLWVycm9yLmpzIiwibm9kZV9tb2R1bGVzL3N1cGVybW9kZWxzLmpzL2xpYi93cmFwcGVyLmpzIiwidGVzdC9iYXNrZXQvYmFza2V0LWRhdGEuanNvbiIsInRlc3QvYmFza2V0L2luZGV4LmpzIiwidGVzdC9iYXNrZXQvbGluZXMtc3VtbWFyeS5odG1sIiwidGVzdC9iYXNrZXQvcHJvZHVjdHMtZGF0YS5qc29uIiwidGVzdC9iYXNrZXQvdGVtcGxhdGUuaHRtbCIsInRlc3QvYmFza2V0L3RvdGFsLXN1bW1hcnkuaHRtbCIsInRlc3QvaW5jcmVtZW50YWwtZG9tLmpzIiwidGVzdC9pbmRleC5qcyIsInRlc3QvdG9kby9pbmRleC5qcyIsInRlc3QvdG9kby90b2RvLmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3grQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvc3VwZXJtb2RlbHMnKTtcbiIsIid1c2Ugc3RyaWN0J1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG52YXIgY3JlYXRlV3JhcHBlckZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3RvcnknKVxuXG5mdW5jdGlvbiByZXNvbHZlIChmcm9tKSB7XG4gIHZhciBpc0N0b3IgPSB1dGlsLmlzQ29uc3RydWN0b3IoZnJvbSlcbiAgdmFyIGlzU3VwZXJtb2RlbEN0b3IgPSB1dGlsLmlzU3VwZXJtb2RlbENvbnN0cnVjdG9yKGZyb20pXG4gIHZhciBpc0FycmF5ID0gdXRpbC5pc0FycmF5KGZyb20pXG5cbiAgaWYgKGlzQ3RvciB8fCBpc1N1cGVybW9kZWxDdG9yIHx8IGlzQXJyYXkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgX190eXBlOiBmcm9tXG4gICAgfVxuICB9XG5cbiAgdmFyIGlzVmFsdWUgPSAhdXRpbC5pc09iamVjdChmcm9tKVxuICBpZiAoaXNWYWx1ZSkge1xuICAgIHJldHVybiB7XG4gICAgICBfX3ZhbHVlOiBmcm9tXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZyb21cbn1cblxuZnVuY3Rpb24gY3JlYXRlRGVmIChmcm9tKSB7XG4gIGZyb20gPSByZXNvbHZlKGZyb20pXG5cbiAgdmFyIF9fVkFMSURBVE9SUyA9ICdfX3ZhbGlkYXRvcnMnXG4gIHZhciBfX1ZBTFVFID0gJ19fdmFsdWUnXG4gIHZhciBfX1RZUEUgPSAnX190eXBlJ1xuICB2YXIgX19ESVNQTEFZTkFNRSA9ICdfX2Rpc3BsYXlOYW1lJ1xuICB2YXIgX19HRVQgPSAnX19nZXQnXG4gIHZhciBfX1NFVCA9ICdfX3NldCdcbiAgdmFyIF9fRU5VTUVSQUJMRSA9ICdfX2VudW1lcmFibGUnXG4gIHZhciBfX0NPTkZJR1VSQUJMRSA9ICdfX2NvbmZpZ3VyYWJsZSdcbiAgdmFyIF9fV1JJVEFCTEUgPSAnX193cml0YWJsZSdcbiAgdmFyIF9fU1BFQ0lBTF9QUk9QUyA9IFtcbiAgICBfX1ZBTElEQVRPUlMsIF9fVkFMVUUsIF9fVFlQRSwgX19ESVNQTEFZTkFNRSxcbiAgICBfX0dFVCwgX19TRVQsIF9fRU5VTUVSQUJMRSwgX19DT05GSUdVUkFCTEUsIF9fV1JJVEFCTEVcbiAgXVxuXG4gIHZhciBkZWYgPSB7XG4gICAgZnJvbTogZnJvbSxcbiAgICB0eXBlOiBmcm9tW19fVFlQRV0sXG4gICAgdmFsdWU6IGZyb21bX19WQUxVRV0sXG4gICAgdmFsaWRhdG9yczogZnJvbVtfX1ZBTElEQVRPUlNdIHx8IFtdLFxuICAgIGVudW1lcmFibGU6IGZyb21bX19FTlVNRVJBQkxFXSAhPT0gZmFsc2UsXG4gICAgY29uZmlndXJhYmxlOiAhIWZyb21bX19DT05GSUdVUkFCTEVdLFxuICAgIHdyaXRhYmxlOiBmcm9tW19fV1JJVEFCTEVdICE9PSBmYWxzZSxcbiAgICBkaXNwbGF5TmFtZTogZnJvbVtfX0RJU1BMQVlOQU1FXSxcbiAgICBnZXR0ZXI6IGZyb21bX19HRVRdLFxuICAgIHNldHRlcjogZnJvbVtfX1NFVF1cbiAgfVxuXG4gIHZhciB0eXBlID0gZGVmLnR5cGVcblxuICAvLyBTaW1wbGUgJ0NvbnN0cnVjdG9yJyBUeXBlXG4gIGlmICh1dGlsLmlzU2ltcGxlQ29uc3RydWN0b3IodHlwZSkpIHtcbiAgICBkZWYuaXNTaW1wbGUgPSB0cnVlXG5cbiAgICBkZWYuY2FzdCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHV0aWwuY2FzdCh2YWx1ZSwgdHlwZSlcbiAgICB9XG4gIH0gZWxzZSBpZiAodXRpbC5pc1N1cGVybW9kZWxDb25zdHJ1Y3Rvcih0eXBlKSkge1xuICAgIGRlZi5pc1JlZmVyZW5jZSA9IHRydWVcbiAgfSBlbHNlIGlmIChkZWYudmFsdWUpIHtcbiAgICAvLyBJZiBhIHZhbHVlIGlzIHByZXNlbnQsIHVzZVxuICAgIC8vIHRoYXQgYW5kIHNob3J0LWNpcmN1aXQgdGhlIHJlc3RcbiAgICBkZWYuaXNTaW1wbGUgPSB0cnVlXG4gIH0gZWxzZSB7XG4gICAgLy8gT3RoZXJ3aXNlIGxvb2sgZm9yIG90aGVyIG5vbi1zcGVjaWFsXG4gICAgLy8ga2V5cyBhbmQgYWxzbyBhbnkgaXRlbSBkZWZpbml0aW9uXG4gICAgLy8gaW4gdGhlIGNhc2Ugb2YgQXJyYXlzXG5cbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGZyb20pXG4gICAgdmFyIGNoaWxkS2V5cyA9IGtleXMuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gX19TUEVDSUFMX1BST1BTLmluZGV4T2YoaXRlbSkgPT09IC0xXG4gICAgfSlcblxuICAgIGlmIChjaGlsZEtleXMubGVuZ3RoKSB7XG4gICAgICB2YXIgZGVmcyA9IHt9XG4gICAgICB2YXIgcHJvdG9cblxuICAgICAgY2hpbGRLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZnJvbSwga2V5KVxuICAgICAgICB2YXIgdmFsdWVcblxuICAgICAgICBpZiAoZGVzY3JpcHRvci5nZXQgfHwgZGVzY3JpcHRvci5zZXQpIHtcbiAgICAgICAgICB2YWx1ZSA9IHtcbiAgICAgICAgICAgIF9fZ2V0OiBkZXNjcmlwdG9yLmdldCxcbiAgICAgICAgICAgIF9fc2V0OiBkZXNjcmlwdG9yLnNldFxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZSA9IGZyb21ba2V5XVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF1dGlsLmlzQ29uc3RydWN0b3IodmFsdWUpICYmICF1dGlsLmlzU3VwZXJtb2RlbENvbnN0cnVjdG9yKHZhbHVlKSAmJiB1dGlsLmlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgICAgaWYgKCFwcm90bykge1xuICAgICAgICAgICAgcHJvdG8gPSB7fVxuICAgICAgICAgIH1cbiAgICAgICAgICBwcm90b1trZXldID0gdmFsdWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZzW2tleV0gPSBjcmVhdGVEZWYodmFsdWUpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGRlZi5kZWZzID0gZGVmc1xuICAgICAgZGVmLnByb3RvID0gcHJvdG9cblxuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBBcnJheVxuICAgIGlmICh0eXBlID09PSBBcnJheSB8fCB1dGlsLmlzQXJyYXkodHlwZSkpIHtcbiAgICAgIGRlZi5pc0FycmF5ID0gdHJ1ZVxuXG4gICAgICBpZiAodHlwZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGRlZi5kZWYgPSBjcmVhdGVEZWYodHlwZVswXSlcbiAgICAgIH1cblxuICAgIH0gZWxzZSBpZiAoY2hpbGRLZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZGVmLmlzU2ltcGxlID0gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIGRlZi5jcmVhdGUgPSBjcmVhdGVXcmFwcGVyRmFjdG9yeShkZWYpXG5cbiAgcmV0dXJuIGRlZlxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZURlZlxuIiwiJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gIHZhciBhcnIgPSBbXVxuXG4gIC8qKlxuICAgKiBQcm94aWVkIGFycmF5IG11dGF0b3JzIG1ldGhvZHNcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9ialxuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgdmFyIHBvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gQXJyYXkucHJvdG90eXBlLnBvcC5hcHBseShhcnIpXG5cbiAgICBjYWxsYmFjaygncG9wJywgYXJyLCB7XG4gICAgICB2YWx1ZTogcmVzdWx0XG4gICAgfSlcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICB2YXIgcHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoYXJyLCBhcmd1bWVudHMpXG5cbiAgICBjYWxsYmFjaygncHVzaCcsIGFyciwge1xuICAgICAgdmFsdWU6IHJlc3VsdFxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgdmFyIHNoaWZ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXN1bHQgPSBBcnJheS5wcm90b3R5cGUuc2hpZnQuYXBwbHkoYXJyKVxuXG4gICAgY2FsbGJhY2soJ3NoaWZ0JywgYXJyLCB7XG4gICAgICB2YWx1ZTogcmVzdWx0XG4gICAgfSlcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICB2YXIgc29ydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzdWx0ID0gQXJyYXkucHJvdG90eXBlLnNvcnQuYXBwbHkoYXJyLCBhcmd1bWVudHMpXG5cbiAgICBjYWxsYmFjaygnc29ydCcsIGFyciwge1xuICAgICAgdmFsdWU6IHJlc3VsdFxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgdmFyIHVuc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGFyciwgYXJndW1lbnRzKVxuXG4gICAgY2FsbGJhY2soJ3Vuc2hpZnQnLCBhcnIsIHtcbiAgICAgIHZhbHVlOiByZXN1bHRcbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIHZhciByZXZlcnNlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXN1bHQgPSBBcnJheS5wcm90b3R5cGUucmV2ZXJzZS5hcHBseShhcnIpXG5cbiAgICBjYWxsYmFjaygncmV2ZXJzZScsIGFyciwge1xuICAgICAgdmFsdWU6IHJlc3VsdFxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgdmFyIHNwbGljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmFwcGx5KGFyciwgYXJndW1lbnRzKVxuXG4gICAgY2FsbGJhY2soJ3NwbGljZScsIGFyciwge1xuICAgICAgdmFsdWU6IHJlc3VsdCxcbiAgICAgIHJlbW92ZWQ6IHJlc3VsdCxcbiAgICAgIGFkZGVkOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpXG4gICAgfSlcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm94eSBhbGwgQXJyYXkucHJvdG90eXBlIG11dGF0b3IgbWV0aG9kcyBvbiB0aGlzIGFycmF5IGluc3RhbmNlXG4gICAqL1xuICBhcnIucG9wID0gYXJyLnBvcCAmJiBwb3BcbiAgYXJyLnB1c2ggPSBhcnIucHVzaCAmJiBwdXNoXG4gIGFyci5zaGlmdCA9IGFyci5zaGlmdCAmJiBzaGlmdFxuICBhcnIudW5zaGlmdCA9IGFyci51bnNoaWZ0ICYmIHVuc2hpZnRcbiAgYXJyLnNvcnQgPSBhcnIuc29ydCAmJiBzb3J0XG4gIGFyci5yZXZlcnNlID0gYXJyLnJldmVyc2UgJiYgcmV2ZXJzZVxuICBhcnIuc3BsaWNlID0gYXJyLnNwbGljZSAmJiBzcGxpY2VcblxuICAvKipcbiAgICogU3BlY2lhbCB1cGRhdGUgZnVuY3Rpb24gc2luY2Ugd2UgY2FuJ3QgZGV0ZWN0XG4gICAqIGFzc2lnbm1lbnQgYnkgaW5kZXggZS5nLiBhcnJbMF0gPSAnc29tZXRoaW5nJ1xuICAgKi9cbiAgYXJyLnVwZGF0ZSA9IGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcbiAgICB2YXIgb2xkVmFsdWUgPSBhcnJbaW5kZXhdXG4gICAgdmFyIG5ld1ZhbHVlID0gYXJyW2luZGV4XSA9IHZhbHVlXG5cbiAgICBjYWxsYmFjaygndXBkYXRlJywgYXJyLCB7XG4gICAgICBpbmRleDogaW5kZXgsXG4gICAgICB2YWx1ZTogbmV3VmFsdWUsXG4gICAgICBvbGRWYWx1ZTogb2xkVmFsdWVcbiAgICB9KVxuXG4gICAgcmV0dXJuIG5ld1ZhbHVlXG4gIH1cblxuICByZXR1cm4gYXJyXG59XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBFbWl0dGVyRXZlbnQgKG5hbWUsIHBhdGgsIHRhcmdldCwgZGV0YWlsKSB7XG4gIHRoaXMubmFtZSA9IG5hbWVcbiAgdGhpcy5wYXRoID0gcGF0aFxuICB0aGlzLnRhcmdldCA9IHRhcmdldFxuXG4gIGlmIChkZXRhaWwpIHtcbiAgICB0aGlzLmRldGFpbCA9IGRldGFpbFxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlclxuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlciAob2JqKSB7XG4gIHZhciBjdHggPSBvYmogfHwgdGhpc1xuXG4gIGlmIChvYmopIHtcbiAgICBjdHggPSBtaXhpbihvYmopXG4gICAgcmV0dXJuIGN0eFxuICB9XG59XG5cbi8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbiAob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XVxuICB9XG4gIHJldHVybiBvYmpcbn1cblxuLyoqXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID0gRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudCwgZm4pIHtcbiAgKHRoaXMuX19jYWxsYmFja3NbZXZlbnRdID0gdGhpcy5fX2NhbGxiYWNrc1tldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pXG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiAoZXZlbnQsIGZuKSB7XG4gIGZ1bmN0aW9uIG9uICgpIHtcbiAgICB0aGlzLm9mZihldmVudCwgb24pXG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICB9XG5cbiAgb24uZm4gPSBmblxuICB0aGlzLm9uKGV2ZW50LCBvbilcbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID0gRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIChldmVudCwgZm4pIHtcbiAgLy8gYWxsXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhpcy5fX2NhbGxiYWNrcyA9IHt9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIHNwZWNpZmljIGV2ZW50XG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9fY2FsbGJhY2tzW2V2ZW50XVxuICBpZiAoIWNhbGxiYWNrcykge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgZGVsZXRlIHRoaXMuX19jYWxsYmFja3NbZXZlbnRdXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYlxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGNiID0gY2FsbGJhY2tzW2ldXG4gICAgaWYgKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pIHtcbiAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSlcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIChldmVudCkge1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fX2NhbGxiYWNrc1tldmVudF1cblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChldmVudCkge1xuICByZXR1cm4gdGhpcy5fX2NhbGxiYWNrc1tldmVudF0gfHwgW11cbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGlzIGVtaXR0ZXIgaGFzIGBldmVudGAgaGFuZGxlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgcmV0dXJuICEhdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJylcbnZhciBjcmVhdGVNb2RlbFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vcHJvdG8nKVxudmFyIFdyYXBwZXIgPSByZXF1aXJlKCcuL3dyYXBwZXInKVxuXG5mdW5jdGlvbiBjcmVhdGVNb2RlbERlc2NyaXB0b3JzIChkZWYsIHBhcmVudCkge1xuICB2YXIgX18gPSB7fVxuXG4gIHZhciBkZXNjID0ge1xuICAgIF9fOiB7XG4gICAgICB2YWx1ZTogX19cbiAgICB9LFxuICAgIF9fZGVmOiB7XG4gICAgICB2YWx1ZTogZGVmXG4gICAgfSxcbiAgICBfX3BhcmVudDoge1xuICAgICAgdmFsdWU6IHBhcmVudCxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBfX2NhbGxiYWNrczoge1xuICAgICAgdmFsdWU6IHt9LFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZGVzY1xufVxuXG5mdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzIChtb2RlbCkge1xuICB2YXIgZGVmcyA9IG1vZGVsLl9fZGVmLmRlZnNcbiAgZm9yICh2YXIga2V5IGluIGRlZnMpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShtb2RlbCwga2V5LCBkZWZzW2tleV0pXG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkgKG1vZGVsLCBrZXksIGRlZikge1xuICB2YXIgZGVzYyA9IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fZ2V0KGtleSlcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IGRlZi5lbnVtZXJhYmxlLFxuICAgIGNvbmZpZ3VyYWJsZTogZGVmLmNvbmZpZ3VyYWJsZVxuICB9XG5cbiAgaWYgKGRlZi53cml0YWJsZSkge1xuICAgIGRlc2Muc2V0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLl9fc2V0Tm90aWZ5Q2hhbmdlKGtleSwgdmFsdWUpXG4gICAgfVxuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZGVsLCBrZXksIGRlc2MpXG5cbiAgLy8gU2lsZW50bHkgaW5pdGlhbGl6ZSB0aGUgcHJvcGVydHkgd3JhcHBlclxuICBtb2RlbC5fX1trZXldID0gZGVmLmNyZWF0ZShtb2RlbClcbn1cblxuZnVuY3Rpb24gY3JlYXRlV3JhcHBlckZhY3RvcnkgKGRlZikge1xuICB2YXIgd3JhcHBlciwgZGVmYXVsdFZhbHVlLCBhc3NlcnRcblxuICBpZiAoZGVmLmlzU2ltcGxlKSB7XG4gICAgd3JhcHBlciA9IG5ldyBXcmFwcGVyKGRlZi52YWx1ZSwgZGVmLndyaXRhYmxlLCBkZWYudmFsaWRhdG9ycywgZGVmLmdldHRlciwgZGVmLnNldHRlciwgZGVmLmNhc3QsIG51bGwpXG4gIH0gZWxzZSBpZiAoZGVmLmlzUmVmZXJlbmNlKSB7XG4gICAgLy8gSG9sZCBhIHJlZmVyZW5jZSB0byB0aGVcbiAgICAvLyByZWZlcmVyZW5jZWQgdHlwZXMnIGRlZmluaXRpb25cbiAgICB2YXIgcmVmRGVmID0gZGVmLnR5cGUuZGVmXG5cbiAgICBpZiAocmVmRGVmLmlzU2ltcGxlKSB7XG4gICAgICAvLyBJZiB0aGUgcmVmZXJlbmNlZCB0eXBlIGlzIGl0c2VsZiBzaW1wbGUsXG4gICAgICAvLyB3ZSBjYW4gc2V0IGp1c3QgcmV0dXJuIGEgd3JhcHBlciBhbmRcbiAgICAgIC8vIHRoZSBwcm9wZXJ0eSB3aWxsIGdldCBpbml0aWFsaXplZC5cbiAgICAgIHdyYXBwZXIgPSBuZXcgV3JhcHBlcihyZWZEZWYudmFsdWUsIHJlZkRlZi53cml0YWJsZSwgcmVmRGVmLnZhbGlkYXRvcnMsIGRlZi5nZXR0ZXIsIGRlZi5zZXR0ZXIsIHJlZkRlZi5jYXN0LCBudWxsKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB3ZSdyZSBub3QgZGVhbGluZyB3aXRoIGEgc2ltcGxlIHJlZmVyZW5jZSBtb2RlbFxuICAgICAgLy8gd2UgbmVlZCB0byBkZWZpbmUgYW4gYXNzZXJ0aW9uIHRoYXQgdGhlIGluc3RhbmNlXG4gICAgICAvLyBiZWluZyBzZXQgaXMgb2YgdGhlIGNvcnJlY3QgdHlwZS4gV2UgZG8gdGhpcyBiZVxuICAgICAgLy8gY29tcGFyaW5nIHRoZSBkZWZzLlxuXG4gICAgICBhc3NlcnQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gY29tcGFyZSB0aGUgZGVmaW50aW9ucyBvZiB0aGUgdmFsdWUgaW5zdGFuY2VcbiAgICAgICAgLy8gYmVpbmcgcGFzc2VkIGFuZCB0aGUgZGVmIHByb3BlcnR5IGF0dGFjaGVkXG4gICAgICAgIC8vIHRvIHRoZSB0eXBlIFN1cGVybW9kZWxDb25zdHJ1Y3Rvci4gQWxsb3cgdGhlXG4gICAgICAgIC8vIHZhbHVlIHRvIGJlIHVuZGVmaW5lZCBvciBudWxsIGFsc28uXG4gICAgICAgIHZhciBpc0NvcnJlY3RUeXBlID0gZmFsc2VcblxuICAgICAgICBpZiAodXRpbC5pc051bGxPclVuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICBpc0NvcnJlY3RUeXBlID0gdHJ1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlzQ29ycmVjdFR5cGUgPSByZWZEZWYgPT09IHZhbHVlLl9fZGVmXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzQ29ycmVjdFR5cGUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZhbHVlIHNob3VsZCBiZSBhbiBpbnN0YW5jZSBvZiB0aGUgcmVmZXJlbmNlZCBtb2RlbCwgbnVsbCBvciB1bmRlZmluZWQnKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHdyYXBwZXIgPSBuZXcgV3JhcHBlcihkZWYudmFsdWUsIGRlZi53cml0YWJsZSwgZGVmLnZhbGlkYXRvcnMsIGRlZi5nZXR0ZXIsIGRlZi5zZXR0ZXIsIG51bGwsIGFzc2VydClcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGVmLmlzQXJyYXkpIHtcbiAgICBkZWZhdWx0VmFsdWUgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gICAgICAvLyBmb3IgQXJyYXlzLCB3ZSBjcmVhdGUgYSBuZXcgQXJyYXkgYW5kIGVhY2hcbiAgICAgIC8vIHRpbWUsIG1peCB0aGUgbW9kZWwgcHJvcGVydGllcyBpbnRvIGl0XG4gICAgICB2YXIgbW9kZWwgPSBjcmVhdGVNb2RlbFByb3RvdHlwZShkZWYpXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhtb2RlbCwgY3JlYXRlTW9kZWxEZXNjcmlwdG9ycyhkZWYsIHBhcmVudCkpXG4gICAgICBkZWZpbmVQcm9wZXJ0aWVzKG1vZGVsKVxuICAgICAgcmV0dXJuIG1vZGVsXG4gICAgfVxuXG4gICAgYXNzZXJ0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAvLyB0b2RvOiBmdXJ0aGVyIGFycmF5IHR5cGUgdmFsaWRhdGlvblxuICAgICAgaWYgKCF1dGlsLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVmFsdWUgc2hvdWxkIGJlIGFuIGFycmF5JylcbiAgICAgIH1cbiAgICB9XG5cbiAgICB3cmFwcGVyID0gbmV3IFdyYXBwZXIoZGVmYXVsdFZhbHVlLCBkZWYud3JpdGFibGUsIGRlZi52YWxpZGF0b3JzLCBkZWYuZ2V0dGVyLCBkZWYuc2V0dGVyLCBudWxsLCBhc3NlcnQpXG4gIH0gZWxzZSB7XG4gICAgLy8gZm9yIE9iamVjdHMsIHdlIGNhbiBjcmVhdGUgYW5kIHJldXNlXG4gICAgLy8gYSBwcm90b3R5cGUgb2JqZWN0LiBXZSB0aGVuIG5lZWQgdG8gb25seVxuICAgIC8vIGRlZmluZSB0aGUgZGVmcyBhbmQgdGhlICdpbnN0YW5jZScgcHJvcGVydGllc1xuICAgIC8vIGUuZy4gX18sIHBhcmVudCBldGMuXG4gICAgdmFyIHByb3RvID0gY3JlYXRlTW9kZWxQcm90b3R5cGUoZGVmKVxuXG4gICAgZGVmYXVsdFZhbHVlID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICAgICAgdmFyIG1vZGVsID0gT2JqZWN0LmNyZWF0ZShwcm90bywgY3JlYXRlTW9kZWxEZXNjcmlwdG9ycyhkZWYsIHBhcmVudCkpXG4gICAgICBkZWZpbmVQcm9wZXJ0aWVzKG1vZGVsKVxuICAgICAgcmV0dXJuIG1vZGVsXG4gICAgfVxuXG4gICAgYXNzZXJ0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAoIXByb3RvLmlzUHJvdG90eXBlT2YodmFsdWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwcm90b3R5cGUnKVxuICAgICAgfVxuICAgIH1cblxuICAgIHdyYXBwZXIgPSBuZXcgV3JhcHBlcihkZWZhdWx0VmFsdWUsIGRlZi53cml0YWJsZSwgZGVmLnZhbGlkYXRvcnMsIGRlZi5nZXR0ZXIsIGRlZi5zZXR0ZXIsIG51bGwsIGFzc2VydClcbiAgfVxuXG4gIHZhciBmYWN0b3J5ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICAgIHZhciB3cmFwID0gT2JqZWN0LmNyZWF0ZSh3cmFwcGVyKVxuICAgIC8vIGlmICghd3JhcC5pc0luaXRpYWxpemVkKSB7XG4gICAgd3JhcC5pbml0aWFsaXplKHBhcmVudClcbiAgICAvLyB9XG4gICAgcmV0dXJuIHdyYXBcbiAgfVxuXG4gIC8vIGV4cG9zZSB0aGUgd3JhcHBlciwgdGhpcyBpcyB1c2VkXG4gIC8vIGZvciB2YWxpZGF0aW5nIGFycmF5IGl0ZW1zIGxhdGVyXG4gIGZhY3Rvcnkud3JhcHBlciA9IHdyYXBwZXJcblxuICByZXR1cm4gZmFjdG9yeVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVdyYXBwZXJGYWN0b3J5XG4iLCIndXNlIHN0cmljdCdcblxuZnVuY3Rpb24gbWVyZ2UgKG1vZGVsLCBvYmopIHtcbiAgdmFyIGlzQXJyYXkgPSBtb2RlbC5fX2RlZi5pc0FycmF5XG4gIHZhciBkZWZzID0gbW9kZWwuX19kZWYuZGVmc1xuICB2YXIgZGVmS2V5cywgZGVmLCBrZXksIGksIGlzU2ltcGxlLFxuICAgIGlzU2ltcGxlUmVmZXJlbmNlLCBpc0luaXRpYWxpemVkUmVmZXJlbmNlXG5cbiAgaWYgKGRlZnMpIHtcbiAgICBkZWZLZXlzID0gT2JqZWN0LmtleXMoZGVmcylcbiAgICBmb3IgKGkgPSAwOyBpIDwgZGVmS2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0gZGVmS2V5c1tpXVxuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIGRlZiA9IGRlZnNba2V5XVxuXG4gICAgICAgIGlzU2ltcGxlID0gZGVmLmlzU2ltcGxlXG4gICAgICAgIGlzU2ltcGxlUmVmZXJlbmNlID0gZGVmLmlzUmVmZXJlbmNlICYmIGRlZi50eXBlLmRlZi5pc1NpbXBsZVxuICAgICAgICBpc0luaXRpYWxpemVkUmVmZXJlbmNlID0gZGVmLmlzUmVmZXJlbmNlICYmIG9ialtrZXldICYmIG9ialtrZXldLl9fc3VwZXJtb2RlbFxuXG4gICAgICAgIGlmIChpc1NpbXBsZSB8fCBpc1NpbXBsZVJlZmVyZW5jZSB8fCBpc0luaXRpYWxpemVkUmVmZXJlbmNlKSB7XG4gICAgICAgICAgbW9kZWxba2V5XSA9IG9ialtrZXldXG4gICAgICAgIH0gZWxzZSBpZiAob2JqW2tleV0pIHtcbiAgICAgICAgICBpZiAoZGVmLmlzUmVmZXJlbmNlKSB7XG4gICAgICAgICAgICBtb2RlbFtrZXldID0gZGVmLnR5cGUoKVxuICAgICAgICAgIH1cbiAgICAgICAgICBtZXJnZShtb2RlbFtrZXldLCBvYmpba2V5XSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChpc0FycmF5ICYmIEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBvYmoubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpdGVtID0gbW9kZWwuY3JlYXRlKClcbiAgICAgIG1vZGVsLnB1c2goaXRlbSAmJiBpdGVtLl9fc3VwZXJtb2RlbCA/IG1lcmdlKGl0ZW0sIG9ialtpXSkgOiBvYmpbaV0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1vZGVsXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWVyZ2VcbiIsIid1c2Ugc3RyaWN0J1xuXG52YXIgRW1pdHRlckV2ZW50ID0gcmVxdWlyZSgnLi9lbWl0dGVyLWV2ZW50JylcbnZhciBWYWxpZGF0aW9uRXJyb3IgPSByZXF1aXJlKCcuL3ZhbGlkYXRpb24tZXJyb3InKVxudmFyIFdyYXBwZXIgPSByZXF1aXJlKCcuL3dyYXBwZXInKVxudmFyIG1lcmdlID0gcmVxdWlyZSgnLi9tZXJnZScpXG5cbnZhciBkZXNjcmlwdG9ycyA9IHtcbiAgX19zdXBlcm1vZGVsOiB7XG4gICAgdmFsdWU6IHRydWVcbiAgfSxcbiAgX19rZXlzOiB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMpXG5cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMpKSB7XG4gICAgICAgIHZhciBvbWl0ID0gW1xuICAgICAgICAgICdhZGRFdmVudExpc3RlbmVyJywgJ29uJywgJ29uY2UnLCAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsICdyZW1vdmVBbGxMaXN0ZW5lcnMnLFxuICAgICAgICAgICdyZW1vdmVMaXN0ZW5lcicsICdvZmYnLCAnZW1pdCcsICdsaXN0ZW5lcnMnLCAnaGFzTGlzdGVuZXJzJywgJ3BvcCcsICdwdXNoJyxcbiAgICAgICAgICAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1cGRhdGUnLCAndW5zaGlmdCcsICdjcmVhdGUnLCAnX19tZXJnZScsXG4gICAgICAgICAgJ19fc2V0Tm90aWZ5Q2hhbmdlJywgJ19fbm90aWZ5Q2hhbmdlJywgJ19fc2V0JywgJ19fZ2V0JywgJ19fY2hhaW4nLCAnX19yZWxhdGl2ZVBhdGgnXG4gICAgICAgIF1cblxuICAgICAgICBrZXlzID0ga2V5cy5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gb21pdC5pbmRleE9mKGl0ZW0pIDwgMFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ga2V5c1xuICAgIH1cbiAgfSxcbiAgX19uYW1lOiB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5fX2lzUm9vdCkge1xuICAgICAgICByZXR1cm4gJydcbiAgICAgIH1cblxuICAgICAgLy8gV29yayBvdXQgdGhlICduYW1lJyBvZiB0aGUgbW9kZWxcbiAgICAgIC8vIExvb2sgdXAgdG8gdGhlIHBhcmVudCBhbmQgbG9vcCB0aHJvdWdoIGl0J3Mga2V5cyxcbiAgICAgIC8vIEFueSB2YWx1ZSBvciBhcnJheSBmb3VuZCB0byBjb250YWluIHRoZSB2YWx1ZSBvZiB0aGlzICh0aGlzIG1vZGVsKVxuICAgICAgLy8gdGhlbiB3ZSByZXR1cm4gdGhlIGtleSBhbmQgaW5kZXggaW4gdGhlIGNhc2Ugd2UgZm91bmQgdGhlIG1vZGVsIGluIGFuIGFycmF5LlxuICAgICAgdmFyIHBhcmVudEtleXMgPSB0aGlzLl9fcGFyZW50Ll9fa2V5c1xuICAgICAgdmFyIHBhcmVudEtleSwgcGFyZW50VmFsdWVcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJlbnRLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBhcmVudEtleSA9IHBhcmVudEtleXNbaV1cbiAgICAgICAgcGFyZW50VmFsdWUgPSB0aGlzLl9fcGFyZW50W3BhcmVudEtleV1cblxuICAgICAgICBpZiAocGFyZW50VmFsdWUgPT09IHRoaXMpIHtcbiAgICAgICAgICByZXR1cm4gcGFyZW50S2V5XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIF9fcGF0aDoge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuX19oYXNBbmNlc3RvcnMgJiYgIXRoaXMuX19wYXJlbnQuX19pc1Jvb3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19wYXJlbnQuX19wYXRoICsgJy4nICsgdGhpcy5fX25hbWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fbmFtZVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX19pc1Jvb3Q6IHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAhdGhpcy5fX2hhc0FuY2VzdG9yc1xuICAgIH1cbiAgfSxcbiAgX19jaGlsZHJlbjoge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNoaWxkcmVuID0gW11cblxuICAgICAgdmFyIGtleXMgPSB0aGlzLl9fa2V5c1xuICAgICAgdmFyIGtleSwgdmFsdWVcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGtleSA9IGtleXNbaV1cbiAgICAgICAgdmFsdWUgPSB0aGlzW2tleV1cblxuICAgICAgICBpZiAodmFsdWUgJiYgdmFsdWUuX19zdXBlcm1vZGVsKSB7XG4gICAgICAgICAgY2hpbGRyZW4ucHVzaCh2YWx1ZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2hpbGRyZW5cbiAgICB9XG4gIH0sXG4gIF9fYW5jZXN0b3JzOiB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYW5jZXN0b3JzID0gW11cbiAgICAgIHZhciByID0gdGhpc1xuXG4gICAgICB3aGlsZSAoci5fX3BhcmVudCkge1xuICAgICAgICBhbmNlc3RvcnMucHVzaChyLl9fcGFyZW50KVxuICAgICAgICByID0gci5fX3BhcmVudFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gYW5jZXN0b3JzXG4gICAgfVxuICB9LFxuICBfX2Rlc2NlbmRhbnRzOiB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZGVzY2VuZGFudHMgPSBbXVxuXG4gICAgICBmdW5jdGlvbiBjaGVja0FuZEFkZERlc2NlbmRhbnRJZk1vZGVsIChvYmopIHtcbiAgICAgICAgdmFyIGtleXMgPSBvYmouX19rZXlzXG4gICAgICAgIHZhciBrZXksIHZhbHVlXG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tpXVxuICAgICAgICAgIHZhbHVlID0gb2JqW2tleV1cblxuICAgICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5fX3N1cGVybW9kZWwpIHtcbiAgICAgICAgICAgIGRlc2NlbmRhbnRzLnB1c2godmFsdWUpXG4gICAgICAgICAgICBjaGVja0FuZEFkZERlc2NlbmRhbnRJZk1vZGVsKHZhbHVlKVxuXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgY2hlY2tBbmRBZGREZXNjZW5kYW50SWZNb2RlbCh0aGlzKVxuXG4gICAgICByZXR1cm4gZGVzY2VuZGFudHNcbiAgICB9XG4gIH0sXG4gIF9faGFzQW5jZXN0b3JzOiB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gISF0aGlzLl9fYW5jZXN0b3JzLmxlbmd0aFxuICAgIH1cbiAgfSxcbiAgX19oYXNEZXNjZW5kYW50czoge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICEhdGhpcy5fX2Rlc2NlbmRhbnRzLmxlbmd0aFxuICAgIH1cbiAgfSxcbiAgZXJyb3JzOiB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZXJyb3JzID0gW11cbiAgICAgIHZhciBkZWYgPSB0aGlzLl9fZGVmXG4gICAgICB2YXIgdmFsaWRhdG9yLCBlcnJvciwgaSwgalxuXG4gICAgICAvLyBSdW4gb3duIHZhbGlkYXRvcnNcbiAgICAgIHZhciBvd24gPSBkZWYudmFsaWRhdG9ycy5zbGljZSgwKVxuICAgICAgZm9yIChpID0gMDsgaSA8IG93bi5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YWxpZGF0b3IgPSBvd25baV1cbiAgICAgICAgZXJyb3IgPSB2YWxpZGF0b3IuY2FsbCh0aGlzLCB0aGlzKVxuXG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIGVycm9ycy5wdXNoKG5ldyBWYWxpZGF0aW9uRXJyb3IodGhpcywgZXJyb3IsIHZhbGlkYXRvcikpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUnVuIHRocm91Z2gga2V5cyBhbmQgZXZhbHVhdGUgdmFsaWRhdG9yc1xuICAgICAgdmFyIGtleXMgPSB0aGlzLl9fa2V5c1xuICAgICAgdmFyIHZhbHVlLCBrZXksIGl0ZW1EZWZcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAga2V5ID0ga2V5c1tpXVxuXG4gICAgICAgIC8vIElmIHdlIGFyZSBhbiBBcnJheSB3aXRoIGFuIGl0ZW0gZGVmaW5pdGlvblxuICAgICAgICAvLyB0aGVuIHdlIGhhdmUgdG8gbG9vayBpbnRvIHRoZSBBcnJheSBmb3Igb3VyIHZhbHVlXG4gICAgICAgIC8vIGFuZCBhbHNvIGdldCBob2xkIG9mIHRoZSB3cmFwcGVyLiBXZSBvbmx5IG5lZWQgdG9cbiAgICAgICAgLy8gZG8gdGhpcyBpZiB0aGUga2V5IGlzIG5vdCBhIHByb3BlcnR5IG9mIHRoZSBhcnJheS5cbiAgICAgICAgLy8gV2UgY2hlY2sgdGhlIGRlZnMgdG8gd29yayB0aGlzIG91dCAoaS5lLiAwLCAxLCAyKS5cbiAgICAgICAgLy8gdG9kbzogVGhpcyBjb3VsZCBiZSBiZXR0ZXIgdG8gY2hlY2sgIU5hTiBvbiB0aGUga2V5P1xuICAgICAgICBpZiAoZGVmLmlzQXJyYXkgJiYgZGVmLmRlZiAmJiAoIWRlZi5kZWZzIHx8ICEoa2V5IGluIGRlZi5kZWZzKSkpIHtcbiAgICAgICAgICAvLyBJZiB3ZSBhcmUgYW4gQXJyYXkgd2l0aCBhIHNpbXBsZSBpdGVtIGRlZmluaXRpb25cbiAgICAgICAgICAvLyBvciBhIHJlZmVyZW5jZSB0byBhIHNpbXBsZSB0eXBlIGRlZmluaXRpb25cbiAgICAgICAgICAvLyBzdWJzdGl0dXRlIHRoZSB2YWx1ZSB3aXRoIHRoZSB3cmFwcGVyIHdlIGdldCBmcm9tIHRoZVxuICAgICAgICAgIC8vIGNyZWF0ZSBmYWN0b3J5IGZ1bmN0aW9uLiBPdGhlcndpc2Ugc2V0IHRoZSB2YWx1ZSB0b1xuICAgICAgICAgIC8vIHRoZSByZWFsIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eS5cbiAgICAgICAgICBpdGVtRGVmID0gZGVmLmRlZlxuXG4gICAgICAgICAgaWYgKGl0ZW1EZWYuaXNTaW1wbGUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gaXRlbURlZi5jcmVhdGUud3JhcHBlclxuICAgICAgICAgICAgdmFsdWUuc2V0VmFsdWUodGhpc1trZXldKVxuICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbURlZi5pc1JlZmVyZW5jZSAmJiBpdGVtRGVmLnR5cGUuZGVmLmlzU2ltcGxlKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGl0ZW1EZWYudHlwZS5kZWYuY3JlYXRlLndyYXBwZXJcbiAgICAgICAgICAgIHZhbHVlLnNldFZhbHVlKHRoaXNba2V5XSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzW2tleV1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gU2V0IHRoZSB2YWx1ZSB0byB0aGUgd3JhcHBlZCB2YWx1ZSBvZiB0aGUgcHJvcGVydHlcbiAgICAgICAgICB2YWx1ZSA9IHRoaXMuX19ba2V5XVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKHZhbHVlLl9fc3VwZXJtb2RlbCkge1xuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZXJyb3JzLCB2YWx1ZS5lcnJvcnMpXG4gICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFdyYXBwZXIpIHtcbiAgICAgICAgICAgIHZhciB3cmFwcGVyVmFsdWUgPSB2YWx1ZS5nZXRWYWx1ZSh0aGlzKVxuXG4gICAgICAgICAgICBpZiAod3JhcHBlclZhbHVlICYmIHdyYXBwZXJWYWx1ZS5fX3N1cGVybW9kZWwpIHtcbiAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoZXJyb3JzLCB3cmFwcGVyVmFsdWUuZXJyb3JzKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdmFyIHNpbXBsZSA9IHZhbHVlLnZhbGlkYXRvcnNcbiAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHNpbXBsZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHZhbGlkYXRvciA9IHNpbXBsZVtqXVxuICAgICAgICAgICAgICAgIGVycm9yID0gdmFsaWRhdG9yLmNhbGwodGhpcywgd3JhcHBlclZhbHVlLCBrZXkpXG5cbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKG5ldyBWYWxpZGF0aW9uRXJyb3IodGhpcywgZXJyb3IsIHZhbGlkYXRvciwga2V5KSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGVycm9yc1xuICAgIH1cbiAgfVxufVxuXG52YXIgcHJvdG8gPSB7XG4gIF9fZ2V0OiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuX19ba2V5XS5nZXRWYWx1ZSh0aGlzKVxuICB9LFxuICBfX3NldDogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICB0aGlzLl9fW2tleV0uc2V0VmFsdWUodmFsdWUsIHRoaXMpXG4gIH0sXG4gIF9fcmVsYXRpdmVQYXRoOiBmdW5jdGlvbiAodG8sIGtleSkge1xuICAgIHZhciByZWxhdGl2ZVBhdGggPSB0aGlzLl9fcGF0aCA/IHRvLnN1YnN0cih0aGlzLl9fcGF0aC5sZW5ndGggKyAxKSA6IHRvXG5cbiAgICBpZiAocmVsYXRpdmVQYXRoKSB7XG4gICAgICByZXR1cm4ga2V5ID8gcmVsYXRpdmVQYXRoICsgJy4nICsga2V5IDogcmVsYXRpdmVQYXRoXG4gICAgfVxuICAgIHJldHVybiBrZXlcbiAgfSxcbiAgX19jaGFpbjogZnVuY3Rpb24gKGZuKSB7XG4gICAgcmV0dXJuIFt0aGlzXS5jb25jYXQodGhpcy5fX2FuY2VzdG9ycykuZm9yRWFjaChmbilcbiAgfSxcbiAgX19tZXJnZTogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICByZXR1cm4gbWVyZ2UodGhpcywgZGF0YSlcbiAgfSxcbiAgX19ub3RpZnlDaGFuZ2U6IGZ1bmN0aW9uIChrZXksIG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgIHZhciB0YXJnZXQgPSB0aGlzXG4gICAgdmFyIHRhcmdldFBhdGggPSB0aGlzLl9fcGF0aFxuICAgIHZhciBldmVudE5hbWUgPSAnc2V0J1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgb2xkVmFsdWU6IG9sZFZhbHVlLFxuICAgICAgbmV3VmFsdWU6IG5ld1ZhbHVlXG4gICAgfVxuXG4gICAgdGhpcy5lbWl0KGV2ZW50TmFtZSwgbmV3IEVtaXR0ZXJFdmVudChldmVudE5hbWUsIGtleSwgdGFyZ2V0LCBkYXRhKSlcbiAgICB0aGlzLmVtaXQoJ2NoYW5nZScsIG5ldyBFbWl0dGVyRXZlbnQoZXZlbnROYW1lLCBrZXksIHRhcmdldCwgZGF0YSkpXG4gICAgdGhpcy5lbWl0KCdjaGFuZ2U6JyArIGtleSwgbmV3IEVtaXR0ZXJFdmVudChldmVudE5hbWUsIGtleSwgdGFyZ2V0LCBkYXRhKSlcblxuICAgIHRoaXMuX19hbmNlc3RvcnMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIHBhdGggPSBpdGVtLl9fcmVsYXRpdmVQYXRoKHRhcmdldFBhdGgsIGtleSlcbiAgICAgIGl0ZW0uZW1pdCgnY2hhbmdlJywgbmV3IEVtaXR0ZXJFdmVudChldmVudE5hbWUsIHBhdGgsIHRhcmdldCwgZGF0YSkpXG4gICAgfSlcbiAgfSxcbiAgX19zZXROb3RpZnlDaGFuZ2U6IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgdmFyIG9sZFZhbHVlID0gdGhpcy5fX2dldChrZXkpXG4gICAgdGhpcy5fX3NldChrZXksIHZhbHVlKVxuICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuX19nZXQoa2V5KVxuICAgIHRoaXMuX19ub3RpZnlDaGFuZ2Uoa2V5LCBuZXdWYWx1ZSwgb2xkVmFsdWUpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHByb3RvOiBwcm90byxcbiAgZGVzY3JpcHRvcnM6IGRlc2NyaXB0b3JzXG59XG4iLCIndXNlIHN0cmljdCdcblxudmFyIGVtaXR0ZXIgPSByZXF1aXJlKCcuL2VtaXR0ZXItb2JqZWN0JylcbnZhciBlbWl0dGVyQXJyYXkgPSByZXF1aXJlKCcuL2VtaXR0ZXItYXJyYXknKVxudmFyIEVtaXR0ZXJFdmVudCA9IHJlcXVpcmUoJy4vZW1pdHRlci1ldmVudCcpXG5cbnZhciBleHRlbmQgPSByZXF1aXJlKCcuL3V0aWwnKS5leHRlbmRcbnZhciBtb2RlbCA9IHJlcXVpcmUoJy4vbW9kZWwnKVxudmFyIG1vZGVsUHJvdG8gPSBtb2RlbC5wcm90b1xudmFyIG1vZGVsRGVzY3JpcHRvcnMgPSBtb2RlbC5kZXNjcmlwdG9yc1xuXG52YXIgbW9kZWxQcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKG1vZGVsUHJvdG8sIG1vZGVsRGVzY3JpcHRvcnMpXG52YXIgb2JqZWN0UHJvdG90eXBlID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHAgPSBPYmplY3QuY3JlYXRlKG1vZGVsUHJvdG90eXBlKVxuXG4gIGVtaXR0ZXIocClcblxuICByZXR1cm4gcFxufSkoKVxuXG5mdW5jdGlvbiBjcmVhdGVBcnJheVByb3RvdHlwZSAoKSB7XG4gIHZhciBwID0gZW1pdHRlckFycmF5KGZ1bmN0aW9uIChldmVudE5hbWUsIGFyciwgZSkge1xuICAgIGlmIChldmVudE5hbWUgPT09ICd1cGRhdGUnKSB7XG4gICAgICAvKipcbiAgICAgICAqIEZvcndhcmQgdGhlIHNwZWNpYWwgYXJyYXkgdXBkYXRlXG4gICAgICAgKiBldmVudHMgYXMgc3RhbmRhcmQgX19ub3RpZnlDaGFuZ2UgZXZlbnRzXG4gICAgICAgKi9cbiAgICAgIGFyci5fX25vdGlmeUNoYW5nZShlLmluZGV4LCBlLnZhbHVlLCBlLm9sZFZhbHVlKVxuICAgIH0gZWxzZSB7XG4gICAgICAvKipcbiAgICAgICAqIEFsbCBvdGhlciBldmVudHMgZS5nLiBwdXNoLCBzcGxpY2UgYXJlIHJlbGF5ZWRcbiAgICAgICAqL1xuICAgICAgdmFyIHRhcmdldCA9IGFyclxuICAgICAgdmFyIHBhdGggPSBhcnIuX19wYXRoXG4gICAgICB2YXIgZGF0YSA9IGVcbiAgICAgIHZhciBrZXkgPSBlLmluZGV4XG5cbiAgICAgIGFyci5lbWl0KGV2ZW50TmFtZSwgbmV3IEVtaXR0ZXJFdmVudChldmVudE5hbWUsICcnLCB0YXJnZXQsIGRhdGEpKVxuICAgICAgYXJyLmVtaXQoJ2NoYW5nZScsIG5ldyBFbWl0dGVyRXZlbnQoZXZlbnROYW1lLCAnJywgdGFyZ2V0LCBkYXRhKSlcbiAgICAgIGFyci5fX2FuY2VzdG9ycy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHZhciBuYW1lID0gaXRlbS5fX3JlbGF0aXZlUGF0aChwYXRoLCBrZXkpXG4gICAgICAgIGl0ZW0uZW1pdCgnY2hhbmdlJywgbmV3IEVtaXR0ZXJFdmVudChldmVudE5hbWUsIG5hbWUsIHRhcmdldCwgZGF0YSkpXG4gICAgICB9KVxuXG4gICAgfVxuICB9KVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHAsIG1vZGVsRGVzY3JpcHRvcnMpXG5cbiAgZW1pdHRlcihwKVxuXG4gIGV4dGVuZChwLCBtb2RlbFByb3RvKVxuXG4gIHJldHVybiBwXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU9iamVjdE1vZGVsUHJvdG90eXBlIChwcm90bykge1xuICB2YXIgcCA9IE9iamVjdC5jcmVhdGUob2JqZWN0UHJvdG90eXBlKVxuXG4gIGlmIChwcm90bykge1xuICAgIGV4dGVuZChwLCBwcm90bylcbiAgfVxuXG4gIHJldHVybiBwXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFycmF5TW9kZWxQcm90b3R5cGUgKHByb3RvLCBpdGVtRGVmKSB7XG4gIC8vIFdlIGRvIG5vdCB0byBhdHRlbXB0IHRvIHN1YmNsYXNzIEFycmF5LFxuICAvLyBpbnN0ZWFkIGNyZWF0ZSBhIG5ldyBpbnN0YW5jZSBlYWNoIHRpbWVcbiAgLy8gYW5kIG1peGluIHRoZSBwcm90byBvYmplY3RcbiAgdmFyIHAgPSBjcmVhdGVBcnJheVByb3RvdHlwZSgpXG5cbiAgaWYgKHByb3RvKSB7XG4gICAgZXh0ZW5kKHAsIHByb3RvKVxuICB9XG5cbiAgaWYgKGl0ZW1EZWYpIHtcbiAgICAvLyBXZSBoYXZlIGEgZGVmaW5pdGlvbiBmb3IgdGhlIGl0ZW1zXG4gICAgLy8gdGhhdCBiZWxvbmcgaW4gdGhpcyBhcnJheS5cblxuICAgIC8vIFVzZSB0aGUgYHdyYXBwZXJgIHByb3RvdHlwZSBwcm9wZXJ0eSBhcyBhXG4gICAgLy8gdmlydHVhbCBXcmFwcGVyIG9iamVjdCB3ZSBjYW4gdXNlXG4gICAgLy8gdmFsaWRhdGUgYWxsIHRoZSBpdGVtcyBpbiB0aGUgYXJyYXkuXG4gICAgdmFyIGFyckl0ZW1XcmFwcGVyID0gaXRlbURlZi5jcmVhdGUud3JhcHBlclxuXG4gICAgLy8gVmFsaWRhdGUgbmV3IG1vZGVscyBieSBvdmVycmlkaW5nIHRoZSBlbWl0dGVyIGFycmF5XG4gICAgLy8gbXV0YXRvcnMgdGhhdCBjYW4gY2F1c2UgbmV3IGl0ZW1zIHRvIGVudGVyIHRoZSBhcnJheS5cbiAgICBvdmVycmlkZUFycmF5QWRkaW5nTXV0YXRvcnMocCwgYXJySXRlbVdyYXBwZXIpXG5cbiAgICAvLyBQcm92aWRlIGEgY29udmVuaWVudCBtb2RlbCBmYWN0b3J5XG4gICAgLy8gZm9yIGNyZWF0aW5nIGFycmF5IGl0ZW0gaW5zdGFuY2VzXG4gICAgcC5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaXRlbURlZi5pc1JlZmVyZW5jZSA/IGl0ZW1EZWYudHlwZSgpIDogaXRlbURlZi5jcmVhdGUoKS5nZXRWYWx1ZSh0aGlzKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwXG59XG5cbmZ1bmN0aW9uIG92ZXJyaWRlQXJyYXlBZGRpbmdNdXRhdG9ycyAoYXJyLCBpdGVtV3JhcHBlcikge1xuICBmdW5jdGlvbiBnZXRBcnJheUFyZ3MgKGl0ZW1zKSB7XG4gICAgdmFyIGFyZ3MgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGl0ZW1XcmFwcGVyLnNldFZhbHVlKGl0ZW1zW2ldLCBhcnIpXG4gICAgICBhcmdzLnB1c2goaXRlbVdyYXBwZXIuZ2V0VmFsdWUoYXJyKSlcbiAgICB9XG4gICAgcmV0dXJuIGFyZ3NcbiAgfVxuXG4gIHZhciBwdXNoID0gYXJyLnB1c2hcbiAgdmFyIHVuc2hpZnQgPSBhcnIudW5zaGlmdFxuICB2YXIgc3BsaWNlID0gYXJyLnNwbGljZVxuICB2YXIgdXBkYXRlID0gYXJyLnVwZGF0ZVxuXG4gIGlmIChwdXNoKSB7XG4gICAgYXJyLnB1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYXJncyA9IGdldEFycmF5QXJncyhhcmd1bWVudHMpXG4gICAgICByZXR1cm4gcHVzaC5hcHBseShhcnIsIGFyZ3MpXG4gICAgfVxuICB9XG5cbiAgaWYgKHVuc2hpZnQpIHtcbiAgICBhcnIudW5zaGlmdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhcmdzID0gZ2V0QXJyYXlBcmdzKGFyZ3VtZW50cylcbiAgICAgIHJldHVybiB1bnNoaWZ0LmFwcGx5KGFyciwgYXJncylcbiAgICB9XG4gIH1cblxuICBpZiAoc3BsaWNlKSB7XG4gICAgYXJyLnNwbGljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhcmdzID0gZ2V0QXJyYXlBcmdzKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMikpXG4gICAgICBhcmdzLnVuc2hpZnQoYXJndW1lbnRzWzFdKVxuICAgICAgYXJncy51bnNoaWZ0KGFyZ3VtZW50c1swXSlcbiAgICAgIHJldHVybiBzcGxpY2UuYXBwbHkoYXJyLCBhcmdzKVxuICAgIH1cbiAgfVxuXG4gIGlmICh1cGRhdGUpIHtcbiAgICBhcnIudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGFyZ3MgPSBnZXRBcnJheUFyZ3MoW2FyZ3VtZW50c1sxXV0pXG4gICAgICBhcmdzLnVuc2hpZnQoYXJndW1lbnRzWzBdKVxuICAgICAgcmV0dXJuIHVwZGF0ZS5hcHBseShhcnIsIGFyZ3MpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1vZGVsUHJvdG90eXBlIChkZWYpIHtcbiAgcmV0dXJuIGRlZi5pc0FycmF5ID8gY3JlYXRlQXJyYXlNb2RlbFByb3RvdHlwZShkZWYucHJvdG8sIGRlZi5kZWYpIDogY3JlYXRlT2JqZWN0TW9kZWxQcm90b3R5cGUoZGVmLnByb3RvKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZU1vZGVsUHJvdG90eXBlXG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSB7fVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8vIHZhciBtZXJnZSA9IHJlcXVpcmUoJy4vbWVyZ2UnKVxudmFyIGNyZWF0ZURlZiA9IHJlcXVpcmUoJy4vZGVmJylcbnZhciBTdXBlcm1vZGVsID0gcmVxdWlyZSgnLi9zdXBlcm1vZGVsJylcblxuZnVuY3Rpb24gc3VwZXJtb2RlbHMgKHNjaGVtYSwgaW5pdGlhbGl6ZXIpIHtcbiAgdmFyIGRlZiA9IGNyZWF0ZURlZihzY2hlbWEpXG5cbiAgZnVuY3Rpb24gU3VwZXJtb2RlbENvbnN0cnVjdG9yIChkYXRhKSB7XG4gICAgdmFyIG1vZGVsID0gZGVmLmlzU2ltcGxlID8gZGVmLmNyZWF0ZSgpIDogZGVmLmNyZWF0ZSgpLmdldFZhbHVlKHt9KVxuXG4gICAgLy8gQ2FsbCBhbnkgaW5pdGlhbGl6ZXJcbiAgICBpZiAoaW5pdGlhbGl6ZXIpIHtcbiAgICAgIGluaXRpYWxpemVyLmFwcGx5KG1vZGVsLCBhcmd1bWVudHMpXG4gICAgfSBlbHNlIGlmIChkYXRhKSB7XG4gICAgICAvLyBpZiB0aGVyZSdzIG5vIGluaXRpYWxpemVyXG4gICAgICAvLyBidXQgd2UgaGF2ZSBiZWVuIHBhc3NlZCBzb21lXG4gICAgICAvLyBkYXRhLCBtZXJnZSBpdCBpbnRvIHRoZSBtb2RlbC5cbiAgICAgIG1vZGVsLl9fbWVyZ2UoZGF0YSlcbiAgICB9XG4gICAgcmV0dXJuIG1vZGVsXG4gIH1cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN1cGVybW9kZWxDb25zdHJ1Y3RvciwgJ2RlZicsIHtcbiAgICB2YWx1ZTogZGVmIC8vIHRoaXMgaXMgdXNlZCB0byB2YWxpZGF0ZSByZWZlcmVuY2VkIFN1cGVybW9kZWxDb25zdHJ1Y3RvcnNcbiAgfSlcbiAgU3VwZXJtb2RlbENvbnN0cnVjdG9yLnByb3RvdHlwZSA9IFN1cGVybW9kZWwgLy8gdGhpcyBzaGFyZWQgb2JqZWN0IGlzIHVzZWQsIGFzIGEgcHJvdG90eXBlLCB0byBpZGVudGlmeSBTdXBlcm1vZGVsQ29uc3RydWN0b3JzXG4gIFN1cGVybW9kZWxDb25zdHJ1Y3Rvci5jb25zdHJ1Y3RvciA9IFN1cGVybW9kZWxDb25zdHJ1Y3RvclxuICByZXR1cm4gU3VwZXJtb2RlbENvbnN0cnVjdG9yXG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3VwZXJtb2RlbHNcbiIsIid1c2Ugc3RyaWN0J1xuXG52YXIgU3VwZXJtb2RlbCA9IHJlcXVpcmUoJy4vc3VwZXJtb2RlbCcpXG5cbmZ1bmN0aW9uIGV4dGVuZCAob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCB0eXBlb2YgYWRkICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBvcmlnaW5cbiAgfVxuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKVxuICB2YXIgaSA9IGtleXMubGVuZ3RoXG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV1cbiAgfVxuICByZXR1cm4gb3JpZ2luXG59XG5cbnZhciB1dGlsID0ge1xuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHlwZU9mOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopLm1hdGNoKC9cXHMoW2EtekEtWl0rKS8pWzFdLnRvTG93ZXJDYXNlKClcbiAgfSxcbiAgaXNPYmplY3Q6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLnR5cGVPZih2YWx1ZSkgPT09ICdvYmplY3QnXG4gIH0sXG4gIGlzQXJyYXk6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKVxuICB9LFxuICBpc1NpbXBsZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLy8gJ1NpbXBsZScgaGVyZSBtZWFucyBhbnl0aGluZ1xuICAgIC8vIG90aGVyIHRoYW4gYW4gT2JqZWN0IG9yIGFuIEFycmF5XG4gICAgLy8gaS5lLiBudW1iZXIsIHN0cmluZywgZGF0ZSwgYm9vbCwgbnVsbCwgdW5kZWZpbmVkLCByZWdleC4uLlxuICAgIHJldHVybiAhdGhpcy5pc09iamVjdCh2YWx1ZSkgJiYgIXRoaXMuaXNBcnJheSh2YWx1ZSlcbiAgfSxcbiAgaXNGdW5jdGlvbjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMudHlwZU9mKHZhbHVlKSA9PT0gJ2Z1bmN0aW9uJ1xuICB9LFxuICBpc0RhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLnR5cGVPZih2YWx1ZSkgPT09ICdkYXRlJ1xuICB9LFxuICBpc051bGw6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbFxuICB9LFxuICBpc1VuZGVmaW5lZDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiAodmFsdWUpID09PSAndW5kZWZpbmVkJ1xuICB9LFxuICBpc051bGxPclVuZGVmaW5lZDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNOdWxsKHZhbHVlKSB8fCB0aGlzLmlzVW5kZWZpbmVkKHZhbHVlKVxuICB9LFxuICBjYXN0OiBmdW5jdGlvbiAodmFsdWUsIHR5cGUpIHtcbiAgICBpZiAoIXR5cGUpIHtcbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBTdHJpbmc6XG4gICAgICAgIHJldHVybiB1dGlsLmNhc3RTdHJpbmcodmFsdWUpXG4gICAgICBjYXNlIE51bWJlcjpcbiAgICAgICAgcmV0dXJuIHV0aWwuY2FzdE51bWJlcih2YWx1ZSlcbiAgICAgIGNhc2UgQm9vbGVhbjpcbiAgICAgICAgcmV0dXJuIHV0aWwuY2FzdEJvb2xlYW4odmFsdWUpXG4gICAgICBjYXNlIERhdGU6XG4gICAgICAgIHJldHVybiB1dGlsLmNhc3REYXRlKHZhbHVlKVxuICAgICAgY2FzZSBPYmplY3Q6XG4gICAgICBjYXNlIEZ1bmN0aW9uOlxuICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjYXN0JylcbiAgICB9XG4gIH0sXG4gIGNhc3RTdHJpbmc6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsIHx8IHV0aWwudHlwZU9mKHZhbHVlKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcgJiYgdmFsdWUudG9TdHJpbmcoKVxuICB9LFxuICBjYXN0TnVtYmVyOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIE5hTlxuICAgIH1cbiAgICBpZiAodXRpbC50eXBlT2YodmFsdWUpID09PSAnbnVtYmVyJykge1xuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuICAgIHJldHVybiBOdW1iZXIodmFsdWUpXG4gIH0sXG4gIGNhc3RCb29sZWFuOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgdmFyIGZhbHNleSA9IFsnMCcsICdmYWxzZScsICdvZmYnLCAnbm8nXVxuICAgIHJldHVybiBmYWxzZXkuaW5kZXhPZih2YWx1ZSkgPT09IC0xXG4gIH0sXG4gIGNhc3REYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB1dGlsLnR5cGVPZih2YWx1ZSkgPT09ICdkYXRlJykge1xuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuICAgIHJldHVybiBuZXcgRGF0ZSh2YWx1ZSlcbiAgfSxcbiAgaXNDb25zdHJ1Y3RvcjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNTaW1wbGVDb25zdHJ1Y3Rvcih2YWx1ZSkgfHwgW0FycmF5LCBPYmplY3RdLmluZGV4T2YodmFsdWUpID4gLTFcbiAgfSxcbiAgaXNTaW1wbGVDb25zdHJ1Y3RvcjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIFtTdHJpbmcsIE51bWJlciwgRGF0ZSwgQm9vbGVhbl0uaW5kZXhPZih2YWx1ZSkgPiAtMVxuICB9LFxuICBpc1N1cGVybW9kZWxDb25zdHJ1Y3RvcjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNGdW5jdGlvbih2YWx1ZSkgJiYgdmFsdWUucHJvdG90eXBlID09PSBTdXBlcm1vZGVsXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsXG4iLCIndXNlIHN0cmljdCdcblxuZnVuY3Rpb24gVmFsaWRhdGlvbkVycm9yICh0YXJnZXQsIGVycm9yLCB2YWxpZGF0b3IsIGtleSkge1xuICB0aGlzLnRhcmdldCA9IHRhcmdldFxuICB0aGlzLmVycm9yID0gZXJyb3JcbiAgdGhpcy52YWxpZGF0b3IgPSB2YWxpZGF0b3JcblxuICBpZiAoa2V5KSB7XG4gICAgdGhpcy5rZXkgPSBrZXlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFZhbGlkYXRpb25FcnJvclxuIiwiJ3VzZSBzdHJpY3QnXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJylcblxuZnVuY3Rpb24gV3JhcHBlciAoZGVmYXVsdFZhbHVlLCB3cml0YWJsZSwgdmFsaWRhdG9ycywgZ2V0dGVyLCBzZXR0ZXIsIGJlZm9yZVNldCwgYXNzZXJ0KSB7XG4gIHRoaXMudmFsaWRhdG9ycyA9IHZhbGlkYXRvcnNcblxuICB0aGlzLl9kZWZhdWx0VmFsdWUgPSBkZWZhdWx0VmFsdWVcbiAgdGhpcy5fd3JpdGFibGUgPSB3cml0YWJsZVxuICB0aGlzLl9nZXR0ZXIgPSBnZXR0ZXJcbiAgdGhpcy5fc2V0dGVyID0gc2V0dGVyXG4gIHRoaXMuX2JlZm9yZVNldCA9IGJlZm9yZVNldFxuICB0aGlzLl9hc3NlcnQgPSBhc3NlcnRcbiAgdGhpcy5pc0luaXRpYWxpemVkID0gZmFsc2VcblxuICBpZiAoIXV0aWwuaXNGdW5jdGlvbihkZWZhdWx0VmFsdWUpKSB7XG4gICAgdGhpcy5pc0luaXRpYWxpemVkID0gdHJ1ZVxuXG4gICAgaWYgKCF1dGlsLmlzVW5kZWZpbmVkKGRlZmF1bHRWYWx1ZSkpIHtcbiAgICAgIHRoaXMuX3ZhbHVlID0gZGVmYXVsdFZhbHVlXG4gICAgfVxuICB9XG59XG5XcmFwcGVyLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICBpZiAodGhpcy5pc0luaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB0aGlzLnNldFZhbHVlKHRoaXMuX2RlZmF1bHRWYWx1ZShwYXJlbnQpLCBwYXJlbnQpXG4gIHRoaXMuaXNJbml0aWFsaXplZCA9IHRydWVcbn1cbldyYXBwZXIucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24gKG1vZGVsKSB7XG4gIHJldHVybiB0aGlzLl9nZXR0ZXIgPyB0aGlzLl9nZXR0ZXIuY2FsbChtb2RlbCkgOiB0aGlzLl92YWx1ZVxufVxuV3JhcHBlci5wcm90b3R5cGUuc2V0VmFsdWUgPSBmdW5jdGlvbiAodmFsdWUsIG1vZGVsKSB7XG4gIGlmICghdGhpcy5fd3JpdGFibGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZhbHVlIGlzIHJlYWRvbmx5JylcbiAgfVxuXG4gIC8vIEhvb2sgdXAgdGhlIHBhcmVudCByZWYgaWYgbmVjZXNzYXJ5XG4gIGlmICh2YWx1ZSAmJiB2YWx1ZS5fX3N1cGVybW9kZWwgJiYgbW9kZWwpIHtcbiAgICBpZiAodmFsdWUuX19wYXJlbnQgIT09IG1vZGVsKSB7XG4gICAgICB2YWx1ZS5fX3BhcmVudCA9IG1vZGVsXG4gICAgfVxuICB9XG5cbiAgdmFyIHZhbFxuICBpZiAodGhpcy5fc2V0dGVyKSB7XG4gICAgdGhpcy5fc2V0dGVyLmNhbGwobW9kZWwsIHZhbHVlKVxuICAgIHZhbCA9IHRoaXMuZ2V0VmFsdWUobW9kZWwpXG4gIH0gZWxzZSB7XG4gICAgdmFsID0gdGhpcy5fYmVmb3JlU2V0ID8gdGhpcy5fYmVmb3JlU2V0KHZhbHVlKSA6IHZhbHVlXG4gIH1cblxuICBpZiAodGhpcy5fYXNzZXJ0KSB7XG4gICAgdGhpcy5fYXNzZXJ0KHZhbClcbiAgfVxuXG4gIHRoaXMuX3ZhbHVlID0gdmFsXG59XG5cbm1vZHVsZS5leHBvcnRzID0gV3JhcHBlclxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIml0ZW1zXCI6IFtcbiAgICB7XG4gICAgICBcInByb2R1Y3RJZFwiOiBcIjFcIixcbiAgICAgIFwicXVhbnRpdHlcIjogMlxuICAgIH0sXG4gICAge1xuICAgICAgXCJwcm9kdWN0SWRcIjogXCIyXCIsXG4gICAgICBcInF1YW50aXR5XCI6IDVcbiAgICB9LFxuICAgIHtcbiAgICAgIFwicHJvZHVjdElkXCI6IFwiM1wiLFxuICAgICAgXCJxdWFudGl0eVwiOiAxXG4gICAgfVxuICBdXG59XG4iLCJ2YXIgc3VwZXJtb2RlbHMgPSByZXF1aXJlKCdzdXBlcm1vZGVscy5qcycpXG52YXIgcGF0Y2ggPSByZXF1aXJlKCcuLi9pbmNyZW1lbnRhbC1kb20nKS5wYXRjaFxudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZS5odG1sJylcbnZhciBwcm9kdWN0c0RhdGEgPSByZXF1aXJlKCcuL3Byb2R1Y3RzLWRhdGEnKVxudmFyIGJhc2tldERhdGEgPSByZXF1aXJlKCcuL2Jhc2tldC1kYXRhJylcblxudmFyIHByb2R1Y3RTY2hlbWEgPSB7XG4gIHByb2R1Y3RJZDogU3RyaW5nLFxuICBwcm9kdWN0TmFtZTogU3RyaW5nLFxuICBwcmljZTogTnVtYmVyLFxuICBpbWFnZTogU3RyaW5nLFxuICBkaXNjb3VudFBlcmNlbnQ6IE51bWJlcixcbiAgZ2V0IGNvc3QgKCkge1xuICAgIHJldHVybiB0aGlzLnByaWNlIC0gKHRoaXMucHJpY2UgKiB0aGlzLmRpc2NvdW50UGVyY2VudClcbiAgfVxufVxudmFyIHByb2R1Y3RzU2NoZW1hID0gW3Byb2R1Y3RTY2hlbWFdXG52YXIgYmFza2V0U2NoZW1hID0ge1xuICBpdGVtczogW3tcbiAgICBwcm9kdWN0SWQ6IFN0cmluZyxcbiAgICBxdWFudGl0eTogTnVtYmVyLFxuICAgIGdldCBjb3N0ICgpIHtcbiAgICAgIHZhciBwcm9kdWN0ID0gdGhpcy5wcm9kdWN0XG4gICAgICByZXR1cm4gdGhpcy5xdWFudGl0eSAqIChwcm9kdWN0LnByaWNlIC0gKHByb2R1Y3QucHJpY2UgKiBwcm9kdWN0LmRpc2NvdW50UGVyY2VudCkpXG4gICAgfSxcbiAgICBnZXQgcHJvZHVjdCAoKSB7XG4gICAgICB2YXIgaWQgPSB0aGlzLnByb2R1Y3RJZFxuXG4gICAgICByZXR1cm4gdGhpcy5fX2FuY2VzdG9yc1t0aGlzLl9fYW5jZXN0b3JzLmxlbmd0aCAtIDFdLnByb2R1Y3RzLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5wcm9kdWN0SWQgPT09IGlkXG4gICAgICB9KVswXVxuICAgIH1cbiAgfV0sXG4gIGdldCB0b3RhbENvc3QgKCkge1xuICAgIHZhciB0b3RhbCA9IDBcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLml0ZW1zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB0b3RhbCArPSB0aGlzLml0ZW1zW2ldLmNvc3RcbiAgICB9XG5cbiAgICByZXR1cm4gdG90YWxcbiAgfSxcbiAgZ2V0IHRvdGFsUXVhbnRpdHkgKCkge1xuICAgIHZhciB0b3RhbCA9IDBcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLml0ZW1zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB0b3RhbCArPSB0aGlzLml0ZW1zW2ldLnF1YW50aXR5XG4gICAgfVxuXG4gICAgcmV0dXJuIHRvdGFsXG4gIH1cbn1cblxudmFyIEJhc2tldCA9IHN1cGVybW9kZWxzKGJhc2tldFNjaGVtYSlcbnZhciBQcm9kdWN0cyA9IHN1cGVybW9kZWxzKHByb2R1Y3RzU2NoZW1hKVxuXG52YXIgYXBwU2NoZW1hID0ge1xuICBiYXNrZXQ6IEJhc2tldCxcbiAgcHJvZHVjdHM6IFByb2R1Y3RzXG59XG5cbnZhciBBcHAgPSBzdXBlcm1vZGVscyhhcHBTY2hlbWEpXG5cbndpbmRvdy5hcHBzID0gW11cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZWwpIHtcbiAgdmFyIGFwcCA9IG5ldyBBcHAoe1xuICAgIGJhc2tldDogbmV3IEJhc2tldChiYXNrZXREYXRhKSxcbiAgICBwcm9kdWN0czogbmV3IFByb2R1Y3RzKHByb2R1Y3RzRGF0YSlcbiAgfSlcblxuICBmdW5jdGlvbiByZW5kZXIgKCkge1xuICAgIHBhdGNoKGVsLCB0ZW1wbGF0ZSwgYXBwKVxuICB9XG4gIHJlbmRlcigpXG5cbiAgYXBwLm9uKCdjaGFuZ2UnLCByZW5kZXIpXG5cbiAgd2luZG93LmFwcHMucHVzaChhcHApXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChtb2RlbCkge1xuZWxlbWVudE9wZW4oXCJoM1wiKVxuICB0ZXh0KFwiIFxcXG4gICAgVG90YWwgbGluZXMgXCIgKyAobW9kZWwuaXRlbXMubGVuZ3RoKSArIFwiLCB0b3RhbCBxdWFudGl0eSBcIiArIChtb2RlbC50b3RhbFF1YW50aXR5KSArIFwiIFxcXG4gIFwiKVxuZWxlbWVudENsb3NlKFwiaDNcIilcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz1bXG4gIHtcbiAgICBcInByb2R1Y3RJZFwiOiBcIjFcIixcbiAgICBcInByb2R1Y3ROYW1lXCI6IFwiQXBwbGUgaVBvZCB0b3VjaCAzMkdCIDV0aCBHZW5lcmF0aW9uIC0gV2hpdGVcIixcbiAgICBcInByaWNlXCI6IDE5MC41MCxcbiAgICBcImRpc2NvdW50UGVyY2VudFwiOiAwLFxuICAgIFwiaW1hZ2VcIjogXCJodHRwOi8vZWN4LmltYWdlcy1hbWF6b24uY29tL2ltYWdlcy9JLzMxWTBEck00Wk5MLl9TWTM1NV8uanBnXCJcbiAgfSxcbiAge1xuICAgIFwicHJvZHVjdElkXCI6IFwiMlwiLFxuICAgIFwicHJvZHVjdE5hbWVcIjogXCJTYW1zdW5nIEdhbGF4eSBUYWIgMyA3LWluY2ggLSAoQmxhY2ssIFdpLUZpKVwiLFxuICAgIFwicHJpY2VcIjogMTEwLFxuICAgIFwiZGlzY291bnRQZXJjZW50XCI6IDAuMixcbiAgICBcImltYWdlXCI6IFwiaHR0cDovL2VjeC5pbWFnZXMtYW1hem9uLmNvbS9pbWFnZXMvSS84MWFhRGpsY1U0TC5fU0wxNTAwXy5qcGdcIlxuICB9LFxuICB7XG4gICAgXCJwcm9kdWN0SWRcIjogXCIzXCIsXG4gICAgXCJwcm9kdWN0TmFtZVwiOiBcIkJvc2UgUXVpZXRDb21mb3J0IDIwIEFjb3VzdGljIE5vaXNlIENhbmNlbGxpbmcgSGVhZHBob25lc1wiLFxuICAgIFwicHJpY2VcIjogMjUwLFxuICAgIFwiZGlzY291bnRQZXJjZW50XCI6IDAuMTI1LFxuICAgIFwiaW1hZ2VcIjogXCJodHRwOi8vZWN4LmltYWdlcy1hbWF6b24uY29tL2ltYWdlcy9JLzYxWGFWV1Z5Tk5MLl9TTDE1MDBfLmpwZ1wiXG4gIH1cbl1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG1vZGVsKSB7XG52YXIgYmFza2V0ID0gbW9kZWwuYmFza2V0XG4gIHZhciBwcm9kdWN0cyA9IG1vZGVsLnByb2R1Y3RzXG4gIHZhciBsaW5lc1N1bW1hcnkgPSByZXF1aXJlKCcuL2xpbmVzLXN1bW1hcnkuaHRtbCcpXG4gIHZhciB0b3RhbFN1bW1hcnkgPSByZXF1aXJlKCcuL3RvdGFsLXN1bW1hcnkuaHRtbCcpXG5cbiAgZnVuY3Rpb24gYWRkIChwcm9kdWN0KSB7XG4gICAgdmFyIGl0ZW1zID0gYmFza2V0Lml0ZW1zXG5cbiAgICB2YXIgZXhpc3RpbmcgPSBpdGVtcy5maW5kKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gaXRlbS5wcm9kdWN0SWQgPT09IHByb2R1Y3QucHJvZHVjdElkXG4gICAgfSlcblxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgZXhpc3RpbmcucXVhbnRpdHkrK1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgaXRlbSA9IGl0ZW1zLmNyZWF0ZSgpXG4gICAgICBpdGVtLnByb2R1Y3RJZCA9IHByb2R1Y3QucHJvZHVjdElkXG4gICAgICBpdGVtLnF1YW50aXR5ID0gMVxuICAgICAgaXRlbXMucHVzaChpdGVtKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZSAoJGluZGV4KSB7XG4gICAgYmFza2V0Lml0ZW1zLnNwbGljZSgkaW5kZXgsIDEpXG4gIH1cbmVsZW1lbnRPcGVuKFwidGFibGVcIilcbiAgZWxlbWVudE9wZW4oXCJ0aGVhZFwiKVxuICAgIGVsZW1lbnRPcGVuKFwidHJcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwidGhcIilcbiAgICAgICAgdGV4dChcInByb2R1Y3RJZFwiKVxuICAgICAgZWxlbWVudENsb3NlKFwidGhcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwidGhcIilcbiAgICAgICAgdGV4dChcInByb2R1Y3ROYW1lXCIpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJ0aFwiKVxuICAgICAgZWxlbWVudE9wZW4oXCJ0aFwiKVxuICAgICAgICB0ZXh0KFwicXVhbnRpdHlcIilcbiAgICAgIGVsZW1lbnRDbG9zZShcInRoXCIpXG4gICAgICBlbGVtZW50T3BlbihcInRoXCIpXG4gICAgICAgIHRleHQoXCJwcmljZVwiKVxuICAgICAgZWxlbWVudENsb3NlKFwidGhcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwidGhcIilcbiAgICAgICAgdGV4dChcImRpc2NvdW50UGVyY2VudFwiKVxuICAgICAgZWxlbWVudENsb3NlKFwidGhcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwidGhcIilcbiAgICAgICAgdGV4dChcImNvc3RcIilcbiAgICAgIGVsZW1lbnRDbG9zZShcInRoXCIpXG4gICAgICBlbGVtZW50T3BlbihcInRoXCIpXG4gICAgICAgIGxpbmVzU3VtbWFyeShiYXNrZXQpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJ0aFwiKVxuICAgIGVsZW1lbnRDbG9zZShcInRyXCIpXG4gIGVsZW1lbnRDbG9zZShcInRoZWFkXCIpXG4gIGVsZW1lbnRPcGVuKFwidGJvZHlcIilcbiAgICA7KEFycmF5LmlzQXJyYXkoYmFza2V0Lml0ZW1zKSA/IGJhc2tldC5pdGVtcyA6IE9iamVjdC5rZXlzKGJhc2tldC5pdGVtcykpLmZvckVhY2goZnVuY3Rpb24oaXRlbSwgJGluZGV4KSB7XG4gICAgICBlbGVtZW50T3BlbihcInRyXCIsIGl0ZW0uaWQpXG4gICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIiwgbnVsbCwgbnVsbCwgXCJvbmNsaWNrXCIsIGFkZClcbiAgICAgICAgICB0ZXh0KFwiXCIgKyAoaXRlbS5wcm9kdWN0LnByb2R1Y3RJZCkgKyBcIlwiKVxuICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgdGV4dChcIlwiICsgKGl0ZW0ucHJvZHVjdC5wcm9kdWN0TmFtZSkgKyBcIlwiKVxuICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJpbnB1dFwiLCBudWxsLCBbXCJ0eXBlXCIsIFwibnVtYmVyXCIsIFwib25jaGFuZ2VcIiwgZnVuY3Rpb24gKGUpIHsgaXRlbS5xdWFudGl0eSA9IHRoaXMudmFsdWV9XSwgXCJ2YWx1ZVwiLCBpdGVtLnF1YW50aXR5KVxuICAgICAgICAgIGVsZW1lbnRDbG9zZShcImlucHV0XCIpXG4gICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICB0ZXh0KFwiXCIgKyAoaXRlbS5wcm9kdWN0LnByaWNlKSArIFwiXCIpXG4gICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICB0ZXh0KFwiXCIgKyAoaXRlbS5wcm9kdWN0LmRpc2NvdW50UGVyY2VudCAqIDEwMCArICcgJScpICsgXCJcIilcbiAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgIHRleHQoXCJcIiArIChpdGVtLmNvc3QudG9GaXhlZCgyKSkgKyBcIlwiKVxuICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgZWxlbWVudE9wZW4oXCJidXR0b25cIiwgbnVsbCwgW1wib25jbGlja1wiLCBmdW5jdGlvbiAoZSkgeyByZW1vdmUoJGluZGV4KSB9XSlcbiAgICAgICAgICAgIHRleHQoXCJSZW1vdmVcIilcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJidXR0b25cIilcbiAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgIGVsZW1lbnRDbG9zZShcInRyXCIpXG4gICAgfSwgYmFza2V0Lml0ZW1zKVxuICAgIGVsZW1lbnRPcGVuKFwidGJvZHlcIilcbiAgICAgIHRvdGFsU3VtbWFyeShiYXNrZXQpXG4gICAgICBpZiAoYmFza2V0Lml0ZW1zLmxlbmd0aCkge1xuICAgICAgICB0ZXh0KFwiIFxcXG4gICAgICAgICAgICBJJ20gaW4gYW4gYGlmYCBhdHRyaWJ1dGUgXCIgKyAoYmFza2V0LnRvdGFsQ29zdCkgKyBcIiBcXFxuICAgICAgICAgIFwiKVxuICAgICAgfVxuICAgIGVsZW1lbnRDbG9zZShcInRib2R5XCIpXG4gIGVsZW1lbnRDbG9zZShcInRib2R5XCIpXG5lbGVtZW50Q2xvc2UoXCJ0YWJsZVwiKVxuOyhBcnJheS5pc0FycmF5KHByb2R1Y3RzKSA/IHByb2R1Y3RzIDogT2JqZWN0LmtleXMocHJvZHVjdHMpKS5mb3JFYWNoKGZ1bmN0aW9uKHByb2R1Y3QsICRpbmRleCkge1xuICBlbGVtZW50T3BlbihcImRpdlwiLCAkaW5kZXgsIFtcInN0eWxlXCIsIFwid2lkdGg6IDMzJTsgZmxvYXQ6IGxlZnQ7XCJdKVxuICAgIGVsZW1lbnRPcGVuKFwiZGl2XCIpXG4gICAgICB0ZXh0KFwiXCIgKyAocHJvZHVjdC5wcm9kdWN0SWQpICsgXCJcIilcbiAgICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbiAgICBlbGVtZW50T3BlbihcImRpdlwiKVxuICAgICAgdGV4dChcIlwiICsgKHByb2R1Y3QucHJvZHVjdE5hbWUpICsgXCJcIilcbiAgICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbiAgICBlbGVtZW50T3BlbihcImRpdlwiKVxuICAgICAgdGV4dChcIlwiICsgKHByb2R1Y3QucHJpY2UpICsgXCJcIilcbiAgICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbiAgICBlbGVtZW50T3BlbihcImRpdlwiKVxuICAgICAgdGV4dChcIlwiICsgKHByb2R1Y3QuZGlzY291bnRQZXJjZW50ICogMTAwICsgJyAlJykgKyBcIlwiKVxuICAgIGVsZW1lbnRDbG9zZShcImRpdlwiKVxuICAgIGVsZW1lbnRPcGVuKFwiZGl2XCIpXG4gICAgICB0ZXh0KFwiXCIgKyAocHJvZHVjdC5jb3N0KSArIFwiXCIpXG4gICAgZWxlbWVudENsb3NlKFwiZGl2XCIpXG4gICAgZWxlbWVudE9wZW4oXCJpbWdcIiwgbnVsbCwgW1wic3R5bGVcIiwgXCJtYXgtd2lkdGg6IDI0MHB4OyBtYXgtaGVpZ2h0OiAyMDBweDtcIl0sIFwic3JjXCIsIHByb2R1Y3QuaW1hZ2UpXG4gICAgZWxlbWVudENsb3NlKFwiaW1nXCIpXG4gICAgZWxlbWVudE9wZW4oXCJidXR0b25cIiwgbnVsbCwgW1wib25jbGlja1wiLCBmdW5jdGlvbiAoZSkgeyBhZGQocHJvZHVjdCkgfV0pXG4gICAgICB0ZXh0KFwiQWRkIHRvIGJhc2tldFwiKVxuICAgIGVsZW1lbnRDbG9zZShcImJ1dHRvblwiKVxuICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbn0sIHByb2R1Y3RzKVxuOyhBcnJheS5pc0FycmF5KG1vZGVsKSA/IG1vZGVsIDogT2JqZWN0LmtleXMobW9kZWwpKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSwgJGluZGV4KSB7XG4gIGVsZW1lbnRPcGVuKFwiZGl2XCIsIGtleSlcbiAgICBlbGVtZW50T3BlbihcInNwYW5cIilcbiAgICAgIHRleHQoXCJcIiArIChrZXkpICsgXCJcIilcbiAgICBlbGVtZW50Q2xvc2UoXCJzcGFuXCIpXG4gICAgZWxlbWVudE9wZW4oXCJzcGFuXCIpXG4gICAgICB0ZXh0KFwiXCIgKyAoJGluZGV4KSArIFwiXCIpXG4gICAgZWxlbWVudENsb3NlKFwic3BhblwiKVxuICBlbGVtZW50Q2xvc2UoXCJkaXZcIilcbn0sIG1vZGVsKVxuZWxlbWVudE9wZW4oXCJwcmVcIilcbiAgdGV4dChcIiBcXFxuICAgIFwiICsgKEpTT04uc3RyaW5naWZ5KG1vZGVsLCBudWxsLCAyKSkgKyBcIiBcXFxuICBcIilcbiAgZWxlbWVudE9wZW4oXCJwcmVcIilcbiAgZWxlbWVudENsb3NlKFwicHJlXCIpXG5lbGVtZW50Q2xvc2UoXCJwcmVcIilcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChtb2RlbCkge1xuZWxlbWVudE9wZW4oXCJ0Zm9vdFwiKVxuICBlbGVtZW50T3BlbihcInRyXCIpXG4gICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgZWxlbWVudE9wZW4oXCJoM1wiKVxuICAgICAgICB0ZXh0KFwiIFxcXG4gICAgICAgICAgICAgICAgXCIgKyAobW9kZWwudG90YWxDb3N0KSArIFwiIFxcXG4gICAgICAgICAgICAgIFwiKVxuICAgICAgZWxlbWVudENsb3NlKFwiaDNcIilcbiAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICBlbGVtZW50Q2xvc2UoXCJ0clwiKVxuZWxlbWVudENsb3NlKFwidGZvb3RcIilcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDogdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6IGZhY3RvcnkoZ2xvYmFsLkluY3JlbWVudGFsRE9NID0ge30pO1xufSkodGhpcywgZnVuY3Rpb24gKGV4cG9ydHMpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBDb3B5cmlnaHQgMjAxNSBUaGUgSW5jcmVtZW50YWwgRE9NIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gICAqXG4gICAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gICAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gICAqXG4gICAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gICAqXG4gICAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICAgKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICAgKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAgICovXG5cbiAgLyoqXG4gICAqIEB0eXBlIHtUcmVlV2Fsa2VyfVxuICAgKi9cbiAgdmFyIHdhbGtlcl87XG5cbiAgLyoqXG4gICAqIEByZXR1cm4ge1RyZWVXYWxrZXJ9IHRoZSBjdXJyZW50IFRyZWVXYWxrZXJcbiAgICovXG4gIHZhciBnZXRXYWxrZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHdhbGtlcl87XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGN1cnJlbnQgVHJlZVdhbGtlclxuICAgKiBAcGFyYW0ge1RyZWVXYWxrZXJ9IHdhbGtlclxuICAgKi9cbiAgdmFyIHNldFdhbGtlciA9IGZ1bmN0aW9uICh3YWxrZXIpIHtcbiAgICB3YWxrZXJfID0gd2Fsa2VyO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb3B5cmlnaHQgMjAxNSBUaGUgSW5jcmVtZW50YWwgRE9NIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gICAqXG4gICAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gICAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gICAqXG4gICAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gICAqXG4gICAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICAgKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICAgKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAgICovXG5cbiAgLyoqXG4gICAqIEtlZXBzIHRyYWNrIG9mIGluZm9ybWF0aW9uIG5lZWRlZCB0byBwZXJmb3JtIGRpZmZzIGZvciBhIGdpdmVuIERPTSBub2RlLlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IG5vZGVOYW1lXG4gICAqIEBwYXJhbSB7P3N0cmluZ30ga2V5XG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgZnVuY3Rpb24gTm9kZURhdGEobm9kZU5hbWUsIGtleSkge1xuICAgIC8qKlxuICAgICAqIFRoZSBhdHRyaWJ1dGVzIGFuZCB0aGVpciB2YWx1ZXMuXG4gICAgICogQGNvbnN0XG4gICAgICovXG4gICAgdGhpcy5hdHRycyA9IHt9O1xuXG4gICAgLyoqXG4gICAgICogQW4gYXJyYXkgb2YgYXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMsIHVzZWQgZm9yIHF1aWNrbHkgZGlmZmluZyB0aGVcbiAgICAgKiBpbmNvbW1pbmcgYXR0cmlidXRlcyB0byBzZWUgaWYgdGhlIERPTSBub2RlJ3MgYXR0cmlidXRlcyBuZWVkIHRvIGJlXG4gICAgICogdXBkYXRlZC5cbiAgICAgKiBAY29uc3Qge0FycmF5PCo+fVxuICAgICAqL1xuICAgIHRoaXMuYXR0cnNBcnIgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBpbmNvbWluZyBhdHRyaWJ1dGVzIGZvciB0aGlzIE5vZGUsIGJlZm9yZSB0aGV5IGFyZSB1cGRhdGVkLlxuICAgICAqIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsICo+fVxuICAgICAqL1xuICAgIHRoaXMubmV3QXR0cnMgPSB7fTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBrZXkgdXNlZCB0byBpZGVudGlmeSB0aGlzIG5vZGUsIHVzZWQgdG8gcHJlc2VydmUgRE9NIG5vZGVzIHdoZW4gdGhleVxuICAgICAqIG1vdmUgd2l0aGluIHRoZWlyIHBhcmVudC5cbiAgICAgKiBAY29uc3RcbiAgICAgKi9cbiAgICB0aGlzLmtleSA9IGtleTtcblxuICAgIC8qKlxuICAgICAqIEtlZXBzIHRyYWNrIG9mIGNoaWxkcmVuIHdpdGhpbiB0aGlzIG5vZGUgYnkgdGhlaXIga2V5LlxuICAgICAqIHs/T2JqZWN0PHN0cmluZywgIUVsZW1lbnQ+fVxuICAgICAqL1xuICAgIHRoaXMua2V5TWFwID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgb3Igbm90IHRoZSBrZXlNYXAgaXMgY3VycmVudGx5IHZhbGlkLlxuICAgICAqIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMua2V5TWFwVmFsaWQgPSB0cnVlO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGxhc3QgY2hpbGQgdG8gaGF2ZSBiZWVuIHZpc2l0ZWQgd2l0aGluIHRoZSBjdXJyZW50IHBhc3MuXG4gICAgICogez9Ob2RlfVxuICAgICAqL1xuICAgIHRoaXMubGFzdFZpc2l0ZWRDaGlsZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbm9kZSBuYW1lIGZvciB0aGlzIG5vZGUuXG4gICAgICogQGNvbnN0XG4gICAgICovXG4gICAgdGhpcy5ub2RlTmFtZSA9IG5vZGVOYW1lO1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0IHtzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy50ZXh0ID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBhIE5vZGVEYXRhIG9iamVjdCBmb3IgYSBOb2RlLlxuICAgKlxuICAgKiBAcGFyYW0geyFOb2RlfSBub2RlIFRoZSBub2RlIHRvIGluaXRpYWxpemUgZGF0YSBmb3IuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBub2RlTmFtZSBUaGUgbm9kZSBuYW1lIG9mIG5vZGUuXG4gICAqIEBwYXJhbSB7P3N0cmluZ30ga2V5IFRoZSBrZXkgdGhhdCBpZGVudGlmaWVzIHRoZSBub2RlLlxuICAgKiBAcmV0dXJuIHshTm9kZURhdGF9IFRoZSBuZXdseSBpbml0aWFsaXplZCBkYXRhIG9iamVjdFxuICAgKi9cbiAgdmFyIGluaXREYXRhID0gZnVuY3Rpb24gKG5vZGUsIG5vZGVOYW1lLCBrZXkpIHtcbiAgICB2YXIgZGF0YSA9IG5ldyBOb2RlRGF0YShub2RlTmFtZSwga2V5KTtcbiAgICBub2RlWydfX2luY3JlbWVudGFsRE9NRGF0YSddID0gZGF0YTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBOb2RlRGF0YSBvYmplY3QgZm9yIGEgTm9kZSwgY3JlYXRpbmcgaXQgaWYgbmVjZXNzYXJ5LlxuICAgKlxuICAgKiBAcGFyYW0geyFOb2RlfSBub2RlIFRoZSBub2RlIHRvIHJldHJpZXZlIHRoZSBkYXRhIGZvci5cbiAgICogQHJldHVybiB7Tm9kZURhdGF9IFRoZSBOb2RlRGF0YSBmb3IgdGhpcyBOb2RlLlxuICAgKi9cbiAgdmFyIGdldERhdGEgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIHZhciBkYXRhID0gbm9kZVsnX19pbmNyZW1lbnRhbERPTURhdGEnXTtcblxuICAgIGlmICghZGF0YSkge1xuICAgICAgdmFyIG5vZGVOYW1lID0gbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgdmFyIGtleSA9IG51bGw7XG5cbiAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICBrZXkgPSBub2RlLmdldEF0dHJpYnV0ZSgna2V5Jyk7XG4gICAgICB9XG5cbiAgICAgIGRhdGEgPSBpbml0RGF0YShub2RlLCBub2RlTmFtZSwga2V5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfTtcblxuICAvKipcbiAgICogQXBwbGllcyBhbiBhdHRyaWJ1dGUgb3IgcHJvcGVydHkgdG8gYSBnaXZlbiBFbGVtZW50LiBJZiB0aGUgdmFsdWUgaXMgbnVsbFxuICAgKiBvciB1bmRlZmluZWQsIGl0IGlzIHJlbW92ZWQgZnJvbSB0aGUgRWxlbWVudC4gT3RoZXJ3aXNlLCB0aGUgdmFsdWUgaXMgc2V0XG4gICAqIGFzIGFuIGF0dHJpYnV0ZS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIGF0dHJpYnV0ZSdzIG5hbWUuXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIGF0dHJpYnV0ZSdzIHZhbHVlLlxuICAgKi9cbiAgdmFyIGFwcGx5QXR0ciA9IGZ1bmN0aW9uIChlbCwgbmFtZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQXBwbGllcyBhIHByb3BlcnR5IHRvIGEgZ2l2ZW4gRWxlbWVudC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIHByb3BlcnR5J3MgbmFtZS5cbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgcHJvcGVydHkncyB2YWx1ZS5cbiAgICovXG4gIHZhciBhcHBseVByb3AgPSBmdW5jdGlvbiAoZWwsIG5hbWUsIHZhbHVlKSB7XG4gICAgZWxbbmFtZV0gPSB2YWx1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQXBwbGllcyBhIHN0eWxlIHRvIGFuIEVsZW1lbnQuIE5vIHZlbmRvciBwcmVmaXggZXhwYW5zaW9uIGlzIGRvbmUgZm9yXG4gICAqIHByb3BlcnR5IG5hbWVzL3ZhbHVlcy5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIGF0dHJpYnV0ZSdzIG5hbWUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfE9iamVjdDxzdHJpbmcsc3RyaW5nPn0gc3R5bGUgVGhlIHN0eWxlIHRvIHNldC4gRWl0aGVyIGFcbiAgICogICAgIHN0cmluZyBvZiBjc3Mgb3IgYW4gb2JqZWN0IGNvbnRhaW5pbmcgcHJvcGVydHktdmFsdWUgcGFpcnMuXG4gICAqL1xuICB2YXIgYXBwbHlTdHlsZSA9IGZ1bmN0aW9uIChlbCwgbmFtZSwgc3R5bGUpIHtcbiAgICBpZiAodHlwZW9mIHN0eWxlID09PSAnc3RyaW5nJykge1xuICAgICAgZWwuc3R5bGUuY3NzVGV4dCA9IHN0eWxlO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC5zdHlsZS5jc3NUZXh0ID0gJyc7XG5cbiAgICAgIGZvciAodmFyIHByb3AgaW4gc3R5bGUpIHtcbiAgICAgICAgZWwuc3R5bGVbcHJvcF0gPSBzdHlsZVtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgYSBzaW5nbGUgYXR0cmlidXRlIG9uIGFuIEVsZW1lbnQuXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBhdHRyaWJ1dGUncyBuYW1lLlxuICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBhdHRyaWJ1dGUncyB2YWx1ZS4gSWYgdGhlIHZhbHVlIGlzIGFuIG9iamVjdCBvclxuICAgKiAgICAgZnVuY3Rpb24gaXQgaXMgc2V0IG9uIHRoZSBFbGVtZW50LCBvdGhlcndpc2UsIGl0IGlzIHNldCBhcyBhbiBIVE1MXG4gICAqICAgICBhdHRyaWJ1dGUuXG4gICAqL1xuICB2YXIgYXBwbHlBdHRyaWJ1dGVUeXBlZCA9IGZ1bmN0aW9uIChlbCwgbmFtZSwgdmFsdWUpIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcblxuICAgIGlmICh0eXBlID09PSAnb2JqZWN0JyB8fCB0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhcHBseVByb3AoZWwsIG5hbWUsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBwbHlBdHRyKGVsLCBuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxscyB0aGUgYXBwcm9wcmlhdGUgYXR0cmlidXRlIG11dGF0b3IgZm9yIHRoaXMgYXR0cmlidXRlLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgYXR0cmlidXRlJ3MgbmFtZS5cbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgYXR0cmlidXRlJ3MgdmFsdWUuXG4gICAqL1xuICB2YXIgdXBkYXRlQXR0cmlidXRlID0gZnVuY3Rpb24gKGVsLCBuYW1lLCB2YWx1ZSkge1xuICAgIHZhciBkYXRhID0gZ2V0RGF0YShlbCk7XG4gICAgdmFyIGF0dHJzID0gZGF0YS5hdHRycztcblxuICAgIGlmIChhdHRyc1tuYW1lXSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbXV0YXRvciA9IF9tdXRhdG9yc1tuYW1lXSB8fCBfbXV0YXRvcnMuX19hbGw7XG4gICAgbXV0YXRvcihlbCwgbmFtZSwgdmFsdWUpO1xuXG4gICAgYXR0cnNbbmFtZV0gPSB2YWx1ZTtcbiAgfTtcblxuICAvKipcbiAgICogRXhwb3NlcyBvdXIgZGVmYXVsdCBhdHRyaWJ1dGUgbXV0YXRvcnMgcHVibGljbHksIHNvIHRoZXkgbWF5IGJlIHVzZWQgaW5cbiAgICogY3VzdG9tIG11dGF0b3JzLlxuICAgKiBAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCBmdW5jdGlvbighRWxlbWVudCwgc3RyaW5nLCAqKT59XG4gICAqL1xuICB2YXIgX2RlZmF1bHRzID0ge1xuICAgIGFwcGx5QXR0cjogYXBwbHlBdHRyLFxuICAgIGFwcGx5UHJvcDogYXBwbHlQcm9wLFxuICAgIGFwcGx5U3R5bGU6IGFwcGx5U3R5bGVcbiAgfTtcblxuICAvKipcbiAgICogQSBwdWJsaWNseSBtdXRhYmxlIG9iamVjdCB0byBwcm92aWRlIGN1c3RvbSBtdXRhdG9ycyBmb3IgYXR0cmlidXRlcy5cbiAgICogQGNvbnN0IHshT2JqZWN0PHN0cmluZywgZnVuY3Rpb24oIUVsZW1lbnQsIHN0cmluZywgKik+fVxuICAgKi9cbiAgdmFyIF9tdXRhdG9ycyA9IHtcbiAgICAvLyBTcGVjaWFsIGdlbmVyaWMgbXV0YXRvciB0aGF0J3MgY2FsbGVkIGZvciBhbnkgYXR0cmlidXRlIHRoYXQgZG9lcyBub3RcbiAgICAvLyBoYXZlIGEgc3BlY2lmaWMgbXV0YXRvci5cbiAgICBfX2FsbDogYXBwbHlBdHRyaWJ1dGVUeXBlZCxcblxuICAgIC8vIFNwZWNpYWwgY2FzZSB0aGUgc3R5bGUgYXR0cmlidXRlXG4gICAgc3R5bGU6IGFwcGx5U3R5bGVcbiAgfTtcblxuICB2YXIgU1ZHX05TID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJztcblxuICAvKipcbiAgICogRW50ZXJzIGEgdGFnLCBjaGVja2luZyB0byBzZWUgaWYgaXQgaXMgYSBuYW1lc3BhY2UgYm91bmRhcnksIGFuZCBpZiBzbyxcbiAgICogdXBkYXRlcyB0aGUgY3VycmVudCBuYW1lc3BhY2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIHRhZyB0byBlbnRlci5cbiAgICovXG4gIHZhciBlbnRlclRhZyA9IGZ1bmN0aW9uICh0YWcpIHtcbiAgICBpZiAodGFnID09PSAnc3ZnJykge1xuICAgICAgZ2V0V2Fsa2VyKCkuZW50ZXJOYW1lc3BhY2UoU1ZHX05TKTtcbiAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ2ZvcmVpZ25PYmplY3QnKSB7XG4gICAgICBnZXRXYWxrZXIoKS5lbnRlck5hbWVzcGFjZSh1bmRlZmluZWQpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRXhpdHMgYSB0YWcsIGNoZWNraW5nIHRvIHNlZSBpZiBpdCBpcyBhIG5hbWVzcGFjZSBib3VuZGFyeSwgYW5kIGlmIHNvLFxuICAgKiB1cGRhdGVzIHRoZSBjdXJyZW50IG5hbWVzcGFjZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyBUaGUgdGFnIHRvIGVudGVyLlxuICAgKi9cbiAgdmFyIGV4aXRUYWcgPSBmdW5jdGlvbiAodGFnKSB7XG4gICAgaWYgKHRhZyA9PT0gJ3N2ZycgfHwgdGFnID09PSAnZm9yZWlnbk9iamVjdCcpIHtcbiAgICAgIGdldFdhbGtlcigpLmV4aXROYW1lc3BhY2UoKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG5hbWVzcGFjZSB0byBjcmVhdGUgYW4gZWxlbWVudCAob2YgYSBnaXZlbiB0YWcpIGluLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSB0YWcgdG8gZ2V0IHRoZSBuYW1lc3BhY2UgZm9yLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBuYW1lc3BhY2UgdG8gY3JlYXRlIHRoZSB0YWcgaW4uXG4gICAqL1xuICB2YXIgZ2V0TmFtZXNwYWNlRm9yVGFnID0gZnVuY3Rpb24gKHRhZykge1xuICAgIGlmICh0YWcgPT09ICdzdmcnKSB7XG4gICAgICByZXR1cm4gU1ZHX05TO1xuICAgIH1cblxuICAgIHJldHVybiBnZXRXYWxrZXIoKS5nZXRDdXJyZW50TmFtZXNwYWNlKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gRWxlbWVudC5cbiAgICogQHBhcmFtIHshRG9jdW1lbnR9IGRvYyBUaGUgZG9jdW1lbnQgd2l0aCB3aGljaCB0byBjcmVhdGUgdGhlIEVsZW1lbnQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIHRhZyBmb3IgdGhlIEVsZW1lbnQuXG4gICAqIEBwYXJhbSB7P3N0cmluZ30ga2V5IEEga2V5IHRvIGlkZW50aWZ5IHRoZSBFbGVtZW50LlxuICAgKiBAcGFyYW0gez9BcnJheTwqPn0gc3RhdGljcyBBbiBhcnJheSBvZiBhdHRyaWJ1dGUgbmFtZS92YWx1ZSBwYWlycyBvZlxuICAgKiAgICAgdGhlIHN0YXRpYyBhdHRyaWJ1dGVzIGZvciB0aGUgRWxlbWVudC5cbiAgICogQHJldHVybiB7IUVsZW1lbnR9XG4gICAqL1xuICB2YXIgY3JlYXRlRWxlbWVudCA9IGZ1bmN0aW9uIChkb2MsIHRhZywga2V5LCBzdGF0aWNzKSB7XG4gICAgdmFyIG5hbWVzcGFjZSA9IGdldE5hbWVzcGFjZUZvclRhZyh0YWcpO1xuICAgIHZhciBlbDtcblxuICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgIGVsID0gZG9jLmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2UsIHRhZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsID0gZG9jLmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICB9XG5cbiAgICBpbml0RGF0YShlbCwgdGFnLCBrZXkpO1xuXG4gICAgaWYgKHN0YXRpY3MpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhdGljcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICB1cGRhdGVBdHRyaWJ1dGUoZWwsIHN0YXRpY3NbaV0sIHN0YXRpY3NbaSArIDFdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZWw7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBOb2RlLCBlaXRoZXIgYSBUZXh0IG9yIGFuIEVsZW1lbnQgZGVwZW5kaW5nIG9uIHRoZSBub2RlIG5hbWVcbiAgICogcHJvdmlkZWQuXG4gICAqIEBwYXJhbSB7IURvY3VtZW50fSBkb2MgVGhlIGRvY3VtZW50IHdpdGggd2hpY2ggdG8gY3JlYXRlIHRoZSBOb2RlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbm9kZU5hbWUgVGhlIHRhZyBpZiBjcmVhdGluZyBhbiBlbGVtZW50IG9yICN0ZXh0IHRvIGNyZWF0ZVxuICAgKiAgICAgYSBUZXh0LlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IGtleSBBIGtleSB0byBpZGVudGlmeSB0aGUgRWxlbWVudC5cbiAgICogQHBhcmFtIHs/QXJyYXk8Kj59IHN0YXRpY3MgVGhlIHN0YXRpYyBkYXRhIHRvIGluaXRpYWxpemUgdGhlIE5vZGVcbiAgICogICAgIHdpdGguIEZvciBhbiBFbGVtZW50LCBhbiBhcnJheSBvZiBhdHRyaWJ1dGUgbmFtZS92YWx1ZSBwYWlycyBvZlxuICAgKiAgICAgdGhlIHN0YXRpYyBhdHRyaWJ1dGVzIGZvciB0aGUgRWxlbWVudC5cbiAgICogQHJldHVybiB7IU5vZGV9XG4gICAqL1xuICB2YXIgY3JlYXRlTm9kZSA9IGZ1bmN0aW9uIChkb2MsIG5vZGVOYW1lLCBrZXksIHN0YXRpY3MpIHtcbiAgICBpZiAobm9kZU5hbWUgPT09ICcjdGV4dCcpIHtcbiAgICAgIHJldHVybiBkb2MuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVFbGVtZW50KGRvYywgbm9kZU5hbWUsIGtleSwgc3RhdGljcyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBtYXBwaW5nIHRoYXQgY2FuIGJlIHVzZWQgdG8gbG9vayB1cCBjaGlsZHJlbiB1c2luZyBhIGtleS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxcbiAgICogQHJldHVybiB7IU9iamVjdDxzdHJpbmcsICFFbGVtZW50Pn0gQSBtYXBwaW5nIG9mIGtleXMgdG8gdGhlIGNoaWxkcmVuIG9mIHRoZVxuICAgKiAgICAgRWxlbWVudC5cbiAgICovXG4gIHZhciBjcmVhdGVLZXlNYXAgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICB2YXIgbWFwID0ge307XG4gICAgdmFyIGNoaWxkcmVuID0gZWwuY2hpbGRyZW47XG4gICAgdmFyIGNvdW50ID0gY2hpbGRyZW4ubGVuZ3RoO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSArPSAxKSB7XG4gICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgIHZhciBrZXkgPSBnZXREYXRhKGNoaWxkKS5rZXk7XG5cbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgbWFwW2tleV0gPSBjaGlsZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWFwO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIG1hcHBpbmcgb2Yga2V5IHRvIGNoaWxkIG5vZGUgZm9yIGEgZ2l2ZW4gRWxlbWVudCwgY3JlYXRpbmcgaXRcbiAgICogaWYgbmVjZXNzYXJ5LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbFxuICAgKiBAcmV0dXJuIHshT2JqZWN0PHN0cmluZywgIUVsZW1lbnQ+fSBBIG1hcHBpbmcgb2Yga2V5cyB0byBjaGlsZCBFbGVtZW50c1xuICAgKi9cbiAgdmFyIGdldEtleU1hcCA9IGZ1bmN0aW9uIChlbCkge1xuICAgIHZhciBkYXRhID0gZ2V0RGF0YShlbCk7XG5cbiAgICBpZiAoIWRhdGEua2V5TWFwKSB7XG4gICAgICBkYXRhLmtleU1hcCA9IGNyZWF0ZUtleU1hcChlbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGEua2V5TWFwO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYSBjaGlsZCBmcm9tIHRoZSBwYXJlbnQgd2l0aCB0aGUgZ2l2ZW4ga2V5LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBwYXJlbnRcbiAgICogQHBhcmFtIHs/c3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7P0VsZW1lbnR9IFRoZSBjaGlsZCBjb3JyZXNwb25kaW5nIHRvIHRoZSBrZXkuXG4gICAqL1xuICB2YXIgZ2V0Q2hpbGQgPSBmdW5jdGlvbiAocGFyZW50LCBrZXkpIHtcbiAgICByZXR1cm4gZ2V0S2V5TWFwKHBhcmVudClba2V5XTtcbiAgfTtcblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGVsZW1lbnQgYXMgYmVpbmcgYSBjaGlsZC4gVGhlIHBhcmVudCB3aWxsIGtlZXAgdHJhY2sgb2YgdGhlXG4gICAqIGNoaWxkIHVzaW5nIHRoZSBrZXkuIFRoZSBjaGlsZCBjYW4gYmUgcmV0cmlldmVkIHVzaW5nIHRoZSBzYW1lIGtleSB1c2luZ1xuICAgKiBnZXRLZXlNYXAuIFRoZSBwcm92aWRlZCBrZXkgc2hvdWxkIGJlIHVuaXF1ZSB3aXRoaW4gdGhlIHBhcmVudCBFbGVtZW50LlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBwYXJlbnQgVGhlIHBhcmVudCBvZiBjaGlsZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBBIGtleSB0byBpZGVudGlmeSB0aGUgY2hpbGQgd2l0aC5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gY2hpbGQgVGhlIGNoaWxkIHRvIHJlZ2lzdGVyLlxuICAgKi9cbiAgdmFyIHJlZ2lzdGVyQ2hpbGQgPSBmdW5jdGlvbiAocGFyZW50LCBrZXksIGNoaWxkKSB7XG4gICAgZ2V0S2V5TWFwKHBhcmVudClba2V5XSA9IGNoaWxkO1xuICB9O1xuXG4gIGlmICh1bmRlZmluZWQgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIC8qKlxuICAgICogTWFrZXMgc3VyZSB0aGF0IGtleWVkIEVsZW1lbnQgbWF0Y2hlcyB0aGUgdGFnIG5hbWUgcHJvdmlkZWQuXG4gICAgKiBAcGFyYW0geyFFbGVtZW50fSBub2RlIFRoZSBub2RlIHRoYXQgaXMgYmVpbmcgbWF0Y2hlZC5cbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIHRhZyBuYW1lIG9mIHRoZSBFbGVtZW50LlxuICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBFbGVtZW50LlxuICAgICovXG4gICAgdmFyIGFzc2VydEtleWVkVGFnTWF0Y2hlcyA9IGZ1bmN0aW9uIChub2RlLCB0YWcsIGtleSkge1xuICAgICAgdmFyIG5vZGVOYW1lID0gZ2V0RGF0YShub2RlKS5ub2RlTmFtZTtcbiAgICAgIGlmIChub2RlTmFtZSAhPT0gdGFnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV2FzIGV4cGVjdGluZyBub2RlIHdpdGgga2V5IFwiJyArIGtleSArICdcIiB0byBiZSBhICcgKyB0YWcgKyAnLCBub3QgYSAnICsgbm9kZU5hbWUgKyAnLicpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgb3Igbm90IGEgZ2l2ZW4gbm9kZSBtYXRjaGVzIHRoZSBzcGVjaWZpZWQgbm9kZU5hbWUgYW5kIGtleS5cbiAgICpcbiAgICogQHBhcmFtIHshTm9kZX0gbm9kZSBBbiBIVE1MIG5vZGUsIHR5cGljYWxseSBhbiBIVE1MRWxlbWVudCBvciBUZXh0LlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IG5vZGVOYW1lIFRoZSBub2RlTmFtZSBmb3IgdGhpcyBub2RlLlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IGtleSBBbiBvcHRpb25hbCBrZXkgdGhhdCBpZGVudGlmaWVzIGEgbm9kZS5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgbm9kZSBtYXRjaGVzLCBmYWxzZSBvdGhlcndpc2UuXG4gICAqL1xuICB2YXIgbWF0Y2hlcyA9IGZ1bmN0aW9uIChub2RlLCBub2RlTmFtZSwga2V5KSB7XG4gICAgdmFyIGRhdGEgPSBnZXREYXRhKG5vZGUpO1xuXG4gICAgLy8gS2V5IGNoZWNrIGlzIGRvbmUgdXNpbmcgZG91YmxlIGVxdWFscyBhcyB3ZSB3YW50IHRvIHRyZWF0IGEgbnVsbCBrZXkgdGhlXG4gICAgLy8gc2FtZSBhcyB1bmRlZmluZWQuIFRoaXMgc2hvdWxkIGJlIG9rYXkgYXMgdGhlIG9ubHkgdmFsdWVzIGFsbG93ZWQgYXJlXG4gICAgLy8gc3RyaW5ncywgbnVsbCBhbmQgdW5kZWZpbmVkIHNvIHRoZSA9PSBzZW1hbnRpY3MgYXJlIG5vdCB0b28gd2VpcmQuXG4gICAgcmV0dXJuIGtleSA9PSBkYXRhLmtleSAmJiBub2RlTmFtZSA9PT0gZGF0YS5ub2RlTmFtZTtcbiAgfTtcblxuICAvKipcbiAgICogQWxpZ25zIHRoZSB2aXJ0dWFsIEVsZW1lbnQgZGVmaW5pdGlvbiB3aXRoIHRoZSBhY3R1YWwgRE9NLCBtb3ZpbmcgdGhlXG4gICAqIGNvcnJlc3BvbmRpbmcgRE9NIG5vZGUgdG8gdGhlIGNvcnJlY3QgbG9jYXRpb24gb3IgY3JlYXRpbmcgaXQgaWYgbmVjZXNzYXJ5LlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IG5vZGVOYW1lIEZvciBhbiBFbGVtZW50LCB0aGlzIHNob3VsZCBiZSBhIHZhbGlkIHRhZyBzdHJpbmcuXG4gICAqICAgICBGb3IgYSBUZXh0LCB0aGlzIHNob3VsZCBiZSAjdGV4dC5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSBrZXkgVGhlIGtleSB1c2VkIHRvIGlkZW50aWZ5IHRoaXMgZWxlbWVudC5cbiAgICogQHBhcmFtIHs/QXJyYXk8Kj59IHN0YXRpY3MgRm9yIGFuIEVsZW1lbnQsIHRoaXMgc2hvdWxkIGJlIGFuIGFycmF5IG9mXG4gICAqICAgICBuYW1lLXZhbHVlIHBhaXJzLlxuICAgKiBAcmV0dXJuIHshTm9kZX0gVGhlIG1hdGNoaW5nIG5vZGUuXG4gICAqL1xuICB2YXIgYWxpZ25XaXRoRE9NID0gZnVuY3Rpb24gKG5vZGVOYW1lLCBrZXksIHN0YXRpY3MpIHtcbiAgICB2YXIgd2Fsa2VyID0gZ2V0V2Fsa2VyKCk7XG4gICAgdmFyIGN1cnJlbnROb2RlID0gd2Fsa2VyLmN1cnJlbnROb2RlO1xuICAgIHZhciBwYXJlbnQgPSB3YWxrZXIuZ2V0Q3VycmVudFBhcmVudCgpO1xuICAgIHZhciBtYXRjaGluZ05vZGU7XG5cbiAgICAvLyBDaGVjayB0byBzZWUgaWYgd2UgaGF2ZSBhIG5vZGUgdG8gcmV1c2VcbiAgICBpZiAoY3VycmVudE5vZGUgJiYgbWF0Y2hlcyhjdXJyZW50Tm9kZSwgbm9kZU5hbWUsIGtleSkpIHtcbiAgICAgIG1hdGNoaW5nTm9kZSA9IGN1cnJlbnROb2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZXhpc3RpbmdOb2RlID0ga2V5ICYmIGdldENoaWxkKHBhcmVudCwga2V5KTtcblxuICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRoZSBub2RlIGhhcyBtb3ZlZCB3aXRoaW4gdGhlIHBhcmVudCBvciBpZiBhIG5ldyBvbmVcbiAgICAgIC8vIHNob3VsZCBiZSBjcmVhdGVkXG4gICAgICBpZiAoZXhpc3RpbmdOb2RlKSB7XG4gICAgICAgIGlmICh1bmRlZmluZWQgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgIGFzc2VydEtleWVkVGFnTWF0Y2hlcyhleGlzdGluZ05vZGUsIG5vZGVOYW1lLCBrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgbWF0Y2hpbmdOb2RlID0gZXhpc3RpbmdOb2RlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF0Y2hpbmdOb2RlID0gY3JlYXRlTm9kZSh3YWxrZXIuZG9jLCBub2RlTmFtZSwga2V5LCBzdGF0aWNzKTtcblxuICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgcmVnaXN0ZXJDaGlsZChwYXJlbnQsIGtleSwgbWF0Y2hpbmdOb2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgbm9kZSBoYXMgYSBrZXksIHJlbW92ZSBpdCBmcm9tIHRoZSBET00gdG8gcHJldmVudCBhIGxhcmdlIG51bWJlclxuICAgICAgLy8gb2YgcmUtb3JkZXJzIGluIHRoZSBjYXNlIHRoYXQgaXQgbW92ZWQgZmFyIG9yIHdhcyBjb21wbGV0ZWx5IHJlbW92ZWQuXG4gICAgICAvLyBTaW5jZSB3ZSBob2xkIG9uIHRvIGEgcmVmZXJlbmNlIHRocm91Z2ggdGhlIGtleU1hcCwgd2UgY2FuIGFsd2F5cyBhZGQgaXRcbiAgICAgIC8vIGJhY2suXG4gICAgICBpZiAoY3VycmVudE5vZGUgJiYgZ2V0RGF0YShjdXJyZW50Tm9kZSkua2V5KSB7XG4gICAgICAgIHBhcmVudC5yZXBsYWNlQ2hpbGQobWF0Y2hpbmdOb2RlLCBjdXJyZW50Tm9kZSk7XG4gICAgICAgIGdldERhdGEocGFyZW50KS5rZXlNYXBWYWxpZCA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShtYXRjaGluZ05vZGUsIGN1cnJlbnROb2RlKTtcbiAgICAgIH1cblxuICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gbWF0Y2hpbmdOb2RlO1xuICAgIH1cblxuICAgIHJldHVybiBtYXRjaGluZ05vZGU7XG4gIH07XG5cbiAgLyoqXG4gICAqIENsZWFycyBvdXQgYW55IHVudmlzaXRlZCBOb2RlcywgYXMgdGhlIGNvcnJlc3BvbmRpbmcgdmlydHVhbCBlbGVtZW50XG4gICAqIGZ1bmN0aW9ucyB3ZXJlIG5ldmVyIGNhbGxlZCBmb3IgdGhlbS5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gbm9kZVxuICAgKi9cbiAgdmFyIGNsZWFyVW52aXNpdGVkRE9NID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEobm9kZSk7XG4gICAgdmFyIGtleU1hcCA9IGRhdGEua2V5TWFwO1xuICAgIHZhciBrZXlNYXBWYWxpZCA9IGRhdGEua2V5TWFwVmFsaWQ7XG4gICAgdmFyIGxhc3RDaGlsZCA9IG5vZGUubGFzdENoaWxkO1xuICAgIHZhciBsYXN0VmlzaXRlZENoaWxkID0gZGF0YS5sYXN0VmlzaXRlZENoaWxkO1xuXG4gICAgZGF0YS5sYXN0VmlzaXRlZENoaWxkID0gbnVsbDtcblxuICAgIGlmIChsYXN0Q2hpbGQgPT09IGxhc3RWaXNpdGVkQ2hpbGQgJiYga2V5TWFwVmFsaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB3aGlsZSAobGFzdENoaWxkICE9PSBsYXN0VmlzaXRlZENoaWxkKSB7XG4gICAgICBub2RlLnJlbW92ZUNoaWxkKGxhc3RDaGlsZCk7XG4gICAgICBsYXN0Q2hpbGQgPSBub2RlLmxhc3RDaGlsZDtcbiAgICB9XG5cbiAgICAvLyBDbGVhbiB0aGUga2V5TWFwLCByZW1vdmluZyBhbnkgdW51c3VlZCBrZXlzLlxuICAgIGZvciAodmFyIGtleSBpbiBrZXlNYXApIHtcbiAgICAgIGlmICgha2V5TWFwW2tleV0ucGFyZW50Tm9kZSkge1xuICAgICAgICBkZWxldGUga2V5TWFwW2tleV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGF0YS5rZXlNYXBWYWxpZCA9IHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEVudGVycyBhbiBFbGVtZW50LCBzZXR0aW5nIHRoZSBjdXJyZW50IG5hbWVzcGFjZSBmb3IgbmVzdGVkIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBub2RlXG4gICAqL1xuICB2YXIgZW50ZXJOb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICB2YXIgZGF0YSA9IGdldERhdGEobm9kZSk7XG4gICAgZW50ZXJUYWcoZGF0YS5ub2RlTmFtZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEV4aXRzIGFuIEVsZW1lbnQsIHVud2luZGluZyB0aGUgY3VycmVudCBuYW1lc3BhY2UgdG8gdGhlIHByZXZpb3VzIHZhbHVlLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBub2RlXG4gICAqL1xuICB2YXIgZXhpdE5vZGUgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIHZhciBkYXRhID0gZ2V0RGF0YShub2RlKTtcbiAgICBleGl0VGFnKGRhdGEubm9kZU5hbWUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBNYXJrcyBub2RlJ3MgcGFyZW50IGFzIGhhdmluZyB2aXNpdGVkIG5vZGUuXG4gICAqIEBwYXJhbSB7IU5vZGV9IG5vZGVcbiAgICovXG4gIHZhciBtYXJrVmlzaXRlZCA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgdmFyIHdhbGtlciA9IGdldFdhbGtlcigpO1xuICAgIHZhciBwYXJlbnQgPSB3YWxrZXIuZ2V0Q3VycmVudFBhcmVudCgpO1xuICAgIHZhciBkYXRhID0gZ2V0RGF0YShwYXJlbnQpO1xuICAgIGRhdGEubGFzdFZpc2l0ZWRDaGlsZCA9IG5vZGU7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdG8gdGhlIGZpcnN0IGNoaWxkIG9mIHRoZSBjdXJyZW50IG5vZGUuXG4gICAqL1xuICB2YXIgZmlyc3RDaGlsZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgd2Fsa2VyID0gZ2V0V2Fsa2VyKCk7XG4gICAgZW50ZXJOb2RlKHdhbGtlci5jdXJyZW50Tm9kZSk7XG4gICAgd2Fsa2VyLmZpcnN0Q2hpbGQoKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hhbmdlcyB0byB0aGUgbmV4dCBzaWJsaW5nIG9mIHRoZSBjdXJyZW50IG5vZGUuXG4gICAqL1xuICB2YXIgbmV4dFNpYmxpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHdhbGtlciA9IGdldFdhbGtlcigpO1xuICAgIG1hcmtWaXNpdGVkKHdhbGtlci5jdXJyZW50Tm9kZSk7XG4gICAgd2Fsa2VyLm5leHRTaWJsaW5nKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdG8gdGhlIHBhcmVudCBvZiB0aGUgY3VycmVudCBub2RlLCByZW1vdmluZyBhbnkgdW52aXNpdGVkIGNoaWxkcmVuLlxuICAgKi9cbiAgdmFyIHBhcmVudE5vZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHdhbGtlciA9IGdldFdhbGtlcigpO1xuICAgIHdhbGtlci5wYXJlbnROb2RlKCk7XG4gICAgZXhpdE5vZGUod2Fsa2VyLmN1cnJlbnROb2RlKTtcbiAgfTtcblxuICAvKipcbiAgICogQ29weXJpZ2h0IDIwMTUgVGhlIEluY3JlbWVudGFsIERPTSBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICAgKlxuICAgKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAgKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gICAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAgKlxuICAgKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAgKlxuICAgKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gICAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAgICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gICAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBTaW1pbGFyIHRvIHRoZSBidWlsdC1pbiBUcmVld2Fsa2VyIGNsYXNzLCBidXQgc2ltcGxpZmllZCBhbmQgYWxsb3dzIGRpcmVjdFxuICAgKiBhY2Nlc3MgdG8gbW9kaWZ5IHRoZSBjdXJyZW50Tm9kZSBwcm9wZXJ0eS5cbiAgICogQHBhcmFtIHshTm9kZX0gbm9kZSBUaGUgcm9vdCBOb2RlIG9mIHRoZSBzdWJ0cmVlIHRoZSB3YWxrZXIgc2hvdWxkIHN0YXJ0XG4gICAqICAgICB0cmF2ZXJzaW5nLlxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGZ1bmN0aW9uIFRyZWVXYWxrZXIobm9kZSkge1xuICAgIC8qKlxuICAgICAqIEtlZXBzIHRyYWNrIG9mIHRoZSBjdXJyZW50IHBhcmVudCBub2RlLiBUaGlzIGlzIG5lY2Vzc2FyeSBhcyB0aGUgdHJhdmVyc2FsXG4gICAgICogbWV0aG9kcyBtYXkgdHJhdmVyc2UgcGFzdCB0aGUgbGFzdCBjaGlsZCBhbmQgd2Ugc3RpbGwgbmVlZCBhIHdheSB0byBnZXRcbiAgICAgKiBiYWNrIHRvIHRoZSBwYXJlbnQuXG4gICAgICogQGNvbnN0IEBwcml2YXRlIHshQXJyYXk8IU5vZGU+fVxuICAgICAqL1xuICAgIHRoaXMuc3RhY2tfID0gW107XG5cbiAgICAvKiogez9Ob2RlfSAqL1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSBub2RlO1xuXG4gICAgLyoqIHshRG9jdW1lbnR9ICovXG4gICAgdGhpcy5kb2MgPSBub2RlLm93bmVyRG9jdW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBLZWVwcyB0cmFjayBvZiB3aGF0IG5hbWVzcGFjZSB0byBjcmVhdGUgbmV3IEVsZW1lbnRzIGluLlxuICAgICAqIEBjb25zdCBAcHJpdmF0ZSB7IUFycmF5PHN0cmluZz59XG4gICAgICovXG4gICAgdGhpcy5uc1N0YWNrXyA9IFt1bmRlZmluZWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFOb2RlfSBUaGUgY3VycmVudCBwYXJlbnQgb2YgdGhlIGN1cnJlbnQgbG9jYXRpb24gaW4gdGhlIHN1YnRyZWUuXG4gICAqL1xuICBUcmVlV2Fsa2VyLnByb3RvdHlwZS5nZXRDdXJyZW50UGFyZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnN0YWNrX1t0aGlzLnN0YWNrXy5sZW5ndGggLSAxXTtcbiAgfTtcblxuICAvKipcbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgY3VycmVudCBuYW1lc3BhY2UgdG8gY3JlYXRlIEVsZW1lbnRzIGluLlxuICAgKi9cbiAgVHJlZVdhbGtlci5wcm90b3R5cGUuZ2V0Q3VycmVudE5hbWVzcGFjZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5uc1N0YWNrX1t0aGlzLm5zU3RhY2tfLmxlbmd0aCAtIDFdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZXNwYWNlIFRoZSBuYW1lc3BhY2UgdG8gZW50ZXIuXG4gICAqL1xuICBUcmVlV2Fsa2VyLnByb3RvdHlwZS5lbnRlck5hbWVzcGFjZSA9IGZ1bmN0aW9uIChuYW1lc3BhY2UpIHtcbiAgICB0aGlzLm5zU3RhY2tfLnB1c2gobmFtZXNwYWNlKTtcbiAgfTtcblxuICAvKipcbiAgICogRXhpdHMgdGhlIGN1cnJlbnQgbmFtZXNwYWNlXG4gICAqL1xuICBUcmVlV2Fsa2VyLnByb3RvdHlwZS5leGl0TmFtZXNwYWNlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubnNTdGFja18ucG9wKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdGhlIGN1cnJlbnQgbG9jYXRpb24gdGhlIGZpcnN0Q2hpbGQgb2YgdGhlIGN1cnJlbnQgbG9jYXRpb24uXG4gICAqL1xuICBUcmVlV2Fsa2VyLnByb3RvdHlwZS5maXJzdENoaWxkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc3RhY2tfLnB1c2godGhpcy5jdXJyZW50Tm9kZSk7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IHRoaXMuY3VycmVudE5vZGUuZmlyc3RDaGlsZDtcbiAgfTtcblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgY3VycmVudCBsb2NhdGlvbiB0aGUgbmV4dFNpYmxpbmcgb2YgdGhlIGN1cnJlbnQgbG9jYXRpb24uXG4gICAqL1xuICBUcmVlV2Fsa2VyLnByb3RvdHlwZS5uZXh0U2libGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0gdGhpcy5jdXJyZW50Tm9kZS5uZXh0U2libGluZztcbiAgfTtcblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgY3VycmVudCBsb2NhdGlvbiB0aGUgcGFyZW50Tm9kZSBvZiB0aGUgY3VycmVudCBsb2NhdGlvbi5cbiAgICovXG4gIFRyZWVXYWxrZXIucHJvdG90eXBlLnBhcmVudE5vZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IHRoaXMuc3RhY2tfLnBvcCgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAY29uc3Qge2Jvb2xlYW59XG4gICAqL1xuICBpZiAodW5kZWZpbmVkICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICB2YXIgYXNzZXJ0Tm9VbmNsb3NlZFRhZ3MgPSBmdW5jdGlvbiAocm9vdCkge1xuICAgICAgdmFyIG9wZW5FbGVtZW50ID0gZ2V0V2Fsa2VyKCkuZ2V0Q3VycmVudFBhcmVudCgpO1xuICAgICAgaWYgKCFvcGVuRWxlbWVudCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBvcGVuVGFncyA9IFtdO1xuICAgICAgd2hpbGUgKG9wZW5FbGVtZW50ICYmIG9wZW5FbGVtZW50ICE9PSByb290KSB7XG4gICAgICAgIG9wZW5UYWdzLnB1c2gob3BlbkVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIG9wZW5FbGVtZW50ID0gb3BlbkVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICAgIH1cblxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdPbmUgb3IgbW9yZSB0YWdzIHdlcmUgbm90IGNsb3NlZDpcXG4nICsgb3BlblRhZ3Muam9pbignXFxuJykpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUGF0Y2hlcyB0aGUgZG9jdW1lbnQgc3RhcnRpbmcgYXQgZWwgd2l0aCB0aGUgcHJvdmlkZWQgZnVuY3Rpb24uIFRoaXMgZnVuY3Rpb25cbiAgICogbWF5IGJlIGNhbGxlZCBkdXJpbmcgYW4gZXhpc3RpbmcgcGF0Y2ggb3BlcmF0aW9uLlxuICAgKiBAcGFyYW0geyFFbGVtZW50fCFEb2N1bWVudH0gbm9kZSBUaGUgRWxlbWVudCBvciBEb2N1bWVudCB0byBwYXRjaC5cbiAgICogQHBhcmFtIHshZnVuY3Rpb259IGZuIEEgZnVuY3Rpb24gY29udGFpbmluZyBlbGVtZW50T3Blbi9lbGVtZW50Q2xvc2UvZXRjLlxuICAgKiAgICAgY2FsbHMgdGhhdCBkZXNjcmliZSB0aGUgRE9NLlxuICAgKiBAcGFyYW0geyp9IGRhdGEgQW4gYXJndW1lbnQgcGFzc2VkIHRvIGZuIHRvIHJlcHJlc2VudCBET00gc3RhdGUuXG4gICAqL1xuICBleHBvcnRzLnBhdGNoID0gZnVuY3Rpb24gKG5vZGUsIGZuLCBkYXRhKSB7XG4gICAgdmFyIHByZXZXYWxrZXIgPSBnZXRXYWxrZXIoKTtcbiAgICBzZXRXYWxrZXIobmV3IFRyZWVXYWxrZXIobm9kZSkpO1xuXG4gICAgZmlyc3RDaGlsZCgpO1xuICAgIGZuKGRhdGEpO1xuICAgIHBhcmVudE5vZGUoKTtcbiAgICBjbGVhclVudmlzaXRlZERPTShub2RlKTtcblxuICAgIGlmICh1bmRlZmluZWQgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgYXNzZXJ0Tm9VbmNsb3NlZFRhZ3Mobm9kZSk7XG4gICAgfVxuXG4gICAgc2V0V2Fsa2VyKHByZXZXYWxrZXIpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUaGUgb2Zmc2V0IGluIHRoZSB2aXJ0dWFsIGVsZW1lbnQgZGVjbGFyYXRpb24gd2hlcmUgdGhlIGF0dHJpYnV0ZXMgYXJlXG4gICAqIHNwZWNpZmllZC5cbiAgICogQGNvbnN0XG4gICAqL1xuICB2YXIgQVRUUklCVVRFU19PRkZTRVQgPSAzO1xuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW4gYXJyYXkgb2YgYXJndW1lbnRzIGZvciB1c2Ugd2l0aCBlbGVtZW50T3BlblN0YXJ0LCBhdHRyIGFuZFxuICAgKiBlbGVtZW50T3BlbkVuZC5cbiAgICogQGNvbnN0IHtBcnJheTwqPn1cbiAgICovXG4gIHZhciBhcmdzQnVpbGRlciA9IFtdO1xuXG4gIGlmICh1bmRlZmluZWQgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIC8qKlxuICAgICAqIEtlZXBzIHRyYWNrIHdoZXRoZXIgb3Igbm90IHdlIGFyZSBpbiBhbiBhdHRyaWJ1dGVzIGRlY2xhcmF0aW9uIChhZnRlclxuICAgICAqIGVsZW1lbnRPcGVuU3RhcnQsIGJ1dCBiZWZvcmUgZWxlbWVudE9wZW5FbmQpLlxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIHZhciBpbkF0dHJpYnV0ZXMgPSBmYWxzZTtcblxuICAgIC8qKiBNYWtlcyBzdXJlIHRoYXQgdGhlIGNhbGxlciBpcyBub3Qgd2hlcmUgYXR0cmlidXRlcyBhcmUgZXhwZWN0ZWQuICovXG4gICAgdmFyIGFzc2VydE5vdEluQXR0cmlidXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChpbkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXYXMgbm90IGV4cGVjdGluZyBhIGNhbGwgdG8gYXR0ciBvciBlbGVtZW50T3BlbkVuZCwgJyArICd0aGV5IG11c3QgZm9sbG93IGEgY2FsbCB0byBlbGVtZW50T3BlblN0YXJ0LicpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKiogTWFrZXMgc3VyZSB0aGF0IHRoZSBjYWxsZXIgaXMgd2hlcmUgYXR0cmlidXRlcyBhcmUgZXhwZWN0ZWQuICovXG4gICAgdmFyIGFzc2VydEluQXR0cmlidXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghaW5BdHRyaWJ1dGVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV2FzIGV4cGVjdGluZyBhIGNhbGwgdG8gYXR0ciBvciBlbGVtZW50T3BlbkVuZC4gJyArICdlbGVtZW50T3BlblN0YXJ0IG11c3QgYmUgZm9sbG93ZWQgYnkgemVybyBvciBtb3JlIGNhbGxzIHRvIGF0dHIsICcgKyAndGhlbiBvbmUgY2FsbCB0byBlbGVtZW50T3BlbkVuZC4nKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTWFrZXMgc3VyZSB0aGF0IHRhZ3MgYXJlIGNvcnJlY3RseSBuZXN0ZWQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhZ1xuICAgICAqL1xuICAgIHZhciBhc3NlcnRDbG9zZU1hdGNoZXNPcGVuVGFnID0gZnVuY3Rpb24gKHRhZykge1xuICAgICAgdmFyIGNsb3NpbmdOb2RlID0gZ2V0V2Fsa2VyKCkuZ2V0Q3VycmVudFBhcmVudCgpO1xuICAgICAgdmFyIGRhdGEgPSBnZXREYXRhKGNsb3NpbmdOb2RlKTtcblxuICAgICAgaWYgKHRhZyAhPT0gZGF0YS5ub2RlTmFtZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlY2VpdmVkIGEgY2FsbCB0byBjbG9zZSAnICsgdGFnICsgJyBidXQgJyArIGRhdGEubm9kZU5hbWUgKyAnIHdhcyBvcGVuLicpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKiogVXBkYXRlcyB0aGUgc3RhdGUgdG8gYmVpbmcgaW4gYW4gYXR0cmlidXRlIGRlY2xhcmF0aW9uLiAqL1xuICAgIHZhciBzZXRJbkF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpbkF0dHJpYnV0ZXMgPSB0cnVlO1xuICAgIH07XG5cbiAgICAvKiogVXBkYXRlcyB0aGUgc3RhdGUgdG8gbm90IGJlaW5nIGluIGFuIGF0dHJpYnV0ZSBkZWNsYXJhdGlvbi4gKi9cbiAgICB2YXIgc2V0Tm90SW5BdHRyaWJ1dGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgaW5BdHRyaWJ1dGVzID0gZmFsc2U7XG4gICAgfTtcbiAgfVxuXG4gIGV4cG9ydHMuZWxlbWVudE9wZW4gPSBmdW5jdGlvbiAodGFnLCBrZXksIHN0YXRpY3MsIHZhcl9hcmdzKSB7XG4gICAgaWYgKHVuZGVmaW5lZCAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBhc3NlcnROb3RJbkF0dHJpYnV0ZXMoKTtcbiAgICB9XG5cbiAgICB2YXIgbm9kZSA9IGFsaWduV2l0aERPTSh0YWcsIGtleSwgc3RhdGljcyk7XG4gICAgdmFyIGRhdGEgPSBnZXREYXRhKG5vZGUpO1xuXG4gICAgLypcbiAgICAgKiBDaGVja3MgdG8gc2VlIGlmIG9uZSBvciBtb3JlIGF0dHJpYnV0ZXMgaGF2ZSBjaGFuZ2VkIGZvciBhIGdpdmVuIEVsZW1lbnQuXG4gICAgICogV2hlbiBubyBhdHRyaWJ1dGVzIGhhdmUgY2hhbmdlZCwgdGhpcyBpcyBtdWNoIGZhc3RlciB0aGFuIGNoZWNraW5nIGVhY2hcbiAgICAgKiBpbmRpdmlkdWFsIGFyZ3VtZW50LiBXaGVuIGF0dHJpYnV0ZXMgaGF2ZSBjaGFuZ2VkLCB0aGUgb3ZlcmhlYWQgb2YgdGhpcyBpc1xuICAgICAqIG1pbmltYWwuXG4gICAgICovXG4gICAgdmFyIGF0dHJzQXJyID0gZGF0YS5hdHRyc0FycjtcbiAgICB2YXIgYXR0cnNDaGFuZ2VkID0gZmFsc2U7XG4gICAgdmFyIGkgPSBBVFRSSUJVVEVTX09GRlNFVDtcbiAgICB2YXIgaiA9IDA7XG5cbiAgICBmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkgKz0gMSwgaiArPSAxKSB7XG4gICAgICBpZiAoYXR0cnNBcnJbal0gIT09IGFyZ3VtZW50c1tpXSkge1xuICAgICAgICBhdHRyc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkgKz0gMSwgaiArPSAxKSB7XG4gICAgICBhdHRyc0FycltqXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBpZiAoaiA8IGF0dHJzQXJyLmxlbmd0aCkge1xuICAgICAgYXR0cnNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIGF0dHJzQXJyLmxlbmd0aCA9IGo7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBBY3R1YWxseSBwZXJmb3JtIHRoZSBhdHRyaWJ1dGUgdXBkYXRlLlxuICAgICAqL1xuICAgIGlmIChhdHRyc0NoYW5nZWQpIHtcbiAgICAgIHZhciBuZXdBdHRycyA9IGRhdGEubmV3QXR0cnM7XG5cbiAgICAgIGZvciAodmFyIGF0dHIgaW4gbmV3QXR0cnMpIHtcbiAgICAgICAgbmV3QXR0cnNbYXR0cl0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSBBVFRSSUJVVEVTX09GRlNFVDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBuZXdBdHRyc1thcmd1bWVudHNbaV1dID0gYXJndW1lbnRzW2kgKyAxXTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgYXR0ciBpbiBuZXdBdHRycykge1xuICAgICAgICB1cGRhdGVBdHRyaWJ1dGUobm9kZSwgYXR0ciwgbmV3QXR0cnNbYXR0cl0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZpcnN0Q2hpbGQoKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfTtcblxuICAvKipcbiAgICogRGVjbGFyZXMgYSB2aXJ0dWFsIEVsZW1lbnQgYXQgdGhlIGN1cnJlbnQgbG9jYXRpb24gaW4gdGhlIGRvY3VtZW50LiBUaGlzXG4gICAqIGNvcnJlc3BvbmRzIHRvIGFuIG9wZW5pbmcgdGFnIGFuZCBhIGVsZW1lbnRDbG9zZSB0YWcgaXMgcmVxdWlyZWQuIFRoaXMgaXNcbiAgICogbGlrZSBlbGVtZW50T3BlbiwgYnV0IHRoZSBhdHRyaWJ1dGVzIGFyZSBkZWZpbmVkIHVzaW5nIHRoZSBhdHRyIGZ1bmN0aW9uXG4gICAqIHJhdGhlciB0aGFuIGJlaW5nIHBhc3NlZCBhcyBhcmd1bWVudHMuIE11c3QgYmUgZm9sbGxvd2VkIGJ5IDAgb3IgbW9yZSBjYWxsc1xuICAgKiB0byBhdHRyLCB0aGVuIGEgY2FsbCB0byBlbGVtZW50T3BlbkVuZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyBUaGUgZWxlbWVudCdzIHRhZy5cbiAgICogQHBhcmFtIHs/c3RyaW5nfSBrZXkgVGhlIGtleSB1c2VkIHRvIGlkZW50aWZ5IHRoaXMgZWxlbWVudC4gVGhpcyBjYW4gYmUgYW5cbiAgICogICAgIGVtcHR5IHN0cmluZywgYnV0IHBlcmZvcm1hbmNlIG1heSBiZSBiZXR0ZXIgaWYgYSB1bmlxdWUgdmFsdWUgaXMgdXNlZFxuICAgKiAgICAgd2hlbiBpdGVyYXRpbmcgb3ZlciBhbiBhcnJheSBvZiBpdGVtcy5cbiAgICogQHBhcmFtIHs/QXJyYXk8Kj59IHN0YXRpY3MgQW4gYXJyYXkgb2YgYXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMgb2YgdGhlXG4gICAqICAgICBzdGF0aWMgYXR0cmlidXRlcyBmb3IgdGhlIEVsZW1lbnQuIFRoZXNlIHdpbGwgb25seSBiZSBzZXQgb25jZSB3aGVuIHRoZVxuICAgKiAgICAgRWxlbWVudCBpcyBjcmVhdGVkLlxuICAgKi9cbiAgZXhwb3J0cy5lbGVtZW50T3BlblN0YXJ0ID0gZnVuY3Rpb24gKHRhZywga2V5LCBzdGF0aWNzKSB7XG4gICAgaWYgKHVuZGVmaW5lZCAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBhc3NlcnROb3RJbkF0dHJpYnV0ZXMoKTtcbiAgICAgIHNldEluQXR0cmlidXRlcygpO1xuICAgIH1cblxuICAgIGFyZ3NCdWlsZGVyWzBdID0gdGFnO1xuICAgIGFyZ3NCdWlsZGVyWzFdID0ga2V5O1xuICAgIGFyZ3NCdWlsZGVyWzJdID0gc3RhdGljcztcbiAgfTtcblxuICAvKioqXG4gICAqIERlZmluZXMgYSB2aXJ0dWFsIGF0dHJpYnV0ZSBhdCB0aGlzIHBvaW50IG9mIHRoZSBET00uIFRoaXMgaXMgb25seSB2YWxpZFxuICAgKiB3aGVuIGNhbGxlZCBiZXR3ZWVuIGVsZW1lbnRPcGVuU3RhcnQgYW5kIGVsZW1lbnRPcGVuRW5kLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0geyp9IHZhbHVlXG4gICAqL1xuICBleHBvcnRzLmF0dHIgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICBpZiAodW5kZWZpbmVkICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGFzc2VydEluQXR0cmlidXRlcygpO1xuICAgIH1cblxuICAgIGFyZ3NCdWlsZGVyLnB1c2gobmFtZSwgdmFsdWUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbG9zZXMgYW4gb3BlbiB0YWcgc3RhcnRlZCB3aXRoIGVsZW1lbnRPcGVuU3RhcnQuXG4gICAqIEByZXR1cm4geyFFbGVtZW50fSBUaGUgY29ycmVzcG9uZGluZyBFbGVtZW50LlxuICAgKi9cbiAgZXhwb3J0cy5lbGVtZW50T3BlbkVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodW5kZWZpbmVkICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGFzc2VydEluQXR0cmlidXRlcygpO1xuICAgICAgc2V0Tm90SW5BdHRyaWJ1dGVzKCk7XG4gICAgfVxuXG4gICAgdmFyIG5vZGUgPSBleHBvcnRzLmVsZW1lbnRPcGVuLmFwcGx5KG51bGwsIGFyZ3NCdWlsZGVyKTtcbiAgICBhcmdzQnVpbGRlci5sZW5ndGggPSAwO1xuICAgIHJldHVybiBub2RlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbG9zZXMgYW4gb3BlbiB2aXJ0dWFsIEVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIGVsZW1lbnQncyB0YWcuXG4gICAqIEByZXR1cm4geyFFbGVtZW50fSBUaGUgY29ycmVzcG9uZGluZyBFbGVtZW50LlxuICAgKi9cbiAgZXhwb3J0cy5lbGVtZW50Q2xvc2UgPSBmdW5jdGlvbiAodGFnKSB7XG4gICAgaWYgKHVuZGVmaW5lZCAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBhc3NlcnROb3RJbkF0dHJpYnV0ZXMoKTtcbiAgICAgIGFzc2VydENsb3NlTWF0Y2hlc09wZW5UYWcodGFnKTtcbiAgICB9XG5cbiAgICBwYXJlbnROb2RlKCk7XG5cbiAgICB2YXIgbm9kZSA9IGdldFdhbGtlcigpLmN1cnJlbnROb2RlO1xuICAgIGNsZWFyVW52aXNpdGVkRE9NKG5vZGUpO1xuXG4gICAgbmV4dFNpYmxpbmcoKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfTtcblxuICAvKipcbiAgICogRGVjbGFyZXMgYSB2aXJ0dWFsIEVsZW1lbnQgYXQgdGhlIGN1cnJlbnQgbG9jYXRpb24gaW4gdGhlIGRvY3VtZW50IHRoYXQgaGFzXG4gICAqIG5vIGNoaWxkcmVuLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSBlbGVtZW50J3MgdGFnLlxuICAgKiBAcGFyYW0gez9zdHJpbmd9IGtleSBUaGUga2V5IHVzZWQgdG8gaWRlbnRpZnkgdGhpcyBlbGVtZW50LiBUaGlzIGNhbiBiZSBhblxuICAgKiAgICAgZW1wdHkgc3RyaW5nLCBidXQgcGVyZm9ybWFuY2UgbWF5IGJlIGJldHRlciBpZiBhIHVuaXF1ZSB2YWx1ZSBpcyB1c2VkXG4gICAqICAgICB3aGVuIGl0ZXJhdGluZyBvdmVyIGFuIGFycmF5IG9mIGl0ZW1zLlxuICAgKiBAcGFyYW0gez9BcnJheTwqPn0gc3RhdGljcyBBbiBhcnJheSBvZiBhdHRyaWJ1dGUgbmFtZS92YWx1ZSBwYWlycyBvZiB0aGVcbiAgICogICAgIHN0YXRpYyBhdHRyaWJ1dGVzIGZvciB0aGUgRWxlbWVudC4gVGhlc2Ugd2lsbCBvbmx5IGJlIHNldCBvbmNlIHdoZW4gdGhlXG4gICAqICAgICBFbGVtZW50IGlzIGNyZWF0ZWQuXG4gICAqIEBwYXJhbSB7Li4uKn0gdmFyX2FyZ3MgQXR0cmlidXRlIG5hbWUvdmFsdWUgcGFpcnMgb2YgdGhlIGR5bmFtaWMgYXR0cmlidXRlc1xuICAgKiAgICAgZm9yIHRoZSBFbGVtZW50LlxuICAgKiBAcmV0dXJuIHshRWxlbWVudH0gVGhlIGNvcnJlc3BvbmRpbmcgRWxlbWVudC5cbiAgICovXG4gIGV4cG9ydHMuZWxlbWVudFZvaWQgPSBmdW5jdGlvbiAodGFnLCBrZXksIHN0YXRpY3MsIHZhcl9hcmdzKSB7XG4gICAgaWYgKHVuZGVmaW5lZCAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBhc3NlcnROb3RJbkF0dHJpYnV0ZXMoKTtcbiAgICB9XG5cbiAgICB2YXIgbm9kZSA9IGV4cG9ydHMuZWxlbWVudE9wZW4uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICBleHBvcnRzLmVsZW1lbnRDbG9zZS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiBub2RlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEZWNsYXJlcyBhIHZpcnR1YWwgVGV4dCBhdCB0aGlzIHBvaW50IGluIHRoZSBkb2N1bWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfGJvb2xlYW59IHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgVGV4dC5cbiAgICogQHBhcmFtIHsuLi4oZnVuY3Rpb24oc3RyaW5nfG51bWJlcnxib29sZWFuKTpzdHJpbmd8bnVtYmVyfGJvb2xlYW4pfSB2YXJfYXJnc1xuICAgKiAgICAgRnVuY3Rpb25zIHRvIGZvcm1hdCB0aGUgdmFsdWUgd2hpY2ggYXJlIGNhbGxlZCBvbmx5IHdoZW4gdGhlIHZhbHVlIGhhc1xuICAgKiAgICAgY2hhbmdlZC5cbiAgICovXG4gIGV4cG9ydHMudGV4dCA9IGZ1bmN0aW9uICh2YWx1ZSwgdmFyX2FyZ3MpIHtcbiAgICBpZiAodW5kZWZpbmVkICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGFzc2VydE5vdEluQXR0cmlidXRlcygpO1xuICAgIH1cblxuICAgIHZhciBub2RlID0gYWxpZ25XaXRoRE9NKCcjdGV4dCcsIG51bGwpO1xuICAgIHZhciBkYXRhID0gZ2V0RGF0YShub2RlKTtcblxuICAgIGlmIChkYXRhLnRleHQgIT09IHZhbHVlKSB7XG4gICAgICBkYXRhLnRleHQgPSB2YWx1ZTtcblxuICAgICAgdmFyIGZvcm1hdHRlZCA9IHZhbHVlO1xuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgZm9ybWF0dGVkID0gYXJndW1lbnRzW2ldKGZvcm1hdHRlZCk7XG4gICAgICB9XG5cbiAgICAgIG5vZGUuZGF0YSA9IGZvcm1hdHRlZDtcbiAgICB9XG5cbiAgICBuZXh0U2libGluZygpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdWJsaWNseSBleHBvcnRzIHRoZSBtdXRhdG9yIGhvb2tzIGZyb20gdmFyaW91cyBpbnRlcm5hbCBtb2R1bGVzLlxuICAgKiBOb3RlIHRoYXQgbXV0YXRpbmcgdGhlc2Ugb2JqZWN0cyB3aWxsIGFsdGVyIHRoZSBiZWhhdmlvciBvZiB0aGUgaW50ZXJuYWxcbiAgICogY29kZS5cbiAgICoge09iamVjdDxzdHJpbmcsIE9iamVjdDxzdHJpbmcsIGZ1bmN0aW9uPj59XG4gICAqL1xuICBleHBvcnRzLm11dGF0b3JzID0ge1xuICAgIGF0dHJpYnV0ZXM6IF9tdXRhdG9yc1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdWJsaWNseSBleHBvcnRzIHRoZSBkZWZhdWx0IG11dGF0b3JzIGZyb20gdmFyaW91cyBpbnRlcm5hbCBtb2R1bGVzLlxuICAgKiBOb3RlIHRoYXQgbXV0YXRpbmcgdGhlc2Ugb2JqZWN0cyB3aWxsIGhhdmUgbm8gYWZmZWN0IG9uIHRoZSBpbnRlcm5hbCBjb2RlLFxuICAgKiB0aGVzZSBhcmUgZXhwb3NlZCBvbmx5IHRvIGJlIHVzZWQgYnkgY3VzdG9tIG11dGF0b3JzLlxuICAgKiB7T2JqZWN0PHN0cmluZywgT2JqZWN0PHN0cmluZywgZnVuY3Rpb24+Pn1cbiAgICovXG4gIGV4cG9ydHMuZGVmYXVsdHMgPSB7XG4gICAgYXR0cmlidXRlczogX2RlZmF1bHRzXG4gIH07XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluY3JlbWVudGFsLWRvbS5qcy5tYXBcbiIsIi8vIHJlcXVpcmUoJ2FycmF5LnByb3RvdHlwZS5maW5kJylcbi8vIHJlcXVpcmUoJ2FycmF5LnByb3RvdHlwZS5maW5kaW5kZXgnKVxuXG52YXIgSW5jcmVtZW50YWxET00gPSByZXF1aXJlKCcuL2luY3JlbWVudGFsLWRvbScpXG5cbnZhciBwYXRjaCA9IEluY3JlbWVudGFsRE9NLnBhdGNoXG52YXIgZWxlbWVudE9wZW4gPSBJbmNyZW1lbnRhbERPTS5lbGVtZW50T3BlblxudmFyIGVsZW1lbnRWb2lkID0gSW5jcmVtZW50YWxET00uZWxlbWVudFZvaWRcbnZhciBlbGVtZW50Q2xvc2UgPSBJbmNyZW1lbnRhbERPTS5lbGVtZW50Q2xvc2VcbnZhciB0ZXh0ID0gSW5jcmVtZW50YWxET00udGV4dFxuXG53aW5kb3cucGF0Y2ggPSBwYXRjaFxud2luZG93LmVsZW1lbnRPcGVuID0gZWxlbWVudE9wZW5cbndpbmRvdy5lbGVtZW50Vm9pZCA9IGVsZW1lbnRWb2lkXG53aW5kb3cuZWxlbWVudENsb3NlID0gZWxlbWVudENsb3NlXG53aW5kb3cudGV4dCA9IHRleHRcblxudmFyIGJhc2tldCA9IHJlcXVpcmUoJy4vYmFza2V0JylcbnZhciB0b2RvID0gcmVxdWlyZSgnLi90b2RvJylcblxud2luZG93LmJhc2tldCA9IGJhc2tldFxud2luZG93LnRvZG8gPSB0b2RvXG4iLCJ2YXIgdG9kbyA9IHJlcXVpcmUoJy4vdG9kby5odG1sJylcbnZhciBJbmNyZW1lbnRhbERPTSA9IHJlcXVpcmUoJy4uL2luY3JlbWVudGFsLWRvbScpXG52YXIgc3VwZXJtb2RlbHMgPSByZXF1aXJlKCdzdXBlcm1vZGVscy5qcycpXG5cbnZhciBwYXRjaCA9IEluY3JlbWVudGFsRE9NLnBhdGNoXG52YXIgZWxlbWVudE9wZW4gPSBJbmNyZW1lbnRhbERPTS5lbGVtZW50T3BlblxudmFyIGVsZW1lbnRWb2lkID0gSW5jcmVtZW50YWxET00uZWxlbWVudFZvaWRcbnZhciBlbGVtZW50Q2xvc2UgPSBJbmNyZW1lbnRhbERPTS5lbGVtZW50Q2xvc2VcbnZhciB0ZXh0ID0gSW5jcmVtZW50YWxET00udGV4dFxuXG52YXIgVG9kbyA9IHN1cGVybW9kZWxzKHtcbiAgaWQ6IHtcbiAgICBfX3ZhbHVlOiBybmRzdHJcbiAgfSxcbiAgdGV4dDogU3RyaW5nLFxuICBjb21wbGV0ZWQ6IEJvb2xlYW5cbn0pXG52YXIgVG9kb3MgPSBzdXBlcm1vZGVscyhbVG9kb10pXG5cbmZ1bmN0aW9uIHJuZHN0ciAoKSB7XG4gIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgNSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZWwpIHtcbiAgdmFyIHRvZG9zID0gbmV3IFRvZG9zKFtcbiAgICB7XG4gICAgICB0ZXh0OiAnUGhvbmUgbXVtJyxcbiAgICAgIGNvbXBsZXRlZDogZmFsc2VcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6ICdEbyBzaG9wcGluZycsXG4gICAgICBjb21wbGV0ZWQ6IHRydWVcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6ICdXcml0ZSBlbWFpbCB0byBCcmlhbicsXG4gICAgICBjb21wbGV0ZWQ6IHRydWVcbiAgICB9XG4gIF0pXG5cbiAgZnVuY3Rpb24gcmVuZGVyICgpIHtcbiAgICBwYXRjaChlbCwgdG9kbywgdG9kb3MpXG4gIH1cbiAgcmVuZGVyKClcblxuICB0b2Rvcy5vbignY2hhbmdlJywgcmVuZGVyKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobW9kZWwpIHtcbnZhciB0b2RvcyA9IG1vZGVsXG5cbmZ1bmN0aW9uIGFkZCAoZSkge1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIHZhciBuZXdUb2RvID0gdG9kb3MuY3JlYXRlKClcbiAgbmV3VG9kby50ZXh0ID0gdGhpcy5uZXdUb2RvLnZhbHVlO1xuICB0b2Rvcy5wdXNoKG5ld1RvZG8pXG4gIHRoaXMubmV3VG9kby5zZWxlY3QoKVxufVxuXG5mdW5jdGlvbiBjbGVhckNvbXBsZXRlZCAoaW5kZXgpIHtcbiAgdmFyIGxlbiA9IHRvZG9zLmxlbmd0aFxuICBmb3IgKHZhciBpID0gbGVuIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAodG9kb3NbaV0uY29tcGxldGVkKSB7XG4gICAgICB0b2Rvcy5zcGxpY2UoaSwgMSlcbiAgICB9XG4gIH1cbn1cblxuLy8gZnVuY3Rpb24gdG9nZ2xlQ29tcGxldGVkICgpIHtcbi8vICAgdmFyIHN0YXRlID0gdGhpcy5jaGVja2VkXG4vLyAgIHRvZG9zLmZvckVhY2goZnVuY3Rpb24odG9kbykge1xuLy8gICAgIHRvZG8uY29tcGxldGVkID0gc3RhdGVcbi8vICAgfSlcbi8vIH1cblxuZnVuY3Rpb24gdG90YWxDb21wbGV0ZWQgKCkge1xuICByZXR1cm4gdG9kb3MuZmlsdGVyKGZ1bmN0aW9uICh0b2RvKSB7XG4gICAgcmV0dXJuIHRvZG8uY29tcGxldGVkXG4gIH0pLmxlbmd0aFxufVxuZWxlbWVudE9wZW4oXCJ0YWJsZVwiKVxuICBlbGVtZW50T3BlbihcInRoZWFkXCIpXG4gICAgZWxlbWVudE9wZW4oXCJ0clwiKVxuICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgZWxlbWVudE9wZW4oXCJmb3JtXCIsIG51bGwsIG51bGwsIFwib25zdWJtaXRcIiwgYWRkKVxuICAgICAgICAgIGVsZW1lbnRPcGVuKFwiaW5wdXRcIiwgbnVsbCwgW1widHlwZVwiLCBcInRleHRcIiwgXCJuYW1lXCIsIFwibmV3VG9kb1wiLCBcInBsYWNlaG9sZGVyXCIsIFwiRW50ZXIgbmV3IHRvZG9cIl0pXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwiaW5wdXRcIilcbiAgICAgICAgZWxlbWVudENsb3NlKFwiZm9ybVwiKVxuICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICBlbGVtZW50Q2xvc2UoXCJ0clwiKVxuICBlbGVtZW50Q2xvc2UoXCJ0aGVhZFwiKVxuICBlbGVtZW50T3BlbihcInRib2R5XCIpXG4gICAgOyhBcnJheS5pc0FycmF5KHRvZG9zKSA/IHRvZG9zIDogT2JqZWN0LmtleXModG9kb3MpKS5mb3JFYWNoKGZ1bmN0aW9uKHRvZG8sICRpbmRleCkge1xuICAgICAgZWxlbWVudE9wZW4oXCJ0clwiLCB0b2RvLmlkKVxuICAgICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgICAgdGV4dChcIlwiICsgKCRpbmRleCArIDEpICsgXCIuXCIpXG4gICAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgICBlbGVtZW50T3BlbihcImlucHV0XCIsIG51bGwsIFtcInR5cGVcIiwgXCJ0ZXh0XCIsIFwib25rZXl1cFwiLCBmdW5jdGlvbiAoZSkgeyB0b2RvLnRleHQgPSB0aGlzLnZhbHVlfV0sIFwidmFsdWVcIiwgdG9kby50ZXh0LCBcInN0eWxlXCIsIHsgYm9yZGVyQ29sb3I6IHRvZG8udGV4dCA/ICcnOiAncmVkJywgdGV4dERlY29yYXRpb246IHRvZG8uY29tcGxldGVkID8gJ2xpbmUtdGhyb3VnaCc6ICcnIH0pXG4gICAgICAgICAgZWxlbWVudENsb3NlKFwiaW5wdXRcIilcbiAgICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgICAgZWxlbWVudE9wZW4oXCJ0ZFwiKVxuICAgICAgICAgIGVsZW1lbnRPcGVuKFwiaW5wdXRcIiwgbnVsbCwgW1widHlwZVwiLCBcImNoZWNrYm94XCIsIFwib25jaGFuZ2VcIiwgZnVuY3Rpb24gKGUpIHsgdG9kby5jb21wbGV0ZWQgPSB0aGlzLmNoZWNrZWR9XSwgXCJjaGVja2VkXCIsIHRvZG8uY29tcGxldGVkIHx8IHVuZGVmaW5lZClcbiAgICAgICAgICBlbGVtZW50Q2xvc2UoXCJpbnB1dFwiKVxuICAgICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgICAgZWxlbWVudENsb3NlKFwidHJcIilcbiAgICB9LCB0b2RvcylcbiAgICBlbGVtZW50T3BlbihcInRyXCIpXG4gICAgZWxlbWVudENsb3NlKFwidHJcIilcbiAgZWxlbWVudENsb3NlKFwidGJvZHlcIilcbiAgZWxlbWVudE9wZW4oXCJ0Zm9vdFwiKVxuICAgIGVsZW1lbnRPcGVuKFwidHJcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgICAgdGV4dChcIlRvdGFsIFwiICsgKHRvZG9zLmxlbmd0aCkgKyBcIlwiKVxuICAgICAgZWxlbWVudENsb3NlKFwidGRcIilcbiAgICAgIGVsZW1lbnRPcGVuKFwidGRcIilcbiAgICAgIGVsZW1lbnRDbG9zZShcInRkXCIpXG4gICAgICBlbGVtZW50T3BlbihcInRkXCIpXG4gICAgICAgIGVsZW1lbnRPcGVuKFwiYnV0dG9uXCIsIG51bGwsIG51bGwsIFwib25jbGlja1wiLCBjbGVhckNvbXBsZXRlZClcbiAgICAgICAgICB0ZXh0KFwiQ2xlYXIgY29tcGxldGVkIFwiICsgKHRvdGFsQ29tcGxldGVkKCkpICsgXCJcIilcbiAgICAgICAgZWxlbWVudENsb3NlKFwiYnV0dG9uXCIpXG4gICAgICBlbGVtZW50Q2xvc2UoXCJ0ZFwiKVxuICAgIGVsZW1lbnRDbG9zZShcInRyXCIpXG4gIGVsZW1lbnRDbG9zZShcInRmb290XCIpXG5lbGVtZW50Q2xvc2UoXCJ0YWJsZVwiKVxuZWxlbWVudE9wZW4oXCJwcmVcIilcbiAgdGV4dChcIlwiICsgKEpTT04uc3RyaW5naWZ5KHRvZG9zLCBudWxsLCAyKSkgKyBcIlwiKVxuZWxlbWVudENsb3NlKFwicHJlXCIpXG59O1xuIl19
