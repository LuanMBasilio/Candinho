import { useState } from 'react'
import Modal from './Modal'
import { money } from '../lib/format'

const groupHint = (g) => {
  if (g.max === 1) return g.required ? 'Escolha 1 opção' : 'Escolha até 1 opção'
  if (g.required) return g.min === g.max ? `Escolha ${g.min} opções` : `Escolha de ${g.min} a ${g.max} opções`
  return `Escolha até ${g.max} opções`
}

export default function ProductModal({ product, emoji, onClose, onAdd }) {
  const [selected, setSelected] = useState({}) // { groupId: [itemId, ...] }
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [showErrors, setShowErrors] = useState(false)

  const toggle = (group, itemId) => {
    setSelected((prev) => {
      const current = prev[group.id] || []
      if (group.max === 1) return { ...prev, [group.id]: current[0] === itemId && !group.required ? [] : [itemId] }
      if (current.includes(itemId)) return { ...prev, [group.id]: current.filter((id) => id !== itemId) }
      if (current.length >= group.max) return prev
      return { ...prev, [group.id]: [...current, itemId] }
    })
  }

  const missing = product.complements.filter((g) => g.required && (selected[g.id]?.length || 0) < g.min)

  const options = product.complements.flatMap((g) =>
    g.items
      .filter((i) => selected[g.id]?.includes(i.id))
      .map((i) => ({ group: g.name, name: i.name, price: i.price })),
  )
  const unit = product.price + options.reduce((s, o) => s + o.price, 0)

  const submit = () => {
    if (missing.length) {
      setShowErrors(true)
      document.getElementById(`group-${missing[0].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    onAdd({ productId: product.id, name: product.name, price: product.price, options, quantity, notes: notes.trim() })
  }

  return (
    <Modal onClose={onClose} className="product-modal">
      <div className="modal-scroll">
        {product.image ? (
          <img className="modal-image" src={product.image} alt={product.name} />
        ) : (
          <div className="modal-image placeholder">{emoji}</div>
        )}
        <div className="modal-body">
          <h2>{product.name}</h2>
          {product.description && <p className="modal-desc">{product.description}</p>}
          <div className="modal-price">{money(product.price)}</div>

          {product.complements.map((g) => {
            const count = selected[g.id]?.length || 0
            const invalid = showErrors && missing.includes(g)
            return (
              <section key={g.id} id={`group-${g.id}`} className={`group ${invalid ? 'invalid' : ''}`}>
                <div className="group-head">
                  <div>
                    <h4>{g.name}</h4>
                    <small>{groupHint(g)}</small>
                  </div>
                  {g.required ? (
                    <span className={`badge ${count >= g.min ? 'badge-ok' : ''}`}>
                      {count >= g.min ? '✓' : 'Obrigatório'}
                    </span>
                  ) : (
                    g.max > 1 && <span className="badge badge-muted">{count}/{g.max}</span>
                  )}
                </div>
                {g.items.map((i) => {
                  const checked = selected[g.id]?.includes(i.id) || false
                  const disabled = !checked && g.max > 1 && count >= g.max
                  return (
                    <label key={i.id} className={`option ${disabled ? 'disabled' : ''}`}>
                      <span className="option-name">{i.name}</span>
                      {i.price > 0 && <span className="option-price">+ {money(i.price)}</span>}
                      <input
                        type={g.max === 1 ? 'radio' : 'checkbox'}
                        name={g.id}
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggle(g, i.id)}
                        onClick={() => g.max === 1 && checked && !g.required && toggle(g, i.id)}
                      />
                    </label>
                  )
                })}
              </section>
            )
          })}

          <section className="group">
            <h4>Alguma observação?</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: tirar a cebola, maionese à parte..."
              maxLength={200}
              rows={2}
            />
          </section>
        </div>
      </div>

      <footer className="modal-footer">
        <div className="qty">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Diminuir">−</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} aria-label="Aumentar">+</button>
        </div>
        <button className="btn-primary grow" onClick={submit}>
          <span>Adicionar</span>
          <span>{money(unit * quantity)}</span>
        </button>
      </footer>
    </Modal>
  )
}
