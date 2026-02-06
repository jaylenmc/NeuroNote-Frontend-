import React from 'react';

const testimonials = [
  {
    quote: "NeuroNote completely changed how I approach medical school. The spaced repetition algorithm is scary accurate.",
    author: "Sarah Jenning",
    role: "Med Student, Stanford",
    image: "https://picsum.photos/100/100?random=10"
  },
  {
    quote: "I used to drown in scattered notes. Now everything is connected, and I actually remember what I read three months ago.",
    author: "David Chen",
    role: "Software Engineer, Google",
    image: "https://picsum.photos/100/100?random=11"
  },
  {
    quote: "The cleanest study tool on the market. It doesn't feel like a chore to open this app every morning.",
    author: "Elena Rodriguez",
    role: "PhD Candidate, MIT",
    image: "https://picsum.photos/100/100?random=12"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-[#05080f] relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white mb-16">
          Loved by lifelong learners
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex gap-1 mb-6">
                {[1,2,3,4,5].map(star => (
                    <svg key={star} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-4">
                <img src={t.image} alt={t.author} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/20" />
                <div>
                  <div className="text-white font-medium">{t.author}</div>
                  <div className="text-sm text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;