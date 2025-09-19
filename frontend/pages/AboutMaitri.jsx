import React from "react";
import "../css/AboutMaitri.css";
import Navbar from "../components/Navbar";

export default function AboutMaitri() {
  return (
    <div className="about-maitri-page">
      <Navbar />

      <div className="about-maitri-container">

        <section className="maitri-hero">
          <h1>About Maitri</h1>
          <p>
            Maitri is dedicated to promoting mental health awareness and
            providing tools for emotional well-being. Our goal is to create a
            safe, supportive, and accessible space for everyone.
          </p>
        </section>

        <section className="maitri-mission">
          <h2>Our Mission</h2>
          <p>
            To empower individuals to take charge of their mental health through
            journaling, guided resources, and community support. We aim to break
            stigma and encourage open conversations about mental wellness.
          </p>
          <h2>Our Vision</h2>
          <p>
            A world where mental health is valued equally to physical health, and
            support is accessible to all.
          </p>
        </section>

        <section className="maitri-features">
          <h2>What We Offer</h2>
          <ul>
            <li>Guided journaling to track mood and emotions.</li>
            <li>Interactive chatbot for mental health support.</li>
            <li>Emotional and screening metrics to understand your mental state.</li>
            <li>Educational resources and videos on mental wellness.</li>
            <li>Community support and expert advice.</li>
          </ul>
        </section>

        <section className="maitri-videos">
          <h2>Helpful Videos</h2>
          <div className="video-grid">
            <iframe
              src="https://www.youtube.com/embed/92iQ5Yk0oc8"
              title="Mindfulness Meditation"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <iframe
              src="https://www.youtube.com/embed/inpok4MKVLM"
              title="Stress Relief Techniques"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <iframe
              src="https://www.youtube.com/embed/oHg5SJYRHA0"
              title="Positive Thinking Techniques"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        <section className="maitri-tips">
          <h2>Mental Health Tips</h2>
          <ul>
            <li>Practice daily gratitude journaling.</li>
            <li>Exercise regularly to boost mood and reduce stress.</li>
            <li>Stay connected with friends and loved ones.</li>
            <li>Set realistic goals and break them into small tasks.</li>
            <li>Take breaks from social media to reduce anxiety.</li>
            <li>Practice deep breathing or meditation daily.</li>
          </ul>
        </section>

        <section className="maitri-faqs">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-item">
            <h3>What is Maitri?</h3>
            <p>
              Maitri is a mental wellness platform offering journaling, resources,
              videos, and community support to enhance emotional well-being.
            </p>
          </div>
          <div className="faq-item">
            <h3>Is it free to use?</h3>
            <p>
              Yes! Maitri provides free access to most of its tools and resources.
            </p>
          </div>
          <div className="faq-item">
            <h3>Can I track my progress?</h3>
            <p>
              Absolutely. Our journaling and emotional metrics help you monitor your
              mental health over time.
            </p>
          </div>
          <div className="faq-item">
            <h3>Is my data private?</h3>
            <p>
              Yes, entries are stored locally by default. We also support optional
              secure cloud backup in future releases.
            </p>
          </div>
        </section>

        <section className="maitri-testimonials">
          <h2>What Our Users Say</h2>
          <div className="testimonial-card">
            <p>
              "Maitri helped me understand my emotions better and start a daily
              journaling habit. I feel more balanced now." – <strong>Alice</strong>
            </p>
          </div>
          <div className="testimonial-card">
            <p>
              "The videos and tips are extremely useful. The platform feels safe and
              supportive." – <strong>Rahul</strong>
            </p>
          </div>
        </section>

        <section className="maitri-contact">
          <h2>Get Started with Maitri</h2>
          <p>
            Start your journey toward better mental health today. Explore our
            journaling and support features now!
          </p>
          <button className="maitri-start-btn">Start Journaling</button>
        </section>
      </div>
    </div>
  );
}
