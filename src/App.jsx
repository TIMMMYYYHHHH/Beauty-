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
  { quantity: 1, price: 299, label: 'One jar', note: 'R299 per jar', saving: '' },
  { quantity: 2, price: 499, label: 'Two jars', note: 'R249.50 per jar', saving: 'Save R99' },
  { quantity: 3, price: 649, label: 'Three jars', note: 'R216.33 per jar', saving: 'Save R248' },
]

const faqs = [
  ['How do I use Velvet Dawn?', 'Massage a small amount into clean skin. Use it in the morning before SPF or as the final step in your evening routine.'],
  ['What does the texture feel like?', 'Velvet Dawn has a plush cream texture that spreads easily and settles to a soft finish.'],
  ['How large is the jar?', 'Each Velvet Dawn jar contains 50 ml of face cream.'],
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
  const [scrolled, setScrolled] = useState(false)

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
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      <div className="announcement">Complimentary delivery from R450 <ArrowRight size={13} /></div>
      <header className={scrolled ? 'nav scrolled' : 'nav'} inert={cartOpen || checkoutOpen || menuOpen ? true : undefined}>
        <button className="icon-btn mobile-only" onClick={openMenu} aria-label="Open menu"><Menu /></button>
        <Logo />
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#shop">Shop</a>
          <a href="#story">Our story</a>
          <a href="#texture">Texture & ritual</a>
          <a href="#faq">FAQs</a>
        </nav>
        <button className="bag-button" onClick={openCart} aria-label="Open shopping bag">
          <ShoppingBag size={19} /><span>Bag</span><b>{cartItem ? cartItem.quantity : 0}</b>
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu" tabIndex="-1" ref={menuRef}>
          <div className="mobile-menu-head"><Logo onClick={closeMenu} /><button className="icon-btn" onClick={closeMenu} aria-label="Close menu"><X /></button></div>
          <nav>{[['shop', 'Shop'], ['story', 'Our story'], ['texture', 'Texture & ritual'], ['faq', 'FAQs']].map(([id, label]) => <a key={id} href={`#${id}`} onClick={closeMenu}>{label}</a>)}</nav>
          <p>One thoughtful cream. One quieter routine.</p>
        </div>
      )}

      <main inert={cartOpen || checkoutOpen || menuOpen ? true : undefined}>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">Velvet Dawn · Face cream · 50 ml</div>
            <h1>A softer state <em>of skin.</em></h1>
            <p>A plush daily face cream with a velvet finish, made for an unhurried moment in your routine.</p>
            <a className="hero-link" href="#shop">Choose your set <ArrowRight size={17} /></a>
          </div>
          <div className="hero-relief" aria-hidden="true" />
          <ProductVisual variant="hero" alt="Ané Lumière Velvet Dawn Face Cream jar and carton" />
          <span className="room-caption">THE SOFT ROOM · ANÉ LUMIÈRE</span>
        </section>

        <section className="shop" id="shop" aria-labelledby="shop-heading">
          <div className="shop-heading"><div><span>VELVET DAWN FACE CREAM</span><h2 id="shop-heading">Choose your set</h2></div><p>50 ml per jar</p></div>
          <div className="bundle-list">
            {bundles.map((bundle) => (
              <button key={bundle.quantity} className={`bundle ${selected.quantity === bundle.quantity ? 'selected' : ''}`} onClick={() => setSelected(bundle)} aria-pressed={selected.quantity === bundle.quantity} aria-label={`${bundle.label}, R${bundle.price}${bundle.saving ? `, ${bundle.saving}` : ''}`}>
                <span className="radio" aria-hidden="true"><i /></span>
                <span className="bundle-quantity"><strong>{bundle.quantity}</strong><small>{bundle.quantity === 1 ? 'JAR' : 'JARS'}</small></span>
                <span className="bundle-name"><strong>{bundle.label}</strong><small>{bundle.note}</small></span>
                <span className="bundle-price"><strong>R{bundle.price}</strong><small>{bundle.saving || 'No bundle saving'}</small></span>
              </button>
            ))}
          </div>
          <div className="purchase-row">
            <p>{selected.price >= 450 ? 'Complimentary delivery included' : `R75 delivery · R${selected.price + 75} total`}</p>
            <button className="add-btn" onClick={addToBag}>Add to bag — R{selected.price} <ShoppingBag size={17} /></button>
          </div>
        </section>

        <section className="story" id="story">
          <div className="story-intro">
            <span>OUR STORY</span>
            <h2>Skincare can be<br /><em>a quieter thing.</em></h2>
            <p>Velvet Dawn began with a simple idea: make one daily cream feel considered, comforting and easy to return to.</p>
          </div>
          <aside className="story-note"><span>THE SOFT ROOM</span><p>A small pause between cleansing and the rest of your day.</p></aside>
        </section>

        <section className="texture" id="texture">
          <div className="texture-copy">
            <span>TEXTURE & RITUAL</span>
            <h2>Plush at first touch.<br /><em>Soft after.</em></h2>
            <p>Warm a small amount between your fingertips, then press it into clean skin. The cream spreads easily and settles to a smooth finish.</p>
          </div>
          <ol className="ritual-list">
            <li><span>01</span><div><b>Begin clean</b><p>Use after cleansing and any water-based steps.</p></div></li>
            <li><span>02</span><div><b>Take a small amount</b><p>Warm the cream gently between your fingertips.</p></div></li>
            <li><span>03</span><div><b>Press, then smooth</b><p>Finish with SPF during the day.</p></div></li>
          </ol>
        </section>

        <section className="reviews" id="reviews">
          <span>CUSTOMER NOTES</span>
          <div><h2>Reviews will live here.</h2><p>We will publish customer feedback when verified reviews are available. We will not fill this space with invented testimonials.</p></div>
        </section>

        <section className="faq" id="faq">
          <div className="faq-heading"><span>GOOD TO KNOW</span><h2>Questions,<br /><em>answered.</em></h2><p>Need more help? <a href="mailto:hello@anelumiere.co.za">Email our care team.</a></p></div>
          <div className="faq-list">
            {faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={question}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`}>{question}<ChevronDown /></button><div id={`faq-answer-${index}`} aria-hidden={openFaq !== index}><p>{answer}</p></div></div>)}
          </div>
        </section>

        <section className="newsletter">
          <div><span>THE LUMIÈRE LETTER</span><h2>Notes for a slower routine.</h2></div>
          <form onSubmit={subscribe}>
            <label htmlFor="email">Save your email for launch updates</label>
            <div><input id="email" name="email" type="email" placeholder="Your email address" required /><button aria-label="Save email for launch updates"><ArrowRight /></button></div>
            <small>This preview stores the email only on this device. No subscription is sent.</small>
          </form>
        </section>
      </main>

      <footer inert={cartOpen || checkoutOpen || menuOpen ? true : undefined}>
        <div className="footer-main"><div><Logo /><p>A considered daily cream for a quieter skincare routine.</p></div><div className="footer-links"><section><b>EXPLORE</b><a href="#shop">Shop</a><a href="#story">Our story</a><a href="#texture">Texture & ritual</a></section><section><b>HELP</b><a href="mailto:hello@anelumiere.co.za">Contact</a><a href="#delivery">Delivery</a><a href="#faq">FAQs</a></section></div></div>
        <div className="footer-policies"><section id="delivery"><b>DELIVERY</b><p>Delivery costs R75 below R450. Orders of R450 or more include complimentary delivery. Contact our care team for current return terms.</p></section><section><b>PREVIEW PRIVACY</b><p>The newsletter saves one email only in your browser storage. No details reach a server.</p></section></div>
        <div className="footer-bottom"><span>© 2026 ANÉ LUMIÈRE</span><span>SOUTH AFRICA · ZAR</span></div>
      </footer>

      {cartOpen && <><div className="overlay" onClick={closeCart} /><aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag" aria-hidden={checkoutOpen ? true : undefined} inert={checkoutOpen ? true : undefined} tabIndex="-1" ref={cartRef}><div className="drawer-head"><h2>Your bag <span>{cartItem ? `(${cartItem.quantity})` : '(0)'}</span></h2><button className="icon-btn drawer-close" onClick={closeCart} aria-label="Close shopping bag"><X /></button></div>{cartItem ? <><div className="delivery-progress"><p>{deliveryFee === 0 ? <><Check size={14} /> Complimentary delivery included</> : <><Truck size={14} /> R75 delivery on this order</>}</p><span><i style={{ width: `${Math.min((cartItem.price / 450) * 100, 100)}%` }} /></span></div><div className="cart-line"><ProductVisual variant="thumbnail" /><div><span>ANÉ LUMIÈRE</span><h3>Velvet Dawn</h3><p>{cartItem.label} · {cartItem.quantity} {cartItem.quantity === 1 ? 'jar' : 'jars'}</p><button onClick={() => setCartItem(null)}>Remove</button></div><strong>R{cartItem.price}</strong></div><div className="cart-summary"><p><span>Subtotal</span><b>R{cartItem.price}</b></p><p><span>Delivery</span><b>{deliveryFee === 0 ? 'Complimentary' : `R${deliveryFee}`}</b></p><div><span>Total</span><strong>R{orderTotal}</strong></div><button className="add-btn" onClick={openCheckout}>Continue to checkout <ArrowRight size={18} /></button><small><ShieldCheck size={14} /> Checkout preview · PayFast ready</small></div></> : <div className="empty-cart"><ShoppingBag size={38} /><h3>Your bag is empty</h3><p>Choose a set to continue.</p><button className="primary-btn" onClick={closeCart}>Continue shopping</button></div>}</aside></>}

      {checkoutOpen && <><div className="overlay checkout-overlay" /><div className="checkout-modal" role="dialog" aria-modal="true" aria-label="Checkout" tabIndex="-1" ref={checkoutRef}><button className="checkout-close icon-btn" onClick={closeCheckout} aria-label="Close checkout"><X /></button><div className="checkout-brand"><Logo asText /><div className="checkout-product"><ProductVisual variant="thumbnail" /><p><b>{cartItem.label}</b><span>{cartItem.quantity} × Velvet Dawn Face Cream</span></p><strong>R{cartItem.price}</strong></div><div className="checkout-total"><span>Total including delivery</span><b>R{orderTotal}</b></div><small>Preview only. No payment is taken.</small></div><div className="checkout-form">{checkoutStep === 1 ? <><span className="step-label">DELIVERY · STEP 1 OF 2</span><h2>Where should we send your order?</h2><form onSubmit={submitDelivery}><label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label><div className="field-row"><label>First name<input name="firstName" required /></label><label>Last name<input name="lastName" required /></label></div><label>Street address<input name="address" placeholder="Street and number" required /></label><div className="field-row"><label>City<input name="city" required /></label><label>Postal code<input name="postalCode" inputMode="numeric" required /></label></div><button className="add-btn">Review payment step <ArrowRight size={18} /></button></form></> : <div className="payment-ready"><span className="step-label">PAYMENT · STEP 2 OF 2</span><div className="payment-icon"><ShieldCheck /></div><h2>Ready for PayFast setup</h2><p>This preview validated and retained your delivery details for this checkout session.</p><div className="delivery-review"><b>{deliveryDetails.firstName} {deliveryDetails.lastName}</b><span>{deliveryDetails.address}</span><span>{deliveryDetails.city}, {deliveryDetails.postalCode}</span><span>{deliveryDetails.email}</span></div><button className="add-btn" onClick={closeCheckout}>Return to your bag</button><small>No payment was taken. Connect PayFast credentials before launch.</small></div>}</div></div></>}

      {toast && !cartOpen && !checkoutOpen && <div className="toast" role="status" aria-live="polite"><Check size={16} /> {toast}</div>}
    </div>
  )
}

export default App
