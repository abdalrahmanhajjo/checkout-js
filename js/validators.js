// Per-field validators. Each returns an error message string, or '' when valid.
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
  phoneCountry(value) {
    if (!value) return 'Select your country code.';
    return '';
  },
  phone(value) {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'Enter your phone number.';
    if (digits.length < 6 || digits.length > 15) return 'Enter a valid phone number.';
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
    if (cashSelected()) return '';
    if (!value.trim()) return 'Enter the name shown on the card.';
    return '';
  },
  cardNumber(value) {
    if (cashSelected()) return '';
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'Enter your card number.';
    if (digits.length < 13 || digits.length > 19) return 'Card number must be 13 to 19 digits.';
    if (!passesLuhnCheck(digits)) return 'Enter a valid card number.';
    return '';
  },
  expiry(value) {
    if (cashSelected()) return '';
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
    if (cashSelected()) return '';
    if (!value.trim()) return 'Enter your CVV.';
    if (!/^\d{3,4}$/.test(value)) return 'CVV must be 3 or 4 digits.';
    return '';
  },
  terms(_value, input) {
    if (!input.checked) return 'Confirm the information and terms before paying.';
    return '';
  },
};

// Field names grouped by the step they live on; index matches the step's data-step.
const stepFields = [
  ['fullName', 'email', 'phoneCountry', 'phone'],
  ['addressLine1', 'city', 'country', 'postalCode', 'shipAddressLine1', 'shipCity', 'shipCountry', 'shipPostalCode'],
  ['cardName', 'cardNumber', 'expiry', 'cvv'],
  ['terms'],
];
