import { useState } from 'react'
import Modal from './Modal'
import { money } from '../lib/format'
import { cartTotal, itemTotal } from '../lib/cart'
import { buildOrderMessage, whatsappUrl } from '../lib/whatsapp'

const CUSTOMER_KEY = 'candinho-customer'

const loadCustomer = () => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_KEY)) || {}
  } catch {
    return {}
  }
}

const EMPTY = {
  name: '',
  deliveryMethod: 'delivery',
  street: '',
  number: '',
  neighborhood: '',
  complement: '',
  payment: '',
  change: '',
  notes: '',
}

export default function CartDrawer({ store, cart, status, onClose }) {
  const [step, setStep] = useState('cart')
  const [customer, setCustomer] = useState(() => ({ ...EMPTY, ...loadCustomer(), payment: '', change: '', notes: '' }))
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setCustomer((c) => ({ ...c, [field]: e.target.value }))
  const total = cartTotal(cart.items)

  const validate = () => {
    const e = {}
    if (!customer.name.trim()) e.name = 'Informe seu nome'
    if (customer.deliveryMethod === 'delivery') {
      if (!customer.street.trim()) e.street = 'Informe a rua'
      if (!customer.number.trim()) e.number = 'Informe o número'
      if (!customer.neighborhood.trim()) e.neighborhood = 'Informe o bairro'
    }
    if (!customer.payment) e.payment = 'Escolha a forma de pagamento'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const send = () => {
    if (!validate()) return
    const { name, deliveryMethod, street, number, neighborhood, complement } = customer
    try {
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name, deliveryMethod, street, number, neighborhood, complement }))
    } catch {
      // ignora
    }
    const message = buildOrderMessage({ store, items: cart.items, customer })
    window.open(whatsappUrl(store.whatsapp, message), '_blank', 'noopener')
    setStep('sent')
  }

  const finish = () => {
    cart.clear()
    onClose()
  }

  return (
    <Modal onClose={onClose} className="cart-modal">
      {step === 'cart' && (
        <>
          <div className="modal-scroll">
            <div className="modal-body">
              <h2>Seu pedido</h2>
              {cart.items.length === 0 ? (
                <p className="empty">Seu carrinho está vazio. Adicione itens do cardápio 🍔</p>
              ) : (
                <ul className="cart-list">
                  {cart.items.map((item) => (
                    <li key={item.key} className="cart-item">
                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        {item.options.length > 0 && (
                          <small>{item.options.map((o) => o.name).join(', ')}</small>
                        )}
                        {item.notes && <small className="muted">Obs: {item.notes}</small>}
                        <span className="cart-item-price">{money(itemTotal(item))}</span>
                      </div>
                      <div className="qty small">
                        <button
                          onClick={() => cart.setQuantity(item.key, item.quantity - 1)}
                          aria-label={item.quantity === 1 ? 'Remover' : 'Diminuir'}
                        >
                          {item.quantity === 1 ? '🗑' : '−'}
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => cart.setQuantity(item.key, item.quantity + 1)} aria-label="Aumentar">
                          +
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {cart.items.length > 0 && (
                <div className="totals">
                  <div>
                    <span>Subtotal</span>
                    <strong>{money(total)}</strong>
                  </div>
                  <small className="muted">
                    Taxa de entrega de {money(store.deliveryFee.min)} a {money(store.deliveryFee.max)}, confirmada
                    pelo WhatsApp conforme o bairro.
                  </small>
                </div>
              )}
            </div>
          </div>
          {cart.items.length > 0 && (
            <footer className="modal-footer">
              <button className="btn-primary grow" onClick={() => setStep('checkout')}>
                <span>Continuar</span>
                <span>{money(total)}</span>
              </button>
            </footer>
          )}
        </>
      )}

      {step === 'checkout' && (
        <>
          <div className="modal-scroll">
            <div className="modal-body">
              <button className="back-btn" onClick={() => setStep('cart')}>
                ‹ Voltar ao carrinho
              </button>
              <h2>Finalizar pedido</h2>
              {!status.open && (
                <div className="notice">
                  ⚠️ Estamos fechados no momento ({status.label.replace('Fechado · ', '')}). Você pode enviar o
                  pedido e ele será respondido assim que abrirmos.
                </div>
              )}

              <Field label="Seu nome" error={errors.name}>
                <input value={customer.name} onChange={set('name')} placeholder="Como podemos te chamar?" />
              </Field>

              <div className="field">
                <span className="field-label">Como deseja receber?</span>
                <div className="segmented">
                  {[
                    ['delivery', '🛵 Entrega'],
                    ['pickup', '🏃 Retirar no local'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      className={customer.deliveryMethod === value ? 'active' : ''}
                      onClick={() => setCustomer((c) => ({ ...c, deliveryMethod: value }))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {customer.deliveryMethod === 'delivery' ? (
                <>
                  <div className="row">
                    <Field label="Rua" error={errors.street} className="grow">
                      <input value={customer.street} onChange={set('street')} autoComplete="address-line1" />
                    </Field>
                    <Field label="Número" error={errors.number} className="narrow">
                      <input value={customer.number} onChange={set('number')} inputMode="numeric" />
                    </Field>
                  </div>
                  <Field label="Bairro" error={errors.neighborhood}>
                    <input value={customer.neighborhood} onChange={set('neighborhood')} />
                  </Field>
                  <Field label="Complemento / ponto de referência (opcional)">
                    <input value={customer.complement} onChange={set('complement')} />
                  </Field>
                </>
              ) : (
                <div className="notice info">📍 Retirada em: {store.address}</div>
              )}

              <div className="field">
                <span className="field-label">Forma de pagamento</span>
                <div className="pay-options">
                  {store.paymentMethods.map((p) => (
                    <button
                      key={p}
                      className={customer.payment === p ? 'active' : ''}
                      onClick={() => setCustomer((c) => ({ ...c, payment: p }))}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {errors.payment && <span className="field-error">{errors.payment}</span>}
              </div>

              {customer.payment === 'Dinheiro' && (
                <Field label="Troco para quanto? (opcional)">
                  <input value={customer.change} onChange={set('change')} placeholder="Ex.: R$ 100,00" />
                </Field>
              )}
              {customer.payment === 'PIX' && <div className="notice info">Chave PIX — {store.pixKey}</div>}

              <Field label="Observações do pedido (opcional)">
                <textarea value={customer.notes} onChange={set('notes')} rows={2} />
              </Field>
            </div>
          </div>
          <footer className="modal-footer">
            <button className="btn-whatsapp grow" onClick={send}>
              <WhatsAppIcon /> Enviar pedido pelo WhatsApp
            </button>
          </footer>
        </>
      )}

      {step === 'sent' && (
        <div className="modal-body sent">
          <div className="sent-icon">✅</div>
          <h2>Pedido pronto para envio!</h2>
          <p>
            Abrimos o WhatsApp com o seu pedido. <strong>Confirme o envio da mensagem</strong> por lá para que a
            Candinho Lanches receba o pedido.
          </p>
          <p className="muted">Se o WhatsApp não abriu, toque em “Abrir novamente”.</p>
          <div className="sent-actions">
            <a
              className="btn-whatsapp"
              href={whatsappUrl(store.whatsapp, buildOrderMessage({ store, items: cart.items, customer }))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon /> Abrir novamente
            </a>
            <button className="btn-secondary" onClick={finish}>
              Concluir e limpar carrinho
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function Field({ label, error, className = '', children }) {
  return (
    <label className={`field ${className} ${error ? 'has-error' : ''}`}>
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43 2.52 0 4.89.98 6.67 2.77a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.44 9.43zm8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.8.72.7 5.8.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.64l6.04-1.58a11.33 11.33 0 0 0 5.4 1.38h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.03z" />
    </svg>
  )
}
