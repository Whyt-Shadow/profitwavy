class LoadingStates {
  static setLoading(button, isLoading, loadingText = 'Processing...') {
    if (isLoading) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
    } else {
      button.disabled = false;
      button.innerHTML = button.dataset.originalText;
    }
  }

  static setFormLoading(form, isLoading) {
    const inputs = form.querySelectorAll('input, button, select, textarea');
    inputs.forEach(input => {
      input.disabled = isLoading;
    });
    
    if (isLoading) {
      form.classList.add('loading');
    } else {
      form.classList.remove('loading');
    }
  }
}