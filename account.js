// DeAddict Phase 4 account implementation preview.
// This controller intentionally uses page memory only and contains no network or persistence APIs.
(() => {
  const root = document.querySelector('[data-account-preview]');
  if (!root) return;

  const panels = [...root.querySelectorAll('[data-account-panel]')];
  const form = root.querySelector('[data-account-form]');
  const emailInput = root.querySelector('#accountEmail');
  const formError = root.querySelector('[data-account-error]');
  const status = root.querySelector('[data-account-status]');
  const deleteWrap = root.querySelector('[data-delete-confirm]');
  const deleteInput = root.querySelector('#deletePhrase');
  const deleteError = root.querySelector('[data-delete-error]');
  const memory = { discreetMode: true, state: 'signed-out' };

  function showPanel(name, { focus = true } = {}) {
    memory.state = name;
    panels.forEach(panel => {
      const active = panel.dataset.accountPanel === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });

    if (focus) {
      const heading = panels.find(panel => panel.dataset.accountPanel === name)?.querySelector('h1');
      heading?.focus();
    }
  }

  function showMessage(message) {
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
    status.focus?.();
  }

  function clearMessage() {
    if (!status) return;
    status.textContent = '';
    status.hidden = true;
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
  }

  form?.addEventListener('submit', event => {
    event.preventDefault();
    const decisions = [...form.querySelectorAll('input[type="checkbox"][required]')];
    const email = emailInput?.value.trim() || '';
    const allAccepted = decisions.every(input => input.checked);

    if (!validEmail(email) || !allAccepted) {
      if (formError) {
        formError.textContent = !validEmail(email)
          ? 'Enter a valid email address for this preview.'
          : 'Review and accept each required decision before continuing.';
        formError.hidden = false;
        formError.focus();
      }
      return;
    }

    if (formError) formError.hidden = true;
    if (emailInput) emailInput.value = '';
    decisions.forEach(input => { input.checked = false; });
    showPanel('link-requested');
  });

  root.querySelector('[data-preview-session]')?.addEventListener('click', () => {
    clearMessage();
    showPanel('signed-in');
  });

  root.querySelector('[data-setting-toggle]')?.addEventListener('click', event => {
    memory.discreetMode = !memory.discreetMode;
    const button = event.currentTarget;
    button.setAttribute('aria-pressed', String(memory.discreetMode));
    button.textContent = memory.discreetMode ? 'On' : 'Off';
    showMessage(`Discreet mode is ${memory.discreetMode ? 'on' : 'off'} for this page preview only.`);
  });

  root.querySelector('[data-session-revoke]')?.addEventListener('click', () => {
    showMessage('Preview only: a production request would require recent authentication and revoke all sessions.');
  });

  root.querySelector('[data-export-request]')?.addEventListener('click', () => {
    showMessage('Preview only: no export request was created and no data package exists.');
  });

  root.querySelector('[data-delete-open]')?.addEventListener('click', () => {
    if (!deleteWrap) return;
    deleteWrap.hidden = false;
    deleteInput?.focus();
  });

  root.querySelector('[data-delete-cancel]')?.addEventListener('click', () => {
    if (deleteWrap) deleteWrap.hidden = true;
    if (deleteInput) deleteInput.value = '';
    if (deleteError) deleteError.hidden = true;
  });

  root.querySelector('[data-delete-submit]')?.addEventListener('click', () => {
    if ((deleteInput?.value || '') !== 'DELETE') {
      if (deleteError) {
        deleteError.textContent = 'Type DELETE exactly to confirm this preview.';
        deleteError.hidden = false;
        deleteError.focus();
      }
      return;
    }

    if (deleteError) deleteError.hidden = true;
    if (deleteInput) deleteInput.value = '';
    if (deleteWrap) deleteWrap.hidden = true;
    showMessage('Preview only: no account or data was deleted. A real deletion would require recent authentication.');
  });

  root.querySelectorAll('[data-account-reset]').forEach(button => {
    button.addEventListener('click', () => {
      clearMessage();
      if (deleteWrap) deleteWrap.hidden = true;
      if (deleteInput) deleteInput.value = '';
      if (formError) formError.hidden = true;
      showPanel('signed-out', { focus: false });
      emailInput?.focus();
    });
  });

  // Explicitly initialize hidden panels without moving focus on page load.
  showPanel('signed-out', { focus: false });
})();