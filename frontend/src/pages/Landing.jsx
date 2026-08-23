import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { getToken } from '../api/client.js';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

import HeroSection from '../components/landing/HeroSection.jsx';
import HowItWorksSection from '../components/landing/HowItWorksSection.jsx';
import FeaturesSection from '../components/landing/FeaturesSection.jsx';
import TestimonialSection from '../components/landing/TestimonialSection.jsx';
import ComparisonSection from '../components/landing/ComparisonSection.jsx';
import PricingSection from '../components/landing/PricingSection.jsx';
import FaqSection from '../components/landing/FaqSection.jsx';
import CtaSection from '../components/landing/CtaSection.jsx';

export default function Landing() {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const observerRef = useRef(null);
  const isLoggedIn = !!getToken();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observerRef.current.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id');

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="lp">
      <Header />
      
      <HeroSection setMobileMenuOpen={setMobileMenuOpen} />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialSection />
      <ComparisonSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      
      <Footer />

      <style>{`
        .lp {
          font-family: 'Manrope', sans-serif;
          color: var(--ink);
          background: var(--paper);
          overflow-x: hidden;
        }

        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .reveal.revealed { opacity: 1; transform: translateY(0); }

        h1, h2, h3 { font-family: 'Fraunces', serif; color: var(--ink); }

        .full { width: 100%; }

        /* HERO */
        .hero { position: relative; padding: 150px 6% 100px; min-height: 92vh; display: flex; align-items: center; }
        .hero-grain {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 15% 20%, rgba(185,141,70,0.12), transparent 45%),
                      radial-gradient(circle at 85% 80%, rgba(122,36,54,0.08), transparent 50%);
          pointer-events: none;
        }
        .hero-inner { position: relative; z-index: 1; max-width: 1240px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 70px; align-items: center; }
        .hero-copy h1 { font-size: 52px; line-height: 1.14; font-weight: 600; margin: 0 0 24px; }
        .hero-copy h1 em { font-style: italic; color: var(--wine); }
        .hero-copy p { font-size: 17px; line-height: 1.7; color: var(--ink-soft); max-width: 460px; margin: 0 0 36px; }
        .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 44px; }
        .hero-proof { display: flex; align-items: center; gap: 24px; padding-top: 28px; border-top: 1px solid var(--line); }
        .proof-stat strong { font-family: 'Fraunces', serif; font-size: 26px; display: block; }
        .proof-stat span { font-size: 12.5px; color: var(--ink-soft); }
        .proof-divider { width: 1px; height: 36px; background: var(--line); }

        /* HERO VISUAL - invite card + wax seal + phone peek */
        .invite-stage { position: relative; max-width: 380px; margin: 0 auto; }
        .invite-ribbon {
          position: absolute; top: -20px; left: 50%; transform: translateX(-50%) rotate(-3deg);
          width: 46px; height: 90px; background: linear-gradient(180deg, var(--wine), #5c1c28);
          clip-path: polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%); z-index: 3;
        }
        .invite-card {
          background: var(--paper); border: 1px solid var(--line); border-radius: 4px;
          padding: 10px; box-shadow: 0 30px 60px -20px rgba(24,36,32,0.35);
          transform-origin: top center; animation: unfold 1.1s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.2s;
        }
        @keyframes unfold {
          0% { transform: rotateX(-35deg) scale(0.92); opacity: 0; }
          100% { transform: rotateX(0) scale(1); opacity: 1; }
        }
        .invite-card-inner {
          border: 1.5px solid var(--gold); padding: 56px 30px; text-align: center; background: var(--paper-deep);
        }
        .invite-eyebrow { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); margin-bottom: 14px; }
        .invite-names { font-family: 'Mrs Saint Delafield', cursive; font-size: 44px; color: var(--ink); line-height: 1; }
        .invite-line { width: 40px; height: 1px; background: var(--gold); margin: 20px auto; }
        .invite-date { font-size: 13px; color: var(--ink-soft); letter-spacing: 0.04em; }

        .wax-seal {
          position: absolute; top: 42%; left: 50%; transform: translate(-50%,-50%);
          width: 64px; height: 64px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #9c3448, var(--wine));
          display: flex; align-items: center; justify-content: center; color: #f3d9c6; font-size: 20px;
          box-shadow: 0 8px 18px rgba(0,0,0,0.35); z-index: 4;
          animation: crack 0.5s ease 1.3s both;
        }
        @keyframes crack { 0% { transform: translate(-50%,-50%) scale(1.4); opacity: 0; } 60% { transform: translate(-50%,-50%) scale(0.92); opacity: 1; } 100% { transform: translate(-50%,-50%) scale(1); } }

        .phone-peek {
          position: absolute; bottom: -36px; right: -30px; width: 150px; height: 220px;
          background: var(--ink); border-radius: 22px; padding: 8px;
          box-shadow: 0 24px 50px -10px rgba(0,0,0,0.4); z-index: 2;
          animation: peekIn 0.8s cubic-bezier(0.16,1,0.3,1) 1.6s both;
        }
        @keyframes peekIn { 0% { transform: translateY(30px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .phone-peek-notch { width: 34px; height: 5px; background: rgba(255,255,255,0.15); border-radius: 4px; margin: 4px auto 6px; }
        .phone-peek-body { background: var(--paper-deep); border-radius: 16px; height: calc(100% - 20px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center; padding: 10px; }
        .ppb-label { font-size: 8px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-soft); }
        .ppb-names { font-family: 'Fraunces', serif; font-size: 15px; }
        .ppb-btn { margin-top: 8px; background: var(--wine); color: #fff; font-size: 9px; font-weight: 700; padding: 6px 14px; border-radius: 12px; }

        /* SECTION HEAD reusable */
        .section-head { text-align: center; max-width: 640px; margin: 0 auto 64px; }
        .section-head h2 { font-size: 36px; font-weight: 600; line-height: 1.25; margin: 0 0 12px; }
        .section-sub { color: var(--ink-soft); font-size: 15.5px; }

        /* STEPS - Susunan Acara style */
        .steps { padding: 130px 6%; background: var(--paper-deep); }
        .steps-list { max-width: 640px; margin: 0 auto; position: relative; }
        .steps-line {
          position: absolute; left: 27px; top: 8px; bottom: 8px; width: 1px;
          background: var(--line);
        }
        .steps-list .step-row:first-child .step-marker { margin-top: 0; }
        .step-row { display: flex; gap: 26px; align-items: flex-start; padding-bottom: 52px; position: relative; }
        .step-row:last-child { padding-bottom: 0; }
        .step-marker {
          width: 56px; height: 56px; border-radius: 50%; background: var(--paper); border: 1.5px solid var(--gold);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--wine); font-size: 18px;
          position: relative; z-index: 1;
          transform: scale(0.6); opacity: 0;
          transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease;
        }
        .step-row.revealed .step-marker { transform: scale(1); opacity: 1; }
        .step-body { padding-top: 6px; }
        .step-ord {
          font-family: 'Mrs Saint Delafield', cursive; font-size: 22px; color: var(--wine); line-height: 1; margin-bottom: 6px;
        }
        .step-body h3 { font-size: 20px; margin: 0 0 8px; font-weight: 600; }
        .step-body p { color: var(--ink-soft); font-size: 14.5px; line-height: 1.65; max-width: 420px; margin: 0; }

        /* FEATURES BENTO */
        .features { padding: 130px 6%; }
        .bento { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; max-width: 1040px; margin: 0 auto; }
        .bento-card {
          background: var(--paper-deep); border-radius: 20px; padding: 34px; border: 1px solid var(--line);
          display: flex; flex-direction: column; justify-content: space-between; gap: 24px;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease;
        }
        .bento-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px -16px rgba(24,36,32,0.2); }
        .bento-card.wide { grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 30px; }
        .bento-copy h3 { font-size: 20px; font-weight: 600; margin: 0 0 10px; display: flex; align-items: center; gap: 10px; }
        .bento-copy p { color: var(--ink-soft); font-size: 14.5px; line-height: 1.65; margin: 0; }
        .wa-bubble { background: var(--paper); padding: 16px; border-radius: 14px; font-size: 13px; border: 1px solid var(--line); }
        .rsvp-tally { display: flex; flex-direction: column; gap: 10px; }
        .tally-row { display: flex; justify-content: space-between; background: var(--paper); padding: 10px 14px; border-radius: 10px; font-weight: 700; font-size: 14px; }
        .tally-row strong { color: var(--wine); }
        .tally-row.muted strong { color: var(--gold); }
        .mini-gallery { display: flex; gap: 8px; }
        .mini-gallery span { flex: 1; height: 60px; border-radius: 8px; background: linear-gradient(135deg, var(--gold-light), var(--wine)); opacity: 0.5; }
        .mini-gallery span:nth-child(2) { opacity: 0.75; }
        .mini-gallery span:nth-child(3) { opacity: 1; }
        .swatch-row { display: flex; gap: 12px; justify-content: center; }
        .sw { width: 42px; height: 42px; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.15); }

        /* GUESTBOOK */
        .guestbook { padding: 130px 6%; background: var(--paper-deep); }
        .guestbook-page {
          max-width: 720px; margin: 0 auto; background: var(--paper); border: 1px solid var(--line); border-radius: 4px;
          padding: 20px 48px; box-shadow: 0 20px 50px -20px rgba(24,36,32,0.2);
        }
        .signature-line { padding: 26px 0; border-bottom: 1px dashed var(--line); }
        .signature-line:last-child { border-bottom: none; }
        .sig-text { font-size: 15.5px; line-height: 1.7; color: var(--ink); margin: 0 0 10px; }
        .sig-name { font-family: 'Mrs Saint Delafield', cursive; font-size: 24px; color: var(--wine); }
        .sig-name span { font-family: 'Manrope', sans-serif; font-size: 12px; color: var(--ink-soft); }

        /* COMPARISON */
        .comparison { padding: 130px 6%; background: var(--paper); }
        .compare-grid {
          display: flex; align-items: stretch; justify-content: center; gap: 24px;
          max-width: 1000px; margin: 0 auto; position: relative;
        }
        .compare-col {
          flex: 1; border-radius: 18px; padding: 40px; border: 1px solid var(--line);
        }
        .compare-col.old-way { background: var(--paper-deep); opacity: 0.85; transform: scale(0.96); filter: grayscale(40%); }
        .compare-col.new-way { background: var(--paper); border: 2px solid var(--wine); box-shadow: 0 20px 40px -16px rgba(122,36,54,0.15); }
        .cc-head { margin-bottom: 30px; padding-bottom: 24px; border-bottom: 1px dashed var(--line); position: relative; }
        .compare-col h3 { font-size: 20px; font-weight: 600; margin: 0 0 10px; }
        .cc-price { font-family: 'Fraunces', serif; font-size: 32px; font-weight: 600; color: var(--ink); }
        .new-way .cc-price { color: var(--wine); }
        .cc-badge { position: absolute; top: 0; right: 0; background: var(--wine); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
        .compare-col ul { list-style: none; padding: 0; margin: 0; }
        .compare-col li { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 16px; font-size: 14.5px; line-height: 1.5; color: var(--ink-soft); }
        .old-way li i { color: #8a4d4d; margin-top: 4px; }
        .new-way li i { color: var(--gold); margin-top: 4px; }
        .compare-vs {
          position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
          width: 50px; height: 50px; border-radius: 50%; background: var(--ink); color: var(--paper);
          display: flex; align-items: center; justify-content: center; font-family: 'Fraunces', serif; font-weight: 600;
          font-size: 18px; z-index: 2; border: 4px solid var(--paper);
        }
        @media (max-width: 768px) {
          .compare-grid { flex-direction: column; gap: 40px; }
          .compare-col.old-way { transform: scale(1); }
          .compare-vs { display: none; }
        }

        /* PRICING - ticket style */
        .pricing { padding: 130px 6%; }
        .ticket-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; max-width: 1000px; margin: 0 auto; align-items: start; }
        .ticket { background: var(--paper-deep); border-radius: 18px; position: relative; border: 1px solid var(--line); transition: transform 0.3s ease; }
        .ticket:hover { transform: translateY(-6px); }
        .ticket.highlighted { border: 2px solid var(--wine); }
        .ticket-flag {
          position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
          background: var(--wine); color: #fff; font-size: 11px; font-weight: 700; padding: 5px 16px; border-radius: 20px;
        }
        .ticket-body { padding: 36px 28px 24px; }
        .ticket-name { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; }
        .ticket-price { font-family: 'Fraunces', serif; font-size: 36px; font-weight: 600; margin: 8px 0 2px; }
        .ticket-period { font-size: 12px; color: var(--ink-soft); margin-bottom: 22px; }
        .ticket-body ul { list-style: none; padding: 0; margin: 0; }
        .ticket-body li { font-size: 13.5px; color: var(--ink-soft); padding: 7px 0; padding-left: 20px; position: relative; }
        .ticket-body li::before { content: '✦'; position: absolute; left: 0; color: var(--gold); font-size: 11px; }
        .ticket-perf { height: 0; border-top: 2px dashed var(--line); margin: 0 20px; position: relative; }
        .ticket-perf::before, .ticket-perf::after { content: ''; position: absolute; top: -9px; width: 18px; height: 18px; border-radius: 50%; background: var(--paper); }
        .ticket-perf::before { left: -29px; }
        .ticket-perf::after { right: -29px; }
        .ticket-stub { padding: 22px 28px 28px; }

        /* FAQ */
        .faq { padding: 130px 6%; }
        .faq-list { max-width: 680px; margin: 0 auto; }
        .faq-item {
          border-bottom: 1px solid var(--line);
          transition: border-color 0.3s ease;
        }
        .faq-item:hover { border-color: var(--gold); }
        .faq-q {
          width: 100%; background: none; border: none; cursor: pointer; text-align: left;
          display: flex; align-items: center; gap: 18px; padding: 24px 0;
        }
        .faq-index {
          font-family: 'Fraunces', serif; font-size: 13px; color: var(--gold); flex-shrink: 0;
          width: 26px; padding-top: 2px;
        }
        .faq-q-text { flex: 1; font-size: 15.5px; font-weight: 700; color: var(--ink); }
        .faq-chev {
          flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: var(--paper-deep);
          display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--wine);
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), background 0.3s ease;
        }
        .faq-chev.open { transform: rotate(180deg); background: var(--wine); color: #fff; }
        .faq-a-wrap {
          display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .faq-a-wrap.open { grid-template-rows: 1fr; }
        .faq-a-inner { overflow: hidden; }
        .faq-a-inner p { color: var(--ink-soft); font-size: 14.5px; line-height: 1.7; margin: 0; padding: 0 44px 26px 0; padding-left: 44px; }

        /* CTA SEAL */
        .cta-seal { padding: 130px 6%; background: var(--ink); text-align: center; }
        .cta-seal-inner { max-width: 560px; margin: 0 auto; }
        .big-seal {
          width: 84px; height: 84px; border-radius: 50%; margin: 0 auto 28px;
          background: radial-gradient(circle at 35% 30%, #9c3448, var(--wine));
          display: flex; align-items: center; justify-content: center; color: #f3d9c6; font-size: 26px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.4);
        }
        .cta-seal h2 { color: var(--paper); font-size: 38px; margin: 0 0 16px; }
        .cta-seal p { color: rgba(250,243,227,0.65); font-size: 16px; margin-bottom: 36px; }

        /* RESPONSIVE */
        @media (max-width: 980px) {
          .hero-inner { grid-template-columns: 1fr; text-align: center; }
          .hero-copy p { margin: 0 auto 36px; }
          .hero-actions, .hero-proof { justify-content: center; }
          .invite-stage { margin-top: 40px; }
          .bento-card.wide { grid-template-columns: 1fr; }
          .ticket-grid { grid-template-columns: 1fr; max-width: 380px; margin: 0 auto; }
        }
        @media (max-width: 768px) {
          .hero-copy h1 { font-size: 38px; }
          .bento { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}