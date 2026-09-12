import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Menu,
  X,
  Home,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Zap,
  Heart,
  Receipt,
  Scale,
  Users,
  Star,
  Check,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Send,
  Lightbulb,
  Bot
} from 'lucide-react'

export default function LandingPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [emailInput, setEmailInput] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSignOut = () => {
    setProfileMenuOpen(false)
    logout()
    navigate('/')
  }

  // IntersectionObserver for smooth scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const elements = document.querySelectorAll('.reveal-on-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const handleScrollTo = (e, id) => {
    e.preventDefault()
    setActiveTab(id)
    setMobileMenuOpen(false)
    const elem = document.getElementById(id)
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/register')
    }
  }

  const handleSignIn = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (emailInput.trim()) {
      setSubscribed(true)
      setEmailInput('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <div className="bg-[#F9F7F2] text-[#121826] font-sans min-h-screen selection:bg-[#EAE4D8] selection:text-[#121826]">
      {/* 1. STICKY / TOP NAVIGATION */}
      <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black/70 via-black/40 to-transparent backdrop-blur-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-center backdrop-blur-md">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight font-sans">FairShare</span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-10">
            <a
              href="#home"
              onClick={(e) => handleScrollTo(e, 'home')}
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'home' ? 'text-white font-bold border-b border-white/60 pb-0.5' : 'text-slate-200 hover:text-white'
              }`}
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleScrollTo(e, 'how-it-works')}
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'how-it-works' ? 'text-white font-bold border-b border-white/60 pb-0.5' : 'text-slate-200 hover:text-white'
              }`}
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={(e) => handleScrollTo(e, 'features')}
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'features' ? 'text-white font-bold border-b border-white/60 pb-0.5' : 'text-slate-200 hover:text-white'
              }`}
            >
              Features
            </a>
            <a
              href="#about"
              onClick={(e) => handleScrollTo(e, 'about')}
              className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'about' ? 'text-white font-bold border-b border-white/60 pb-0.5' : 'text-slate-200 hover:text-white'
              }`}
            >
              About
            </a>
          </nav>

          {/* Right Action Buttons ΓÇö Shows REAL logged-in user profile icon if signed in */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="w-10 h-10 rounded-full bg-[#5F402B] text-white flex items-center justify-center font-extrabold text-sm border-2 border-white/30 shadow-md hover:scale-105 active:scale-95 transition-all"
                  title={user.name || 'User Profile'}
                >
                  {user.name ? user.name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-[#E5DED3] shadow-2xl p-3 z-50 animate-fadeIn text-[#121826]">
                    <div className="px-3 py-2 border-b border-[#E5DED3]">
                      <p className="font-bold text-sm text-[#172033] truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-[#687080] truncate font-medium mt-0.5">{user.email || ''}</p>
                    </div>
                    <div className="pt-2 space-y-1">
                      <button
                        onClick={() => { setProfileMenuOpen(false); navigate('/dashboard') }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-[#172033] hover:bg-[#F2EEE7] rounded-xl transition-colors flex items-center justify-between"
                      >
                        <span>Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#5F402B]" />
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-[#D65B57] hover:bg-red-50 rounded-xl transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={handleSignIn}
                  className="px-5 py-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors text-xs font-bold"
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetStarted}
                  className="bg-[#D1A568] hover:bg-[#C29557] text-[#121826] px-6 py-2 rounded-full font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#121826]/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 space-y-4 animate-fadeIn text-white">
            <nav className="flex flex-col gap-4 font-medium text-sm">
              <a href="#home" onClick={(e) => handleScrollTo(e, 'home')} className="text-slate-300 hover:text-white">Home</a>
              <a href="#how-it-works" onClick={(e) => handleScrollTo(e, 'how-it-works')} className="text-slate-300 hover:text-white">How It Works</a>
              <a href="#features" onClick={(e) => handleScrollTo(e, 'features')} className="text-slate-300 hover:text-white">Features</a>
              <a href="#about" onClick={(e) => handleScrollTo(e, 'about')} className="text-slate-300 hover:text-white">About</a>
            </nav>
            <div className="flex flex-col gap-2.5 pt-4 border-t border-white/10">
              {user ? (
                <>
                  <button onClick={() => navigate('/dashboard')} className="w-full text-center py-2.5 rounded-full bg-[#D1A568] text-[#121826] font-bold text-xs">
                    Dashboard
                  </button>
                  <button onClick={handleSignOut} className="w-full text-center py-2.5 rounded-full border border-red-400/40 text-red-400 font-bold text-xs">
                    Sign Out ({user.name || 'User'})
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleSignIn} className="w-full text-center py-2.5 rounded-full border border-white/30 font-bold text-xs text-white">
                    Sign In
                  </button>
                  <button onClick={handleGetStarted} className="w-full text-center py-2.5 rounded-full bg-[#D1A568] text-[#121826] font-bold text-xs">
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main id="home">
        {/* 2. HERO SECTION */}
        <section className="relative w-full min-h-screen flex items-center bg-[#0D111A] text-white overflow-hidden pt-28 pb-20">
          {/* Background Photography */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80"
              alt="Warm luxury apartment interior living room"
              className="w-full h-full object-cover opacity-55 mix-blend-luminosity scale-105"
            />
            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D111A]/90 via-[#0D111A]/60 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D111A] via-transparent to-black/30 z-10" />
          </div>

          <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Content Column */}
              <div className="lg:col-span-8 space-y-8">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
                    SHARED LIVING. SIMPLIFIED
                  </span>
                  <div className="w-12 h-px bg-slate-400/50" />
                </div>

                {/* Editorial Headline */}
                <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tight leading-[1.04]">
                  Live Together.<br />
                  <span className="font-serif italic font-normal text-[#EAE4D8]">
                    Spend Smarter.
                  </span>
                </h1>

                {/* Supporting Text */}
                <p className="text-base sm:text-lg text-slate-300 font-sans font-normal max-w-xl leading-relaxed">
                  Track shared expenses, see who owes whom, and settle up effortlessly ΓÇö so you can focus on what really matters.
                </p>

                {/* CTA Row (1st referal empty play button removed) */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={handleGetStarted}
                    className="bg-[#D1A568] hover:bg-[#C29557] text-[#121826] px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2.5 active:scale-95"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Roommate Trust Badge */}
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0D111A] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Roommate 1" />
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0D111A] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Roommate 2" />
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0D111A] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="Roommate 3" />
                  </div>
                  <p className="text-xs text-slate-300 font-sans font-medium">
                    Trusted by <strong>10K+ roommates</strong> for a simpler, happier living.
                  </p>
                </div>
              </div>

              {/* Right Column Editorial Accent Text */}
              <div className="hidden lg:flex lg:col-span-4 flex-col items-end justify-between h-full pt-12 space-y-12">
                <div className="text-right space-y-1">
                  <p className="font-serif text-3xl italic text-[#D1A568]">Better</p>
                  <p className="font-serif text-3xl text-white">Roommates</p>
                  <p className="font-serif text-3xl italic text-[#D1A568]">Brighter</p>
                  <p className="font-serif text-3xl text-white">Days</p>
                  <div className="w-10 h-0.5 bg-[#D1A568] ml-auto mt-3" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. WHY FairShare SECTION */}
        <section id="why-FairShare" className="bg-[#F9F7F2] py-24 md:py-36 border-b border-[#EBE7DF] scroll-mt-16">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Text Box */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C7A6B]">
                    WHY FairShare
                  </span>
                  <div className="w-10 h-px bg-[#D6CEC2]" />
                </div>

                <h2 className="font-serif text-4xl md:text-5xl text-[#121826] tracking-tight leading-[1.1]">
                  More than an<br />
                  <span className="font-serif italic text-[#8C7A6B]">expense tracker.</span>
                </h2>
                <p className="text-lg font-serif italic text-[#555C6B]">
                  A better way to live together.
                </p>

                <p className="text-sm md:text-base text-[#555C6B] font-sans leading-relaxed">
                  Whether itΓÇÖs rent, groceries, utilities or a night out, FairShare helps you keep shared spending organized, fair and stress-free.
                </p>

                <div className="pt-2">
                  <a
                    href="#features"
                    onClick={(e) => handleScrollTo(e, 'features')}
                    className="inline-flex items-center gap-2.5 bg-[#121826] hover:bg-[#252E42] text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    <span>Explore Features</span>
                    <ArrowRight className="w-4 h-4 text-[#D1A568]" />
                  </a>
                </div>
              </div>

              {/* Right 2x2 Feature Benefit Grid */}
              <div className="lg:col-span-7 bg-[#FAF8F4] rounded-3xl border border-[#E6E1D7] p-8 md:p-10 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
                  {/* Block 1 */}
                  <div className="space-y-3 pb-6 sm:pb-0 border-b sm:border-b-0 border-[#E6E1D7] sm:border-r sm:pr-6">
                    <div className="w-11 h-11 rounded-full bg-[#F0ECE1] text-[#121826] flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-[#121826]">Clear Conversations</h3>
                    <p className="text-xs text-[#6B7280] leading-relaxed">No more awkward money talks</p>
                  </div>

                  {/* Block 2 */}
                  <div className="space-y-3 pb-6 sm:pb-0 border-b sm:border-b-0 border-[#E6E1D7] sm:pl-2">
                    <div className="w-11 h-11 rounded-full bg-[#F0ECE1] text-[#121826] flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-[#121826]">Transparent Splits</h3>
                    <p className="text-xs text-[#6B7280] leading-relaxed">Everyone sees the same details</p>
                  </div>

                  {/* Block 3 */}
                  <div className="space-y-3 pt-4 sm:border-r sm:pr-6 border-[#E6E1D7]">
                    <div className="w-11 h-11 rounded-full bg-[#F0ECE1] text-[#121826] flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-[#121826]">Save Time</h3>
                    <p className="text-xs text-[#6B7280] leading-relaxed">Automated calculations and smart suggestions</p>
                  </div>

                  {/* Block 4 */}
                  <div className="space-y-3 pt-4 sm:pl-2">
                    <div className="w-11 h-11 rounded-full bg-[#F0ECE1] text-[#121826] flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-[#121826]">Happier Homes</h3>
                    <p className="text-xs text-[#6B7280] leading-relaxed">Less stress, more memories</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS SECTION ΓÇö 5 PERFECTLY ALIGNED STEPS */}
        <section id="how-it-works" className="relative w-full bg-[#0D111A] text-white py-24 md:py-36 overflow-hidden scroll-mt-16">
          {/* Top Organic Wave Transition */}
          <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none -mt-1">
            <svg className="relative block w-full h-[40px] md:h-[70px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C300,90 600,-40 1200,40 L1200,0 L0,0 Z" fill="#F9F7F2"></path>
            </svg>
          </div>

          {/* Dark Background Photography Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=2400&q=80"
              alt="Dark warm luxury apartment"
              className="w-full h-full object-cover opacity-25 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-[#0D111A]/90 z-10" />
          </div>

          <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 w-full pt-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <div className="inline-flex items-center gap-3 mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D1A568]">
                    HOW IT WORKS
                  </span>
                  <div className="w-10 h-px bg-[#D1A568]/40" />
                </div>
                <h2 className="font-serif text-4xl md:text-5xl text-white tracking-tight leading-tight">
                  Get started<br />in minutes.
                </h2>
              </div>
              <p className="text-sm md:text-base text-slate-300 max-w-md font-sans leading-relaxed">
                A simple process for a more organized and stress-free shared living experience.
              </p>
            </div>

            {/* Horizontal 5-Step Process with Perfect Alignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative text-left">
              {/* Step 01 */}
              <div className="space-y-4 relative group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D1A568]/60 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-full border border-white/30 bg-white/5 flex items-center justify-center text-white group-hover:border-[#D1A568] group-hover:text-[#D1A568] transition-colors shrink-0">
                      <Home className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-[#D1A568] font-bold">01</span>
                  </div>
                  <h3 className="font-bold text-base text-white mb-1">Create a Room</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">Set up your shared space in seconds.</p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="space-y-4 relative group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D1A568]/60 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-full border border-white/30 bg-white/5 flex items-center justify-center text-white group-hover:border-[#D1A568] group-hover:text-[#D1A568] transition-colors shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-[#D1A568] font-bold">02</span>
                  </div>
                  <h3 className="font-bold text-base text-white mb-1">Add Your Roommates/Members</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">Invite your roommates or members to join.</p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="space-y-4 relative group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D1A568]/60 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-full border border-white/30 bg-white/5 flex items-center justify-center text-white group-hover:border-[#D1A568] group-hover:text-[#D1A568] transition-colors shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-[#D1A568] font-bold">03</span>
                  </div>
                  <h3 className="font-bold text-base text-white mb-1">Add Expenses</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">Track what everyone spends.</p>
                </div>
              </div>

              {/* Step 04 */}
              <div className="space-y-4 relative group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D1A568]/60 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-full border border-white/30 bg-white/5 flex items-center justify-center text-white group-hover:border-[#D1A568] group-hover:text-[#D1A568] transition-colors shrink-0">
                      <Scale className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-[#D1A568] font-bold">04</span>
                  </div>
                  <h3 className="font-bold text-base text-white mb-1">Split Fairly</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">Let FairShare calculate everyone's share.</p>
                </div>
              </div>

              {/* Step 05 */}
              <div className="space-y-4 relative group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D1A568]/60 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-full border border-white/30 bg-white/5 flex items-center justify-center text-white group-hover:border-[#D1A568] group-hover:text-[#D1A568] transition-colors shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-[#D1A568] font-bold">05</span>
                  </div>
                  <h3 className="font-bold text-base text-white mb-1">Settle Up</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">Clear balances with simple suggestions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Organic Wave Transition */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none -mb-1">
            <svg className="relative block w-full h-[40px] md:h-[70px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C300,90 600,-40 1200,40 L1200,120 L0,120 Z" fill="#F9F7F2"></path>
            </svg>
          </div>
        </section>

        {/* 5. FEATURES SECTION WITH EXACT 2ND REFERRAL IMAGE IN REAL DEVICE FRAME */}
        <section id="features" className="bg-[#F9F7F2] py-24 md:py-36 scroll-mt-16">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Feature Rows */}
              <div className="lg:col-span-6 space-y-8">
                <div>
                  <div className="inline-flex items-center gap-3 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C7A6B]">
                      FEATURES
                    </span>
                    <div className="w-10 h-px bg-[#D6CEC2]" />
                  </div>
                  <h2 className="font-serif text-4xl md:text-5xl text-[#121826] tracking-tight leading-[1.1]">
                    Everything you need<br />
                    for a smoother<br />
                    shared life.
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Row 1 */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E6E1D7] hover:border-[#121826] transition-all flex items-center justify-between group cursor-pointer shadow-xs">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F0ECE1] text-[#121826] flex items-center justify-center shrink-0">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#121826]">Expense Tracking</h3>
                        <p className="text-xs text-[#6B7280]">Add expenses with categories, receipts, and flexible split options.</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#D1A568] group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>

                  {/* Row 2 */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E6E1D7] hover:border-[#121826] transition-all flex items-center justify-between group cursor-pointer shadow-xs">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F0ECE1] text-[#121826] flex items-center justify-center shrink-0">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#121826]">Real-time Balances</h3>
                        <p className="text-xs text-[#6B7280]">See exactly who owes whom, instantly.</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#D1A568] group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>

                  {/* Row 3 */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E6E1D7] hover:border-[#121826] transition-all flex items-center justify-between group cursor-pointer shadow-xs">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F0ECE1] text-[#121826] flex items-center justify-center shrink-0">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#121826]">Smart Settlement Suggestions</h3>
                        <p className="text-xs text-[#6B7280]">Get clear, fair recommendations.</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#D1A568] group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>

                  {/* Row 4 */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E6E1D7] hover:border-[#121826] transition-all flex items-center justify-between group cursor-pointer shadow-xs">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F0ECE1] text-[#121826] flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#121826]">AI Assistant</h3>
                        <p className="text-xs text-[#6B7280]">Ask questions, get insights, and manage your finances ΓÇö all in chat.</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#D1A568] group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleGetStarted}
                    className="inline-flex items-center gap-2 bg-[#121826] hover:bg-[#252E42] text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    <span>Explore All Features</span>
                    <ArrowRight className="w-4 h-4 text-[#D1A568]" />
                  </button>
                </div>
              </div>

              {/* Right Side Attached Phone Reference Image Visual */}
              <div className="lg:col-span-6 relative flex flex-col items-center justify-center reveal-on-scroll reveal-stagger-2">
                <div className="relative w-full max-w-[340px] sm:max-w-[380px] flex items-center justify-center">
                  <img
                    src="/phone-mockup-reference.jpg"
                    alt="FairShare App Interface Mockup"
                    className="w-full h-auto object-contain max-h-[600px] transition-transform duration-500 hover:scale-[1.02]"
                  />
                </div>

                {/* Editorial Caption Below Image ΓÇö No Overlap */}
                <div className="mt-6 text-center space-y-1">
                  <p className="font-serif italic text-base text-[#121826]">
                    All your shared finances in one place <span className="text-[#D1A568]">Γñ╖</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. SOCIAL PROOF / BRAND STATISTICS SECTION */}
        <section className="relative w-full bg-[#0D111A] text-white py-24 md:py-36 overflow-hidden">
          {/* Top Organic Wave */}
          <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none -mt-1">
            <svg className="relative block w-full h-[40px] md:h-[70px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C300,90 600,-40 1200,40 L1200,0 L0,0 Z" fill="#F9F7F2"></path>
            </svg>
          </div>

          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=80"
              alt="Luxury modern living room background"
              className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-[#0D111A]/90 z-10" />
          </div>

          <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 text-center space-y-12 pt-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D1A568]">
                  BUILT FOR MODERN LIVING
                </span>
              </div>
              <h2 className="font-serif text-4xl md:text-6xl text-white tracking-tight leading-tight">
                Better Roommates<br />
                <span className="font-serif italic font-normal text-[#EAE4D8]">Brighter Days</span>
              </h2>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <Users className="w-6 h-6 text-[#D1A568] mx-auto mb-1" />
                <div className="text-3xl md:text-4xl font-extrabold text-white font-serif">10K+</div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Happy Users</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <Star className="w-6 h-6 text-[#D1A568] mx-auto mb-1 fill-[#D1A568]" />
                <div className="text-3xl md:text-4xl font-extrabold text-white font-serif">4.8/5</div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">User Rating</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <Heart className="w-6 h-6 text-[#D1A568] mx-auto mb-1 fill-[#D1A568]" />
                <div className="text-3xl md:text-4xl font-extrabold text-white font-serif">99%</div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Would Recommend</p>
              </div>
            </div>
          </div>

          {/* Bottom Organic Wave */}
          <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none -mb-1">
            <svg className="relative block w-full h-[40px] md:h-[70px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C300,90 600,-40 1200,40 L1200,120 L0,120 Z" fill="#F9F7F2"></path>
            </svg>
          </div>
        </section>

        {/* 7. FINAL CTA SECTION */}
        <section id="about" className="bg-[#F9F7F2] py-24 md:py-36 scroll-mt-16">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C7A6B]">
                    READY FOR A HAPPIER HOME
                  </span>
                  <div className="w-10 h-px bg-[#D6CEC2]" />
                </div>

                <h2 className="font-serif text-4xl md:text-6xl text-[#121826] tracking-tight leading-[1.08]">
                  Share the home.<br />
                  <span className="font-serif italic font-normal text-[#8C7A6B]">Not the headache.</span>
                </h2>

                <p className="text-sm md:text-base text-[#555C6B] font-sans max-w-lg leading-relaxed">
                  Start managing your shared expenses the smarter way.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={handleGetStarted}
                    className="bg-[#D1A568] hover:bg-[#C29557] text-[#121826] px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2.5 active:scale-95"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSignIn}
                    className="px-7 py-3.5 rounded-full border border-[#121826]/30 text-[#121826] hover:bg-[#121826]/5 transition-colors text-xs font-bold uppercase tracking-wider"
                  >
                    Sign In
                  </button>
                </div>
              </div>

              {/* Right Floating Light Card & Room Image */}
              <div className="lg:col-span-5 relative">
                <div className="rounded-3xl overflow-hidden shadow-xl border border-[#E6E1D7] relative aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
                    alt="Sunlit warm modern living space"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Floating Checklist Card */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-[#E6E1D7] shadow-xl space-y-2 text-xs font-bold text-[#121826]">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">Γ£ô</div>
                    <span>Shared Bills</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">Γ£ô</div>
                    <span>Stronger Friendships</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">Γ£ô</div>
                    <span>Happier Living</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. PROFESSIONAL DARK FOOTER */}
      <footer className="bg-[#0D111A] text-white pt-20 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-slate-800/80">
            {/* Left Column Brand */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center border border-white/20">
                  <Home className="w-4 h-4" />
                </div>
                <span className="font-bold text-xl text-white tracking-tight">FairShare</span>
              </div>
              <p className="text-xs text-slate-400 font-sans max-w-xs leading-relaxed">
                Shared living, simplified.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-2">
                <a href="#twitter" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-colors">
                  <Twitter className="w-3.5 h-3.5" />
                </a>
                <a href="#instagram" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-colors">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a href="#linkedin" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-colors">
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a href="#youtube" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-colors">
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Navigation Columns */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-6 text-xs">
              {/* Product */}
              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">PRODUCT</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="#features" onClick={(e) => handleScrollTo(e, 'features')} className="hover:text-white transition-colors">Features</a></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Pricing</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Security</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Download</span></li>
                </ul>
              </div>

              {/* Company */}
              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">COMPANY</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="#about" onClick={(e) => handleScrollTo(e, 'about')} className="hover:text-white transition-colors">About</a></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Careers</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Blog</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Contact</span></li>
                </ul>
              </div>

              {/* Legal */}
              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">LEGAL</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer">Cookie Policy</span></li>
                </ul>
              </div>
            </div>

            {/* Right Newsletter Card */}
            <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <h4 className="font-bold text-xs text-white">Stay in the loop</h4>
              <p className="text-[11px] text-slate-400">Get product updates and new features.</p>
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D1A568]"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-xl bg-[#D1A568] hover:bg-[#C29557] text-[#121826] flex items-center justify-center shrink-0 transition-all font-bold"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              {subscribed && (
                <p className="text-[10px] text-emerald-400 font-bold">Subscribed successfully!</p>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>┬⌐ 2026 FairShare. All rights reserved.</p>
            <p className="font-serif italic text-slate-400">A smarter way to live together.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
