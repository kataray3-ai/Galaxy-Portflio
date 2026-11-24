import { useEffect, useState } from 'react';
import { GalaxyBackdrop } from './components/GalaxyBackdrop';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ConstellationSection } from './components/ConstellationSection';
import { ExperienceAndPrograms } from './components/ExperienceAndPrograms';
import { VoicesAndContact } from './components/VoicesAndContact';
import { ProgramModal } from './components/ProgramModal';
import { CosmicSoundToggle } from './components/CosmicSoundToggle';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { cosmicAudio } from './audio/cosmicAudio';
import { ProgramService } from './data/portfolioData';

const MARQUEE_ITEMS = [
  'Generative AI in Marketing',
  'Search Engine Optimization',
  'Google & Meta Ads',
  'WordPress & CRO',
  'GA4 & Tag Manager',
  'Corporate & Campus Training',
  '10,000+ Learners Mentored',
];

export default function App() {
  const [selectedProgram, setSelectedProgram] = useState<ProgramService | null>(null);
  const [inquiryTopic, setInquiryTopic] = useState<string>('');

  useEffect(() => {
    return () => {
      cosmicAudio.dispose();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInquireTopic = (topic: string) => {
    setInquiryTopic(topic);
    scrollToSection('contact');
  };

  return (
    <div className="relative min-h-screen text-[#F8FAFC]">
      {/* Subtle golden top scroll progress indicator */}
      <ScrollProgressBar />

      {/* Fixed interactive Three.js spiral galaxy skyfield */}
      <GalaxyBackdrop />

      {/* 3-Zone Top Navigation Bar */}
      <Navbar onBookClick={() => scrollToSection('contact')} />

      <main className="relative z-10">
        {/* Hero Split + 4-Column Impact Strip */}
        <HeroSection
          onExploreConstellation={() => scrollToSection('constellation')}
          onViewPrograms={() => scrollToSection('programs')}
        />

        {/* Editorial Marquee Section Divider */}
        <div
          aria-hidden="true"
          className="border-y border-white/10 bg-[#0B101E]/75 py-3 overflow-hidden"
        >
          <div className="flex w-max animate-marquee whitespace-nowrap text-xs font-medium tracking-wide text-slate-400">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center">
                {MARQUEE_ITEMS.map((item) => (
                  <span key={`${dup}-${item}`} className="flex items-center">
                    <span className="px-5">{item}</span>
                    <span className="text-[#F5B041]">·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Interactive 3D Skill Constellation Observatory */}
        <ConstellationSection onInquireTopic={handleInquireTopic} />

        {/* Experience Milestones & Programs Bento Grid */}
        <ExperienceAndPrograms onSelectProgram={setSelectedProgram} />

        {/* Verified Testimonials, Contact & Footer */}
        <VoicesAndContact prefilledTopic={inquiryTopic} />
      </main>

      {/* Procedural Cosmic Soundscape Toggle (Sound ON by default) */}
      <CosmicSoundToggle />

      {/* Accessible Program Scope Modal */}
      <ProgramModal
        program={selectedProgram}
        onClose={() => setSelectedProgram(null)}
        onInquire={handleInquireTopic}
      />
    </div>
  );
}
