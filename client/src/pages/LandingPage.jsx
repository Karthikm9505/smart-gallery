import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const LandingPage = () => {
  return (
    // We apply the body styles and the dark background color directly to this wrapper div
    <div className="text-on-background min-h-screen flex flex-col bg-[#0B0F19]">
      
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-lg border-b border-white/10 shadow-[0_8px_32px_0_rgba(173,198,255,0.15)] glass-nav">
        <div className="flex justify-between items-center px-container-padding h-20 w-full max-w-7xl mx-auto">
          <div className="font-display-lg text-display-lg font-bold text-primary tracking-tight">
            SecureCloud
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/login" className="hidden md:block font-label-sm text-label-sm text-primary hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/login" className="btn-primary px-6 py-2 rounded-lg font-label-sm text-label-sm font-semibold active:scale-[0.98] transition-transform duration-200 inline-block text-center">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mt-32 px-container-padding max-w-7xl mx-auto w-full flex flex-col items-center text-center gap-stack-lg mb-section-gap">
        <div className="max-w-4xl space-y-stack-md">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg gradient-text">
            Serverless Media Management Platform
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Automate your media workflow with AI-powered tagging and secure, zero-trust infrastructure.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-gutter mt-4">
          <Link to="/login" className="btn-primary px-8 py-3 rounded-lg font-label-sm text-label-sm font-bold shadow-[0_0_24px_rgba(77,142,255,0.3)] hover:shadow-[0_0_32px_rgba(77,142,255,0.5)] transition-all inline-block text-center">
            Get Started
          </Link>
        </div>
        <div className="w-full mt-stack-lg rounded-xl overflow-hidden border border-white/10 glass-edge ambient-glow relative aspect-video bg-surface-container-low flex items-center justify-center">
          {/* Placeholder for complex abstract dashboard visual */}
          <img 
            alt="Dashboard Abstract" 
            className="w-full h-full object-cover opacity-60" 
            data-alt="A highly detailed, futuristic abstract visualization of a cloud data dashboard. The image features glowing neon blue data streams, floating isometric server nodes, and complex connecting lines on a deep Midnight Navy background. The lighting is sophisticated and moody, with high contrast highlighting the Electric Blue accents. It conveys a sense of high-tech security, speed, and immense data processing capability within a modern corporate IT environment." 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrUhtLdABYIuxmymeQrwPH_H8wTtFvfFISsvpESMqCnNr4FrYc0DdB3D4NyfZDKS4Sh1xpTkveBKms5dBPcTVLiEnRU6s4sql5r53HOiImI6ZXMmC_EZVJU30NtPOHpTVUcbCz644eCbMME7P3kpkENl_16kZEIT5W8cIsGX7-OGPNXTk8vn-BeHtWuyfFMPyaMm2qmTkWAYGj5PPiJnr7o_wlAm4StgoJU6zMs_SaDLeGwSPsLM4HBAz1PyqYUZ_KVQ8EXiqUT6sp" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] to-transparent"></div>
          <div className="absolute text-center">
            <span className="material-symbols-outlined text-[64px] text-primary opacity-80">cloud_sync</span>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="px-container-padding max-w-7xl mx-auto w-full mb-section-gap">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          
          {/* Feature 1: AI Tagging (Large) */}
          <div className="col-span-1 md:col-span-7 bg-[#1E293B] rounded-xl border border-white/10 p-stack-lg flex flex-col justify-between hover:border-primary transition-colors group ambient-glow relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="space-y-stack-sm relative z-10">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center mb-4 border border-outline-variant">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Intelligent AI Tagging</h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Leverage Amazon Rekognition to automatically generate metadata for every asset. Remove manual entry and boost searchability by 40%.
              </p>
            </div>
            <div className="mt-stack-lg relative h-48 rounded-lg bg-surface-dim border border-outline-variant/50 flex items-end p-4 gap-2 overflow-hidden z-10">
              {/* Faux tags visual */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-40"></div>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-code-md text-code-md backdrop-blur-md border border-primary/30 z-20">Mountain</span>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-code-md text-code-md backdrop-blur-md border border-primary/30 z-20">Blue Sky</span>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-code-md text-code-md backdrop-blur-md border border-primary/30 z-20">Sunset</span>
            </div>
          </div>

          {/* Feature 2: Smart Search (Tall) */}
          <div className="col-span-1 md:col-span-5 bg-[#1E293B] rounded-xl border border-white/10 p-stack-lg flex flex-col hover:border-primary transition-colors group ambient-glow relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="space-y-stack-sm relative z-10">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center mb-4 border border-outline-variant">
                <span className="material-symbols-outlined text-primary">manage_search</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Smart Natural Language Search</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Data discoverability at your fingertips. Use natural language queries to filter through complex AI-generated metadata instantly.
              </p>
            </div>
            <div className="mt-stack-lg bg-surface-container-low border border-outline-variant rounded-lg p-4 flex-grow relative z-10 flex flex-col justify-center">
              <div className="w-full bg-surface-dim rounded border border-primary flex items-center px-3 py-2 shadow-[0_0_12px_rgba(173,198,255,0.2)]">
                <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px]">search</span>
                <span className="font-code-md text-code-md text-on-surface truncate">search with tags</span>
              </div>
              <div className="mt-4 space-y-2 opacity-50">
                <div className="h-8 bg-surface-variant rounded w-full"></div>
                <div className="h-8 bg-surface-variant rounded w-3/4"></div>
                <div className="h-8 bg-surface-variant rounded w-5/6"></div>
              </div>
            </div>
          </div>

          {/* Feature 3: Zero-Trust Security (Full Width) */}
          <div className="col-span-1 md:col-span-12 bg-[#1E293B] rounded-xl border border-white/10 p-stack-lg flex flex-col md:flex-row gap-stack-lg items-center hover:border-primary transition-colors group ambient-glow relative overflow-hidden">
            <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="md:w-1/2 space-y-stack-sm relative z-10">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center mb-4 border border-outline-variant">
                <span className="material-symbols-outlined text-primary">security</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Zero-Trust Infrastructure</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                100% data privacy with Amazon S3 Presigned URLs and AWS Cognito for industry-standard multi-tenant isolation.
              </p>
            </div>
            <div className="md:w-1/2 w-full h-48 bg-surface-dim rounded-lg border border-outline-variant/50 flex items-center justify-center relative z-10">
              <span className="material-symbols-outlined text-[80px] text-primary/40 group-hover:text-primary transition-colors duration-500" data-weight="fill">enhanced_encryption</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-container-padding max-w-4xl mx-auto w-full text-center py-section-gap border-t border-white/10 mb-section-gap flex flex-col items-center gap-stack-md">
        <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
          Ready to secure your media workflow?
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-4">
          Join leading enterprises leveraging SecureCloud for robust, AI-driven media management.
        </p>
        <div className="flex gap-4">
          <Link to="/login" className="btn-primary px-8 py-3 rounded-lg font-label-sm text-label-sm font-bold shadow-[0_0_24px_rgba(77,142,255,0.3)] hover:shadow-[0_0_32px_rgba(77,142,255,0.5)] transition-all inline-block text-center">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/20 w-full py-stack-lg mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-container-padding w-full max-w-7xl mx-auto gap-gutter">
          <div className="font-headline-md text-headline-md font-bold text-on-surface">
            SecureCloud
          </div>
          <div className="flex flex-wrap gap-gutter justify-center md:justify-end">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-all" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-all" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-all" href="#">Documentation</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary underline-offset-4 hover:underline transition-all" href="#">API Status</a>
          </div>
          <div className="font-body-md text-body-md text-on-surface-variant text-center md:text-left mt-4 md:mt-0 w-full md:w-auto">
            © 2024 SecureCloud Infrastructure. High-stakes media delivery.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;