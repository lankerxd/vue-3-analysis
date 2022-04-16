/*
 * @Descripttion: depsMap 键为属性名 ， 值为 dep
 * @Author: superman
 * @Date: 2022-03-23 09:09:38
 * @LastEditors: superman
 * @LastEditTime: 2022-03-23 10:07:20
 */
const depsMap = new Map()
// 跟踪
function track(key) {
  let dep = depsMap.get(key)
  if (!dep) {
    // 如果没有找到dep 那么先给dep赋值，再set.
    depsMap.set(key, (dep = new Set()))
  }

  dep.add(effect)
}

function trigger(key) {
  let dep = depsMap.get(key)
  if (dep) {
    dep.forEach((effect) => {
      effect()
    })
  }
}

let product = { price: 5, quantity: 2 }
let total = 0

let effect = () => {
  total = product.price * product.quantity
}

track('quantity')
effect()

// product.quantity = 3
// out : 3
// trigger('quantity')
// out: undefined
// total
// out: 15 before: 10
