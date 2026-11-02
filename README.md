# Candinho Lanches — Cardápio

Cardápio online da Candinho Lanches em React + Vite. O cliente monta o pedido no site e ele é enviado **somente por mensagem no WhatsApp** (5511971946016).

## Rodando

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera a pasta dist/ para hospedar (Netlify, Vercel, GitHub Pages...)
```

## Onde editar

- **Produtos, preços, adicionais, horários, telefone:** `src/data/menu.json` (preços em centavos: `2500` = R$ 25,00)
- **Fotos:** `public/images/` (referenciadas no campo `image` de cada produto)
- **Texto da mensagem do WhatsApp:** `src/lib/whatsapp.js`
- **Cores e visual:** `src/styles.css` (variáveis no topo)

Os dados foram copiados do app original (https://pwa4.app.vc/candinholanches/) em 02/11/2026.
