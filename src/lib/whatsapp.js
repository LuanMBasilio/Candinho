import { money } from './format'
import { cartTotal, itemTotal } from './cart'

export function buildOrderMessage({ store, items, customer }) {
  const lines = [`*NOVO PEDIDO - ${store.name.toUpperCase()}*`, '']

  items.forEach((item) => {
    lines.push(`*${item.quantity}x ${item.name}* — ${money(itemTotal(item))}`)
    const groups = {}
    item.options.forEach((o) => {
      ;(groups[o.group] ||= []).push(o.price ? `${o.name} (+${money(o.price)})` : o.name)
    })
    Object.entries(groups).forEach(([group, names]) => lines.push(`   • ${group}: ${names.join(', ')}`))
    if (item.notes) lines.push(`   _Obs: ${item.notes}_`)
    lines.push('')
  })

  lines.push(`*Total dos itens:* ${money(cartTotal(items))}`)

  if (customer.deliveryMethod === 'delivery') {
    lines.push(
      `*Taxa de entrega:* a confirmar (${money(store.deliveryFee.min)} a ${money(store.deliveryFee.max)})`,
    )
  }
  lines.push('', '------------------------------', '')
  lines.push(`*Nome:* ${customer.name}`)

  if (customer.deliveryMethod === 'delivery') {
    lines.push('*Forma de entrega:* 🛵 Delivery')
    const address = [`${customer.street}, ${customer.number}`, customer.neighborhood].filter(Boolean).join(' - ')
    lines.push(`*Endereço:* ${address}`)
    if (customer.complement) lines.push(`*Complemento/Referência:* ${customer.complement}`)
  } else {
    lines.push('*Forma de entrega:* 🏃 Retirar no local')
  }

  let payment = customer.payment
  if (payment === 'Dinheiro' && customer.change) payment += ` (troco para ${customer.change})`
  if (payment === 'PIX') payment += ` (chave: ${store.pixKey})`
  lines.push(`*Pagamento:* ${payment}`)

  if (customer.notes) lines.push(`*Observações:* ${customer.notes}`)

  return lines.join('\n')
}

export const whatsappUrl = (phone, message) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
