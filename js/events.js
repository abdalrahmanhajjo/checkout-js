// Advance only when the current step validates.
nextButton.addEventListener('click', () => {
  if (validateStep(currentStep)) {
    goToStep(currentStep + 1);
  }
});

backButton.addEventListener('click', () => {
  goToStep(currentStep - 1);
});

// Let users jump between unlocked steps via the progress tracker (click + keyboard).
progressSteps.forEach((step, index) => {
  step.addEventListener('click', () => navigateToStep(index));
  step.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigateToStep(index);
    }
  });
});

// Switch between card and cash payment, updating fields, the note, and the button.
paymentMethodInputs.forEach((input) => {
  input.addEventListener('change', applyPaymentMethod);
});

// Final submit: re-validate everything, run the simulated payment, show result.
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!validateAllSteps()) return;

  setSubmitting(true);
  hideStatus();

  try {
    const result = await simulatePayment(cashSelected() ? null : fields.cardNumber.value);
    showResult({ isSuccess: true, orderId: result.orderId });
  } catch (error) {
    showResult({ isSuccess: false, message: error.message });
  } finally {
    setSubmitting(false);
  }
});

// Validate each field on blur; once a field is flagged invalid, re-validate on
// every keystroke so the error clears as soon as the value becomes valid.
Object.entries(fields).forEach(([name, input]) => {
  input.addEventListener('blur', () => validateField(name));
  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true') validateField(name);
  });
});

// Live input formatting for the payment fields.
fields.cardNumber.addEventListener('input', (event) => {
  event.target.value = formatCardNumber(event.target.value);
});

fields.expiry.addEventListener('input', (event) => {
  event.target.value = formatExpiry(event.target.value);
});

fields.cvv.addEventListener('input', (event) => {
  event.target.value = event.target.value.replace(/\D/g, '').slice(0, 4);
});

// Reveal the separate shipping fields when "same as billing" is unchecked, and
// clear any stale shipping errors when it's re-checked.
fields.sameAsBilling.addEventListener('change', () => {
  shippingFields.hidden = !shippingSeparate();
  if (!shippingSeparate()) {
    ['shipAddressLine1', 'shipAddressLine2', 'shipCity', 'shipCountry', 'shipPostalCode'].forEach((name) => setError(name, ''));
  }
});

// From the failure modal, jump straight back to the payment step.
editPaymentButton.addEventListener('click', () => {
  closeModal();
  goToStep(2);
});

startOverButton.addEventListener('click', resetCheckout);

// Allow Escape to dismiss the modal.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) {
    closeModal();
  }
});

// Focus trap: keep Tab/Shift+Tab cycling within the modal's buttons while open.
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

// Render the initial step and payment method state on load (no scroll on first paint).
applyPaymentMethod();
goToStep(0, { scroll: false });
