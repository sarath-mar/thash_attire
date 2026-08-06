export function debounce(fn, delay = 300) {
  let timer = null

  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export function debounceRef(fn, delay = 300) {
  let timer = null

  return (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
