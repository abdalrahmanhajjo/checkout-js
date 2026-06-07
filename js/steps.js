// Switches the visible step, updates the progress indicator and action buttons,
// renders the review on the final step, and moves focus to the first control.
function goToStep(stepIndex) {
  currentStep = Math.max(0, Math.min(stepIndex, steps.length - 1)); // Clamp to a valid range.

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

// Builds the read-only review summary shown on the final step from current
// form values. The card number is masked and shipping is collapsed if shared.
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

// Renders a single label/value pair for the review grid, escaping user input.
function reviewRow(label, value) {
  return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || 'Not provided')}</dd></div>`;
}

// Snapshots all named form controls into a plain { name: value } object.
function getFormValues() {
  return Object.fromEntries(new FormData(form).entries());
}
