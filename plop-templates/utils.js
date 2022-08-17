exports.notEmpty = name => {
  return v => {
    if (!v || v.trim === '') {
      return `${name} 是必填项`
    } else {
      return true
    }
  }
}
