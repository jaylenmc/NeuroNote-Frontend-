import React from 'react';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-600/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-accent-500/10 rounded-full blur-[100px] -z-10 opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-accent-500"></span>
          <span className="text-sm font-medium text-gray-300">New: AI-Powered Syllabus Parsing</span>
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl font-display text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Study with Clarity. <br />
          <span className="text-gradient">Learn with Confidence.</span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          The all-in-one cognitive operating system designed to save you time, cut through confusion, and strengthen long-term retention.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <button className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-semibold transition-all transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2">
            Start Learning Free
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-semibold transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
            <Play className="w-4 h-4 fill-current" />
            Watch Demo
          </button>
        </div>

        {/* Social Proof Text */}
        <div className="flex flex-col items-center gap-4 mb-20 animate-in fade-in duration-1000 delay-500">
          <div className="flex -space-x-2">
             {[1,2,3,4].map(i => (
                 <img key={i} src={`https://picsum.photos/40/40?random=${i}`} alt="User" className="w-8 h-8 rounded-full border-2 border-background" />
             ))}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <div className="flex text-yellow-500">
                {'★★★★★'}
            </div>
            <span className="ml-2">Loved by 10,000+ top students</span>
          </div>
        </div>

        {/* Floating UI Mockup */}
        <div className="relative w-full max-w-5xl mx-auto perspective-[2000px] group">
            {/* Glow effect behind */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-accent-500 blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity duration-700 rounded-2xl" />
            
            {/* Main Window */}
            <div className="relative bg-[#0F1115] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform rotate-x-12 group-hover:rotate-x-0 transition-transform duration-700 ease-out">
                {/* Window Header */}
                <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                    </div>
                    <div className="mx-auto text-xs font-mono text-gray-500">neuro-note-dashboard.app</div>
                </div>

                {/* Window Content */}
                <div className="flex h-[500px] md:h-[600px]">
                    {/* Sidebar */}
                    <div className="w-16 md:w-64 border-r border-white/5 p-4 flex flex-col hidden md:flex">
                        <div className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">Library</div>
                        <div className="space-y-2">
                            {['Anatomy 101', 'Cognitive Science', 'React Patterns', 'System Design'].map((item, i) => (
                                <div key={item} className={`p-2 rounded-lg text-sm flex items-center gap-3 cursor-pointer ${i === 1 ? 'bg-primary-600/10 text-primary-400' : 'text-gray-400 hover:bg-white/5'}`}>
                                    <div className={`w-2 h-2 rounded-full ${i===1 ? 'bg-primary-500' : 'bg-gray-600'}`} />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 p-6 md:p-8 bg-gradient-to-br from-[#0F1115] to-[#13151A]">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Review Session</h3>
                                <p className="text-gray-400 text-sm">Stay consistent, see results!</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase">Streak</div>
                                    <div className="text-xl font-bold text-accent-500">12 Days 🔥</div>
                                </div>
                            </div>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2].map((card) => (
                                <div key={card} className="bg-white/5 border border-white/5 rounded-xl p-6 hover:border-primary-500/50 transition-colors group/card cursor-pointer">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-2 py-1 rounded bg-primary-500/20 text-primary-300 text-xs font-medium">Design Patterns</span>
                                        <span className="text-xs text-red-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Overdue</span>
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-200 mb-8">
                                        {card === 1 ? "What defines the Singleton pattern?" : "Explain the difference between MVC and MVVM."}
                                    </h4>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-600 w-2/3"></div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500 text-right">Recall Strength: 68%</div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Action Bar */}
                        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-primary-900/40 to-primary-800/20 border border-primary-500/20 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary-500 text-white">
                                    <Play className="w-5 h-5 fill-current" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">Ready to study?</div>
                                    <div className="text-xs text-primary-200">6 cards due for review</div>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white text-primary-900 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors">Start Session</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;