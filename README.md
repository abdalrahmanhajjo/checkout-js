# Stride — Checkout

The checkout feature for **Stride**, built with **HTML, CSS, and vanilla JavaScript**. It covers the part of the product flow that comes after the cart: collecting contact and address details, choosing a payment method, reviewing the order, and confirming. It demonstrates accessible form handling, responsive layout, inline validation, loading states, and success/failure outcomes without relying on any frontend framework.

## Features

- Order summary sidebar (checkout summary screen)
- Multi-step checkout flow:
  1. Personal and contact information
  2. Billing address, with an optional separate shipping address ("same as billing" toggle)
  3. Payment details (credit/debit card or cash on delivery)
  4. Review and confirmation
- Revisit any finished step by clicking it in the progress tracker (keyboard accessible)
- Phone number entry with a country dial-code selector (no manual `+code` typing)
- Inline validation for every required field (full name, email, phone, address, card)
- Card-specific validation: Luhn check, brand detection, auto-formatting, future-dated expiry
- Accessible error messages using `aria-invalid`, `aria-describedby`, and live status regions
- Responsive layout for mobile, tablet, and desktop
- Payment loading state during submission
- Success and failure states shown in an accessible modal dialog
- Review step with masked card details
- Keyboard-friendly navigation, focus management, and a focus trap inside the result modal

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript

No build tools are required.

## How to Run Locally

### Option 1: Open directly

Open `index.html` in your browser.

### Option 2: Use a local static server

If you have Node.js installed:

```bash
npx serve .
```

Or with Python:

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

## Demo Payment Cards

Use this card number for a successful payment:

```text
4242 4242 4242 4242
```

Use any valid card number ending in `0002` to simulate a failed payment.

Example failure card:

```text
4000 0000 0000 0002
```

Use any valid future expiry date and any 3 or 4 digit CVV.

## Design Decisions

### Clear multi-step flow

The checkout is split into small, focused steps to reduce cognitive load. Each step has a clear title, helper text, progress indicator, and a single primary action.

### Validation strategy

Validation runs when fields lose focus, while typing after an error, and before moving to the next step. This keeps the form helpful without being overly aggressive.

### Billing and shipping

Billing address is always required. A "shipping address is the same as billing" checkbox is enabled by default; unchecking it reveals a separate shipping address whose fields then become required. Shipping validators short-circuit while the box is checked, so the user is never blocked by hidden fields.

### Accessibility

The implementation includes:

- Semantic form structure with `fieldset` and `legend`
- Visible labels for every input
- Inline errors connected to fields with `aria-describedby`
- `aria-invalid` on invalid fields
- Live status messages for validation and step changes
- Keyboard-accessible buttons and modal behavior
- Focus movement when steps change or validation fails

### Responsive behavior

The layout uses a two-column desktop design with a sticky order summary. On smaller screens, the checkout and summary stack vertically, progress labels collapse into numbered steps, and action buttons become full-width.

### Payment handling

This project does not collect or send real payment data. The payment flow is simulated locally to demonstrate loading, success, and failure states. In production, card details should be handled by a PCI-compliant provider such as Stripe, Adyen, Braintree, or Checkout.com using secure hosted fields or tokenization.

## File Structure

```text
frontend-checkout-flow-vanilla/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## Evaluation Notes

This implementation focuses on:

- UX clarity
- Helpful error handling
- Clean vanilla JavaScript organization
- Accessible form behavior
- Responsive UI
- Documented design and technical rationale
