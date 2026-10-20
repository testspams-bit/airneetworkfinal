import { motion, type Variants } from 'motion/react';
import { Phone, Mail, Play } from 'lucide-react';

interface AboutSectionProps {
  theme: 'dark' | 'light';
}

export const AboutSection: React.FC<AboutSectionProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid flex-1 items-center gap-10 py-12 md:grid-cols-2 md:gap-14 md:py-16"
      aria-labelledby="about-title"
    >
      <div className="max-w-xl">
        {/* Title in air.neetwork font and Sentence Case */}
        <motion.h1
          id="about-title"
          variants={itemVariants}
          className={`about-title-font mb-6 text-4xl sm:text-6xl font-black tracking-tight leading-none ${
            isDark ? 'text-zinc-300' : 'text-slate-800'
          }`}
        >
          About us
        </motion.h1>

        {/* Shortened essential text in a refined grey shade */}
        <motion.div
          variants={itemVariants}
          className={`about-copy-font space-y-4 text-base leading-relaxed sm:text-lg ${
            isDark ? 'text-zinc-400' : 'text-slate-600'
          }`}
        >
          <p>
            We started air.neetwork to connect students directly with All India Rankers who have already walked this path.
          </p>
          <p>
            Having prepared through lockdown uncertainty firsthand, we know how much practical, personal guidance matters. We keep our mentorship honest, focused, and worth your investment.
          </p>
          <p className={`font-medium ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
            Still unsure? You can speak directly with our co-founder.
          </p>
        </motion.div>

        {/* Two Options: Call or Gmail */}
        <motion.div variants={itemVariants} className="mt-8">
          <p
            className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 ${
              isDark ? 'text-zinc-400' : 'text-slate-500'
            }`}
          >
            Talk to co-founder
          </p>
          <div className="flex items-center gap-3">
            {/* Option 1: Call */}
            <a
              href="tel:+919876543210"
              title="Call co-founder"
              aria-label="Call co-founder"
              className={`group grid h-12 w-12 place-items-center rounded-2xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-xs ${
                isDark
                  ? 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-200'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm'
              }`}
            >
              <div
                className={`grid h-9 w-9 place-items-center rounded-xl transition-all duration-200 ${
                  isDark
                    ? 'bg-[#CCFF00]/15 text-[#CCFF00] group-hover:bg-[#CCFF00] group-hover:text-black'
                    : 'bg-[#0066FF]/10 text-[#0066FF] group-hover:bg-[#0066FF] group-hover:text-white'
                }`}
              >
                <Phone className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              </div>
            </a>

            {/* Option 2: Gmail */}
            <a
              href="mailto:csebks@gmail.com"
              title="Email co-founder via Gmail"
              aria-label="Email co-founder via Gmail"
              className={`group grid h-12 w-12 place-items-center rounded-2xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-xs ${
                isDark
                  ? 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-200'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm'
              }`}
            >
              <div
                className={`grid h-9 w-9 place-items-center rounded-xl transition-all duration-200 ${
                  isDark
                    ? 'bg-[#CCFF00]/15 text-[#CCFF00] group-hover:bg-[#CCFF00] group-hover:text-black'
                    : 'bg-[#0066FF]/10 text-[#0066FF] group-hover:bg-[#0066FF] group-hover:text-white'
                }`}
              >
                <Mail className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              </div>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Vision Video Card */}
      <motion.div variants={itemVariants}>
        <h2
          className={`mb-3 text-xs font-semibold uppercase tracking-[0.22em] ${
            isDark ? 'text-zinc-400' : 'text-slate-500'
          }`}
        >
          Our Vision
        </h2>
        <div
          className={`about-vision-card relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border ${
            isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-center">
            <span
              className={`grid h-14 w-14 place-items-center rounded-full ${
                isDark ? 'bg-[#CCFF00] text-black' : 'bg-[#0066FF] text-white'
              }`}
            >
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};
