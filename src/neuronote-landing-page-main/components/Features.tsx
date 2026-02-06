import React from 'react';
import { Brain, Zap, Layout, Share2, Layers, Clock } from 'lucide-react';

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  delay?: string;
}> = ({ title, description, icon, className, delay }) => (
  <div className={`glass-card rounded-3xl p-8 hover:bg-white/5 transition-colors duration-300 flex flex-col justify-between group ${className} animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards ${delay}`}>
    <div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
    <div className="mt-8 flex items-center text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
      Learn more &rarr;
    </div>
  </div>
);

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 relative bg-background">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary-900/20 blur-[100px] -translate-y-1/2 rounded-full pointer-events-none" />
        
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-primary-500 font-semibold tracking-wide uppercase mb-3 text-sm">Neuro Study Methods</h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Study Smarter. <span className="text-gray-500">Not Harder.</span>
          </h3>
          <p className="text-lg text-gray-400">
            Advanced cognitive science principles baked into a beautiful interface. NeuroNote handles the structure so you can focus on the content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Card - Spaced Repetition */}
          <FeatureCard
            className="md:col-span-2 bg-gradient-to-br from-white/5 to-transparent"
            title="Active Recall & Spaced Repetition"
            description="Our algorithm schedules reviews at the exact moment you're about to forget. This guarantees long-term retention with minimum effort."
            icon={<Clock className="w-6 h-6 text-primary-400" />}
            delay="delay-0"
          />
          
          {/* Tall Card - Organization */}
          <FeatureCard
             className="md:row-span-2 bg-gradient-to-b from-white/5 to-transparent"
             title="Knowledge Graphing"
             description="Visualize how concepts connect. Turn linear notes into a dynamic web of knowledge that mimics your brain's neural networks."
             icon={<Share2 className="w-6 h-6 text-accent-400" />}
             delay="delay-100"
          />

          {/* Regular Cards */}
          <FeatureCard
            title="AI Summarization"
            description="Upload PDFs or lectures. Our AI instantly generates concise summaries and flashcards."
            icon={<Brain className="w-6 h-6 text-pink-400" />}
             delay="delay-200"
          />

          <FeatureCard
            title="Focus Modes"
            description="Block distractions with built-in Pomodoro timers and ambient soundscapes tailored for deep work."
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
             delay="delay-300"
          />
        </div>
      </div>
    </section>
  );
};

export default Features;