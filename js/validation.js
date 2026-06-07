// Shows or clears a field's error message and keeps ARIA attributes in sync
// so screen readers announce invalid fields and their messages.
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

// Runs a single field's validator and reflects the result in the UI.
function validateField(name) {
  const input = fields[name];
  const validator = validators[name];
  if (!validator) return true;

  const error = validator(input.value, input);
  setError(name, error);
  return !error;
}

// Validates every field on a step, focuses the first invalid one, and toggles
// the status banner. Returns whether the step is good to advance from.
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

// Reveals the live-region status banner with an error/help message.
function showStatus(message) {
  statusMessage.textContent = message;
  statusMessage.hidden = false;
}

// Clears and hides the status banner.
function hideStatus() {
  statusMessage.textContent = '';
  statusMessage.hidden = true;
}
