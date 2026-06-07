// Luhn (mod 10) checksum used to reject card numbers that are obviously invalid.
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

// Escapes HTML-significant characters so user-entered values can't inject markup.
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Masks a card number to its last four digits for display.
function maskCard(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return 'Card not provided';
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

// Infers the card brand from the leading digits (IIN ranges).
function detectCardBrand(value) {
  const digits = value.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^6/.test(digits)) return 'Discover';
  return 'Card';
}

// Reformats raw input into grouped card digits and updates the brand badge.
// Amex uses 4-6-5 grouping; everyone else gets even groups of four.
function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  const brand = detectCardBrand(digits);
  cardBrand.textContent = brand;

  if (brand === 'Amex') {
    return digits.replace(/(\d{4})(\d{0,6})(\d{0,5}).*/, (_, first, second, third) => [first, second, third].filter(Boolean).join(' '));
  }

  return digits.replace(/(.{4})/g, '$1 ').trim();
}

// Inserts the MM/YY slash as the user types the expiry date.
function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
