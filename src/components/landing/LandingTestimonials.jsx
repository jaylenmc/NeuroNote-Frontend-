import React from 'react';

const testimonials = [
  {
    quote: 'NeuroNote completely changed how I approach medical school. The spaced repetition algorithm is scary accurate.',
    author: 'Sarah Jenning',
    role: 'Med Student, Stanford',
    image: 'https://picsum.photos/100/100?random=10',
  },
  {
    quote: 'I used to drown in scattered notes. Now everything is connected, and I actually remember what I read three months ago.',
    author: 'David Chen',
    role: 'CS Student, UND',
    image: 'https://picsum.photos/100/100?random=11',
  },
  {
    quote: 'The cleanest study tool on the market. It doesn\'t feel like a chore to open this app every morning.',
    author: 'Elena Rodriguez',
    role: 'Bio Student, UW-Madison',
    image: 'https://picsum.photos/100/100?random=12',
  },
];

function StarIcon() {
  return (
    <svg className="landing-testimonial-star" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function LandingTestimonials() {
  return (
    <section className="landing-testimonials">
      <div className="landing-testimonials-inner">
        <h2 className="landing-testimonials-title landing-font-display">
          Loved by lifelong learners
        </h2>

        <div className="landing-testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="landing-testimonial-card">
              <div className="landing-testimonial-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} />
                ))}
              </div>
              <p className="landing-testimonial-quote">&quot;{t.quote}&quot;</p>
              <div className="landing-testimonial-author">
                <img
                  src={t.image}
                  alt=""
                  className="landing-testimonial-avatar"
                />
                <div>
                  <div className="landing-testimonial-name">{t.author}</div>
                  <div className="landing-testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LandingTestimonials;
