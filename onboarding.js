// DeAddict Phase 2 onboarding demo.
// Selections intentionally remain only in this page's JavaScript memory.
(() => {
  const onboarding = document.querySelector('[data-onboarding]');
  if (!onboarding) return;

  const steps = [...onboarding.querySelectorAll('[data-onboarding-step]')];
  const state = { category: '', approach: '' };
  let currentIndex = 0;

  function activeStep() {
    return steps[currentIndex];
  }

  function focusStepHeading(step) {
    const heading = step?.querySelector('h1');
    if (!heading) return;
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }

  function showStep(index) {
    currentIndex = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => {
      const isActive = stepIndex === currentIndex;
      step.classList.toggle('is-active', isActive);
      step.hidden = !isActive;
    });
    focusStepHeading(activeStep());
  }

  function removeError(step) {
    step?.querySelector('.onboarding-error')?.remove();
  }

  function showError(step, message) {
    let error = step.querySelector('.onboarding-error');
    if (!error) {
      error = document.createElement('p');
      error.className = 'onboarding-error field-error';
      error.setAttribute('role', 'alert');
      error.setAttribute('tabindex', '-1');
      step.querySelector('.onboarding-nav')?.before(error);
    }
    error.textContent = message;
    error.focus();
  }

  onboarding.querySelectorAll('[data-choice-group]').forEach(group => {
    const key = group.dataset.choiceGroup;
    group.querySelectorAll('.onboarding-option').forEach(button => {
      button.addEventListener('click', () => {
        group.querySelectorAll('.onboarding-option').forEach(option => {
          option.setAttribute('aria-pressed', 'false');
        });
        button.setAttribute('aria-pressed', 'true');
        state[key] = button.dataset.value || button.textContent.trim();
        removeError(button.closest('.onboarding-step'));
      });
    });
  });

  function updateReview() {
    onboarding.querySelector('[data-summary="category"]').textContent = state.category || 'Not selected';
    onboarding.querySelector('[data-summary="approach"]').textContent = state.approach || 'Not selected';

    const safetyNotice = onboarding.querySelector('[data-substance-safety]');
    if (safetyNotice) {
      safetyNotice.hidden = state.category !== 'Alcohol';
    }
  }

  onboarding.querySelectorAll('.onboarding-next').forEach(button => {
    button.addEventListener('click', () => {
      const step = activeStep();
      const group = step?.querySelector('[data-choice-group]');
      if (group) {
        const selected = group.querySelector('.onboarding-option[aria-pressed="true"]');
        if (!selected) {
          showError(step, 'Choose one option before continuing.');
          return;
        }
      }

      if (currentIndex === steps.length - 2) updateReview();
      showStep(currentIndex + 1);
    });
  });

  onboarding.querySelectorAll('.onboarding-back').forEach(button => {
    button.addEventListener('click', () => showStep(currentIndex - 1));
  });

  // Explicit initialization prevents hidden content from becoming keyboard-focusable.
  showStep(0);
})();
