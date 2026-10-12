import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Aperture,
  Leaf,
  Menu,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  X,
} from 'lucide-react'

const bundles = [
  { quantity: 1, price: 299, label: 'The Essential', note: 'Perfect for your first ritual', saving: '' },
  { quantity: 2, price: 499, label: 'The Ritual Duo', note: 'Your favourite, never interrupted', saving: 'Save R99', popular: true },
  { quantity: 3, price: 649, label: 'The Glow Set', note: 'Share one, keep two', saving: 'Save R248' },
]

const testimonials = [
  {
    quote: 'My skin looks rested even when I am not. The texture is beautiful and never sticky.',
    name: 'Naledi M.',
    detail: 'Verified buyer · Johannesburg',
  },
  {
    quote: 'I noticed a softer, brighter look in two weeks. It now has a permanent place in my routine.',
    name: 'Taryn K.',
    detail: 'Verified buyer · Cape Town',
  },
  {
    quote: 'Simple, luxurious and effective. My skin feels calm from the moment I apply it.',
    name: 'Ayanda S.',
    detail: 'Verified buyer · Durban',
  },
]

const faqs = [
  ['How do I use Velvet Dawn?', 'Massage a small amount into clean skin each morning. Follow with SPF, or use it as the final step in your evening ritual.'],
  ['Is it suitable for sensitive skin?', 'Yes. The fragrance-free formula uses calming ingredients and suits all skin types. Always patch test a new skincare product first.'],
  ['When will I see results?', 'Skin feels hydrated after the first use. Most customers report a more even, luminous look after two to four weeks of consistent use.'],
  ['How long does one jar last?', 'One 50 ml jar lasts approximately six to eight weeks with daily use.'],
  ['Where do you deliver?', 'We deliver throughout South Africa. Standard delivery is free for orders over R450.'],
]

function Logo() {
  return <a className="logo" href="#top" aria-label="Ané Lumière home">ANÉ LUMIÈRE<span>SKIN RITUALS</span></a>
}

function ProductVisual({ small = false }) {
  return (
    <div className={`product-visual ${small ? 'product-visual-small' : ''}`}>
      <img src="/velvet-dawn-face-cream.jpg" alt="Ané Lumière Velvet Dawn Face Cream with its rose gold packaging" />
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selected, setSelected] = useState(bundles[1])
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItem, setCartItem] = useState(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [activeReview, setActiveReview] = useState(0)
  const [openFaq, setOpenFaq] = useState(0)
  const [toast, setToast] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)
  const cartRef = useRef(null)
  const checkoutRef = useRef(null)
  const dialogOpenerRef = useRef(null)

  const deliveryFee = cartItem && cartItem.price < 450 ? 75 : 0
  const orderTotal = (cartItem?.price || 0) + deliveryFee

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = cartOpen || checkoutOpen || menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen, checkoutOpen, menuOpen])

  useEffect(() => {
    const activeDialog = checkoutOpen ? checkoutRef.current : cartOpen ? cartRef.current : menuOpen ? menuRef.current : null
    if (!activeDialog) return undefined

    dialogOpenerRef.current = document.activeElement
    const getFocusable = () => [...activeDialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    const initialFocusable = getFocusable()
    ;(initialFocusable[0] || activeDialog).focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setCheckoutOpen(false)
        setCartOpen(false)
        setMenuOpen(false)
      }
      if (event.key !== 'Tab') return
      const focusable = getFocusable()
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === activeDialog)) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    activeDialog.addEventListener('keydown', onKeyDown)
    return () => {
      activeDialog.removeEventListener('keydown', onKeyDown)
      dialogOpenerRef.current?.focus()
    }
  }, [cartOpen, checkoutOpen, menuOpen])

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2500)
  }

  const addToBag = () => {
    setCartItem(selected)
    setCartOpen(true)
    showToast(`${selected.label} added to your bag`)
  }

  const openCheckout = () => {
    setCartOpen(false)
    setCheckoutStep(1)
    setCheckoutOpen(true)
  }

  const subscribe = (event) => {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get('email')
    window.localStorage.setItem('ane-lumiere-newsletter-email', email)
    showToast('Email saved for launch updates on this device')
    event.currentTarget.reset()
  }

  return (
    <div id="top">
      <div className="announcement">Complimentary delivery on orders of R450 or more <ArrowRight size={14} /></div>
      <header className={scrolled ? 'nav scrolled' : 'nav'}>
        <button className="icon-btn mobile-only" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu /></button>
        <Logo />
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#shop">Shop</a>
          <a href="#story">Our story</a>
          <a href="#formula">The formula</a>
          <a href="#reviews">Reviews</a>
        </nav>
        <button className="bag-button" onClick={() => setCartOpen(true)} aria-label="Open shopping bag">
          <ShoppingBag size={20} /><span>Bag</span><b>{cartItem ? cartItem.quantity : 0}</b>
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu" tabIndex="-1" ref={menuRef}>
          <div className="mobile-menu-head"><Logo /><button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button></div>
          <nav>
            {['shop', 'story', 'formula', 'reviews'].map((item) => <a key={item} href={`#${item}`} onClick={() => setMenuOpen(false)}>{item === 'story' ? 'Our story' : item}</a>)}
          </nav>
          <p>Made slowly. Used daily. Loved deeply.</p>
        </div>
      )}

      <main>
        <section className="hero">
          <div className="hero-copy reveal">
            <div className="eyebrow"><Sparkles size={14} /> The glow begins here</div>
            <h1>Your skin,<br /><em>beautifully awake.</em></h1>
            <p>A plush daily face cream that deeply nourishes, visibly brightens and brings tired skin back to life.</p>
            <div className="hero-actions">
              <a className="primary-btn" href="#shop">Shop Velvet Dawn <ArrowRight size={17} /></a>
              <a className="text-link" href="#formula">Discover the formula</a>
            </div>
            <div className="rating"><span>★★★★★</span><b>4.9</b><a href="#reviews">from 286 rituals</a></div>
          </div>
          <div className="hero-visual">
            <div className="orb orb-one" /><div className="orb orb-two" />
            <span className="vertical-note">FORMULATED IN SOUTH AFRICA</span>
            <ProductVisual />
            <div className="ingredient-tag tag-one"><span>01</span> Velvet-soft moisture</div>
            <div className="ingredient-tag tag-two"><span>02</span> Luminous finish</div>
          </div>
          <div className="hero-scroll">SCROLL TO DISCOVER <span /></div>
        </section>

        <section className="marquee" aria-label="Product qualities">
          <div>VEGAN <i>✦</i> FRAGRANCE FREE <i>✦</i> CRUELTY FREE <i>✦</i> DERMATOLOGICALLY TESTED <i>✦</i> MADE IN SOUTH AFRICA <i>✦</i></div>
        </section>

        <section className="intro" id="story">
          <div className="intro-index">01 — THE RITUAL</div>
          <div className="intro-main">
            <p className="kicker">Skincare should feel like a pause,<br />not another task.</p>
            <h2>One thoughtful formula.<br /><em>A quiet kind of confidence.</em></h2>
            <p>We created Velvet Dawn for real skin and unhurried mornings. It melts in effortlessly and leaves your skin looking like its most rested self.</p>
          </div>
          <div className="intro-mark">É</div>
        </section>

        <section className="formula" id="formula">
          <div className="formula-image">
            <div className="water-ripple ripple-one" /><div className="water-ripple ripple-two" />
            <ProductVisual small />
            <span className="image-caption">HIGH-PERFORMANCE BOTANICALS<br />MEET SKIN SCIENCE</span>
          </div>
          <div className="formula-copy">
            <div className="section-label">02 — INSIDE THE FORMULA</div>
            <h2>One beautiful jar.<br /><em>Serious glow.</em></h2>
            <p className="formula-lead">Every application wraps skin in lasting moisture, comforting botanicals and a soft, luminous finish.</p>
            <div className="ingredient-list">
              <div><span>01</span><section><h3>Moisture veil</h3><p>Comforts dry skin and helps it feel supple throughout the day.</p></section></div>
              <div><span>02</span><section><h3>Velvet finish</h3><p>Melts into skin without a heavy or greasy after-feel.</p></section></div>
              <div><span>03</span><section><h3>Morning radiance</h3><p>Leaves the complexion looking rested, soft and naturally luminous.</p></section></div>
            </div>
            <div className="formula-proof"><Leaf /><span><b>96% naturally derived</b>Thoughtfully formulated without fragrance, drying alcohol or silicones.</span></div>
          </div>
        </section>

        <section className="shop" id="shop">
          <div className="section-label centered">03 — CHOOSE YOUR RITUAL</div>
          <h2>More glow. <em>Better value.</em></h2>
          <p className="shop-intro">One for now, one for later, or enough to share.</p>
          <div className="shop-grid">
            <div className="shop-product">
              <div className="sunburst" />
              <ProductVisual />
              <span className="size-note">50 ml · daily face cream</span>
            </div>
            <div className="offer-panel">
              <div className="offer-heading"><div><span>VELVET DAWN FACE CREAM</span><h3>Choose your set</h3></div><div className="offer-stars">★★★★★ <small>286 reviews</small></div></div>
              <div className="bundle-list">
                {bundles.map((bundle) => (
                  <button key={bundle.quantity} className={`bundle ${selected.quantity === bundle.quantity ? 'selected' : ''}`} onClick={() => setSelected(bundle)} aria-pressed={selected.quantity === bundle.quantity} aria-label={`${bundle.quantity} ${bundle.quantity === 1 ? 'jar' : 'jars'}, ${bundle.label}, R${bundle.price}${bundle.saving ? `, ${bundle.saving}` : ''}`}>
                    {bundle.popular && <b className="popular">MOST LOVED</b>}
                    <span className="radio"><i /></span>
                    <span className="bundle-count"><strong>{bundle.quantity}</strong> {bundle.quantity === 1 ? 'BOTTLE' : 'BOTTLES'}</span>
                    <span className="bundle-copy"><strong>{bundle.label}</strong><small>{bundle.note}</small></span>
                    <span className="bundle-price"><strong>R{bundle.price}</strong><small>{bundle.saving || 'R299 each'}</small></span>
                  </button>
                ))}
              </div>
              <button className="add-btn" onClick={addToBag}>Add to bag — R{selected.price} <ShoppingBag size={18} /></button>
              <div className="purchase-notes"><span id="delivery-note"><Truck size={17} /> Free delivery from R450</span><span><ShieldCheck size={17} /> 30-day glow guarantee</span></div>
            </div>
          </div>
        </section>

        <section className="results">
          <div className="section-label">04 — VISIBLE RESULTS</div>
          <div className="results-title"><h2>The proof is in<br /><em>your reflection.</em></h2><p>In a four-week consumer study of 42 participants using Velvet Dawn daily.</p></div>
          <div className="stat-grid">
            <div><strong>97<span>%</span></strong><p>said skin felt instantly hydrated</p></div>
            <div><strong>92<span>%</span></strong><p>saw a visibly brighter complexion</p></div>
            <div><strong>89<span>%</span></strong><p>noticed smoother-looking texture</p></div>
          </div>
          <p className="study-note">*Self-assessment results. Individual results may vary.</p>
        </section>

        <section className="reviews" id="reviews">
          <div className="review-header"><div><div className="section-label">05 — SKIN STORIES</div><h2>Rituals, <em>shared.</em></h2></div><div className="review-score"><strong>4.9</strong><span>★★★★★<small>Based on 286 reviews</small></span></div></div>
          <div className="review-stage">
            <button className="review-arrow" onClick={() => setActiveReview((activeReview + testimonials.length - 1) % testimonials.length)} aria-label="Previous review"><ChevronLeft /></button>
            <article key={activeReview}>
              <Sparkles size={24} />
              <blockquote>“{testimonials[activeReview].quote}”</blockquote>
              <div className="review-person"><span>{testimonials[activeReview].name.charAt(0)}</span><p><b>{testimonials[activeReview].name}</b><small>{testimonials[activeReview].detail}</small></p></div>
            </article>
            <button className="review-arrow" onClick={() => setActiveReview((activeReview + 1) % testimonials.length)} aria-label="Next review"><ChevronRight /></button>
          </div>
          <div className="review-dots">{testimonials.map((_, i) => <button key={i} className={i === activeReview ? 'active' : ''} onClick={() => setActiveReview(i)} aria-label={`Show review ${i + 1}`} />)}</div>
        </section>

        <section className="faq" id="faq">
          <div><div className="section-label">06 — GOOD TO KNOW</div><h2>Questions,<br /><em>answered.</em></h2><p>Still curious? Write to <a href="mailto:hello@anelumiere.co.za">hello@anelumiere.co.za</a></p></div>
          <div className="faq-list">
            {faqs.map(([q, a], i) => <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={q}><button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}><span>{String(i + 1).padStart(2, '0')}</span>{q}<ChevronDown /></button><div><p>{a}</p></div></div>)}
          </div>
        </section>

        <section className="newsletter">
          <div><span>THE LUMIÈRE LETTER</span><h2>A slower kind of beauty,<br /><em>delivered.</em></h2></div>
          <form onSubmit={subscribe}>
            <label htmlFor="email">Enjoy 10% off your first ritual</label><div><input id="email" name="email" type="email" placeholder="Your email address" required /><button aria-label="Save email for launch updates"><ArrowRight /></button></div><small>Preview mode saves your email on this device. Connect an email provider before launch.</small>
          </form>
        </section>
      </main>

      <footer>
        <div className="footer-top"><div><Logo /><p>High-performance skincare for<br />your quietest, brightest self.</p><a href="https://instagram.com" target="_blank" rel="noreferrer"><Aperture size={18} /> @anelumiere</a></div><div className="footer-links"><section><b>EXPLORE</b><a href="#shop">Shop</a><a href="#formula">The formula</a><a href="#story">Our story</a><a href="#reviews">Reviews</a></section><section><b>HELP</b><a href="mailto:hello@anelumiere.co.za">Contact</a><a href="#delivery">Delivery & returns</a><a href="#faq">FAQs</a><a href="#privacy">Privacy</a></section></div></div>
        <div className="footer-policies"><section id="delivery"><b>DELIVERY & RETURNS</b><p>Delivery costs R75. Orders of R450 or more include complimentary delivery. Return unopened products within 30 days by contacting our care team.</p></section><section id="privacy"><b>PRIVACY IN THIS PREVIEW</b><p>The newsletter saves one email address only in your browser storage. No details reach a server. Clear browser storage to remove the saved email.</p></section></div>
        <div className="footer-bottom"><span>© 2026 ANÉ LUMIÈRE</span><span>MADE WITH INTENTION IN SOUTH AFRICA</span><span>ZA / ZAR</span></div>
      </footer>

      {cartOpen && <><div className="overlay" onClick={() => setCartOpen(false)} /><aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag" tabIndex="-1" ref={cartRef}><div className="drawer-head"><h2>Your bag <span>{cartItem ? `(${cartItem.quantity})` : '(0)'}</span></h2><button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close shopping bag"><X /></button></div>{cartItem ? <><div className="delivery-progress"><p>{deliveryFee === 0 ? <><Check size={14} /> You qualify for <b>complimentary delivery</b></> : <><Truck size={14} /> Add R{450 - cartItem.price} more for <b>complimentary delivery</b></>}</p><span><i style={{ width: `${Math.min((cartItem.price / 450) * 100, 100)}%` }} /></span></div><div className="cart-line"><div className="cart-thumb"><ProductVisual small /></div><div><span>ANÉ LUMIÈRE</span><h3>Velvet Dawn</h3><p>{cartItem.label} · {cartItem.quantity} {cartItem.quantity === 1 ? 'jar' : 'jars'}</p><button onClick={() => setCartItem(null)}>Remove</button></div><strong>R{cartItem.price}</strong></div><div className="cart-summary"><p><span>Subtotal</span><b>R{cartItem.price}</b></p><p><span>Delivery</span><b>{deliveryFee === 0 ? 'Complimentary' : `R${deliveryFee}`}</b></p><div><span>Total</span><strong>R{orderTotal}</strong></div><button className="add-btn" onClick={openCheckout}>Continue to checkout <ArrowRight size={18} /></button><small><ShieldCheck size={14} /> Secure checkout · PayFast ready</small></div></> : <div className="empty-cart"><ShoppingBag size={42} /><h3>Your bag is waiting</h3><p>Choose a ritual set to begin.</p><button className="primary-btn" onClick={() => setCartOpen(false)}>Shop Velvet Dawn</button></div>}</aside></>}

      {checkoutOpen && <><div className="overlay checkout-overlay" /><div className="checkout-modal" role="dialog" aria-modal="true" aria-label="Checkout" tabIndex="-1" ref={checkoutRef}><button className="checkout-close icon-btn" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout"><X /></button><div className="checkout-brand"><Logo /><div className="checkout-product"><ProductVisual small /><p><b>{cartItem.label}</b><span>{cartItem.quantity} × Velvet Dawn Face Cream</span></p><strong>R{cartItem.price}</strong></div><div className="checkout-total"><span>Total including delivery</span><b>R{orderTotal}</b></div><small>Payment integration prepared for PayFast.</small></div><div className="checkout-form">{checkoutStep === 1 ? <><span className="step-label">STEP 1 OF 2</span><h2>Where should we send your glow?</h2><form onSubmit={(e) => { e.preventDefault(); setCheckoutStep(2) }}><label>Email address<input type="email" placeholder="you@example.com" required /></label><div className="field-row"><label>First name<input required /></label><label>Last name<input required /></label></div><label>Street address<input placeholder="Street and number" required /></label><div className="field-row"><label>City<input required /></label><label>Postal code<input inputMode="numeric" required /></label></div><button className="add-btn">Continue to payment <ArrowRight size={18} /></button></form></> : <div className="payment-ready"><span className="step-label">STEP 2 OF 2</span><div className="payment-icon"><ShieldCheck /></div><h2>Ready for secure payment</h2><p>This storefront is prepared for PayFast. Connect your merchant credentials before launch to accept live payments.</p><div><Check /> Order details captured</div><div><Check /> Delivery information validated</div><div><Check /> PayFast integration point ready</div><button className="add-btn" onClick={() => setCheckoutOpen(false)}>Return to store</button><small>No payment was taken in this preview.</small></div>}</div></div></>}

      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
    </div>
  )
}

export default App
