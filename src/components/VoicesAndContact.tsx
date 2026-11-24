import { useEffect, useState, type FormEvent } from 'react';
import { Check, Copy, ExternalLink, Mail, MapPin, Phone, Send } from 'lucide-react';
import { CONTACT_DETAILS, TESTIMONIALS } from '../data/portfolioData';

interface VoicesAndContactProps {
  prefilledTopic: string;
}

export function VoicesAndContact({ prefilledTopic }: VoicesAndContactProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(
    prefilledTopic || 'AI-Powered Digital Marketing Mastery Course'
  );
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<'email' | 'phone' | null>(null);

  useEffect(() => {
    if (prefilledTopic) {
      setTopic(prefilledTopic);
      setSubmitted(false);
    }
  }, [prefilledTopic]);

  const handleCopy = async (value: string, field: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Clipboard API restricted
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please complete your name, email, and inquiry details.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <>
      {/* Learner & Client Testimonials */}
      <section
        id="voices"
        className="mx-auto max-w-[1280px] px-6 py-16 md:py-24 border-t border-white/10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-[#F5B041]">
              Verified Learner &amp; Client Outcomes
            </p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
              Rated 4.9 / 5 Across Google, UrbanPro &amp; Justdial
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Feedback from students, agency hires, and startup founders.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-white/10 bg-[#0B101E]/82 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{item.platform}</span>
                  <span className="font-mono-tabular text-[#F5B041]">{item.rating}</span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-200">
                  “{item.quote}”
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs font-medium text-[#7DD3FC]">
                  Outcome: {item.outcome}
                </p>
                <p className="mt-2 font-display text-base font-semibold text-white">
                  {item.name}
                </p>
                <p className="text-xs text-slate-400">
                  {item.role} <span aria-hidden="true">·</span> {item.organization}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Contact & Consultation */}
      <section
        id="contact"
        className="mx-auto max-w-[1280px] px-6 py-16 md:py-24 border-t border-white/10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-medium text-[#F5B041]">
                Connect with Digital Yamini
              </p>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
                Start a Training Cohort or Growth Consultation
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Reach out directly for course admissions, university guest lectures, corporate upskilling, or full-funnel digital marketing consulting.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="h-4 w-4 shrink-0 text-[#F5B041]" />
                  <a
                    href={`mailto:${CONTACT_DETAILS.email}`}
                    className="text-sm text-slate-200 hover:text-white truncate"
                  >
                    {CONTACT_DETAILS.email}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(CONTACT_DETAILS.email, 'email')}
                  aria-label="Copy email address"
                  className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/5 shrink-0"
                >
                  {copiedField === 'email' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#34D399]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Phone className="h-4 w-4 shrink-0 text-[#F5B041]" />
                  <a
                    href={CONTACT_DETAILS.phoneHref}
                    className="font-mono-tabular text-sm text-slate-200 hover:text-white"
                  >
                    {CONTACT_DETAILS.phone}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(CONTACT_DETAILS.phone, 'phone')}
                  aria-label="Copy phone number"
                  className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/5 shrink-0"
                >
                  {copiedField === 'phone' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#34D399]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#F5B041]" />
                <p className="text-sm leading-relaxed text-slate-300">
                  {CONTACT_DETAILS.address}
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href={CONTACT_DETAILS.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-slate-200 hover:border-[#F5B041]/50 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                <span>Visit digitalyamini.com</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={CONTACT_DETAILS.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-slate-200 hover:border-[#7DD3FC]/50 hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                <span>Message on WhatsApp</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Consultation Inquiry Form */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0B101E]/82 p-6 md:p-8">
            {submitted ? (
              <div className="py-10 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#34D399]/40 bg-[#34D399]/10 text-[#34D399]">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Inquiry Prepared for Yamini Katara
                </h3>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-300">
                  Thank you, <span className="font-semibold text-white">{name}</span>. Your request regarding <span className="text-[#F5B041]">{topic}</span> is ready. You can also send this directly via email or WhatsApp for immediate scheduling.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`mailto:${CONTACT_DETAILS.email}?subject=${encodeURIComponent(
                      `Portfolio Inquiry: ${topic}`
                    )}&body=${encodeURIComponent(
                      `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`
                    )}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#F5B041] px-5 py-2.5 text-xs font-semibold text-[#04060E] hover:bg-[#F7C266]"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Send via Email Client</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setMessage('');
                    }}
                    className="rounded-lg border border-white/15 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5"
                  >
                    Submit Another Note
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-slate-300 mb-1.5"
                    >
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full rounded-lg border border-white/15 bg-[#04060E] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#F5B041] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-medium text-slate-300 mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-lg border border-white/15 bg-[#04060E] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#F5B041] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-topic"
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    Program or Consulting Focus
                  </label>
                  <select
                    id="contact-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#04060E] px-3.5 py-2.5 text-sm text-white focus:border-[#F5B041] focus:outline-none"
                  >
                    <option value="AI-Powered Digital Marketing Mastery Course">
                      AI-Powered Digital Marketing Mastery Course
                    </option>
                    <option value="Corporate Training & Campus Bootcamps">
                      Corporate Training &amp; Campus Bootcamps
                    </option>
                    <option value="Business Growth & Performance Consulting">
                      Business Growth &amp; Performance Consulting
                    </option>
                    <option value="Freelancing & Career Mentorship">
                      Freelancing &amp; Career Mentorship
                    </option>
                    <option value="Generative AI in Marketing">
                      Generative AI in Marketing
                    </option>
                    <option value="Search Engine Optimization">
                      Search Engine Optimization
                    </option>
                    <option value="Google & Meta Paid Ads">
                      Google &amp; Meta Paid Ads
                    </option>
                    <option value="Social Media & Brand Scaling">
                      Social Media &amp; Brand Scaling
                    </option>
                    <option value="Website Design & CRO">
                      Website Design &amp; CRO
                    </option>
                    <option value="Analytics & Tag Manager">
                      Analytics &amp; Tag Manager
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    Goals, Timeline or Batch Inquiry
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell me about your learning goals, upcoming campus/corporate session, or business growth targets..."
                    className="w-full rounded-lg border border-white/15 bg-[#04060E] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#F5B041] focus:outline-none resize-y"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-xs font-medium text-rose-400">
                    {error}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <p className="text-xs text-slate-400">
                    Direct response from Yamini Katara&apos;s desk in New Delhi.
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#F5B041] px-6 py-2.5 text-sm font-semibold text-[#04060E] hover:bg-[#F7C266] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Send Inquiry</span>
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-white/10 bg-[#04060E]/82">
        <div className="mx-auto max-w-[1280px] px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} Digital Yamini (Yamini Katara). All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#overview" className="hover:text-white transition-colors">
              Overview
            </a>
            <a href="#constellation" className="hover:text-white transition-colors">
              Constellation
            </a>
            <a href="#programs" className="hover:text-white transition-colors">
              Programs
            </a>
            <a
              href={CONTACT_DETAILS.website}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#F5B041] transition-colors"
            >
              digitalyamini.com
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
