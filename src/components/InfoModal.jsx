import Modal from './Modal'
import { weeklyHours } from '../lib/schedule'
import { WhatsAppIcon } from './CartDrawer'

export default function InfoModal({ store, onClose }) {
  const phone = store.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  return (
    <Modal onClose={onClose} className="info-modal">
      <div className="modal-scroll">
        <div className="modal-body">
          <h2>{store.name}</h2>
          <p className="muted">{store.description}</p>

          <h4>Horário de funcionamento</h4>
          <ul className="hours">
            {weeklyHours(store.schedules).map((d) => (
              <li key={d.name} className={d.today ? 'today' : ''}>
                <span>{d.name}</span>
                <span>{d.hours}</span>
              </li>
            ))}
          </ul>

          <h4>Endereço</h4>
          <p>
            <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer">
              📍 {store.address}
            </a>
          </p>

          <h4>Contato</h4>
          <div className="contact-links">
            <a className="btn-whatsapp" href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> {phone}
            </a>
            {store.instagram && (
              <a className="btn-secondary" href={store.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
            {store.facebook && (
              <a className="btn-secondary" href={store.facebook} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            )}
          </div>

          <h4>Pagamento</h4>
          <p>{store.paymentMethods.join(' · ')}</p>
        </div>
      </div>
    </Modal>
  )
}
