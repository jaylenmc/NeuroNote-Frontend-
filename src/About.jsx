import React, { useEffect } from 'react';
import './App.css';

function About() {
  useEffect(() => {
    document.title = 'About Us - NeuroNote';
  }, []);
  const values = [
    { heading: 'Learning-first design', body: 'Every feature we build should strengthen deliberate practice — never replace it. Shortcuts and automation exist to deepen learning, not dilute it.' },
    { heading: 'Evidence over hype', body: 'We turn peer-reviewed learning science into practical, repeatable study loops you can actually feel working session after session.' },
    { heading: 'Calm productivity', body: 'Your study space should lighten your cognitive load. Our dark interface, subtle soundscapes, and gentle cues are all designed to help you stay focused without forcing it.' },
    { heading: 'Clarity at every step', body: 'Students shouldn’t get lost in their own notes. We prioritize structure and guidance so every study session feels intentional.' },
  ];

  return (
    <div className="about-page">
      <section className="about-hero">
        <p className="about-eyebrow">Our Story</p>
        <h1 className="about-title">We built NeuroNote to make deep studying feel effortless</h1>
        <p className="about-lede">
          We all know that dreadful feeling when you're trying to study for an exam, but you can't seem to focus. 
          You're trying to read the material, but you can't seem to remember it. You're trying to take notes, but you 
          can't seem to keep up. Telling you I've gotten burned out often would be an understatement. But I began to notice 
          there were straight A students who were not only acing every test but also juggling 2 jobs while being apart of
          clubs and organizations at their school. As most people would think, "they were born a genius", I had different
          perspective about it. I understood that the path to success included having a system, but not just any, one that is
          not only effective but also efficient. I began to think about how I could create a tool that would not only 
          help myself but also others. That's when NeuroNote was born, a tool that would optimize a big part of a students
          day..studying. We all eventually had the same thought at one point wether we had known it or not, that more time spent studying
          meant the more you learned. I couldn't have been more wrong, what I wanted from NeuroNote was to get into the 
          main point of the material and make the mind work. Although this is not an easy process this is the best way to
          make the material stick long term in the most efficient way possible. Given how much I have benefited from NeuroNote
          I hope it does the same for you.
        </p>
      </section>

      <section className="about-mission">
        <div className="about-mission-copy">
          <h2>Why we exist</h2>
          <p>
          Students deserve a study workflow that respects their time and attention, instead of burying them in cluttered
          notes, distractions, and ineffective techniques.
          </p>
        </div>
        <div className="about-value-grid">
          {values.map((value) => (
            <article className="about-value-card" key={value.heading}>
              <h3>{value.heading}</h3>
              <p>{value.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default About;