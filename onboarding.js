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

  function showStep(index, { focus = true } = {}) {
    currentIndex = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => {
      const isActive = stepIndex === currentIndex;
      step.classList.toggle('is-active', isActive);
      step.hidden = !isActive;
    });
    if (focus) focusStepHeading(activeStep());
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

  // Initialize without moving focus. Focus changes only after a user action.
  showStep(0, { focus: false });

  // Local CI-only interaction path. It exercises the same click handlers as the UI,
  // never accepts user data, and cannot activate on a deployed production hostname.
  const ciMode = new URLSearchParams(window.location.search).get('ci-smoke');
  const isLocalHost = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
  if (isLocalHost && ciMode === 'alcohol') {
    const alcohol = onboarding.querySelector('[data-choice-group="category"] [data-value="Alcohol"]');
    const stopCompletely = onboarding.querySelector('[data-choice-group="approach"] [data-value="Stop completely"]');
    alcohol?.click();
    steps[0]?.querySelector('.onboarding-next')?.click();
    stopCompletely?.click();
    steps[1]?.querySelector('.onboarding-next')?.click();
    onboarding.dataset.ciSmokeComplete = String(currentIndex === 2);
    onboarding.dataset.ciFocused = document.activeElement?.id || '';
  }
})();
