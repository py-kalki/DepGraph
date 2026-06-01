'use client';

// =============================================================================
// DepGraph — Dashboard: /feedback
// Week 8: Beta feedback submission form.
// =============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FeedbackPage() {
  const router = useRouter();
  const [rating, setRating]     = useState<number>(5);
  const [category, setCategory] = useState('bug');
  const [message, setMessage]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/beta/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, category, message }),
      });

      if (!res.ok) {
        const data = await res.json() as { error: string };
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="feedback-success">
        <h2>🎉 Thank you for your feedback!</h2>
        <p>Redirecting you back to the dashboard...</p>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <h2>Beta Feedback</h2>
      <p>Your feedback helps us improve DepGraph before launch.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="ux">UX / Design Issue</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Rating (1-5)</label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={e => setRating(parseInt(e.target.value, 10))}
            required
          />
        </div>

        <div className="form-group">
          <label>Message</label>
          <textarea
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Tell us what happened or what you'd like to see..."
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading || !message.trim()}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
