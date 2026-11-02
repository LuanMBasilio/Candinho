import { useEffect, useMemo, useState } from 'react'
import menu from './data/menu.json'
import Header from './components/Header'
import CategoryNav from './components/CategoryNav'
import ProductCard from './components/ProductCard'
import ProductModal from './components/ProductModal'
import CartDrawer from './components/CartDrawer'
import InfoModal from './components/InfoModal'
import { useCart, cartTotal } from './lib/cart'
import { money, normalize } from './lib/format'
import { getStatus } from './lib/schedule'

const { store, categories } = menu

// Emoji usado como imagem quando o produto não tem foto (vem no nome da categoria)
const categoryEmoji = (name) => name.match(/\p{Extended_Pictographic}/u)?.[0] || '🍽️'

export default function App() {
  const cart = useCart()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(categories[0].id)
  const [selected, setSelected] = useState(null) // { product, emoji }
  const [cartOpen, setCartOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [status, setStatus] = useState(() => getStatus(store.schedules))

  useEffect(() => {
    const id = setInterval(() => setStatus(getStatus(store.schedules)), 60_000)
    return () => clearInterval(id)
  }, [])

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return categories
    return categories
      .map((c) => ({
        ...c,
        products: c.products.filter((p) => normalize(`${p.name} ${p.description}`).includes(q)),
      }))
      .filter((c) => c.products.length)
  }, [query])

  // Destaca a categoria visível na rolagem
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) setActiveCategory(visible[0].target.id)
      },
      { rootMargin: '-120px 0px -65% 0px' },
    )
    filtered.forEach((c) => {
      const el = document.getElementById(c.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [filtered])

  const scrollToCategory = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' })
  }

  const addToCart = (item) => {
    cart.add(item)
    setSelected(null)
    setToast(`${item.quantity}x ${item.name} adicionado ao pedido`)
    setTimeout(() => setToast(''), 2200)
  }

  const count = cart.items.reduce((s, i) => s + i.quantity, 0)

  return (
    <>
      <Header store={store} status={status} onShowInfo={() => setInfoOpen(true)} />

      <div className="sticky-bar">
        <div className="search">
          <span aria-hidden="true">🔍</span>
          <input
            type="search"
            placeholder="Buscar no cardápio"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <CategoryNav categories={filtered} active={activeCategory} onSelect={scrollToCategory} />
      </div>

      <main className="menu">
        {filtered.length === 0 && <p className="empty">Nenhum item encontrado para “{query}”.</p>}
        {filtered.map((c) => (
          <section key={c.id} id={c.id} className="category">
            <h2>{c.name}</h2>
            <div className="product-grid">
              {c.products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  emoji={categoryEmoji(c.name)}
                  onClick={() => setSelected({ product: p, emoji: categoryEmoji(c.name) })}
                />
              ))}
            </div>
          </section>
        ))}
        <footer className="site-footer">
          <img src={store.logo} alt="" />
          <p>
            {store.name} · {store.address}
          </p>
          <p className="muted">Pedidos somente pelo WhatsApp</p>
        </footer>
      </main>

      {count > 0 && (
        <button className="cart-bar" onClick={() => setCartOpen(true)}>
          <span className="cart-count">{count}</span>
          <span>Ver pedido</span>
          <span>{money(cartTotal(cart.items))}</span>
        </button>
      )}

      {toast && <div className="toast">✓ {toast}</div>}

      {selected && (
        <ProductModal
          product={selected.product}
          emoji={selected.emoji}
          onClose={() => setSelected(null)}
          onAdd={addToCart}
        />
      )}
      {cartOpen && <CartDrawer store={store} cart={cart} status={status} onClose={() => setCartOpen(false)} />}
      {infoOpen && <InfoModal store={store} onClose={() => setInfoOpen(false)} />}
    </>
  )
}
