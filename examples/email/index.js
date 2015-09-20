var supermodels = require('supermodels.js')
var patch = require('incremental-dom').patch
var helpers = require('../helpers')
var template = require('./template.html')
var emailData = require('./email-data')

var emailClientSchema = {
  emails: [{
    id: helpers.rndstr,
    sender: String,
    text: String,
    subject: String,
    date: Date,
    to: [String],
    recipients: [String],
    cc: [String],
    bcc: [String],
    checked: Boolean,
    expanded: Boolean
  }]
}

var EmailClient = supermodels(emailClientSchema)

module.exports = function (el) {
  var emailClient = new EmailClient({
    emails: emailData
  })

  function render () {
    var d = Date.now()
    patch(el, template, emailClient)
    console.log(Date.now() - d)
  }
  render()

  /* patch the dom whenever the app model changes. */
  emailClient.on('change', render)
}
