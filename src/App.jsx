import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Menu,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-react'

const bundles = [
  { quantity: 1, price: 299, label: 'One jar', note: 'R299 per jar', saving: '', regular: '' },
  { quantity: 2, price: 499, label: 'Two jars', note: 'R249.50 per jar', saving: 'Save R99', regular: 'R598' },
  { quantity: 3, price: 649, label: 'Three jars', note: 'R216.33 per jar', saving: 'Save R248', regular: 'R897' },
]

const faqs = [
  ['What does the texture feel like?', 'A plush cream that spreads easily and settles to a soft finish. Each jar contains 50 ml.'],
  ['Where do you deliver?', 'We deliver throughout South Africa. Delivery costs R75 for orders below R450 and is complimentary from R450.'],
  ['Can I ask about returns?', 'Yes. Contact our care team before ordering or returning a product so we can confirm the current policy and next steps.'],
]

function Logo({ onClick, asText = false }) {
  const content = <>ANÉ LUMIÈRE<span>SKIN RITUALS</span></>
  if (asText) return <div className="logo logo-static" aria-label="Ané Lumière">{content}</div>
  return <a className="logo" href="#top" onClick={onClick} aria-label="Ané Lumière home">{content}</a>
}

function ProductVisual({ variant = 'default', alt = '' }) {
  return <div className={`product-visual product-visual-${variant}`}><img src="/velvet-dawn-face-cream.jpg" alt={alt} /></div>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selected, setSelected] = useState(bundles[1])
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItem, setCartItem] = useState(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [deliveryDetails, setDeliveryDetails] = useState(null)
  const [openFaq, setOpenFaq] = useState(0)
  const [toast, setToast] = useState('')

  const menuRef = useRef(null)
  const cartRef = useRef(null)
  const checkoutRef = useRef(null)
  const menuOpenerRef = useRef(null)
  const cartOpenerRef = useRef(null)
  const checkoutOpenerRef = useRef(null)
  const toastTimerRef = useRef(null)

  const deliveryFee = cartItem && cartItem.price < 450 ? 75 : 0
  const orderTotal = (cartItem?.price || 0) + deliveryFee

  useEffect(() => {
    document.body.style.overflow = cartOpen || checkoutOpen || menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen, checkoutOpen, menuOpen])

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), [])

  useEffect(() => {
    const activeDialog = checkoutOpen ? checkoutRef.current : cartOpen ? cartRef.current : menuOpen ? menuRef.current : null
    if (!activeDialog) return undefined

    const getFocusable = () => [...activeDialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    const initialFocusable = getFocusable()
    ;(initialFocusable[0] || activeDialog).focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (checkoutOpen) closeCheckout()
        else if (cartOpen) closeCart()
        else closeMenu()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = getFocusable()
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === activeDialog)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    activeDialog.addEventListener('keydown', onKeyDown)
    return () => activeDialog.removeEventListener('keydown', onKeyDown)
  }, [cartOpen, checkoutOpen, menuOpen])

  useEffect(() => {
    if (checkoutOpen && checkoutStep === 2) checkoutRef.current?.querySelector('.checkout-close')?.focus()
  }, [checkoutOpen, checkoutStep])

  useEffect(() => {
    if (cartOpen && !cartItem) cartRef.current?.querySelector('.drawer-close')?.focus()
  }, [cartItem, cartOpen])

  const restoreFocus = (ref) => window.requestAnimationFrame(() => ref.current?.focus())

  const openMenu = (event) => {
    menuOpenerRef.current = event.currentTarget
    setMenuOpen(true)
  }

  const closeMenu = () => {
    setMenuOpen(false)
    restoreFocus(menuOpenerRef)
  }

  const openCart = (event) => {
    cartOpenerRef.current = event?.currentTarget || document.activeElement
    setToast('')
    setCartOpen(true)
  }

  const closeCart = () => {
    setCartOpen(false)
    restoreFocus(cartOpenerRef)
  }

  const showToast = (message) => {
    window.clearTimeout(toastTimerRef.current)
    setToast(message)
    toastTimerRef.current = window.setTimeout(() => setToast(''), 2400)
  }

  const addToBag = (event) => {
    cartOpenerRef.current = event.currentTarget
    setCartItem(selected)
    setCartOpen(true)
    setToast('')
  }

  const openCheckout = (event) => {
    checkoutOpenerRef.current = event.currentTarget
    setCheckoutStep(1)
    setDeliveryDetails(null)
    setCheckoutOpen(true)
  }

  const closeCheckout = () => {
    setCheckoutOpen(false)
    restoreFocus(checkoutOpenerRef)
  }

  const submitDelivery = (event) => {
    event.preventDefault()
    setDeliveryDetails(Object.fromEntries(new FormData(event.currentTarget)))
    setCheckoutStep(2)
  }

  const subscribe = (event) => {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get('email')
    window.localStorage.setItem('ane-lumiere-newsletter-email', email)
    showToast('Email saved on this device')
    event.currentTarget.reset()
  }

  return (
    <div id="top">
      <div className="announcement">Complimentary delivery from R450</div>

      <main inert={cartOpen || checkoutOpen || menuOpen ? true : undefined}>
        <section className="opening-shell" aria-labelledby="hero-title">
          <header className="nav">
            <button className="icon-btn mobile-only" onClick={openMenu} aria-label="Open menu"><Menu /></button>
            <Logo />
            <nav className="desktop-nav" aria-label="Main navigation">
              <a href="#shop">Shop</a>
              <a href="#ritual">The ritual</a>
              <a href="#faq">FAQs</a>
            </nav>
            <button className="bag-button" onClick={openCart} aria-label="Open shopping bag">
              <ShoppingBag size={18} /><span>Bag</span><b>{cartItem ? cartItem.quantity : 0}</b>
            </button>
          </header>

          <div className="hero">
            <div className="hero-image-wrap">
              <img className="model-image hero-model" src="/warm-editorial-model.jpg" alt="Woman applying face cream to her cheek" />
              <a className="floating-product" href="#shop">
                <ProductVisual variant="floating" alt="Ané Lumière Velvet Dawn Face Cream jar and carton" />
                <span><small>YOUR DAILY CREAM</small><strong>Velvet Dawn</strong><em>50 ml · From R299</em></span>
              </a>
            </div>
            <div className="hero-copy">
              <div className="eyebrow">Velvet Dawn · Face cream · 50 ml</div>
              <h1 id="hero-title">A little care.<br /><em>A softer day.</em></h1>
              <p>A plush daily face cream with a velvety finish. Make a little room for your skin.</p>
              <div className="hero-actions">
                <a className="primary-btn" href="#shop">Shop Velvet Dawn <ArrowRight size={17} /></a>
                <a className="text-link" href="#ritual">The ritual</a>
              </div>
              <small>From R299 · Delivered across South Africa</small>
            </div>
          </div>
        </section>

        <div className="service-strip" aria-label="Product summary">
          <span>50 ml of everyday care</span><span>One cream. Your routine.</span><span>South African delivery</span>
        </div>

        <section className="shop" id="shop" aria-labelledby="shop-heading">
          <div className="shop-heading">
            <span>THE COLLECTION</span>
            <h2 id="shop-heading">Your cream.<br />Your kind of set.</h2>
            <p>The same Velvet Dawn, in one, two or three jars.</p>
            <small>Delivery R75 below R450.<br />Complimentary from R450.</small>
          </div>
          <div className="shop-options">
            <div className="bundle-list">
              {bundles.map((bundle) => (
                <button key={bundle.quantity} className={`bundle ${selected.quantity === bundle.quantity ? 'selected' : ''}`} onClick={() => setSelected(bundle)} aria-pressed={selected.quantity === bundle.quantity} aria-label={`${bundle.label}, R${bundle.price}${bundle.saving ? `, ${bundle.saving}` : ''}`}>
                  <ProductVisual variant="card" alt="" />
                  {bundle.saving && <span className="saving">{bundle.saving}</span>}
                  {!bundle.saving && <span className="saving">50 ml</span>}
                  <span className="bundle-copy">
                    <strong>{bundle.label}</strong>
                    <small>{bundle.quantity} × 50 ml · Face cream</small>
                    <span className="bundle-price">R{bundle.price} {bundle.regular && <s>{bundle.regular}</s>}</span>
                    <em>{bundle.note}</em>
                  </span>
                  <span className="radio" aria-hidden="true"><i /></span>
                </button>
              ))}
            </div>
            <div className="purchase-row">
              <p>{selected.label} selected · {selected.price >= 450 ? 'Complimentary delivery' : `R75 delivery · R${selected.price + 75} total`}</p>
              <button className="add-btn" onClick={addToBag}>Add to bag — R{selected.price} <ShoppingBag size={17} /></button>
            </div>
          </div>
        </section>

        <section className="ritual" id="ritual">
          <div className="ritual-photo"><img className="model-image" src="/warm-editorial-model.jpg" alt="Woman pressing face cream into her skin" /></div>
          <div className="ritual-copy">
            <span>AN EVERYDAY RITUAL</span>
            <h2>Less rush.<br />More time for you.</h2>
            <ol className="ritual-list">
              <li><span>01</span><div><b>Start fresh.</b><p>Apply to clean skin.</p></div></li>
              <li><span>02</span><div><b>Take a moment.</b><p>Massage in a small amount of Velvet Dawn.</p></div></li>
              <li><span>03</span><div><b>Make it yours.</b><p>In the morning, follow with SPF. At night, make it your final step.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="faq" id="faq">
          <div className="faq-heading"><span>A LITTLE MORE TO KNOW</span><h2>Care, without<br />the guesswork.</h2><p>A few answers before you find your set.</p></div>
          <div className="faq-list">
            {faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={question}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`}>{question}<ChevronDown /></button><div id={`faq-answer-${index}`} aria-hidden={openFaq !== index}><p>{answer}</p></div></div>)}
          </div>
        </section>

        <section className="newsletter">
          <div><span>STAY A LITTLE LONGER</span><h2>Notes for a slower routine.</h2><p>Make room for launch updates from Ané Lumière.</p></div>
          <form onSubmit={subscribe}>
            <label htmlFor="email">Save your email for launch updates</label>
            <div><input id="email" name="email" type="email" placeholder="Your email address" required /><button aria-label="Save email for launch updates"><ArrowRight /></button></div>
            <small>Preview only. Saved on this device; no emails sent.</small>
          </form>
        </section>
      </main>

      <footer inert={cartOpen || checkoutOpen || menuOpen ? true : undefined}>
        <div className="footer-main"><Logo /><nav><a href="#shop">Shop</a><a href="#ritual">The ritual</a><a href="mailto:hello@anelumiere.co.za">Customer care</a></nav></div>
        <div className="footer-bottom"><span>Delivery across South Africa · R75 below R450 · Complimentary from R450</span><span>© 2026 Ané Lumière</span></div>
      </footer>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu" tabIndex="-1" ref={menuRef}>
          <div className="mobile-menu-head"><Logo onClick={closeMenu} /><button className="icon-btn" onClick={closeMenu} aria-label="Close menu"><X /></button></div>
          <nav>{[['shop', 'Shop'], ['ritual', 'The ritual'], ['faq', 'FAQs']].map(([id, label]) => <a key={id} href={`#${id}`} onClick={closeMenu}>{label}</a>)}</nav>
          <p>One cream. Your routine.</p>
        </div>
      )}

      {cartOpen && <><div className="overlay" onClick={closeCart} /><aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag" aria-hidden={checkoutOpen ? true : undefined} inert={checkoutOpen ? true : undefined} tabIndex="-1" ref={cartRef}><div className="drawer-head"><h2>Your bag <span>{cartItem ? `(${cartItem.quantity})` : '(0)'}</span></h2><button className="icon-btn drawer-close" onClick={closeCart} aria-label="Close shopping bag"><X /></button></div>{cartItem ? <><div className="delivery-progress"><p>{deliveryFee === 0 ? <><Check size={14} /> Complimentary delivery included</> : <><Truck size={14} /> R75 delivery on this order</>}</p><span><i style={{ width: `${Math.min((cartItem.price / 450) * 100, 100)}%` }} /></span></div><div className="cart-line"><ProductVisual variant="thumbnail" /><div><span>ANÉ LUMIÈRE</span><h3>Velvet Dawn</h3><p>{cartItem.label} · {cartItem.quantity} {cartItem.quantity === 1 ? 'jar' : 'jars'}</p><button onClick={() => setCartItem(null)}>Remove</button></div><strong>R{cartItem.price}</strong></div><div className="cart-summary"><p><span>Subtotal</span><b>R{cartItem.price}</b></p><p><span>Delivery</span><b>{deliveryFee === 0 ? 'Complimentary' : `R${deliveryFee}`}</b></p><div><span>Total</span><strong>R{orderTotal}</strong></div><button className="add-btn" onClick={openCheckout}>Continue to checkout <ArrowRight size={18} /></button><small><ShieldCheck size={14} /> Checkout preview · PayFast ready</small></div></> : <div className="empty-cart"><ShoppingBag size={38} /><h3>Your bag is empty</h3><p>Choose a set to continue.</p><button className="primary-btn" onClick={closeCart}>Continue shopping</button></div>}</aside></>}

      {checkoutOpen && <><div className="overlay checkout-overlay" /><div className="checkout-modal" role="dialog" aria-modal="true" aria-label="Checkout" tabIndex="-1" ref={checkoutRef}><button className="checkout-close icon-btn" onClick={closeCheckout} aria-label="Close checkout"><X /></button><div className="checkout-brand"><Logo asText /><div className="checkout-product"><ProductVisual variant="thumbnail" /><p><b>{cartItem.label}</b><span>{cartItem.quantity} × Velvet Dawn Face Cream</span></p><strong>R{cartItem.price}</strong></div><div className="checkout-total"><span>Total including delivery</span><b>R{orderTotal}</b></div><small>Preview only. No payment is taken.</small></div><div className="checkout-form">{checkoutStep === 1 ? <><span className="step-label">DELIVERY · STEP 1 OF 2</span><h2>Where should we send your order?</h2><form onSubmit={submitDelivery}><label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label><div className="field-row"><label>First name<input name="firstName" required /></label><label>Last name<input name="lastName" required /></label></div><label>Street address<input name="address" placeholder="Street and number" required /></label><div className="field-row"><label>City<input name="city" required /></label><label>Postal code<input name="postalCode" inputMode="numeric" required /></label></div><button className="add-btn">Review payment step <ArrowRight size={18} /></button></form></> : <div className="payment-ready"><span className="step-label">PAYMENT · STEP 2 OF 2</span><div className="payment-icon"><ShieldCheck /></div><h2>Ready for PayFast setup</h2><p>This preview validated and retained your delivery details for this checkout session.</p><div className="delivery-review"><b>{deliveryDetails.firstName} {deliveryDetails.lastName}</b><span>{deliveryDetails.address}</span><span>{deliveryDetails.city}, {deliveryDetails.postalCode}</span><span>{deliveryDetails.email}</span></div><button className="add-btn" disabled>PayFast integration pending</button><small>No payment was taken.</small></div>}</div></div></>}

      {toast && !cartOpen && !checkoutOpen && <div className="toast" role="status" aria-live="polite"><Check size={16} /> {toast}</div>}
    </div>
  )
}

export default App
