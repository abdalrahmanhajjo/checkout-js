const steps = Array.from(document.querySelectorAll('.form-step'));
const progressSteps = Array.from(document.querySelectorAll('.progress-step'));
const form = document.querySelector('#checkout-form');
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

let currentStep = 0;
let lastFocusedElement = null;

const fields = {
  fullName: document.querySelector('#fullName'),
  email: document.querySelector('#email'),
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

function shippingSeparate() {
  return !fields.sameAsBilling.checked;
}

const validators = {
  fullName(value) {
    if (!value.trim()) return 'Enter your full name.';
    if (value.trim().split(/\s+/).length < 2) return 'Enter first and last name.';
    return '';
  },
  email(value) {
    if (!value.trim()) return 'Enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
    return '';
  },
  phone(value) {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'Enter your phone number.';
    if (digits.length < 8 || digits.length > 15) return 'Enter a valid phone number.';
    return '';
  },
  addressLine1(value) {
    if (!value.trim()) return 'Enter your billing address.';
    if (value.trim().length < 5) return 'Address must be at least 5 characters.';
    return '';
  },
  city(value) {
    if (!value.trim()) return 'Enter your city.';
    return '';
  },
  country(value) {
    if (!value) return 'Select your country.';
    return '';
  },
  postalCode(value) {
    if (!value.trim()) return 'Enter your postal code.';
    if (!/^[a-zA-Z0-9][a-zA-Z0-9\s-]{2,9}$/.test(value.trim())) return 'Enter a valid postal code.';
    return '';
  },
  shipAddressLine1(value) {
    if (!shippingSeparate()) return '';
    if (!value.trim()) return 'Enter your shipping address.';
    if (value.trim().length < 5) return 'Address must be at least 5 characters.';
    return '';
  },
  shipCity(value) {
    if (!shippingSeparate()) return '';
    if (!value.trim()) return 'Enter the shipping city.';
    return '';
  },
  shipCountry(value) {
    if (!shippingSeparate()) return '';
    if (!value) return 'Select the shipping country.';
    return '';
  },
  shipPostalCode(value) {
    if (!shippingSeparate()) return '';
    if (!value.trim()) return 'Enter the shipping postal code.';
    if (!/^[a-zA-Z0-9][a-zA-Z0-9\s-]{2,9}$/.test(value.trim())) return 'Enter a valid postal code.';
    return '';
  },
  cardName(value) {
    if (!value.trim()) return 'Enter the name shown on the card.';
    return '';
  },
  cardNumber(value) {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'Enter your card number.';
    if (digits.length < 13 || digits.length > 19) return 'Card number must be 13 to 19 digits.';
    if (!passesLuhnCheck(digits)) return 'Enter a valid card number.';
    return '';
  },
  expiry(value) {
    if (!value.trim()) return 'Enter the expiry date.';
    if (!/^\d{2}\/\d{2}$/.test(value)) return 'Use MM/YY format.';

    const [monthText, yearText] = value.split('/');
    const month = Number(monthText);
    const year = Number(`20${yearText}`);
    const now = new Date();
    const expiryDate = new Date(year, month, 0, 23, 59, 59);

    if (month < 1 || month > 12) return 'Expiry month must be between 01 and 12.';
    if (expiryDate < now) return 'Card expiry date must be in the future.';
    return '';
  },
  cvv(value) {
    if (!value.trim()) return 'Enter your CVV.';
    if (!/^\d{3,4}$/.test(value)) return 'CVV must be 3 or 4 digits.';
    return '';
  },
  terms(_value, input) {
    if (!input.checked) return 'Confirm the information and terms before paying.';
    return '';
  },
};

const stepFields = [
  ['fullName', 'email', 'phone'],
  ['addressLine1', 'city', 'country', 'postalCode', 'shipAddressLine1', 'shipCity', 'shipCountry', 'shipPostalCode'],
  ['cardName', 'cardNumber', 'expiry', 'cvv'],
  ['terms'],
];

function passesLuhnCheck(number) {
  let sum = 0;
  let shouldDouble = false;

  for (let index = number.length - 1; index >= 0; index -= 1) {
    let digit = Number(number[index]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function setError(name, message) {
  const input = fields[name];
  const error = document.querySelector(`#${name}-error`);
  const wrapper = input.closest('.field') || input.closest('.checkbox-field');

  if (error) error.textContent = message;

  if (message) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', `${name}-error`);
    wrapper?.classList.add('has-error');
  } else {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    wrapper?.classList.remove('has-error');
  }
}

function validateField(name) {
  const input = fields[name];
  const validator = validators[name];
  if (!validator) return true;

  const error = validator(input.value, input);
  setError(name, error);
  return !error;
}

function validateStep(stepIndex) {
  const names = stepFields[stepIndex];
  const results = names.map(validateField);
  const isValid = results.every(Boolean);

  if (!isValid) {
    const firstInvalid = names.map((name) => fields[name]).find((input) => input.getAttribute('aria-invalid') === 'true');
    firstInvalid?.focus();
    showStatus('Please fix the highlighted fields to continue.');
  } else {
    hideStatus();
  }

  return isValid;
}

// Validates every step before payment. If any step is invalid, jumps to the
// first one with errors so the user can fix it — payment is blocked until all
// fields on all pages are valid, not just the current step.
function validateAllSteps() {
  for (let index = 0; index < stepFields.length; index += 1) {
    const isStepValid = stepFields[index].map(validateField).every(Boolean);
    if (!isStepValid) {
      goToStep(index);
      validateStep(index);
      return false;
    }
  }
  return true;
}

function showStatus(message) {
  statusMessage.textContent = message;
  statusMessage.hidden = false;
}

function hideStatus() {
  statusMessage.textContent = '';
  statusMessage.hidden = true;
}

function goToStep(stepIndex) {
  currentStep = Math.max(0, Math.min(stepIndex, steps.length - 1));

  steps.forEach((step, index) => {
    step.classList.toggle('is-active', index === currentStep);
  });

  progressSteps.forEach((step, index) => {
    step.classList.toggle('is-active', index === currentStep);
    step.classList.toggle('is-complete', index < currentStep);
  });

  currentStepLabel.textContent = `Step ${currentStep + 1}`;
  backButton.disabled = currentStep === 0;
  nextButton.hidden = currentStep === steps.length - 1;
  submitButton.hidden = currentStep !== steps.length - 1;

  if (currentStep === steps.length - 1) {
    renderReview();
  }

  hideStatus();
  const firstField = steps[currentStep].querySelector('input, select, button');
  firstField?.focus({ preventScroll: true });
}

function renderReview() {
  const values = getFormValues();
  const maskedCard = maskCard(values.cardNumber);
  const shippingSummary = shippingSeparate()
    ? [values.shipAddressLine1, values.shipAddressLine2, values.shipCity, values.shipCountry, values.shipPostalCode]
        .filter(Boolean)
        .join(', ')
    : 'Same as billing';

  reviewGrid.innerHTML = `
    <section class="review-card" aria-labelledby="review-contact">
      <h3 id="review-contact">Contact</h3>
      <dl>
        ${reviewRow('Name', values.fullName)}
        ${reviewRow('Email', values.email)}
        ${reviewRow('Phone', values.phone)}
      </dl>
    </section>
    <section class="review-card" aria-labelledby="review-address">
      <h3 id="review-address">Billing address</h3>
      <dl>
        ${reviewRow('Address', [values.addressLine1, values.addressLine2].filter(Boolean).join(', '))}
        ${reviewRow('City', values.city)}
        ${reviewRow('Country', values.country)}
        ${reviewRow('Postal code', values.postalCode)}
        ${reviewRow('Shipping', shippingSummary)}
      </dl>
    </section>
    <section class="review-card" aria-labelledby="review-payment">
      <h3 id="review-payment">Payment</h3>
      <dl>
        ${reviewRow('Cardholder', values.cardName)}
        ${reviewRow('Card', maskedCard)}
        ${reviewRow('Expiry', values.expiry)}
        ${reviewRow('Preference', values.saveCard === 'yes' ? 'Save card securely' : 'Do not save card')}
      </dl>
    </section>
    <section class="review-card" aria-labelledby="review-total">
      <h3 id="review-total">Total due</h3>
      <dl>
        ${reviewRow('Order', 'Workspace Pro Kit')}
        ${reviewRow('Amount', '$142.56')}
      </dl>
    </section>
  `;
}

function reviewRow(label, value) {
  return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || 'Not provided')}</dd></div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getFormValues() {
  return Object.fromEntries(new FormData(form).entries());
}

function maskCard(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return 'Card not provided';
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

function detectCardBrand(value) {
  const digits = value.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^6/.test(digits)) return 'Discover';
  return 'Card';
}

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  const brand = detectCardBrand(digits);
  cardBrand.textContent = brand;

  if (brand === 'Amex') {
    return digits.replace(/(\d{4})(\d{0,6})(\d{0,5}).*/, (_, first, second, third) => [first, second, third].filter(Boolean).join(' '));
  }

  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function setSubmitting(isSubmitting) {
  submitButton.disabled = isSubmitting;
  backButton.disabled = isSubmitting;
  submitButton.classList.toggle('is-loading', isSubmitting);
  submitButton.querySelector('.button-text').textContent = isSubmitting ? 'Processing...' : 'Pay $142.56';
}

function simulatePayment(cardNumber) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      const digits = cardNumber.replace(/\D/g, '');
      if (digits.endsWith('0002')) {
        reject(new Error('Your bank declined this demo payment. Please check the card or try another one.'));
      } else {
        resolve({ orderId: `ORD-${Date.now().toString().slice(-6)}` });
      }
    }, 1200);
  });
}

function showResult({ isSuccess, message, orderId }) {
  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  resultIcon.classList.toggle('failure', !isSuccess);
  resultIcon.textContent = isSuccess ? '✓' : '!';
  resultTitle.textContent = isSuccess ? 'Payment successful' : 'Payment failed';
  resultDescription.textContent = isSuccess
    ? `Thank you. Your order ${orderId} has been confirmed and a receipt has been sent to your email.`
    : message;
  editPaymentButton.hidden = isSuccess;
  startOverButton.textContent = isSuccess ? 'Start new checkout' : 'Try again';
  startOverButton.focus();
}

function closeModal() {
  modal.hidden = true;
  lastFocusedElement?.focus();
}

function resetCheckout() {
  form.reset();
  Object.keys(fields).forEach((name) => setError(name, ''));
  cardBrand.textContent = 'Card';
  shippingFields.hidden = true;
  closeModal();
  goToStep(0);
}

nextButton.addEventListener('click', () => {
  if (validateStep(currentStep)) {
    goToStep(currentStep + 1);
  }
});

backButton.addEventListener('click', () => {
  goToStep(currentStep - 1);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!validateAllSteps()) return;

  setSubmitting(true);
  hideStatus();

  try {
    const result = await simulatePayment(fields.cardNumber.value);
    showResult({ isSuccess: true, orderId: result.orderId });
  } catch (error) {
    showResult({ isSuccess: false, message: error.message });
  } finally {
    setSubmitting(false);
  }
});

Object.entries(fields).forEach(([name, input]) => {
  input.addEventListener('blur', () => validateField(name));
  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true') validateField(name);
  });
});

fields.cardNumber.addEventListener('input', (event) => {
  event.target.value = formatCardNumber(event.target.value);
});

fields.expiry.addEventListener('input', (event) => {
  event.target.value = formatExpiry(event.target.value);
});

fields.cvv.addEventListener('input', (event) => {
  event.target.value = event.target.value.replace(/\D/g, '').slice(0, 4);
});

fields.sameAsBilling.addEventListener('change', () => {
  shippingFields.hidden = !shippingSeparate();
  if (!shippingSeparate()) {
    ['shipAddressLine1', 'shipAddressLine2', 'shipCity', 'shipCountry', 'shipPostalCode'].forEach((name) => setError(name, ''));
  }
});

editPaymentButton.addEventListener('click', () => {
  closeModal();
  goToStep(2);
});

startOverButton.addEventListener('click', resetCheckout);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) {
    closeModal();
  }
});

modal.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;

  const focusable = Array.from(modal.querySelectorAll('button')).filter(
    (element) => !element.hidden && element.offsetParent !== null,
  );
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

goToStep(0);
