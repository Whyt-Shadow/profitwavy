class FormValidator {
  static validatePhone(phone) {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  }

  static validatePassword(password) {
    return password.length >= 8;
  }

  static validateAmount(amount, min = 1, max = 10000) {
    const num = parseFloat(amount);
    return !isNaN(num) && num >= min && num <= max;
  }

  static showError(field, message) {
    field.classList.add('is-invalid');
    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('invalid-feedback')) {
      errorElement = document.createElement('div');
      errorElement.className = 'invalid-feedback';
      field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    errorElement.textContent = message;
  }

  static clearError(field) {
    field.classList.remove('is-invalid');
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('invalid-feedback')) {
      errorElement.remove();
    }
  }
}