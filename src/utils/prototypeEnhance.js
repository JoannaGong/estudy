Object.defineProperty(String.prototype, 'isZeroDate', {
  value() {
    return !this || this.slice(0, 10) == '0000-00-00';
  }
});


function formatNumber (n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

Object.defineProperties(Date.prototype, {
  format: {
    value(chinese) {
      const year = this.getFullYear()
      const month = this.getMonth() + 1
      const day = this.getDate()

      const hour = this.getHours()
      const minute = this.getMinutes()
      const second = this.getSeconds()

      if (chinese) {
        return `${year}年${month}月${day}日 ${hour}:${formatNumber(minute)}`
      }
      const t1 = [year, month, day].map(formatNumber).join('-')
      const t2 = [hour, minute].map(formatNumber).join(':')

      return `${t1} ${t2}`
    }
  }
});

export {}