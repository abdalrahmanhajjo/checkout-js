// Toggles the submitting/loading state: disables buttons and swaps the label/spinner.
function setSubmitting(isSubmitting) {
  submitButton.disabled = isSubmitting;
  backButton.disabled = isSubmitting;
  submitButton.classList.toggle('is-loading', isSubmitting);
  submitButton.querySelector('.button-text').textContent = isSubmitting ? 'Processing...' : 'Pay $142.56';
}

// Fakes a payment network round-trip: resolves after a delay, but rejects for
// any card ending in 0002 so the failure path can be demoed.
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

// Opens the result modal in success or failure mode, tailoring the icon, copy,
// and buttons. Remembers the prior focus so it can be restored on close.
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

// Hides the modal and returns focus to wherever it was before it opened.
function closeModal() {
  modal.hidden = true;
  lastFocusedElement?.focus();
}

// Clears the form, errors, and derived UI, then returns to the first step.
function resetCheckout() {
  form.reset();
  Object.keys(fields).forEach((name) => setError(name, ''));
  cardBrand.textContent = 'Card';
  shippingFields.hidden = true;
  closeModal();
  goToStep(0);
}
