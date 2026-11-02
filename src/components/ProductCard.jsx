import { money } from '../lib/format'

export default function ProductCard({ product, emoji, onClick }) {
  return (
    <button className="product-card" onClick={onClick}>
      <div className="product-info">
        <h3>{product.name}</h3>
        {product.description && <p className="product-desc">{product.description}</p>}
        <div className="product-price">
          {product.oldPrice && <s>{money(product.oldPrice)}</s>}
          {money(product.price)}
        </div>
      </div>
      {product.image ? (
        <img className="product-thumb" src={product.image} alt={product.name} loading="lazy" />
      ) : (
        <div className="product-thumb placeholder" aria-hidden="true">
          {emoji}
        </div>
      )}
    </button>
  )
}
