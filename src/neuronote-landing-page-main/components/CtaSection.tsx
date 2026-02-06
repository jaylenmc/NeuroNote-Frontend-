import React from 'react';
import { ArrowRight } from 'lucide-react';

const CtaSection: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-600/20 blur-[100px] rounded-full pointer-events-none" />
        
      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to optimize your learning?
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of students and professionals who are already using NeuroNote to master new skills faster.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button className="w-full sm:w-auto px-8 py-4 bg-white text-background rounded-full font-bold text-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2">
                Get Started for Free
                <ArrowRight className="w-5 h-5" />
             </button>
        </div>
        <p className="mt-6 text-sm text-gray-500">No credit card required. Free plan available forever.</p>
      </div>
    </section>
  );
};

export default CtaSection;