// Preços vêm em centavos (ex.: 2500 = R$ 25,00)
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const money = (cents) => brl.format(cents / 100)

export const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
