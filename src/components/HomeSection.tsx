import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Crown, Gem, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { SessionValueSection } from './SessionValueSection.tsx';

interface HomeSectionProps {
  theme: 'dark' | 'light';
  onBookSession: (tierName: string) => void;
  onBookRankerSession: () => void;
  onViewMentors: () => void;
}

const tierPlans = [
  { name: 'Diamond', description: 'All India Rankers 1–100', note: 'Avg marks', stat: '690–715', price: '3,000', discountPrice: '2,799', icon: Gem },
  { name: 'Elite', description: 'All India Rankers 200–1000', note: 'Avg marks', stat: '~658–681', price: '2,700', discountPrice: '2,499', icon: Crown },
  { name: 'Prime', description: 'All India Rankers 1000+', note: 'Avg marks', stat: '650+', price: '2,000', discountPrice: '1,799', icon: Sparkles },
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

export const HomeSection: React.FC<HomeSectionProps> = ({ theme, onBookSession, onBookRankerSession, onViewMentors }) => {
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
          <h1 id="home-title" className="home-intro__title home-intro__title--tagline"><span>The NEET race</span><span>is real.</span></h1>
          <p className="home-intro__identity home-intro__identity--ask">Consult those who cleared</p>
          <div className="home-intro__actions">
            <button className="home-intro__action" type="button" onClick={onBookRankerSession}>Book 1:1 session with a ranker <ArrowUpRight aria-hidden="true" /></button>
            <a className="home-intro__action home-intro__action--primary home-intro__action--assessment" href="#diagnostic">Take assessment <ArrowUpRight aria-hidden="true" /></a>
          </div>
          <p className="home-intro__disclaimer">Approximate 2026 figures. Ratios compare seat counts with registered aspirants, not individual admission odds; seat counts may change during counselling.</p>
          <div className="home-intro__links">
            <a href="#services-title">Explore our services <ArrowUpRight aria-hidden="true" /></a>
            <span aria-hidden="true">|</span>
            <a href="#pricing-title">Convince parents to pay <ArrowUpRight aria-hidden="true" /></a>
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
              </div>
              <button
                type="button"
                className="home-gallery__slide-nav home-gallery__slide-nav--previous"
                onClick={showPreviousImage}
                aria-label="Show previous image"
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                className="home-gallery__slide-nav home-gallery__slide-nav--next"
                onClick={showNextImage}
                aria-label="Show next image"
              >
                <ChevronRight aria-hidden="true" />
              </button>
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

      <section className="home-pricing" aria-labelledby="pricing-title">
        <div className="home-pricing__heading">
          <div>
            <div className="home-eyebrow"><span className="home-eyebrow__mark" />MENTORSHIP / PRICING</div>
            <h2 id="pricing-title" className="home-pricing__title">Mentor tiers</h2>
          </div>
          <span className="home-pricing__index">03 PLANS</span>
        </div>
        <div className="home-pricing__grid">
          {tierPlans.map((tier) => {
            const Icon = tier.icon;
            return (
              <article className={`home-tier-card home-tier-card--${tier.name.toLowerCase()}`} key={tier.name}>
                <div className="home-tier-card__top">
                  <h3>{tier.name}</h3>
                  <span className="home-tier-card__icon"><Icon aria-hidden="true" /></span>
                </div>
                <div className="home-tier-card__details">
                  <p>{tier.description}</p>
                  {tier.note && <div className="home-tier-card__stat"><span>{tier.note}</span><strong>{tier.stat}</strong></div>}
                </div>
                <div className="home-tier-card__price-bar"><strong className="home-tier-card__current-price"><small>₹</small>{tier.price}</strong></div>
                <div className="home-tier-card__actions">
                  <button type="button" className="home-tier-card__discount" onClick={() => openDiscountQuestion(tier)} aria-label={`Want a discount? Solve a question and get it for ₹${tier.discountPrice}`}>
                    Want a discount? <span>Solve a question and get it for ₹{tier.discountPrice}</span>
                  </button>
                  <span className="home-tier-card__action-divider" aria-hidden="true" />
                  <button type="button" onClick={() => setSelectedTier(tier)} aria-label={`Know more about ${tier.name}`}>Know more <ArrowUpRight aria-hidden="true" /></button>
                </div>
              </article>
            );
          })}
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
                <button type="button" className="home-tier-dialog__book" onClick={() => setDiscountTier(null)}>Use ₹{discountTier.discountPrice} price</button>
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
