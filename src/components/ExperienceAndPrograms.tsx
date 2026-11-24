import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import {
  EXPERIENCE_MILESTONES,
  PROGRAMS_SERVICES,
  ProgramService,
} from '../data/portfolioData';

interface ExperienceAndProgramsProps {
  onSelectProgram: (program: ProgramService) => void;
}

const FILTER_OPTIONS: Array<'All Offerings' | ProgramService['category']> = [
  'All Offerings',
  'Training & Courses',
  'Consulting',
  'Mentorship',
];

const FLOAT_STAGGER_CLASSES = [
  'float-stagger-0',
  'float-stagger-1',
  'float-stagger-2',
  'float-stagger-3',
];

export function ExperienceAndPrograms({
  onSelectProgram,
}: ExperienceAndProgramsProps) {
  const [filter, setFilter] = useState<'All Offerings' | ProgramService['category']>(
    'All Offerings'
  );

  const filteredPrograms =
    filter === 'All Offerings'
      ? PROGRAMS_SERVICES
      : PROGRAMS_SERVICES.filter((p) => p.category === filter);

  return (
    <>
      {/* Experience & Institutional Track Record */}
      <section
        id="experience"
        className="mx-auto max-w-[1280px] px-6 py-16 md:py-24 border-t border-white/10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium text-[#F5B041]">
              Experience &amp; Social Impact
            </p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
              From University Auditoriums to High-Growth Campaigns
            </h2>
            <p className="mt-4 text-sm md:text-base leading-relaxed text-slate-300">
              My pedagogy and consulting practice reject hollow textbook theory. Every workshop, cohort, and brand retainer is built around live dashboards, campaign economics, and AI-enabled execution.
            </p>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="font-editorial text-xl italic text-slate-100 leading-relaxed">
                “Empowering learners with industry-ready digital skills while channeling education forward for young girls who need it most.”
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Social Initiative <span aria-hidden="true">·</span> Jai Gulab Baba Trust Education Partnership
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 divide-y divide-white/10 border-y border-white/10">
            {EXPERIENCE_MILESTONES.map((item, idx) => (
              <div
                key={item.id}
                className="py-6 first:pt-2 last:pb-2 grid grid-cols-1 sm:grid-cols-12 gap-4"
              >
                <div className="sm:col-span-4">
                  <p className="font-mono-tabular text-xs text-[#F5B041]">
                    0{idx + 1}. {item.period}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{item.location}</p>
                </div>
                <div className="sm:col-span-8">
                  <h3 className="font-display text-lg font-semibold text-white">
                    {item.role}
                  </h3>
                  <p className="mt-0.5 text-sm font-medium text-[#7DD3FC]">
                    {item.organization}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs, Courses & Consulting Bento Grid */}
      <section
        id="programs"
        className="mx-auto max-w-[1280px] px-6 py-16 md:py-24 border-t border-white/10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-[#F5B041]">
              Courses, Workshops &amp; Advisory
            </p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
              Structured Pathways for Learners &amp; Brands
            </h2>
          </div>

          {/* Interactive Segmented Filter Control */}
          <div
            role="tablist"
            aria-label="Filter programs and services"
            className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-[#0B101E]/82 p-1"
          >
            {FILTER_OPTIONS.map((option) => {
              const active = filter === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(option)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#F5B041] text-[#04060E]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Bento Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrograms.map((program, idx) => (
            <article
              key={program.id}
              onClick={() => onSelectProgram(program)}
              className={`group cursor-pointer rounded-2xl border border-white/10 bg-[#0B101E]/82 p-6 md:p-8 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.75)] transition-colors duration-200 hover:border-[#F5B041]/50 flex flex-col justify-between animate-float-card ${FLOAT_STAGGER_CLASSES[idx % FLOAT_STAGGER_CLASSES.length]} ${
                program.featured && filter === 'All Offerings' ? 'md:col-span-2' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
                  <span>
                    {program.category} <span aria-hidden="true">·</span> {program.duration}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#F5B041] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    Details <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>

                <h3 className="mt-3 font-display text-2xl font-bold text-white group-hover:text-[#F5B041] transition-colors">
                  {program.title}
                </h3>
                <p className="mt-1 text-xs text-[#7DD3FC]">{program.format}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300 max-w-3xl">
                  {program.summary}
                </p>

                <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {program.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2 text-xs md:text-sm text-slate-300"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F5B041]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Click card for full scope &amp; inquiry
                </span>
                <span className="text-xs font-semibold text-white group-hover:text-[#F5B041] transition-colors">
                  Inspect Program
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
