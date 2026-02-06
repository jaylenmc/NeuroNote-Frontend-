import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import CtaSection from './components/CtaSection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary-500/30 text-white overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Features />
        {/* Integration/Company Logos Strip */}
        <div className="py-12 border-y border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-4">
                <p className="text-center text-sm font-medium text-gray-500 mb-8 uppercase tracking-widest">Trusted by learners at</p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale">
                    {['MIT', 'Stanford', 'Harvard', 'Oxford', 'Cambridge'].map(uni => (
                        <div key={uni} className="text-xl md:text-2xl font-display font-bold text-white">{uni}</div>
                    ))}
                </div>
            </div>
        </div>
        <Testimonials />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;