import { money } from '../lib/format'

export default function Header({ store, status, onShowInfo }) {
  return (
    <header className="header">
      <div className="banner" style={{ backgroundImage: `url(${store.banner})` }} />
      <div className="store-card">
        <img className="logo" src={store.logo} alt={store.name} />
        <div className="store-text">
          <h1>{store.name}</h1>
          <p className="tagline">{store.description}</p>
          <div className="chips">
            <span className={`chip ${status.open ? 'chip-open' : 'chip-closed'}`}>
              <span className="dot" /> {status.label}
            </span>
            <span className="chip">⭐ {store.rating.average} ({store.rating.total})</span>
            <span className="chip">🛵 {store.deliveryTime}</span>
            <span className="chip">
              Entrega {money(store.deliveryFee.min)} – {money(store.deliveryFee.max)}
            </span>
          </div>
          <button className="link-btn" onClick={onShowInfo}>
            Horários, endereço e mais informações ›
          </button>
        </div>
      </div>
    </header>
  )
}
