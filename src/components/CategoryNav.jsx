import { useEffect, useRef } from 'react'

export default function CategoryNav({ categories, active, onSelect }) {
  const navRef = useRef(null)

  // Mantém a categoria ativa visível na barra horizontal
  useEffect(() => {
    const el = navRef.current?.querySelector(`[data-id="${active}"]`)
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [active])

  return (
    <nav className="category-nav" ref={navRef}>
      {categories.map((c) => (
        <button
          key={c.id}
          data-id={c.id}
          className={`category-pill ${active === c.id ? 'active' : ''}`}
          onClick={() => onSelect(c.id)}
        >
          {c.name}
        </button>
      ))}
    </nav>
  )
}
