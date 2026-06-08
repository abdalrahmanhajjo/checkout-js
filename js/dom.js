// Cached references to the static elements the checkout flow drives.
const steps = Array.from(document.querySelectorAll('.form-step'));
const progressSteps = Array.from(document.querySelectorAll('.progress-step'));
const form = document.querySelector('#checkout-form');
const checkoutCard = document.querySelector('.checkout-card');
const backButton = document.querySelector('#back-button');
const nextButton = document.querySelector('#next-button');
const submitButton = document.querySelector('#submit-button');
const currentStepLabel = document.querySelector('#current-step-label');
const statusMessage = document.querySelector('#status-message');
const reviewGrid = document.querySelector('#review-grid');
const cardBrand = document.querySelector('#card-brand');
const modal = document.querySelector('#result-modal');
const resultIcon = document.querySelector('#result-icon');
const resultTitle = document.querySelector('#result-title');
const resultDescription = document.querySelector('#result-description');
const editPaymentButton = document.querySelector('#edit-payment-button');
const startOverButton = document.querySelector('#start-over-button');

let currentStep = 0; // Index of the form step currently shown (0-based).
let maxStepReached = 0; // Furthest step the user has unlocked; used for click navigation.
let lastFocusedElement = null; // Element focused before the modal opened, restored on close.

// Lookup of every form control by name, keyed to match the validators below.
const fields = {
  fullName: document.querySelector('#fullName'),
  email: document.querySelector('#email'),
  phoneCountry: document.querySelector('#phoneCountry'),
  phone: document.querySelector('#phone'),
  addressLine1: document.querySelector('#addressLine1'),
  addressLine2: document.querySelector('#addressLine2'),
  city: document.querySelector('#city'),
  country: document.querySelector('#country'),
  postalCode: document.querySelector('#postalCode'),
  shipAddressLine1: document.querySelector('#shipAddressLine1'),
  shipAddressLine2: document.querySelector('#shipAddressLine2'),
  shipCity: document.querySelector('#shipCity'),
  shipCountry: document.querySelector('#shipCountry'),
  shipPostalCode: document.querySelector('#shipPostalCode'),
  sameAsBilling: document.querySelector('#sameAsBilling'),
  cardName: document.querySelector('#cardName'),
  cardNumber: document.querySelector('#cardNumber'),
  expiry: document.querySelector('#expiry'),
  cvv: document.querySelector('#cvv'),
  saveCard: document.querySelector('#saveCard'),
  terms: document.querySelector('#terms'),
};

const shippingFields = document.querySelector('#shipping-fields');
const cardFields = document.querySelector('#card-fields');
const cashNote = document.querySelector('#cash-note');
const paymentMethodInputs = Array.from(document.querySelectorAll('input[name="paymentMethod"]'));

// True when the user wants a shipping address distinct from billing, i.e. the
// "same as billing" box is unchecked. The shipping validators no-op otherwise.
function shippingSeparate() {
  return !fields.sameAsBilling.checked;
}

// The currently selected payment method ('card' or 'cash').
function paymentMethod() {
  return paymentMethodInputs.find((input) => input.checked)?.value || 'card';
}

// True when paying with cash on delivery; the card validators no-op otherwise.
function cashSelected() {
  return paymentMethod() === 'cash';
}
