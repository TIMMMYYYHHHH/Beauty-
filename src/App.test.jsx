import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import App from './App'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

async function addBundle(user, name = 'Two jars, R499, Save R99') {
  await user.click(screen.getByRole('button', { name }))
  await user.click(screen.getByRole('button', { name: /Add to bag/i }))
  return screen.getByRole('dialog', { name: 'Shopping bag' })
}

describe('Ané Lumière storefront', () => {
  it('shows the real product choices without unverified proof claims', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /A softer state of skin/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'One jar, R299' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Two jars, R499, Save R99' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Three jars, R649, Save R248' })).toBeInTheDocument()
    expect(screen.getByText(/Reviews will live here/i)).toBeInTheDocument()
    expect(screen.queryByText(/286 reviews/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/97%/i)).not.toBeInTheDocument()
  })

  it('calculates paid delivery for one jar', async () => {
    const user = userEvent.setup()
    render(<App />)

    const cart = await addBundle(user, 'One jar, R299')
    expect(within(cart).getByText('R75 delivery on this order')).toBeInTheDocument()
    expect(within(cart).getByText('R374')).toBeInTheDocument()
  })

  it('includes complimentary delivery for the two-jar set', async () => {
    const user = userEvent.setup()
    render(<App />)

    const cart = await addBundle(user)
    expect(within(cart).getByText('Complimentary delivery included')).toBeInTheDocument()
    expect(within(cart).getAllByText('R499').length).toBeGreaterThan(0)
  })

  it('keeps the three-jar total at R649 with complimentary delivery', async () => {
    const user = userEvent.setup()
    render(<App />)

    const cart = await addBundle(user, 'Three jars, R649, Save R248')
    expect(within(cart).getByText('Complimentary delivery included')).toBeInTheDocument()
    expect(within(cart).getByText('Total').parentElement).toHaveTextContent('R649')
    await user.click(within(cart).getByRole('button', { name: /Continue to checkout/i }))
    const checkout = screen.getByRole('dialog', { name: 'Checkout' })
    expect(checkout.querySelector('.checkout-total')).toHaveTextContent('R649')
  })

  it('removes the cart item and transfers focus to the surviving close control', async () => {
    const user = userEvent.setup()
    render(<App />)

    const cart = await addBundle(user)
    await user.click(within(cart).getByRole('button', { name: 'Remove' }))
    expect(within(cart).getByText('Your bag is empty')).toBeInTheDocument()
    expect(within(cart).getByRole('button', { name: 'Close shopping bag' })).toHaveFocus()
  })

  it('validates and retains delivery details for the checkout preview', async () => {
    const user = userEvent.setup()
    render(<App />)

    const cart = await addBundle(user)
    await user.click(within(cart).getByRole('button', { name: /Continue to checkout/i }))
    const checkout = screen.getByRole('dialog', { name: 'Checkout' })
    await user.click(within(checkout).getByRole('button', { name: /Review payment step/i }))
    expect(within(checkout).getByRole('heading', { name: /Where should we send your order/i })).toBeInTheDocument()

    await user.type(within(checkout).getByLabelText('Email address'), 'hello@example.com')
    await user.type(within(checkout).getByLabelText('First name'), 'Ane')
    await user.type(within(checkout).getByLabelText('Last name'), 'Tester')
    await user.type(within(checkout).getByLabelText('Street address'), '12 Dawn Road')
    await user.type(within(checkout).getByLabelText('City'), 'Cape Town')
    await user.type(within(checkout).getByLabelText('Postal code'), '8001')
    await user.click(within(checkout).getByRole('button', { name: /Review payment step/i }))

    expect(within(checkout).getByRole('heading', { name: 'Ready for PayFast setup' })).toBeInTheDocument()
    expect(within(checkout).getByText('Ane Tester')).toBeInTheDocument()
    expect(within(checkout).getByText('12 Dawn Road')).toBeInTheDocument()
    expect(within(checkout).getByText(/No payment was taken/i)).toBeInTheDocument()
  })

  it('closes only checkout on the first Escape and restores each opener', async () => {
    const user = userEvent.setup()
    render(<App />)

    const addButton = screen.getByRole('button', { name: /Add to bag/i })
    await user.click(addButton)
    const cart = screen.getByRole('dialog', { name: 'Shopping bag' })
    const checkoutButton = within(cart).getByRole('button', { name: /Continue to checkout/i })
    await user.click(checkoutButton)

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Checkout' })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Shopping bag' })).toBeInTheDocument()
    await waitFor(() => expect(checkoutButton).toHaveFocus())

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Shopping bag' })).not.toBeInTheDocument()
    await waitFor(() => expect(addButton).toHaveFocus())
  })

  it('saves newsletter email only in local storage', async () => {
    const user = userEvent.setup()
    render(<App />)

    const email = screen.getByLabelText('Save your email for launch updates')
    await user.type(email, 'ritual@example.com')
    await user.click(screen.getByRole('button', { name: 'Save email for launch updates' }))

    expect(window.localStorage.getItem('ane-lumiere-newsletter-email')).toBe('ritual@example.com')
    expect(email).toHaveValue('')
    expect(screen.getByRole('status')).toHaveTextContent('Email saved on this device')
  })

  it('opens and closes FAQ answers with accessible state', async () => {
    const user = userEvent.setup()
    render(<App />)

    const question = screen.getByRole('button', { name: 'Where do you deliver?' })
    expect(question).toHaveAttribute('aria-expanded', 'false')
    await user.click(question)
    expect(question).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Delivery costs R75 for orders below R450/i)).toBeInTheDocument()
  })

  it('traps focus in the mobile menu and closes it from the linked logo', async () => {
    const user = userEvent.setup()
    render(<App />)

    const opener = screen.getByRole('button', { name: 'Open menu' })
    await user.click(opener)
    const menu = screen.getByRole('dialog', { name: 'Navigation menu' })
    expect(menu).toContainElement(document.activeElement)
    await user.click(within(menu).getByRole('link', { name: 'Ané Lumière home' }))
    expect(screen.queryByRole('dialog', { name: 'Navigation menu' })).not.toBeInTheDocument()
    await waitFor(() => expect(opener).toHaveFocus())
  })

  it('uses a non-link brand mark inside checkout', async () => {
    const user = userEvent.setup()
    render(<App />)

    const cart = await addBundle(user)
    await user.click(within(cart).getByRole('button', { name: /Continue to checkout/i }))
    const checkout = screen.getByRole('dialog', { name: 'Checkout' })
    expect(within(checkout).queryByRole('link', { name: 'Ané Lumière home' })).not.toBeInTheDocument()
    expect(within(checkout).getByLabelText('Ané Lumière')).toBeInTheDocument()
  })
})
