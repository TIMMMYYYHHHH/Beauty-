import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(cleanup)

beforeEach(() => {
  window.localStorage.clear()
  window.scrollTo = () => {}
})

describe('Ané Lumière storefront', () => {
  it('shows the supplied product and bundle choices', () => {
    render(<App />)

    expect(screen.getAllByAltText(/Ané Lumière Velvet Dawn Face Cream/i)).toHaveLength(2)
    expect(screen.getByRole('button', { name: /1 jar, The Essential, R299/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /2 jars, The Ritual Duo, R499/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /3 jars, The Glow Set, R649/i })).toBeInTheDocument()
  })

  it('calculates paid delivery below the free-delivery threshold', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /1 jar, The Essential, R299/i }))
    await user.click(screen.getByRole('button', { name: /Add to bag — R299/i }))

    expect(screen.getByRole('dialog', { name: 'Shopping bag' })).toHaveTextContent('Add R151 more')
    expect(screen.getByRole('dialog', { name: 'Shopping bag' })).toHaveTextContent('R75')
    expect(screen.getByRole('dialog', { name: 'Shopping bag' })).toHaveTextContent('R374')
  })

  it('collects delivery details before the PayFast-ready step', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Add to bag — R499/i }))
    await user.click(screen.getByRole('button', { name: /Continue to checkout/i }))

    await user.type(screen.getByLabelText('Email address'), 'customer@example.com')
    await user.type(screen.getByLabelText('First name'), 'Ane')
    await user.type(screen.getByLabelText('Last name'), 'Customer')
    await user.type(screen.getByLabelText('Street address'), '10 Dawn Road')
    await user.type(screen.getByLabelText('City'), 'Cape Town')
    await user.type(screen.getByLabelText('Postal code'), '8001')
    await user.click(screen.getByRole('button', { name: /Continue to payment/i }))

    expect(screen.getByRole('heading', { name: /Ready for secure payment/i })).toBeInTheDocument()
    expect(screen.getByText(/No payment was taken/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close checkout' })).toHaveFocus()
  })

  it('stores newsletter interest locally and labels preview behavior', async () => {
    const user = userEvent.setup()
    render(<App />)

    const email = screen.getByLabelText(/Enjoy 10% off/i)
    await user.type(email, 'glow@example.com')
    await user.click(screen.getByRole('button', { name: /Save email for launch updates/i }))

    expect(window.localStorage.getItem('ane-lumiere-newsletter-email')).toBe('glow@example.com')
    expect(screen.getByText(/Email saved for launch updates on this device/i)).toBeInTheDocument()
  })

  it('traps focus in the bag and restores focus after Escape', async () => {
    const user = userEvent.setup()
    render(<App />)

    const opener = screen.getByRole('button', { name: 'Open shopping bag' })
    await user.click(opener)
    const dialog = screen.getByRole('dialog', { name: 'Shopping bag' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close shopping bag' })).toHaveFocus()

    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(dialog).toContainElement(document.activeElement)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Shopping bag' })).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })

  it('supports complimentary delivery and cart removal', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Add to bag — R499/i }))
    const bag = screen.getByRole('dialog', { name: 'Shopping bag' })
    expect(bag).toHaveTextContent('You qualify for complimentary delivery')
    expect(bag).toHaveTextContent('R499')
    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(screen.getByRole('heading', { name: /Your bag is waiting/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close shopping bag' })).toHaveFocus()
  })

  it('keeps invalid checkout details on the delivery step', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Add to bag — R499/i }))
    await user.click(screen.getByRole('button', { name: /Continue to checkout/i }))
    await user.type(screen.getByLabelText('Email address'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /Continue to payment/i }))

    expect(screen.getByRole('heading', { name: /Where should we send your glow/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Ready for secure payment/i })).not.toBeInTheDocument()
  })

  it('updates reviews and FAQ answers', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText(/My skin looks rested/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next review' }))
    expect(screen.getByText(/I noticed a softer, brighter look/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Is it suitable for sensitive skin/i }))
    expect(screen.getByText(/fragrance-free formula uses calming ingredients/i)).toBeInTheDocument()
  })

  it('contains mobile menu focus and publishes policy details', async () => {
    const user = userEvent.setup()
    render(<App />)

    const opener = screen.getByRole('button', { name: 'Open menu' })
    await user.click(opener)
    const menu = screen.getByRole('dialog', { name: 'Navigation menu' })
    expect(menu).toContainElement(document.activeElement)
    await user.keyboard('{Escape}')
    expect(opener).toHaveFocus()
    expect(screen.getByText(/Orders of R450 or more include complimentary delivery/i)).toBeInTheDocument()
    expect(screen.getByText(/newsletter saves one email address only in your browser storage/i)).toBeInTheDocument()
  })

  it('lets visitors pause and resume spectacle motion', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Pause motion effects' }))
    expect(screen.getByRole('button', { name: 'Play motion effects' })).toBeInTheDocument()
    expect(document.documentElement).not.toHaveClass('motion-active')
    expect(document.querySelector('[data-scene]')).toHaveStyle({ '--scene-progress': '.65' })
    await user.click(screen.getByRole('button', { name: 'Play motion effects' }))
    expect(screen.getByRole('button', { name: 'Pause motion effects' })).toBeInTheDocument()
  })

  it('updates a scene as soon as it enters the motion observer', async () => {
    const originalObserver = window.IntersectionObserver
    let notify
    window.IntersectionObserver = class {
      constructor(callback) { notify = callback }
      observe() {}
      disconnect() {}
    }

    render(<App />)
    const scene = document.querySelector('[data-scene]')
    scene.getBoundingClientRect = () => ({ top: 0, height: 1000 })
    act(() => notify([{ target: scene, isIntersecting: true }]))
    await waitFor(() => expect(scene.style.getPropertyValue('--scene-progress')).not.toBe('.65'))
    window.IntersectionObserver = originalObserver
  })
})
