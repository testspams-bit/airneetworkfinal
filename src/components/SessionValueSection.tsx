import React from 'react';
import { ClipboardList, MessageCircle, UserRound } from 'lucide-react';

interface SessionValueSectionProps {
  theme: 'dark' | 'light';
}

const benefits = [
  {
    icon: MessageCircle,
    title: 'Not another YouTube session',
    description: 'Free YouTube sessions can explain general concepts. They cannot answer what is specific to your preparation; this hour is built around your questions.',
  },
  {
    icon: UserRound,
    title: 'One full hour, one ranker',
    description: 'Choose a topper from last year for direct 1:1 guidance and answers to the questions that matter to you.',
  },
  {
    icon: ClipboardList,
    title: 'Support that stays after the call',
    description: 'Your session is recorded. Take the audio, a transcript, and a customized schedule and planner with you to guide your preparation.',
  },
];

export const SessionValueSection: React.FC<SessionValueSectionProps> = ({ theme }) => (
  <section
    className="session-followthrough"
    data-theme={theme}
    aria-labelledby="session-followthrough-title"
  >
    <div className="session-followthrough__inner">
      <div className="session-followthrough__heading">
        <p className="session-followthrough__eyebrow">PERSONAL GUIDANCE / BUILT AROUND YOU</p>
        <h2 id="session-followthrough-title">One focused hour. A plan that keeps working.</h2>
      </div>
      <div className="session-followthrough__grid">
        {benefits.map(({ icon: Icon, title, description }) => (
          <article key={title} className="session-benefit">
            <span className="session-benefit__icon" aria-hidden="true"><Icon /></span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);
