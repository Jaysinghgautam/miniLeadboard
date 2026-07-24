import { useMemo, useState } from 'react';
import { createLead } from '../api.js';

const BUDGET_OPTIONS = ['<$1k', '$1k-$5k', '$5k-$15k', '$15k+'];

const EMPTY_FORM = { name: '', email: '', budgetRange: '', message: '' };

function validate(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = 'Name is required.';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.budgetRange) {
    errors.budgetRange = 'Pick a budget range.';
  }

  if (!form.message.trim()) {
    errors.message = 'Tell us a little about the project.';
  } else if (form.message.trim().length < 10) {
    errors.message = 'Message should be at least 10 characters.';
  }

  return errors;
}

export default function LandingPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'success' | 'error', text }
  const [lastLeadId, setLastLeadId] = useState(null);

  const pendingId = useMemo(() => {
    const n = (Date.now() % 9000) + 1000;
    return `LEAD-${n}`;
  }, [banner]);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBanner(null);

    const clientErrors = validate(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      const lead = await createLead(form);
      setLastLeadId(lead._id);
      setBanner({ type: 'success', text: `Received — ticket ${lead._id.slice(-6).toUpperCase()} is in the queue.` });
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (err) {
      if (err.fields) {
        setErrors(err.fields);
        setBanner({ type: 'error', text: 'A couple of fields need a fix.' });
      } else {
        setBanner({ type: 'error', text: err.message || 'Something went wrong. Try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Lead intake, without the spreadsheet</span>
          <h1>Tell us about the project. We'll take it from here.</h1>
          <p>
            LeadDesk Mini routes every enquiry straight into a queue your team can
            search, triage, and move through New → Contacted → Closed — no inbox
            archaeology required.
          </p>
          <ul className="hero-bullets">
            <li>One form, validated on both ends, so nothing malformed reaches your team.</li>
            <li>Every submission lands with a ticket ID the moment it's filed.</li>
            <li>Search and status live on the admin side — see the flip side at /admin.</li>
          </ul>
        </div>

        <form className="ticket" onSubmit={handleSubmit} noValidate>
          <div className="ticket-header">
            <span>NEW INTAKE FORM</span>
            <span className="ticket-id">{lastLeadId ? `#${lastLeadId.slice(-6).toUpperCase()}` : pendingId}</span>
          </div>

          {banner && <div className={`banner ${banner.type}`}>{banner.text}</div>}

          <div className={`field ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Jordan Reyes"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className={`field ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="jordan@company.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className={`field ${errors.budgetRange ? 'has-error' : ''}`}>
            <label htmlFor="budgetRange">Budget range</label>
            <select
              id="budgetRange"
              value={form.budgetRange}
              onChange={(e) => updateField('budgetRange', e.target.value)}
            >
              <option value="">Select a range</option>
              {BUDGET_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {errors.budgetRange && <span className="field-error">{errors.budgetRange}</span>}
          </div>

          <div className={`field ${errors.message ? 'has-error' : ''}`}>
            <label htmlFor="message">Project details</label>
            <textarea
              id="message"
              placeholder="What are you building, and by when?"
              value={form.message}
              onChange={(e) => updateField('message', e.target.value)}
            />
            {errors.message && <span className="field-error">{errors.message}</span>}
          </div>

          <button className="submit-btn" type="submit" disabled={submitting}>
            {submitting ? 'Filing ticket…' : 'Submit ticket'}
          </button>

          <p className="ticket-note">
            Fields are checked here first, then re-checked on the server — so this
            form can't send anything malformed even if JavaScript is tampered with.
          </p>
        </form>
      </section>
    </main>
  );
}
