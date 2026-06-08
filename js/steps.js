// Switches the visible step, updates the progress indicator and action buttons,
// renders the review on the final step, and moves focus to the first control.
function goToStep(stepIndex, { scroll = true } = {}) {
  currentStep = Math.max(0, Math.min(stepIndex, steps.length - 1)); // Clamp to a valid range.
  maxStepReached = Math.max(maxStepReached, currentStep); // Remember the furthest unlocked step.

  steps.forEach((step, index) => {
    step.classList.toggle('is-active', index === currentStep);
  });

  progressSteps.forEach((step, index) => {
    const isNavigable = index <= maxStepReached && index !== currentStep;
    step.classList.toggle('is-active', index === currentStep);
    step.classList.toggle('is-complete', index < currentStep);
    step.classList.toggle('is-navigable', isNavigable);
    // Let users tab to and activate any step they've already unlocked.
    step.setAttribute('role', 'button');
    step.setAttribute('tabindex', index <= maxStepReached ? '0' : '-1');
    step.setAttribute('aria-current', index === currentStep ? 'step' : 'false');
    step.setAttribute('aria-disabled', index <= maxStepReached ? 'false' : 'true');
  });

  currentStepLabel.textContent = `Step ${currentStep + 1}`;
  backButton.disabled = currentStep === 0;
  nextButton.hidden = currentStep === steps.length - 1;
  submitButton.hidden = currentStep !== steps.length - 1;

  if (currentStep === steps.length - 1) {
    renderReview();
  }

  hideStatus();

  // Bring the top of the checkout card (progress + step heading) into view so
  // each step starts from its beginning, then focus the first control without
  // letting focus fight the scroll.
  if (scroll) {
    checkoutCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const firstField = steps[currentStep].querySelector('input, select, button');
  firstField?.focus({ preventScroll: true });
}

// Handles clicking/activating a step in the progress tracker. Going back to an
// earlier step is always allowed; jumping forward is only allowed once every
// step in between validates, so users can move freely among finished steps.
function navigateToStep(targetIndex) {
  if (targetIndex === currentStep || targetIndex > maxStepReached) return;

  if (targetIndex < currentStep) {
    goToStep(targetIndex);
    return;
  }

  for (let index = currentStep; index < targetIndex; index += 1) {
    const isStepValid = stepFields[index].map(validateField).every(Boolean);
    if (!isStepValid) {
      goToStep(index);
      validateStep(index);
      return;
    }
  }

  goToStep(targetIndex);
}

// Builds the read-only review summary shown on the final step from current
// form values. The card number is masked and shipping is collapsed if shared.
function renderReview() {
  const values = getFormValues();
  const isCash = cashSelected();
  const phoneSummary = [values.phoneCountry, values.phone].filter(Boolean).join(' ');
  const shippingSummary = shippingSeparate()
    ? [values.shipAddressLine1, values.shipAddressLine2, values.shipCity, values.shipCountry, values.shipPostalCode]
        .filter(Boolean)
        .join(', ')
    : 'Same as billing';

  const paymentRows = isCash
    ? `
        ${reviewRow('Method', 'Cash on delivery')}
        ${reviewRow('Due on arrival', '$142.56')}
      `
    : `
        ${reviewRow('Method', 'Credit / debit card')}
        ${reviewRow('Cardholder', values.cardName)}
        ${reviewRow('Card', maskCard(values.cardNumber))}
        ${reviewRow('Expiry', values.expiry)}
        ${reviewRow('Preference', values.saveCard === 'yes' ? 'Save card securely' : 'Do not save card')}
      `;

  reviewGrid.innerHTML = `
    <section class="review-card" aria-labelledby="review-contact">
      <h3 id="review-contact">Contact</h3>
      <dl>
        ${reviewRow('Name', values.fullName)}
        ${reviewRow('Email', values.email)}
        ${reviewRow('Phone', phoneSummary)}
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
        ${paymentRows}
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
