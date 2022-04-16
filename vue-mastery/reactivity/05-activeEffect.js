/*
 * @Descripttion:
 * @Author: superman
 * @Date: 2022-03-23 11:15:37
 * @LastEditors: superman
 * @LastEditTime: 2022-03-23 14:36:24
 */
const targetMap = new WeakMap()
let activeEffect = null
function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = new Set()))
    }
    dep.add(activeEffect)
    console.log('track ', 'key:', key, 'dep.size:', dep.size)
  }
}

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  let dep = depsMap.get(key)
  if (dep) {
    dep.forEach((effect) => {
      effect()
    })
  }
}

function reactive(target) {
  const handlers = {
    get(target, key, receiver) {
      console.log('reactive get', 'target:', target, 'key:', key)
      let result = Reflect.get(target, key, receiver)
      track(target, key)
      // target[key] 用Reflect是因为其相关的特性
      return result
    },
    set(target, key, value, receiver) {
      console.log('reactive set', 'target:', target, 'key:', key)
      let oldVal = target[key]
      let result = Reflect.set(target, key, value, receiver)
      if (result && oldVal != value) {
        trigger(target, key)
      }
      return result
    },
  }
  return new Proxy(target, handlers)
}

// 不手动去调用effect
function effect(eff) {
  activeEffect = eff
  activeEffect()
  activeEffect = null
}

let product = reactive({ price: 5, quantity: 2 })
let salePrice = 0
let total = 0
// 调用effect()并传一个匿名函数 => effect方法内部先把匿名函数赋值给全局变量 => effect执行匿名函数 =>
// 因为匿名函数内容有去取对象的值，触发reactive中的get => get中触发track()以及将数据返回 =>
// track()中先判断有没有全局的effect => 如果有就把这个effect存下来，等赋值操作的发生（reactive中的set被触发）
// 当赋值操作发生,触发reactive中的set => 比较新旧的值，如有不同触发trigger()去用effect()更新
effect(() => {
  total = product.price * product.quantity
})

effect(() => {
  salePrice = product.price * 0.9
})

// console.log(
//   `Before updated quantity total (should be 10) = ${total} salePrice (should be 4.5) = ${salePrice}`
// )
product.quantity = 3
// console.log(
//   `After updated quantity total (should be 15) = ${total} salePrice (should be 4.5) = ${salePrice}`
// )
// product.price = 10
// console.log(
//   `After updated price total (should be 30) = ${total} salePrice (should be 9) = ${salePrice}`
//)
