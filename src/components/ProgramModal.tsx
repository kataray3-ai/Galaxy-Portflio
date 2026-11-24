import { useEffect } from 'react';
import { X, ArrowUpRight, Check } from 'lucide-react';
import { ProgramService } from '../data/portfolioData';

interface ProgramModalProps {
  program: ProgramService | null;
  onClose: () => void;
  onInquire: (programTitle: string) => void;
}

export function ProgramModal({ program, onClose, onInquire }: ProgramModalProps) {
  useEffect(() => {
    if (!program) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [program, onClose]);

  if (!program) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="program-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#0B101E] p-6 md:p-8 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#F5B041]">
              {program.category} <span aria-hidden="true">·</span> {program.duration}
            </p>
            <h3
              id="program-modal-title"
              className="mt-2 font-display text-2xl font-bold text-white"
            >
              {program.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-400">{program.format}</p>
        <p className="mt-4 text-sm md:text-base leading-relaxed text-slate-200">
          {program.summary}
        </p>

        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="text-xs font-semibold tracking-wide text-slate-300">
            Program Scope &amp; Deliverables
          </p>
          <ul className="mt-3 space-y-2.5">
            {program.highlights.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F5B041]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors whitespace-nowrap shrink-0"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onInquire(program.title);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#F5B041] px-5 py-2 text-xs font-semibold text-[#04060E] hover:bg-[#F7C266] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Inquire About This Program</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
