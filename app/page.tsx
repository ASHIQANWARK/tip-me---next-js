"use client";

import { useMemo, useState } from "react";
import { Hotel, MapPin } from "lucide-react";

type FeeConfig = {
  processingFee: number;
  gatewayRatePct: number;
};

type TipData = {
  profile: {
    name: string;
    venue: string;
    area: string;
  };
  currency: string;
  presetAmounts: number[];
  popularAmount: number;
  fees: FeeConfig;
  feedbackChips: string[];
};

// I keep tweaking these numbers but never quite happy with them
const DATA: TipData = {
  profile: {
    name: "Ahmed Al-Mansouri",
    venue: "Grand Hyatt Doha",
    area: "Main Lobby",
  },
  currency: "QAR",
  presetAmounts: [10, 20, 50, 100],
  popularAmount: 20,
  fees: {
    processingFee: 35,
    gatewayRatePct: 2,
  },
  feedbackChips: ["very friendly", "very helpful", "Excellent service"],
};

// Honestly should probably move this to a config file but it's fine for now
const RATING_MAP = {
  1: { emoji: "😞", label: "Needs Improvement" },
  2: { emoji: "🙁", label: "Could Be Better" },
  3: { emoji: "😐", label: "Good Experience" },
  4: { emoji: "🙂", label: "Great Experience" },
  5: { emoji: "🤩", label: "Excellent Experience" },
};

const DEFAULT_RATING = { emoji: "🙂", label: "Good Experience" };

// Quick and dirty currency formatter - works for now
const formatMoney = (amount: number) => 
  `${DATA.currency} ${amount.toFixed(2)}`;

// Simple chevron - copied from another project
function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`chevron ${expanded ? "chevron--open" : ""}`}
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        d="M4 6l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Message icon - had to tweak the stroke width a few times
function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5.2 5.6h13.6a2.2 2.2 0 0 1 2.2 2.2v6.1a2.2 2.2 0 0 1-2.2 2.2h-6.4l-3.8 2.7v-2.7H5.2A2.2 2.2 0 0 1 3 13.9V7.8a2.2 2.2 0 0 1 2.2-2.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 10.6h8M8 13.3h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// I know there's a better way to do this but this works
function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`star ${filled ? "star--filled" : ""}`}
    >
      <path d="m12 3.9 2.35 4.76 5.25.76-3.8 3.7.9 5.23L12 15.88l-4.7 2.47.9-5.23-3.8-3.7 5.25-.76L12 3.9Z" />
    </svg>
  );
}

// TODO: Replace with proper back button from design system
function BackArrow() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M12.5 4.5 7 10l5.5 5.5M7.4 10H16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  // State management - I know I could use useReducer but this is simpler
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [rating, setRating] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get first name - handles edge cases... mostly
  const getFirstName = () => {
    const parts = DATA.profile.name.trim().split(/\s+/);
    return parts[0] || DATA.profile.name;
  };
  const firstName = getFirstName();

  // Check if any feedback was provided
  const hasFeedback = rating > 0 || selectedChips.length > 0 || experience.trim().length > 0;

  // Determine if the user can proceed
  const canProceed = selectedTip !== null || hasFeedback;

  // Calculate payment breakdown - probably should move this to a helper
  const paymentBreakdown = useMemo(() => {
    if (selectedTip === null) return null;

    const gatewayFee = selectedTip * (DATA.fees.gatewayRatePct / 100);
    const recipientGets = selectedTip - DATA.fees.processingFee - gatewayFee;

    return {
      gatewayFee,
      recipientGets,
      processingFee: DATA.fees.processingFee,
      total: selectedTip,
    };
  }, [selectedTip]);

  // Handle tip selection
  const onTipSelect = (amount: number) => {
    setSelectedTip(amount);
    setFeedbackOpen(true);
    setSummaryOpen(true);
    setIsSubmitted(false);
  };

  // Toggle chip selection
  const toggleChip = (chip: string) => {
    setSelectedChips(prev => 
      prev.includes(chip) 
        ? prev.filter(c => c !== chip)
        : [...prev, chip]
    );
  };

  // Get current rating data
  const currentRating = RATING_MAP[rating as keyof typeof RATING_MAP] || DEFAULT_RATING;

  // Dynamic CTA text - feels more natural this way
  const getCtaText = () => {
    if (isSubmitted) return "🎉 Thank You!";
    if (selectedTip !== null) return `Pay ${formatMoney(selectedTip)}`;
    return "Choose a tip or add feedback";
  };

  // Reset everything - maybe overkill but it works
  const resetEverything = () => {
    setSelectedTip(null);
    setFeedbackOpen(false);
    setSummaryOpen(true);
    setRating(0);
    setSelectedChips([]);
    setExperience("");
    setCustomerName("");
    setIsSubmitted(false);
  };

  // Submit handler
  const onSubmit = () => {
    if (!canProceed) return;
    setIsSubmitted(true);
  };

  return (
    <main className="page-shell">
      <section className="device-frame" aria-label="Tip Me">
        <div className="screen">
          {/* Header - keeping it simple */}
          <header className="topbar">
            <h1>Tip Me</h1>
            <button
              className="icon-button"
              type="button"
              aria-label="Go back"
              onClick={resetEverything}
            >
              <BackArrow />
            </button>
          </header>

          {/* Profile section */}
          <article className="profile-card">
            <img src="/avatar.png" alt="" className="avatar" />
            <div className="profile-copy">
              <p className="profile-name" title={DATA.profile.name}>
                {DATA.profile.name}
              </p>
              <p className="profile-meta">
                <Hotel className="profile-meta-icon" size={15} strokeWidth={1.7} aria-hidden="true" />
                <span className="profile-meta-text">{DATA.profile.venue}</span>
              </p>
              <p className="profile-meta">
                <MapPin className="profile-meta-icon" size={15} strokeWidth={1.7} aria-hidden="true" />
                <span className="profile-meta-text">{DATA.profile.area}</span>
              </p>
            </div>
          </article>

          {/* Tip amount selection */}
          <section className="tip-section" aria-labelledby="tip-heading">
            <h2 id="tip-heading">Choose a tip amount</h2>
            <div className="tip-grid" role="radiogroup" aria-label="Tip amount">
              {DATA.presetAmounts.map((amount) => {
                const isSelected = selectedTip === amount;
                const isPopular = amount === DATA.popularAmount;

                return (
                  <div className="tip-option" key={amount}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${DATA.currency} ${amount}${isPopular ? ", Popular" : ""}`}
                      className={`tip-pill ${isSelected ? "tip-pill--selected" : ""}`}
                      onClick={() => onTipSelect(amount)}
                      disabled={isSubmitted}
                    >
                      <span className="currency-mini">{DATA.currency}</span>
                      <span className="tip-value">{amount}</span>
                    </button>
                    {isPopular && <span className="popular-badge">Popular</span>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Feedback section - this was tricky to get right */}
          <section className={`feedback-card ${feedbackOpen ? "feedback-card--open" : ""}`}>
            <button
              type="button"
              className="section-toggle"
              aria-expanded={feedbackOpen}
              aria-controls="feedback-panel"
              onClick={() => setFeedbackOpen(prev => !prev)}
              disabled={isSubmitted}
            >
              <span className="section-icon">
                <MessageIcon />
              </span>
              <span className="section-heading-copy">
                <strong>How was {firstName}?</strong>
                <small>Your words are their biggest motivation</small>
              </span>
              <Chevron expanded={feedbackOpen} />
            </button>

            {feedbackOpen && (
              <div id="feedback-panel" className="feedback-panel">
                {/* Rating stars */}
                <div className="rating-row">
                  <div className="stars" role="radiogroup" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={rating === value}
                        aria-label={`${value} star${value > 1 ? "s" : ""}`}
                        className={`star-button ${rating === value ? "star-button--selected" : ""}`}
                        onClick={() => setRating(value)}
                        disabled={isSubmitted}
                      >
                        <Star filled={value <= rating} />
                      </button>
                    ))}
                  </div>
                  <div className="rating-divider" aria-hidden="true" />
                  <div className="rating-result">
                    <span className="rating-emoji" aria-hidden="true">
                      {currentRating.emoji}
                    </span>
                    <span className="rating-label">{currentRating.label}</span>
                  </div>
                </div>

                {/* Feedback chips */}
                <div className="chips" aria-label="Quick feedback">
                  {DATA.feedbackChips.map((chip) => {
                    const isSelected = selectedChips.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        className={`chip ${isSelected ? "chip--selected" : ""}`}
                        aria-pressed={isSelected}
                        onClick={() => toggleChip(chip)}
                        disabled={isSubmitted}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>

                {/* Text inputs */}
                <textarea
                  id="experience"
                  className="text-field textarea"
                  aria-label="Share your experience"
                  placeholder="Share your experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={3}
                  disabled={isSubmitted}
                />
                <input
                  id="name"
                  className="text-field"
                  type="text"
                  aria-label="Add your name (optional)"
                  placeholder="Add your name (optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={isSubmitted}
                />
              </div>
            )}
          </section>

          {/* Payment summary - only show if tip is selected */}
          {paymentBreakdown && (
            <section className="summary-card">
              <button
                type="button"
                className="summary-toggle"
                aria-expanded={summaryOpen}
                aria-controls="summary-panel"
                onClick={() => setSummaryOpen(prev => !prev)}
                disabled={isSubmitted}
              >
                <strong>Payment summary</strong>
                <Chevron expanded={summaryOpen} />
              </button>

              {summaryOpen && (
                <div id="summary-panel" className="summary-panel">
                  <div className="summary-row">
                    <span>Tip amount</span>
                    <strong>{formatMoney(paymentBreakdown.total)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Processing fee (flat)</span>
                    <strong>{formatMoney(paymentBreakdown.processingFee)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Gateway fee ({DATA.fees.gatewayRatePct}%)</span>
                    <strong>{formatMoney(paymentBreakdown.gatewayFee)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>{firstName} receives</span>
                    <strong>{formatMoney(paymentBreakdown.recipientGets)}</strong>
                  </div>
                  <div className="summary-total">
                    <span>Total amount to pay</span>
                    <strong>{formatMoney(paymentBreakdown.total)}</strong>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Primary action button */}
          <div className="action-bar items-center">
            <button
              type="button"
              className="primary-action"
              disabled={!canProceed || isSubmitted}
              aria-disabled={!canProceed || isSubmitted}
              onClick={onSubmit}
              style={{
                ...(isSubmitted ? {
                  background: "linear-gradient(90deg, #2d8a4e, #1a6b3a)",
                  boxShadow: "0 6px 16px rgba(45, 138, 78, 0.25)",
                  cursor: "default",
                } : {}),
                justifyContent: isSubmitted ? "center" : "space-between",
              }}
            >
              <span>{getCtaText()}</span>
              {!isSubmitted && (
                <span className="action-arrow" aria-hidden="true">
                  ››
                </span>
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}