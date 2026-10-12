import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
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

    expect(screen.getAllByAltText(/Ané Lumière Velvet Dawn Face Cream/i).length).toBeGreaterThan(0)
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
})
