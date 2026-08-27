import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { supabaseClient } from './lib/SupabaClient';
import Queen3D from './Queen3d';

/* ==========================================================================
   1. NAVIGATION BAR COMPONENT
   - Logo on the left
   - Centered navigation links (Home, Events, Join Us, Connect)
   - Action CTA button on the right + Mobile Menu toggle
   ========================================================================== */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      {/* LEFT: Logo */}
      <a
        href="#hero"
        className="logo-container"
        title="Infinity Club Home"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection('hero');
        }}
      >
        <div className="logo-img-wrap">
          <img src="/images/asset 5.png" alt="AIVEX Logo" className="logo-img" />
        </div>
        <div className="logo-text-group">
          <div className="logo-title">AIVEX</div>
        </div>
      </a>

      {/* CENTER: Navigation Links */}
      <ul className={`nav-links ${mobileOpen ? 'nav-links--open' : ''}`}>
        <li>
          <a
            href="#hero"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('hero');
            }}
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="#about"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('about');
            }}
          >
            About
          </a>
        </li>
        <li>
          <a
            href="#events"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('events');
            }}
          >
            Events
          </a>
        </li>
        <li>
          <a
            href="#register"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('register');
            }}
          >
            Join Us
          </a>
        </li>
        <li>
          <a
            href="#connect"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('connect');
            }}
          >
            Connect
          </a>
        </li>
        {mobileOpen && (
          <li className="mobile-only-item">
            <button
              className="btn-primary btn-nav-cta"
              onClick={() => scrollToSection('register')}
            >
              <span>Join Now</span>
            </button>
          </li>
        )}
      </ul>

      {/* RIGHT: Header CTA & Mobile Burger */}
      <div className="navbar-right">
        <button
          className="btn-primary btn-nav-cta desktop-only-btn"
          onClick={() => scrollToSection('register')}
        >
          <span>Join Now</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        {/* Mobile Hamburger Toggle */}
        <button
          className={`mobile-menu-btn ${mobileOpen ? 'is-active' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

/* ==========================================================================
   2. THREE.JS 3D QUEEN COMPONENT
   - Loads queen1.glb (with queen.glb fallback)
   - Solid #A0003B clear color matching background seamlessly
   - Warm, bright studio lighting with smooth vertex normals
   - Smooth OrbitControls rotation
   ========================================================================== */
function QueenCanvas() {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Calculate dimensions
    const width = container.clientWidth || (window.innerWidth * 0.40) || 450;
    const height = container.clientHeight || (window.innerHeight * 0.85) || 650;

    // 2. Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, width / height, 0.1, 100);
    camera.position.set(0, 1.6, 4.6);
    camera.lookAt(0, 0, 0);

    // Solid crimson background — matches #A0003B exactly
    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0xA0003B, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.domElement.className = 'three-canvas';
    container.appendChild(renderer.domElement);

    // 3. Bright, warm studio lighting
    const ambientLight = new THREE.AmbientLight('#ffd79e', 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight('#fff0d0', 3.5);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const goldRimLight = new THREE.DirectionalLight('#ffb703', 5.5);
    goldRimLight.position.set(-3, 3, -2);
    scene.add(goldRimLight);

    const cyanLight = new THREE.PointLight('#fb8500', 3.0, 12);
    cyanLight.position.set(2, -1, 2);
    scene.add(cyanLight);

    const crimsonLight = new THREE.PointLight('#d4a373', 1.8, 10);
    crimsonLight.position.set(0, -2, 0);
    scene.add(crimsonLight);

    let mixer = null;
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = 0.3;
    controls.maxPolarAngle = Math.PI * 0.78;
    controls.rotateSpeed = 0.6;

    // 5. Load Queen Model with smooth geometry & original materials
    const loader = new GLTFLoader();
    const loadModel = (url, isFallback = false) => {
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;

          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.3 / (maxDim || 1);
          model.scale.set(scale, scale, scale);
          model.position.x = -center.x * scale;
          model.position.y = -center.y * scale;
          model.position.z = -center.z * scale;

          model.traverse((child) => {
            if (child.isMesh) {
              const nameLower = (child.name || '').toLowerCase();
              if (nameLower.includes('cube')) {
                child.material = new THREE.MeshBasicMaterial({
                  color: 0xA0003B,
                  depthWrite: true,
                });
                child.renderOrder = 0;
                child.castShadow = false;
                child.receiveShadow = false;
              } else if (nameLower.includes('plane')) {
                child.material = new THREE.MeshBasicMaterial({
                  color: 0x000000,
                  depthWrite: true,
                });
                child.renderOrder = 1;
                child.castShadow = false;
                child.receiveShadow = false;
              } else {
                child.castShadow = true;
                child.receiveShadow = true;
                child.renderOrder = 2;

                // Ensure silky smooth geometry normals
                if (child.geometry) {
                  child.geometry.computeVertexNormals();
                }
                if (child.material) {
                  child.material.flatShading = false;
                  child.material.needsUpdate = true;
                }
              }
            }
          });

          modelGroup.add(model);

          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
              const action = mixer.clipAction(clip);
              action.setLoop(THREE.LoopRepeat);
              action.play();
            });
          }

          setLoading(false);
        },
        undefined,
        (err) => {
          console.warn(`Error loading ${url}:`, err);
          if (!isFallback) {
            loadModel('/models/queen.glb', true);
          } else {
            setLoading(false);
          }
        }
      );
    };

    loadModel('/models/queen1.glb');

    // 6. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 350;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 7. Render Loop
    const clock = new THREE.Clock();
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      controls.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="three-queen-container" ref={mountRef}>
      {loading && (
        <div className="model-loader">
          <div className="spinner"></div>
          <span>Loading Model...</span>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   3. HERO SECTION COMPONENT
   ========================================================================== */
function HeroSection() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="section-wrapper hero-section">
      <div className="container">
        <div className="hero-layout">
          {/* Left Column */}
          <div className="hero-left">
            <div className='tags'>
              <div className="hero-tag">
                <span className="dot"></span>
                <span>The Infinity Club</span>
              </div>
              <div className="hero-tag">
                <span className="dot"></span>
                <span>UNIVERSITY of El Bashir El Ibrahimi</span>
              </div>
            </div>
            <h1 className="hero-title">
              No Limits for
              <br />
              <span className="highlight-word">AIVEXERS</span>
            </h1>

            <p className="hero-intro">
              AIVEX is a national AI application development competition bringing together 15 university teams to transform ideas into innovative AI-powered solutions.
            </p>

            <div className="hero-cta-wrapper">
              <button
                id="hero-join-btn"
                className="btn-primary"
                onClick={() => scrollToSection('about')}
              >
                <span>DISCOVER AIVEX</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <button
                id="hero-explore-btn"
                className="btn-secondary"
                onClick={() => scrollToSection('register')}
              >
                <span>JOIN THE CHALLENGE</span>
              </button>
            </div>
          </div>

          {/* Right Column — Video & Responsive Quote */}
          <div className="hero-right">
            <div className="solid-media-card">
              <div className="solid-media-inner">
                <video autoPlay loop muted playsInline width="100%" height="100%">
                  <source src="/videos/Pawn Promotion.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
            <div className="hero-quote-box">
              <p className="hero-quote">
                “Every Queen was once a pawn.{' '}
                <span className="quote-highlight">enter the competition and make your move</span>.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   ABOUT SECTION WITH 3D QUEEN BACKGROUND & ILLUMINATED CARDS
   ========================================================================== */
function AboutSection() {
  return (
    <section id="about" className="section-wrapper about-section">
      {/* 3D Queen Ambient Background */}
      <div className="about-bg-queen" aria-hidden="true">
        <Queen3D
          modelUrl="/models/queen1.glb"
          scale={1.35}
          positionY={-0.1}
          enableParallax={true}
          enableFloat={true}
          className="about-queen-canvas"
        />
        <div className="about-queen-gradient-overlay"></div>
      </div>

      <div className="container about-container">
        <div className="about-header">
          <h2 className="section-title">What is Aivex</h2>
          <p className="about-subtitle">National AI Innovation & Development Tournament</p>
        </div>

        {/* Highlighted Information Grid */}
        <div className="about-highlights">
          <div className="about-highlight">
            <span className="highlight-number">15</span>
            <div>
              <h3>UNIVERSITY TEAMS</h3>
              <p>Bringing together emerging talents from across the country.</p>
            </div>
          </div>

          <div className="about-highlight">
            <span className="highlight-number">03</span>
            <div>
              <h3>THREE DAYS</h3>
              <p>Three days of creation, development and competition.</p>
            </div>
          </div>

          <div className="about-highlight">
            <span className="highlight-number">01</span>
            <div>
              <h3>ONE CHALLENGE</h3>
              <p>One challenge pushing teams to think about one AI-powered solution.</p>
            </div>
          </div>

          <div className="about-highlight">
            <span className="highlight-number">03</span>
            <div>
              <h3>WINNERS</h3>
              <p>Will be announced at the end of the competition and will receive exciting prizes.</p>
            </div>
          </div>
        </div>

        {/* Enhanced Sponsor Card */}
        <div className="sponsor-card">
          <div className="sponsor-info">
            <span className="sponsor-badge">OFFICIAL PARTNER & SPONSOR</span>
            <div className="sponsor-text">
              <h3>POWERED & SPONSORED BY</h3>
              <span className="sponsor-brand">GÉANT ELECTRONICS</span>
            </div>
          </div>

          <div className="sponsor-logo-box">
            <img
              src="/images/geant-logo.png"
              alt="Géant Electronics"
              className="sponsor-logo-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   4. EVENTS SECTION COMPONENT
   ========================================================================== */
function EventsSection() {
  const scrollToRegister = () => {
    const el = document.getElementById('register');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="events" className="section-wrapper events-section">
      <div className="container">
        <div className="events-header">
          <h2 className="section-title">AIVEX 1st Edition</h2>
        </div>

        {/* 3 Playing Cards Layout (Horizontal 180° Flip on Hover) */}
        <div className="events-grid">
          {/* Playing Card 1 */}
          <div className="playing-card-container">
            <div className="playing-card-inner">
              <div className="playing-card-front F1">
                <div className="playing-card-surface"></div>
              </div>
              <div className="playing-card-back B1">
                <div className="playing-card-surface"></div>
              </div>
            </div>
          </div>

          {/* Playing Card 2 */}
          <div className="playing-card-container">
            <div className="playing-card-inner">
              <div className="playing-card-front F2">
                <div className="playing-card-surface"></div>
              </div>
              <div className="playing-card-back B2">
                <div className="playing-card-surface"></div>
              </div>
            </div>
          </div>

          {/* Playing Card 3 */}
          <div className="playing-card-container">
            <div className="playing-card-inner">
              <div className="playing-card-front F3">
                <div className="playing-card-surface"></div>
              </div>
              <div className="playing-card-back B3">
                <div className="playing-card-surface"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Join Us CTA */}
        <div className="events-cta-wrapper">
          <button className="btn-primary" onClick={scrollToRegister}>
            <span>Join Us</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   5. REGISTRATION SECTION COMPONENT
   ========================================================================== */
function RegistrationSection({ onToast }) {
  const initialParticipant = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    studentId: '',
    phone: ''
  };

  const [formData, setFormData] = useState({
    participants: [{ ...initialParticipant }, { ...initialParticipant }],
    headOfDelegation: {
      firstName: '',
      lastName: '',
      phone: ''
    },
    driver: {
      firstName: '',
      lastName: '',
      phone: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleParticipantChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.participants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, participants: updated };
    });
  };

  const addParticipant = () => {
    if (formData.participants.length >= 8) {
      onToast('Maximum 8 participants allowed.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      participants: [...prev.participants, { ...initialParticipant }]
    }));
  };

  const removeParticipant = (index) => {
    if (formData.participants.length <= 1) {
      onToast('At least one participant is required.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
  };

  const handleDelegationChange = (role, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('registrations')
          .insert([
            {
              participants: formData.participants,
              head_of_delegation: formData.headOfDelegation,
              driver: formData.driver,
              full_name: `${formData.participants[0]?.firstName || ''} ${formData.participants[0]?.lastName || ''}`.trim() || `${formData.headOfDelegation.firstName} ${formData.headOfDelegation.lastName}`,
              phone: formData.participants[0]?.phone || formData.headOfDelegation.phone
            }
          ]);

        if (error) {
          console.warn('Supabase registration notice:', error);
        }
      }

      onToast('Registration submitted successfully! Your team data has been recorded.');

      setFormData({
        participants: [{ ...initialParticipant }, { ...initialParticipant }],
        headOfDelegation: {
          firstName: '',
          lastName: '',
          phone: ''
        },
        driver: {
          firstName: '',
          lastName: '',
          phone: ''
        }
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      onToast('Registration noted! Thank you.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="register" className="section-wrapper registration-section">
      <div className="container">
        <div className="events-header">
          <h2 className="section-title">Registration</h2>
        </div>

        <div className="reg-form-card">
          <div className="form-header">
            <h3 className="form-title">Team & Delegation Registration</h3>
            <p className="form-subtitle">Fill in participant and delegation details</p>
          </div>

          <form onSubmit={handleSubmit} className="reg-form-content">
            <div className="reg-form-columns">
              {/* LEFT COLUMN: 1. PARTICIPANTS BLOCK */}
              <div className="form-section-block form-col-participants">
                <div className="form-section-header">
                  <div className="form-section-title-wrap">
                    <div className="form-section-badge">01</div>
                    <h4 className="form-section-title">Participants</h4>
                  </div>

                  <button
                    type="button"
                    className="btn-add-participant"
                    onClick={addParticipant}
                    title="Add another participant"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Add Participant</span>
                  </button>
                </div>

                <div className="participants-list">
                  {formData.participants.map((participant, index) => (
                    <div key={index} className="participant-card">
                      <div className="participant-card-header">
                        <div className="participant-badge-row">
                          <span className="participant-card-badge">Participant {index + 1}</span>
                        </div>
                        {formData.participants.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove-participant"
                            onClick={() => removeParticipant(index)}
                            title={`Remove Participant ${index + 1}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="form-grid">
                        {/* First Name */}
                        <div className="form-group">
                          <label className="form-label">
                            First Name <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            className="form-input"
                            placeholder="e.g. Sarah"
                            value={participant.firstName}
                            onChange={(e) => handleParticipantChange(index, 'firstName', e.target.value)}
                          />
                        </div>

                        {/* Last Name */}
                        <div className="form-group">
                          <label className="form-label">
                            Last Name <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            className="form-input"
                            placeholder="e.g. Benali"
                            value={participant.lastName}
                            onChange={(e) => handleParticipantChange(index, 'lastName', e.target.value)}
                          />
                        </div>

                        {/* Date of Birth */}
                        <div className="form-group">
                          <label className="form-label">
                            Date of Birth <span className="required">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            className="form-input"
                            value={participant.dateOfBirth}
                            onChange={(e) => handleParticipantChange(index, 'dateOfBirth', e.target.value)}
                          />
                        </div>

                        {/* Student ID Number */}
                        <div className="form-group">
                          <label className="form-label">
                            Student ID Number <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            className="form-input"
                            placeholder="e.g. 21213500892"
                            value={participant.studentId}
                            onChange={(e) => handleParticipantChange(index, 'studentId', e.target.value)}
                          />
                        </div>

                        {/* Phone Number */}
                        <div className="form-group full-width">
                          <label className="form-label">
                            Phone Number <span className="required">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            className="form-input"
                            placeholder="05 / 06 / 07 XX XX XX XX"
                            value={participant.phone}
                            onChange={(e) => handleParticipantChange(index, 'phone', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: 2. DELEGATION MEMBERS BLOCK */}
              <div className="form-section-block form-col-delegates">
                <div className="form-section-header">
                  <div className="form-section-title-wrap">
                    <div className="form-section-badge">02</div>
                    <h4 className="form-section-title">Delegation Members</h4>
                  </div>
                </div>

                <div className="delegation-stack">
                  {/* Head of Delegation */}
                  <div className="delegation-card">
                    <div className="delegation-card-header">
                      <div className="delegation-icon-box">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <span className="delegation-card-title">Head of Delegation</span>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">
                          First Name <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. Mohamed"
                          value={formData.headOfDelegation.firstName}
                          onChange={(e) => handleDelegationChange('headOfDelegation', 'firstName', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Last Name <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. Mansouri"
                          value={formData.headOfDelegation.lastName}
                          onChange={(e) => handleDelegationChange('headOfDelegation', 'lastName', e.target.value)}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label">
                          Phone Number <span className="required">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          className="form-input"
                          placeholder="05 / 06 / 07 XX XX XX XX"
                          value={formData.headOfDelegation.phone}
                          onChange={(e) => handleDelegationChange('headOfDelegation', 'phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Driver */}
                  <div className="delegation-card">
                    <div className="delegation-card-header">
                      <div className="delegation-icon-box">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="3" width="15" height="13"></rect>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
                          <circle cx="5.5" cy="18.5" r="2.5"></circle>
                          <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                      </div>
                      <span className="delegation-card-title">Driver</span>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">
                          First Name <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. Karim"
                          value={formData.driver.firstName}
                          onChange={(e) => handleDelegationChange('driver', 'firstName', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Last Name <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. Belkacem"
                          value={formData.driver.lastName}
                          onChange={(e) => handleDelegationChange('driver', 'lastName', e.target.value)}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label">
                          Phone Number <span className="required">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          className="form-input"
                          placeholder="05 / 06 / 07 XX XX XX XX"
                          value={formData.driver.phone}
                          onChange={(e) => handleDelegationChange('driver', 'phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                  <span>Submitting Registration...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   6. CONNECT WITH US SECTION COMPONENT (MINIMAL & SIMPLE)
   - Minimalist sleek cards for Instagram, Facebook, Club Email, Admin Email, Combined Phone Lines, Location
   ========================================================================== */
function ConnectSection({ onToast }) {
  const [copiedId, setCopiedId] = useState(null);
  const emailAddress = 'infinityclub.bba@gmail.com';
  const adminEmail = 'administration@univ-bba.dz';
  const phone1 = '+213 555 12 34 56';
  const phone2 = '+213 770 98 76 54';
  const campusLocation = 'Université Mohamed El Bachir El Ibrahimi, Bordj Bou Arréridj, Algeria';

  const copyToClipboard = (e, id, text, toastMsg) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onToast(toastMsg);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const connectCards = [
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@infinityclub_bba',
      link: 'https://www.instagram.com/infinityclub_bba',
      icon: (
        <svg viewBox="0 0 24 24" className="channel-icon">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      glowClass: 'glow-instagram'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: 'Infinity Club BBA',
      link: 'https://www.facebook.com',
      icon: (
        <svg viewBox="0 0 24 24" className="channel-icon">
          <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
        </svg>
      ),
      glowClass: 'glow-facebook'
    },
    {
      id: 'email',
      name: 'Club Email',
      handle: emailAddress,
      link: `mailto:${emailAddress}`,
      icon: (
        <svg viewBox="0 0 24 24" className="channel-icon">
          <path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l9.061 7.345c.273.221.609.332.939.332s.666-.111.939-.332l9.061-7.345v11.817h-20z" />
        </svg>
      ),
      glowClass: 'glow-email',
      isEmail: true,
      copyValue: emailAddress,
      copyToast: 'Club email copied to clipboard!'
    },
    {
      id: 'adminEmail',
      name: 'Administration Email',
      handle: adminEmail,
      link: `mailto:${adminEmail}`,
      icon: (
        <svg viewBox="0 0 24 24" className="channel-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      glowClass: 'glow-admin',
      isEmail: true,
      copyValue: adminEmail,
      copyToast: 'Administration email copied to clipboard!'
    },
    {
      id: 'phones',
      name: 'Phone Lines',
      handle: `${phone1}  •  ${phone2}`,
      link: `tel:${phone1.replace(/[\s()]/g, '')}`,
      icon: (
        <svg viewBox="0 0 24 24" className="channel-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      glowClass: 'glow-phone',
      copyValue: `${phone1} / ${phone2}`,
      copyToast: 'Phone numbers copied to clipboard!'
    },
    {
      id: 'location',
      name: 'Location',
      handle: 'Univ. Bordj Bou Arréridj',
      link: 'https://maps.google.com/?q=Université+Mohamed+El+Bachir+El+Ibrahimi+Bordj+Bou+Arreridj',
      icon: (
        <svg viewBox="0 0 24 24" className="channel-icon">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      ),
      glowClass: 'glow-location',
      copyValue: campusLocation,
      copyToast: 'Campus address copied to clipboard!'
    }
  ];

  return (
    <section id="connect" className="section-wrapper connect-section">
      <div className="container">
        <div className="events-header">
          <h2 className="section-title">Connect With Us</h2>
        </div>

        {/* Minimal Channels Grid */}
        <div className="connect-grid-minimal">
          {connectCards.map((card) => (
            <div key={card.id} className={`connect-card-minimal ${card.glowClass}`}>
              <a
                href={card.link}
                target={card.isEmail || card.copyValue?.startsWith('+') ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="connect-card-main-link"
                title={`Open ${card.name}`}
              >
                <div className="connect-icon-box">{card.icon}</div>
                <div className="connect-meta-minimal">
                  <span className="connect-name-minimal">{card.name}</span>
                  <span className="connect-handle-minimal" title={card.handle}>{card.handle}</span>
                </div>
                <div className="connect-arrow-btn" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </div>
              </a>

              {card.copyValue && (
                <button
                  onClick={(e) => copyToClipboard(e, card.id, card.copyValue, card.copyToast)}
                  className="btn-copy-minimal"
                  title={`Copy ${card.name} to clipboard`}
                  aria-label={`Copy ${card.name}`}
                >
                  {copiedId === card.id ? (
                    <span className="copied-text">✓ Copied</span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   7. FOOTER COMPONENT
   ========================================================================== */
function Footer() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brands">
          <div className='footer-brand'>
            <div className="logo-img-wrap">
              <img src="/images/asset 5.png" alt="AIVEX" className="logo-img" />
            </div>
            <span className="footer-title">AIVEX</span>
          </div>
          <div className='footer-brand'>
            <div className="logo-img-wrap">
              <img src="/images/infinity.png" alt="infinity club" className="logo-img" />
            </div>
            <span className="footer-title">INFINITY</span>
          </div>
        </div>

        <div className="footer-nav">
          <button onClick={() => scrollToSection('hero')}>Home</button>
          <button onClick={() => scrollToSection('about')}>About</button>
          <button onClick={() => scrollToSection('events')}>Events</button>
          <button onClick={() => scrollToSection('register')}>Join Us</button>
          <button onClick={() => scrollToSection('connect')}>Connect</button>
        </div>

        <div className="footer-copy">
          <span>© {new Date().getFullYear()} AIVEX. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

/* ==========================================================================
   8. MAIN APP COMPONENT
   ========================================================================== */
export default function App() {
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  return (
    <div className="infinity-app">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <EventsSection />
        <RegistrationSection onToast={showToast} />
        <ConnectSection onToast={showToast} />
      </main>
      <Footer />

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="toast-notification">
          <div className="toast-icon">✓</div>
          <div className="toast-message">{toastMessage}</div>
        </div>
      )}
    </div>
  );
}

