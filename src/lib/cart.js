import { useEffect, useState } from 'react'

const STORAGE_KEY = 'candinho-cart'

export const itemUnitPrice = (item) =>
  item.price + item.options.reduce((sum, o) => sum + o.price, 0)

export const itemTotal = (item) => itemUnitPrice(item) * item.quantity

export const cartTotal = (items) => items.reduce((sum, i) => sum + itemTotal(i), 0)

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

export function useCart() {
  const [items, setItems] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // armazenamento indisponível (modo privado etc.)
    }
  }, [items])

  const add = (item) => setItems((prev) => [...prev, { ...item, key: crypto.randomUUID() }])
  const remove = (key) => setItems((prev) => prev.filter((i) => i.key !== key))
  const setQuantity = (key, quantity) =>
    setItems((prev) =>
      quantity <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, quantity } : i)),
    )
  const clear = () => setItems([])

  return { items, add, remove, setQuantity, clear }
}
