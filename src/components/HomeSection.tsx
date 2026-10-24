import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Crown, Gem, Image as ImageIcon, Sparkles, X, Info, ShieldCheck, CheckCircle2, Check } from 'lucide-react';
import { SessionValueSection } from './SessionValueSection.tsx';

interface HomeSectionProps {
  theme: 'dark' | 'light';
  onBookSession: (tierName: string) => void;
  onTakeAssessment: () => void;
  onBookRankerSession: () => void;
  onViewMentors: () => void;
  onOpenSyllabusTracker?: () => void;
}

const tierPlans = [
  {
    name: 'Purple Tier',
    rankSubtitle: 'AIR 1 – 100',
    description: '1-on-1 strategy with Top 100 All India Rankers',
    note: 'Avg score',
    stat: '695–715+',
    originalPrice: '2,200',
    price: '1,999',
    discountPrice: '1,999',
    isOffer: true,
    rightTag: 'Offer: ₹1,999',
    accentStyle: 'purple',
    accentColor: '#c084fc',
    borderColor: '#a855f7',
    icon: Crown,
    features: [
      '1-on-1 Strategy Session with Top 100 Ranker',
      'Negative-Marking & Accuracy Diagnostic Audit',
      'High-Yield Chapter Priority Revision Roadmap',
      'Direct WhatsApp Slot & Schedule Coordination',
    ],
  },
  {
    name: 'Diamond Tier',
    rankSubtitle: 'AIR 100 – 5000',
    description: '1-on-1 strategy with Top Government GMC Rankers',
    note: 'Avg score',
    stat: '640–694',
    originalPrice: null,
    price: '1,499',
    discountPrice: '1,499',
    isOffer: false,
    rightTag: 'Fixed: ₹1,499',
    accentStyle: 'diamond',
    accentColor: '#38bdf8',
    borderColor: '#0284c7',
    icon: Gem,
    features: [
      '1-on-1 Strategy Session with GMC Ranker',
      'Subject-Wise Time Allocation Roadmap',
      'Physics & Chemistry Numerical Bottleneck Fix',
      'Direct WhatsApp Slot & Schedule Coordination',
    ],
  },
];

const neetPyqs = [
  {
    subject: 'Biology',
    year: 'NEET 2022 · Cell Cycle and Cell Division',
    question: 'Which event does not take place during mitosis?',
    options: ['Chromosome condensation', 'Spindle attachment to kinetochores', 'Homologous chromosome pairing', 'Centrioles moving to opposite poles'],
    answer: 2,
    explanation: 'Homologous chromosomes pair during prophase I of meiosis, not mitosis.',
  },
  {
    subject: 'Biology',
    year: 'NEET 2022 · Plant Growth and Development',
    question: 'Which plant hormone promotes female flowers in cucumber?',
    options: ['Cytokinin', 'Abscisic acid', 'Gibberellin', 'Ethylene'],
    answer: 3,
    explanation: 'Ethylene promotes female flower formation in cucurbits such as cucumber.',
  },
  {
    subject: 'Biology',
    year: 'NEET 2022 · Microbes in Human Welfare',
    question: 'Which organism forms nitrogen-fixing root nodules on Alnus?',
    options: ['Beijerinckia', 'Rhizobium', 'Frankia', 'Rhodospirillum'],
    answer: 2,
    explanation: 'Frankia forms nitrogen-fixing nodules on the roots of Alnus.',
  },
  {
    subject: 'Biology',
    year: 'NEET 2023 Manipur · Molecular Basis of Inheritance',
    question: 'Who used ³²P- and ³⁵S-labelled phages to show that DNA is genetic material?',
    options: ['Watson and Crick', 'Hershey and Chase', 'Griffith', 'Avery, MacLeod and McCarty'],
    answer: 1,
    explanation: 'Hershey and Chase used radioactive phosphorus and sulfur to distinguish DNA from protein in bacteriophages.',
  },
  {
    subject: 'Physics',
    year: 'NEET Practice · Electrostatics',
    question: 'A parallel-plate capacitor is charged and then disconnected from the battery. A dielectric of constant K is inserted fully between its plates. What happens to its electrostatic energy?',
    options: ['It becomes K times larger', 'It becomes 1/K of its initial value', 'It remains unchanged', 'It becomes K² times larger'],
    answer: 1,
    explanation: 'With the battery disconnected, charge stays constant. Inserting the dielectric increases capacitance to KC, so U = Q²/(2C) falls to 1/K of its initial value.',
  },
  {
    subject: 'Physics',
    year: 'NEET Practice · Current Electricity',
    question: 'A 2 Ω resistor and a 4 Ω resistor are connected in parallel across a 12 V battery. What is the current through the 4 Ω resistor?',
    options: ['1.5 A', '2 A', '3 A', '6 A'],
    answer: 2,
    explanation: 'Parallel branches have the same potential difference. The current through the 4 Ω resistor is I = V/R = 12/4 = 3 A.',
  },
  {
    subject: 'Physics',
    year: 'NEET Practice · Dual Nature of Matter',
    question: 'An electron is accelerated from rest through a potential difference V. If the potential difference is increased to 4V, how does its de Broglie wavelength change?',
    options: ['It doubles', 'It becomes half', 'It becomes four times', 'It stays the same'],
    answer: 1,
    explanation: 'For a non-relativistic particle accelerated through V, λ is proportional to 1/√V. Quadrupling V halves the wavelength.',
  },
  {
    subject: 'Chemistry',
    year: 'NEET Practice · Equilibrium',
    question: 'What is the pH of a 1.0 × 10⁻³ mol L⁻¹ HCl solution at 25 °C?',
    options: ['1', '2', '3', '11'],
    answer: 2,
    explanation: 'HCl is a strong acid, so [H⁺] = 1.0 × 10⁻³ mol L⁻¹ and pH = −log[H⁺] = 3.',
  },
  {
    subject: 'Chemistry',
    year: 'NEET Practice · Chemical Bonding',
    question: 'What is the hybridisation of sulphur in SF₆?',
    options: ['sp³', 'sp³d', 'sp³d²', 'dsp²'],
    answer: 2,
    explanation: 'Sulphur forms six equivalent bonds in octahedral SF₆; in the conventional hybridisation model this is sp³d².',
  },
  {
    subject: 'Chemistry',
    year: 'NEET Practice · Organic Chemistry',
    question: 'What is the IUPAC name of CH₃CH₂OH?',
    options: ['Methanol', 'Ethanol', 'Propanol', 'Ethanal'],
    answer: 1,
    explanation: 'The molecule has a two-carbon chain and a hydroxyl group, so its IUPAC name is ethanol.',
  },
];

const questionSubjects = ['Physics', 'Chemistry', 'Biology'] as const;
type QuestionSubject = (typeof questionSubjects)[number];

const imageCards = [{ id: '01' }, { id: '02' }, { id: '03' }, { id: '04' }, { id: '05' }];

const competitionStats = [
  { value: '1.4', unit: 'lakh', label: 'MBBS seats across India' },
  { value: '63', unit: 'thousand', label: 'MBBS seats in government colleges', ratio: '0.027' },
  { value: '2,257', unit: 'AIIMS seats', label: '', ratio: '0.00099' },
];

const services = [
  { title: 'Personal one-time session', note: 'Meet 1:1 with a ranker. Bring your own doubts and get personal answers, not generic advice.' },
  { title: 'MBBS abroad counselling', note: 'Get guidance, honest reviews from current students, and support with licensing exams such as USMLE.' },
  { title: 'Question a day & student resources', note: 'Daily NEET questions, the largest NEET-relevant question bank, peer performance tracking, blogs on branches and colleges, coaching and material reviews, plus a free time-management tool.' },
  { title: 'Full mentorship batches', note: 'Year-round guidance in focused groups of 25 students, starting at ₹12,000.' },
];

export const HomeSection: React.FC<HomeSectionProps> = ({
  theme,
  onBookSession,
  onTakeAssessment,
  onBookRankerSession,
  onViewMentors,
  onOpenSyllabusTracker,
}) => {
  const isDark = theme === 'dark';
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedTier, setSelectedTier] = useState<(typeof tierPlans)[number] | null>(null);
  const [discountTier, setDiscountTier] = useState<(typeof tierPlans)[number] | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number | null>(null);
  const [questionSubject, setQuestionSubject] = useState<QuestionSubject>('Biology');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [discountAttemptsByTier, setDiscountAttemptsByTier] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('airneet-discount-attempts') ?? '{}') as Record<string, number>;
    } catch {
      return {};
    }
  });
  const [unlockedTiers, setUnlockedTiers] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('airneet-unlocked-tiers') ?? '[]') as string[];
    } catch {
      return [];
    }
  });
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const activeImage = imageCards[activeImageIndex];

  useEffect(() => {
    if (isSlideshowPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % imageCards.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isSlideshowPaused]);

  const showPreviousImage = () => {
    setActiveImageIndex((current) => (current - 1 + imageCards.length) % imageCards.length);
  };

  const showNextImage = () => {
    setActiveImageIndex((current) => (current + 1) % imageCards.length);
  };

  const toggleSlideshow = () => setIsSlideshowPaused((paused) => !paused);

  useEffect(() => {
    if (!selectedTier && !discountTier) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedTier(null);
        setDiscountTier(null);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedTier, discountTier]);

  const getRandomQuestion = (subject: QuestionSubject, previousIndex: number | null = questionIndex) => {
    const candidates = neetPyqs
      .map((question, index) => ({ question, index }))
      .filter(({ question }) => question.subject === subject);
    const fresh = candidates.filter(({ index }) => index !== previousIndex);
    const pool = fresh.length > 0 ? fresh : candidates;
    if (pool.length > 0) setQuestionIndex(pool[Math.floor(Math.random() * pool.length)].index);
    setSelectedAnswer(null);
    setAnswerChecked(false);
  };

  const openDiscountQuestion = (tier: (typeof tierPlans)[number]) => {
    setDiscountTier(tier);
    setQuestionSubject('Biology');
    getRandomQuestion('Biology', null);
  };

  const changeQuestionSubject = (subject: QuestionSubject) => {
    setQuestionSubject(subject);
    getRandomQuestion(subject);
  };

  const activeQuestion = questionIndex === null ? null : neetPyqs[questionIndex];
  const currentAttempts = discountTier ? discountAttemptsByTier[discountTier.name] ?? 0 : 0;
  const isDiscountUnlocked = discountTier ? unlockedTiers.includes(discountTier.name) : false;
  useEffect(() => {
    try {
      sessionStorage.setItem('airneet-discount-attempts', JSON.stringify(discountAttemptsByTier));
    } catch {
      // The attempt limit still works for this page if browser storage is unavailable.
    }
  }, [discountAttemptsByTier]);

  useEffect(() => {
    try {
      sessionStorage.setItem('airneet-unlocked-tiers', JSON.stringify(unlockedTiers));
    } catch {
      // The unlocked offer still works for this page if browser storage is unavailable.
    }
  }, [unlockedTiers]);

  const checkDiscountAnswer = () => {
    if (!activeQuestion || !discountTier || currentAttempts >= 3) return;
    const nextAttempt = currentAttempts + 1;
    setDiscountAttemptsByTier((current) => ({ ...current, [discountTier.name]: nextAttempt }));
    if (selectedAnswer === activeQuestion.answer) {
      const tierName = discountTier.name;
      setUnlockedTiers((current) => current.includes(tierName) ? current : [...current, tierName]);
    }
    setAnswerChecked(true);
  };

  return (
    <div className={`home-content ${isDark ? 'home-content--dark' : 'home-content--light'}`}>
      <section className="home-intro" aria-labelledby="home-title">
        <div className="home-intro__copy">
          <h1 id="home-title" className="home-intro__title home-intro__title--tagline"><span>The NEET race</span><span>is real.</span></h1>
          <p className="home-intro__identity home-intro__identity--ask">Consult those who cleared</p>
          <div className="home-intro__aspirants">
            <span><strong>22.79</strong> <span className="home-intro__unit">Lakh Aspirants</span></span>
          </div>
          <div className="home-intro__stats home-intro__stats--editorial" aria-label="NEET UG and MBBS seat figures">
            {competitionStats.map((stat) => (
              <div className="home-intro__stat" key={stat.label}>
                <div className="home-intro__stat-copy"><div className="home-intro__stat-value"><strong>{stat.value}</strong><span>{stat.unit}</span></div>{stat.label && <span>{stat.label}</span>}</div>
                {stat.ratio && <span className="home-intro__ratio"><strong>{stat.ratio}</strong><span>selection ratio</span></span>}
              </div>
            ))}
          </div>
          <div className="home-intro__actions">
            <button
              className="home-intro__action cursor-pointer"
              type="button"
              onClick={() => {
                const el = document.getElementById('pricing-title');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onBookRankerSession();
              }}
            >
              Book 1:1 session with a ranker <ArrowUpRight aria-hidden="true" />
            </button>
            <button
              className="home-intro__action home-intro__action--primary home-intro__action--assessment cursor-pointer"
              type="button"
              onClick={onTakeAssessment}
            >
              Take assessment <ArrowUpRight aria-hidden="true" />
            </button>
          </div>
          <p className="home-intro__disclaimer">Approximate 2026 figures. Ratios compare seat counts with registered aspirants, not individual admission odds; seat counts may change during counselling.</p>
          <div className="home-intro__links">
            <a href="#services-title">Explore our services <ArrowUpRight aria-hidden="true" /></a>
            <span aria-hidden="true">|</span>
            <a href="#pricing-title">Convince me to pay <ArrowUpRight aria-hidden="true" /></a>
          </div>
        </div>

        <div
          className="home-gallery"
          role="region"
          aria-roledescription="carousel"
          aria-label="Image slideshow"
          data-slideshow-paused={isSlideshowPaused}
        >
          <div className="home-gallery__stage" aria-live="off">
            <div
              className="home-gallery__slide"
              key={activeImage.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`Image ${activeImageIndex + 1} of ${imageCards.length}`}
            >
              <div
                className="home-image-card"
                data-testid={`placeholder-image-${activeImage.id}`}
                role="button"
                tabIndex={0}
                aria-label={`${isSlideshowPaused ? 'Play' : 'Pause'} slideshow`}
                aria-pressed={isSlideshowPaused}
                title={`${isSlideshowPaused ? 'Play' : 'Pause'} slideshow`}
                onClick={toggleSlideshow}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleSlideshow();
                  }
                }}
              >
                <div className="home-image-card__frame">
                  <ImageIcon aria-hidden="true" className="home-image-card__icon" />
                  <span className="home-image-card__corner" />
                </div>

                {/* Navigation arrows placed directly on the card */}
                <button
                  type="button"
                  className="home-image-card__nav home-image-card__nav--previous"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPreviousImage();
                  }}
                  aria-label="Show previous image"
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="home-image-card__nav home-image-card__nav--next"
                  onClick={(e) => {
                    e.stopPropagation();
                    showNextImage();
                  }}
                  aria-label="Show next image"
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <div className="home-gallery__controls" role="group" aria-label="Slideshow controls">
            <div className="home-gallery__dots" role="group" aria-label="Choose an image">
              {imageCards.map((card, index) => (
                <button
                  key={card.id}
                  type="button"
                  className="home-gallery__dot"
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={activeImageIndex === index}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-pricing py-12 border-t border-[var(--home-line)]" aria-labelledby="pricing-title">
        <div className="flex flex-col items-center justify-center text-center mb-8 sm:mb-10">
          <div className="home-eyebrow flex items-center justify-center gap-2 mb-2">
            <span className="home-eyebrow__mark" />
            MENTORSHIP / PRICING
          </div>
          <h2
            id="pricing-title"
            className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2 ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}
          >
            Mentor tiers
          </h2>
          <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
            02 PLANS · 1-ON-1 TOPPER STRATEGY SESSIONS
          </span>
        </div>

        {/* Outer wrapper: keeps both the two cards and the disclaimer note in the exact same width bounds so their borders align */}
        <div className="max-w-[780px] mx-auto w-full px-3 sm:px-0">
          {/* Two cards start from the middle of the page to the left and right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch w-full">
            {tierPlans.map((tier) => {
              const Icon = tier.icon;
              const isCardPurple = tier.accentStyle === 'purple';
              return (
                <article
                  className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 flex flex-col justify-between cursor-pointer hover:scale-[1.015] min-h-[520px] sm:min-h-[550px] ${
                    isCardPurple
                      ? isDark
                        ? 'bg-gradient-to-b from-[#280c48] via-[#18072e] to-[#0e041a] border-purple-500/50 shadow-[0_12px_40px_rgba(168,85,247,0.22)] hover:border-purple-400'
                        : 'bg-gradient-to-b from-purple-100/95 via-purple-50/70 to-white border-purple-300 shadow-xl hover:border-purple-400'
                      : isDark
                      ? 'bg-gradient-to-b from-[#0b2b4e] via-[#06182e] to-[#030d1a] border-sky-500/50 shadow-[0_12px_40px_rgba(14,165,233,0.22)] hover:border-sky-400'
                      : 'bg-gradient-to-b from-sky-100/95 via-sky-50/70 to-white border-sky-300 shadow-xl hover:border-sky-400'
                  }`}
                  key={tier.name}
                  onClick={() => onBookSession(tier.name)}
                >
                  <div className="flex flex-col flex-1">
                    {/* Top Row: Icon Badge & Right Tag */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner shrink-0"
                        style={{
                          borderColor: `${tier.borderColor}60`,
                          color: tier.accentColor,
                          backgroundColor: isDark ? `${tier.borderColor}20` : `${tier.borderColor}15`,
                        }}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>

                      <span
                        className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm"
                        style={{
                          borderColor: `${tier.borderColor}70`,
                          color: tier.accentColor,
                          backgroundColor: isDark ? `${tier.borderColor}25` : `${tier.borderColor}15`,
                        }}
                      >
                        {tier.rightTag}
                      </span>
                    </div>

                    {/* Tier Name & Rank Subtitle */}
                    <div className="mb-3">
                      <h3
                        className={`text-2xl sm:text-3xl font-extrabold uppercase tracking-tight ${
                          isDark ? 'text-white' : 'text-zinc-900'
                        }`}
                      >
                        {tier.name}
                      </h3>
                      <div
                        className="text-xs font-mono font-bold tracking-wider mt-1 uppercase"
                        style={{ color: tier.accentColor }}
                      >
                        {tier.rankSubtitle}
                      </div>
                      <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {tier.description}
                      </p>
                    </div>

                    {/* Score Benchmark Callout */}
                    <div
                      className="p-3 rounded-xl border flex items-center justify-between text-xs font-mono mb-4"
                      style={{
                        borderColor: isDark ? `${tier.borderColor}30` : `${tier.borderColor}40`,
                        backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>{tier.note}:</span>
                      <strong className="text-sm font-bold tracking-wide" style={{ color: tier.accentColor }}>
                        {tier.stat}
                      </strong>
                    </div>

                    {/* Elongated feature bullets */}
                    <div className="space-y-2.5 mb-5 flex-1">
                      {tier.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <CheckCircle2
                            className="w-4 h-4 shrink-0 mt-0.5"
                            style={{ color: tier.accentColor }}
                          />
                          <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Area */}
                  <div className="space-y-3 pt-3 border-t border-white/10 mt-auto">
                    {/* Side-by-side row: Smaller Price button on the left, Book Now button to the right */}
                    <div className="flex items-center gap-2.5">
                      {/* Smaller Price Button on the Left */}
                      <div
                        className="py-1.5 px-3 rounded-xl border flex flex-col items-center justify-center shrink-0 min-w-[95px] text-center"
                        style={{
                          borderColor: isCardPurple ? 'rgba(192, 132, 252, 0.6)' : 'rgba(56, 189, 248, 0.6)',
                          backgroundColor: isDark
                            ? isCardPurple
                              ? 'rgba(168, 85, 247, 0.2)'
                              : 'rgba(14, 165, 233, 0.2)'
                            : isCardPurple
                            ? 'rgba(233, 213, 255, 0.8)'
                            : 'rgba(224, 242, 254, 0.8)',
                        }}
                      >
                        {tier.originalPrice ? (
                          <div className="flex items-baseline gap-1 leading-none">
                            <span className="text-[10px] line-through font-mono opacity-65 text-purple-200">
                              ₹{tier.originalPrice}
                            </span>
                            <span className="text-sm sm:text-base font-extrabold font-mono text-purple-100">
                              ₹{tier.price}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm sm:text-base font-extrabold font-mono text-sky-100 leading-none">
                            ₹{tier.price}
                          </span>
                        )}
                        <span className="text-[9px] font-mono tracking-tight mt-0.5 text-zinc-300">
                          {tier.isOffer ? 'Offer Price' : 'Session Fee'}
                        </span>
                      </div>

                      {/* Book Now Button to the Right of Price button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookSession(tier.name);
                        }}
                        className="flex-1 py-1.5 px-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center shadow-sm active:scale-95"
                        style={{
                          borderColor: isCardPurple ? '#c084fc' : '#38bdf8',
                          backgroundColor: isDark
                            ? isCardPurple
                              ? 'rgba(147, 51, 234, 0.35)'
                              : 'rgba(2, 132, 199, 0.35)'
                            : isCardPurple
                            ? '#f3e8ff'
                            : '#e0f2fe',
                          color: isDark ? '#ffffff' : '#0f172a',
                        }}
                        aria-label={`Book ${tier.name} slot now for ₹1 token`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 leading-tight">
                          <span>Book Now</span>
                          <ArrowUpRight className="w-3.5 h-3.5" style={{ color: tier.accentColor }} />
                        </span>
                        <span
                          className="text-[10px] font-mono tracking-tight"
                          style={{ color: tier.accentColor }}
                        >
                          Request slot at rupee one
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDiscountQuestion(tier);
                        }}
                        className={`text-[11px] font-mono transition-colors cursor-pointer ${
                          isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        Solve NEET PYQ Question
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTier(tier);
                        }}
                        className={`text-[11px] font-mono font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                          isDark ? 'text-white' : 'text-zinc-900'
                        }`}
                      >
                        <span>Know more</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Disclaimer below the rate cards in grey - ends where the cards end */}
          <div
            className={`mt-5 p-4 sm:p-5 rounded-2xl border text-xs leading-relaxed w-full transition-all ${
              isDark
                ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400'
                : 'bg-slate-100/80 border-slate-300 text-slate-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Disclaimer & Advisory Note
                </span>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  We recommend taking our diagnostic assessment first rather than picking a mentor solely based on their All India Rank.
                  A mentor who mastered the exact negative-mark leakage or physics numerical bottlenecks you face provides more score acceleration
                  than general high rankers. Token ₹1 reserves and prioritizes your 1-on-1 strategy call; timing is coordinated directly on WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedTier && (
        <div className="home-tier-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedTier(null); }}>
          <section className={`home-tier-dialog home-tier-card--${selectedTier.name.toLowerCase()}`} role="dialog" aria-modal="true" aria-labelledby="tier-dialog-title">
            <button className="home-tier-dialog__close" type="button" onClick={() => setSelectedTier(null)} aria-label="Close tier details" autoFocus><X aria-hidden="true" /></button>
            <div className="home-tier-dialog__icon">{React.createElement(selectedTier.icon, { 'aria-hidden': true })}</div>
            <div className="home-tier-dialog__eyebrow">MENTORSHIP TIER</div>
            <h2 id="tier-dialog-title">{selectedTier.name}</h2>
            <p className="home-tier-dialog__description">{selectedTier.description}</p>
            {selectedTier.note && <p className="home-tier-dialog__stat">{selectedTier.note} <strong>{selectedTier.stat}</strong></p>}
            <div className="home-tier-card__price-bar"><strong><small>₹</small>{selectedTier.price}</strong></div>
            <div className="home-tier-dialog__actions">
              <button type="button" className="home-tier-dialog__book" onClick={() => { const name = selectedTier.name; setSelectedTier(null); onBookSession(name); }}>Book a session</button>
              <button type="button" className="home-tier-dialog__mentors" onClick={() => { setSelectedTier(null); onViewMentors(); }}>Know the mentors <ArrowUpRight aria-hidden="true" /></button>
            </div>
          </section>
        </div>
      )}

      {discountTier && activeQuestion && (
        <div className="home-tier-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDiscountTier(null); }}>
          <section className={`home-tier-dialog home-discount-dialog home-tier-card--${discountTier.name.toLowerCase()}`} role="dialog" aria-modal="true" aria-labelledby="discount-dialog-title">
            <button className="home-tier-dialog__close" type="button" onClick={() => setDiscountTier(null)} aria-label="Close discount question"><X aria-hidden="true" /></button>
            <div className="home-tier-dialog__eyebrow">NEET PYQ · {discountTier.name.toUpperCase()} OFFER</div>
            <h2 id="discount-dialog-title" className="home-discount-dialog__offer-title">{isDiscountUnlocked ? 'Your discount is unlocked' : 'Solve a question and get it for'}</h2>
            <div className="home-discount-dialog__offer">₹{discountTier.discountPrice}</div>
            {isDiscountUnlocked ? (
              <div className="home-discount-dialog__success-price" aria-label={`Regular price ₹${discountTier.price}, discounted price ₹${discountTier.discountPrice}`}>
                <span className="home-tier-card__original-price">₹{discountTier.price}</span>
                <strong className="home-tier-card__discounted-price">₹{discountTier.discountPrice}</strong>
              </div>
            ) : (
              <>
                <p className="home-discount-dialog__hint">{currentAttempts === 0 ? '3 chances to answer correctly' : `${3 - currentAttempts} ${3 - currentAttempts === 1 ? 'chance' : 'chances'} left`}</p>
                <div className="home-discount-dialog__subjects" role="tablist" aria-label="Choose a question subject">
                  {questionSubjects.map((subject) => (
                    <button key={subject} type="button" role="tab" aria-selected={questionSubject === subject} className={questionSubject === subject ? 'is-active' : ''} onClick={() => changeQuestionSubject(subject)}>{subject}</button>
                  ))}
                </div>
                <p className="home-discount-dialog__year">{activeQuestion.year}</p>
                <p className="home-discount-dialog__question">{activeQuestion.question}</p>
                <div className="home-discount-dialog__options" role="group" aria-label="Answer options">
                  {activeQuestion.options.map((option, index) => (
                    <button key={option} type="button" disabled={currentAttempts >= 3} aria-pressed={selectedAnswer === index} className={selectedAnswer === index ? 'is-selected' : ''} onClick={() => { if (!answerChecked && currentAttempts < 3) setSelectedAnswer(index); }}>
                      <span>{String.fromCharCode(65 + index)}</span>{option}
                    </button>
                  ))}
                </div>
              </>
            )}
            {answerChecked && !isDiscountUnlocked && (
              <div className={`home-discount-dialog__feedback ${selectedAnswer === activeQuestion.answer ? 'is-correct' : 'is-incorrect'}`} role="status">
                <strong>Not quite{3 - currentAttempts > 0 ? ` — ${3 - currentAttempts} ${3 - currentAttempts === 1 ? 'chance' : 'chances'} left.` : ' — no chances left.'}</strong>
                <span>{activeQuestion.explanation}</span>
              </div>
            )}
            <div className="home-discount-dialog__actions">
              {isDiscountUnlocked ? (
                <button type="button" className="home-tier-dialog__book" onClick={() => { const t = discountTier.name; setDiscountTier(null); onBookSession(t); }}>Book with ₹{discountTier.discountPrice} Discount</button>
              ) : currentAttempts >= 3 ? (
                <button type="button" className="home-tier-dialog__book" onClick={() => setDiscountTier(null)}>Close</button>
              ) : !answerChecked ? (
                <button type="button" className="home-tier-dialog__book" disabled={selectedAnswer === null} onClick={checkDiscountAnswer}>Check answer</button>
              ) : (
                <button type="button" className="home-tier-dialog__book" onClick={() => getRandomQuestion(questionSubject)}>Try again</button>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ================= SECTION: WHY US (US VS COMPETITORS) ================= */}
      <section className="home-why-us py-14 sm:py-16 border-t border-[var(--home-line)]" aria-labelledby="why-us-title">
        <div className="flex flex-col items-center justify-center text-center mb-8 sm:mb-12">
          <div className="home-eyebrow flex items-center justify-center gap-2 mb-2">
            <span className="home-eyebrow__mark" />
            THE AIR ADVANTAGE / COMPARISON
          </div>
          <h2
            id="why-us-title"
            className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2 ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}
          >
            Why Us
          </h2>
          <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
            AIR NEETWORK TOPPERS VS TRADITIONAL COACHING & AGGREGATORS
          </span>
        </div>

        {/* Comparison Cards Grid: Left = US CARD, Right = COMPETITORS CARD */}
        <div className="max-w-[1040px] mx-auto w-full px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* LEFT CARD: US CARD (AIR NEETwork) */}
            <div
              className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between ${
                isDark
                  ? 'bg-gradient-to-b from-[#0a1e3b] via-[#071428] to-[#040b17] border-blue-500/60 shadow-[0_16px_50px_rgba(59,130,246,0.22)]'
                  : 'bg-gradient-to-b from-blue-50/95 via-sky-50/70 to-white border-blue-300 shadow-xl'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                      isDark
                        ? 'bg-blue-500/20 text-[#60A5FA] border-blue-400/40'
                        : 'bg-blue-100 text-[#0066FF] border-blue-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AIR NEETwork (Us)</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    ✓ Verified 1-on-1
                  </span>
                </div>

                <h3 className={`text-xl sm:text-2xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Direct Mentoring by Real Top Rankers
                </h3>
                <p className={`text-xs sm:text-sm mb-6 leading-relaxed ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                  Personal strategy calls with medical students who cleared NEET UG with top All India Ranks.
                </p>

                {/* Advantage Items List */}
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <strong className={`block text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Top 100 & GMC MBBS Rankers
                      </strong>
                      <span className={`text-xs leading-relaxed block mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        Talk directly to rankers from AIIMS New Delhi, MAMC, KGMU with verified 680–715+ scores.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <strong className={`block text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Negative-Marking & Accuracy Audits
                      </strong>
                      <span className={`text-xs leading-relaxed block mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        Detailed diagnostic review of your mocks to plug 30–50 marks in silly calculation traps.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <strong className={`block text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Direct WhatsApp Coordination
                      </strong>
                      <span className={`text-xs leading-relaxed block mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        Direct time slot coordination with your mentor; no support ticket queues or sales bots.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <strong className={`block text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Token ₹1 Slot Request & Direct Honorarium
                      </strong>
                      <span className={`text-xs leading-relaxed block mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        Transparent fixed honorarium directly supporting your MBBS ranker mentor without commissions.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <strong className={`block text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Personalized Weak-Chapter Plan
                      </strong>
                      <span className={`text-xs leading-relaxed block mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        Tailored timetable adjusted to your school/coaching load rather than pre-baked generic batches.
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Bottom Card Footer Banner */}
              <div
                className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-mono font-bold ${
                  isDark ? 'border-blue-500/30 text-blue-300' : 'border-blue-200 text-blue-900'
                }`}
              >
                <span>Result: Real score improvement</span>
                <span className="text-emerald-400">100% Genuine</span>
              </div>
            </div>

            {/* RIGHT CARD: OUR COMPETITORS CARD */}
            <div
              className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between ${
                isDark
                  ? 'bg-gradient-to-b from-[#181114] via-[#120d0f] to-[#0a0708] border-zinc-800 text-zinc-300 shadow-lg'
                  : 'bg-gradient-to-b from-rose-50/50 via-slate-50/60 to-white border-slate-300 text-slate-700 shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                      isDark
                        ? 'bg-red-500/10 text-rose-400 border-red-500/30'
                        : 'bg-rose-100 text-rose-700 border-rose-300'
                    }`}
                  >
                    <X className="w-3.5 h-3.5 text-rose-500" />
                    <span>Our Competitors</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                    ✕ Traditional Coaching
                  </span>
                </div>

                <h3 className={`text-xl sm:text-2xl font-black tracking-tight mb-2 ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>
                  Mass Batches & Generic Telesales
                </h3>
                <p className={`text-xs sm:text-sm mb-6 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Commercial coaching institutes and aggregators driven by volume sales and pre-recorded dumps.
                </p>

                {/* Competitor Pitfalls List */}
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <div>
                      <strong className={`block text-xs sm:text-sm font-bold ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>
                        Telecallers & Non-Medicos as &apos;Mentors&apos;
                      </strong>
                      <span className={`text-xs leading-relaxed block mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                        Guidance given by sales counselors who never took NEET UG or experienced the exam pressure.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <div>
                      <strong className={`block text-xs sm:text-sm font-bold ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>
                        Crowded 100+ Student Doubt Classes
                      </strong>
                      <span className={`text-xs leading-relaxed block mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                        Questions drown in fast-moving live chats; zero individualized error audit for your mistakes.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <div>
                      <strong className={`block text-xs sm:text-sm font-bold ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>
                        Customer Care Ticket Gatekeeping
                      </strong>
                      <span className={`text-xs leading-relaxed block mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                        No direct access to faculty; waiting 48–72 hours for canned responses through automated portals.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <div>
                      <strong className={`block text-xs sm:text-sm font-bold ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>
                        Expensive Annual Lock-ins (₹30,000–₹1,50,000+)
                      </strong>
                      <span className={`text-xs leading-relaxed block mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                        Heavy upfront non-refundable charges with massive marketing overheads baked into the package.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <div>
                      <strong className={`block text-xs sm:text-sm font-bold ${isDark ? 'text-zinc-300' : 'text-slate-800'}`}>
                        Billboard Rankers You Never Speak To
                      </strong>
                      <span className={`text-xs leading-relaxed block mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                        Toppers used strictly on promotional posters who have zero interaction with enrolled students.
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Bottom Card Footer Banner */}
              <div
                className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-mono ${
                  isDark ? 'border-zinc-800 text-zinc-500' : 'border-slate-200 text-slate-500'
                }`}
              >
                <span>Format: Commercial mass coaching</span>
                <span className="text-rose-400">High marketing markup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION: FREE NEET SYLLABUS TRACKER (INSPIRED BY MARKS MATHONGO) ================= */}
      <section className="py-12 border-t border-[var(--home-line)]" aria-labelledby="syllabus-tracker-banner">
        <div className="max-w-[1040px] mx-auto w-full px-4 sm:px-6">
          <div
            className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 border transition-all duration-300 shadow-xl ${
              isDark
                ? 'bg-gradient-to-r from-blue-950/40 via-zinc-900 to-emerald-950/30 border-blue-500/30 shadow-blue-950/20'
                : 'bg-gradient-to-r from-blue-50/80 via-white to-emerald-50/60 border-blue-200 shadow-blue-100/50'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    Free with Student Account
                  </span>
                  <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                    isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-300' : 'border-slate-300 bg-slate-100 text-slate-700'
                  }`}>
                    Inspired by Marks MathonGo
                  </span>
                </div>

                <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-sans ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  NEET UG <span className="text-[#3B82F6]">Syllabus Tracker</span>
                </h3>

                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Track chapter-wise weightage (Block A/B/C), NCERT line-by-line reading, PYQs practiced (2019–2024), and Rev 1 & 2 cycles for Physics, Chemistry & Biology. Included free for registered students with personalized cloud sync and projected score calculator.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 65 Chapters
                  </span>
                  <span className="flex items-center gap-1 text-orange-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> High-Yield Weightage
                  </span>
                  <span className="flex items-center gap-1 text-blue-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> NCERT Checklist
                  </span>
                  <span className="flex items-center gap-1 text-purple-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PYQ Counts
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
                {onOpenSyllabusTracker && (
                  <button
                    type="button"
                    onClick={onOpenSyllabusTracker}
                    className="px-6 py-3 rounded-2xl text-xs font-bold font-mono uppercase tracking-wider bg-[#3B82F6] hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Open Syllabus Tracker</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
                <span className="text-[11px] font-mono text-zinc-400 text-center">
                  Sign in or register to track
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-services" aria-labelledby="services-title">
        <div className="home-services__left">
          <div className="home-services__heading">
            <div>
              <div className="home-eyebrow">
                <span className="home-eyebrow__mark" />
                MENTORSHIP / ACADEMIC SUPPORT
              </div>
              <h2 id="services-title" className="home-services__title">Services</h2>
            </div>
            <span className="home-services__index">NEET SUPPORT</span>
          </div>
          <div className="home-service-grid">
            {services.map((service) => (
              <article className="home-service-card" key={service.title}>
                <div className="home-service-card__top">
                  <ArrowUpRight aria-hidden="true" className="home-service-card__arrow" />
                </div>
                <div className="home-service-card__content">
                  <h3 className="home-service-card__label">{service.title}</h3>
                  <p className="home-service-card__note">{service.note}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <SessionValueSection theme={theme} />
    </div>
  );
};
