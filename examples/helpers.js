function rndstr () {
  return Math.random().toString(36).substr(2, 5)
}

module.exports = {
  rndstr: {
    __value: rndstr
  }
}
