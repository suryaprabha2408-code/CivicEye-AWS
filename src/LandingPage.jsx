import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import myLogo from './logo.png'; 
import { db } from './firebaseConfig'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore';

function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- NOTIFICATION STATE ---
  const [showNotifications, setShowNotifications] = useState(false);
  const [myNotifications, setMyNotifications] = useState([]);
  const [user, setUser] = useState(null);

  // --- CHATBOT STATE ---
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: '👋 Vanakkam! Welcome to Civic Eye. How can I assist you today?' }
  ]);
  const chatEndRef = useRef(null);

  // --- GOVT SCHEMES DATA ---
  const govtSchemes = [
    {
      id: 1,
      title: "Kalaignar Magalir Urimai Thogai",
      status: "ACTIVE SCHEME",
      img: "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fHdvbWVuJTIwY2FzaHxlbnwwfHwwfHx8MA%3D%3D", 
      desc: "Rs. 1,000 Monthly Financial Assistance for eligible women heads of families."
    },
    {
      id: 2,
      title: "Illam Thedi Kalvi",
      status: "EDUCATION",
      img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop", 
      desc: "Bridging learning gaps by bringing education to the doorstep of students."
    },
    {
      id: 3,
      title: "Makkalai Thedi Maruthuvam",
      status: "HEALTHCARE",
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop", 
      desc: "Doorstep healthcare services for non-communicable diseases & physiotherapy."
    },
    {
      id: 4,
      title: "Naan Mudhalvan",
      status: "SKILL DEV",
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop", 
      desc: "Skill development scheme to empower youth and students for better careers."
    }
  ];

  // --- SLIDER LOGIC ---
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % govtSchemes.length);
    }, 5000); 
    return () => clearInterval(slideInterval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % govtSchemes.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + govtSchemes.length) % govtSchemes.length);
  };

  // --- AUTH & NOTIFICATION CHECK ---
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
        setIsLoggedIn(true);
        setUser(storedUser);

        if (storedUser.role !== 'admin') {
            const q = query(collection(db, "complaints"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Filter: My complaints that are Solved or In Progress
                const updates = data.filter(c => 
                    c.user_name === storedUser.username && 
                    (c.status === 'Solved' || c.status === 'In Progress')
                );
                setMyNotifications(updates);
            });
            return () => unsubscribe();
        }
    }
  }, []);

  const handleAuthAction = () => {
    if (isLoggedIn) {
      if (window.confirm("Are you sure you want to Logout?")) {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        window.location.reload(); 
      }
    } else {
      navigate('/login');
    }
  };

  const handleReportClick = () => {
    const user = localStorage.getItem('user');
    user ? navigate('/dashboard') : navigate('/login');
  };

  const publicAnnouncements = [
    "⚠️ Power Cut Alert: Anna Nagar (Tomorrow 9 AM - 2 PM)",
    "💉 Polio Camp: Sunday 8 AM at City Hospital",
    "🌧️ Heavy Rain Alert: School Holiday Declared",
    "🚧 Road Work: Main Street Closed for 2 Days"
  ];

  // --- CHATBOT LOGIC ---
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = chatInput.toLowerCase();
    setChatInput("");

    setTimeout(() => {
      let botResponse = "";
      if (currentInput.includes("hello") || currentInput.includes("hi")) {
        botResponse = "Hello! You can ask me about 'Schemes', 'Complaints', or 'Contact' info.";
      } else if (currentInput.includes("scheme")) {
        botResponse = "We have schemes like Magalir Urimai Thogai and Illam Thedi Kalvi. Scroll down to the slider to see more!";
      } else if (currentInput.includes("complaint") || currentInput.includes("report")) {
        botResponse = "To file a complaint, please click the 'File a Complaint' button in the main banner.";
      } else if (currentInput.includes("contact") || currentInput.includes("phone")) {
        botResponse = "You can reach our helpline at 1913 or email support@civiceye.tn.gov.in.";
      } else {
        botResponse = "I am not sure about that yet. Please try asking about 'Schemes' or 'Complaints'.";
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  return (
    <div className="app-container">
      {/* --- CSS STYLES --- */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Merriweather:wght@700&display=swap');
          :root { --primary: #1e3a8a; --secondary: #1d4ed8; --accent: #f59e0b; --text-main: #0f172a; --bg: #f8fafc; }
          body, html { margin: 0; padding: 0; font-family: 'Roboto', sans-serif; background: var(--bg); overflow-x: hidden; }

          @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }

          .app-container { padding-top: 125px; } 

          /* TOP BAR */
          .top-bar { 
            position: fixed; top: 0; left: 0; width: 100%; height: 40px; 
            background: #0f172a; color: white; padding: 0 5%; 
            display: flex; align-items: center; justify-content: space-between; 
            font-size: 0.8rem; font-weight: 500; z-index: 1002; box-sizing: border-box;
          }
          .top-links span { margin-left: 15px; cursor: pointer; opacity: 0.8; }

          /* NAVBAR */
          .navbar { 
            position: fixed; top: 40px; left: 0; width: 100%; z-index: 1001; 
            background: white; padding: 0 5%; height: 75px; 
            display: flex; justify-content: space-between; align-items: center; 
            box-sizing: border-box; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); 
            border-bottom: 4px solid var(--accent); 
          }

          .nav-logo { display: flex; align-items: center; gap: 15px; cursor: pointer; }
          .nav-logo img { height: 65px; }
          .nav-logo h2 { font-family: 'Merriweather', serif; font-size: 1.5rem; color: var(--primary); margin: 0; line-height: 1.2; }
          .nav-logo span { font-size: 0.75rem; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; display: block; }

          /* DESKTOP MENU */
          .nav-menu { display: flex; gap: 30px; align-items: center; }
          .nav-link { color: #334155; font-weight: 600; font-size: 1rem; cursor: pointer; text-decoration: none; position: relative; padding: 5px 0; transition: color 0.3s; }
          .nav-link:hover { color: var(--secondary); }
          .nav-link::after { content: ''; position: absolute; width: 0; height: 2px; bottom: 0; left: 0; background-color: var(--accent); transition: width 0.3s; }
          .nav-link:hover::after { width: 100%; }
          .btn-login-main { padding: 10px 25px; background: var(--primary); color: white; border: none; font-weight: 500; cursor: pointer; border-radius: 4px; transition: 0.3s; }
          .btn-login-main:hover { background: #172554; }

          /* 🔥 FIX: NOTIFICATION SCROLLABLE 🔥 */
          .notif-wrapper { position: relative; }
          .notif-btn { background: none; border: none; font-size: 1.4rem; cursor: pointer; position: relative; margin-right: 10px; }
          .notif-badge { position: absolute; top: -5px; right: -5px; background: red; color: white; font-size: 0.7rem; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }

          .notif-dropdown { 
            position: absolute; top: 50px; right: 0; 
            width: 300px; 
            background: white; border-radius: 8px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
            z-index: 2000; border: 1px solid #e2e8f0; 

            /* --- THIS FIXES THE SCROLL ISSUE --- */
            max-height: 400px; /* Limits height */
            overflow-y: auto;  /* Enables scroll inside box */
            /* ----------------------------------- */
          }

          .notif-item { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; display:flex; align-items:center; gap:10px; }
          .notif-item:hover { background: #f8fafc; }

          /* HAMBURGER ICON (Hidden on Desktop) */
          .hamburger { display: none; font-size: 28px; cursor: pointer; color: var(--primary); }

          /* MOBILE MENU OVERLAY */
          .mobile-menu-overlay {
             display: none; flex-direction: column; background: white; 
             position: fixed; top: 125px; left: 0; width: 100%; 
             padding: 20px; box-shadow: 0 10px 10px rgba(0,0,0,0.1); z-index: 1000;
             border-bottom: 2px solid var(--accent);
          }
          .mobile-menu-link { padding: 15px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold; color: var(--primary); text-decoration: none; display: block; }

          /* --- RESPONSIVE MEDIA QUERIES --- */
          @media (max-width: 900px) {
             .nav-menu { display: none; } /* Hide Desktop Menu */
             .hamburger { display: block; } /* Show Hamburger */
             .mobile-menu-overlay.open { display: flex; } /* Show Menu when open */
             .top-links { display: none; } /* Hide helpline on small mobile */
             .top-bar { justify-content: center; }
             .nav-logo img { height: 45px; } /* Resize logo */
             .nav-logo h2 { font-size: 1.2rem; }
             .nav-logo span { font-size: 0.6rem; }
             .hero h1 { font-size: 2rem; }
             .stats-container { margin-top: 20px; }
          }

          /* TICKER */
          .ticker-section { background: #fee2e2; color: #991b1b; height: 45px; display: flex; align-items: center; overflow: hidden; border-bottom: 1px solid #fecaca; position: relative; }
          .ticker-label { background: #ef4444; color: white; height: 100%; padding: 0 15px; display: flex; align-items: center; font-weight: 700; font-size: 0.8em; text-transform: uppercase; z-index: 10; box-shadow: 2px 0 10px rgba(0,0,0,0.1); }
          .ticker-content { display: inline-block; white-space: nowrap; padding-left: 100%; animation: scroll 20s linear infinite; font-weight: 600; color: #7f1d1d; }

          /* HERO */
          .hero { height: 80vh; background: linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.6)), url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; text-align: center; color: white; }
          .hero h1 { font-family: 'Merriweather', serif; font-size: 3rem; margin-bottom: 15px; padding: 0 10px; }
          .hero-btn { padding: 15px 35px; font-size: 1.1rem; border: none; cursor: pointer; font-weight: 600; border-radius: 5px; transition: 0.3s; margin: 10px; }
          .btn-primary { background: var(--accent); color: #fff; }

          /* STATS */
          .stats-container { display: flex; justify-content: center; gap: 20px; margin-top: -50px; position: relative; z-index: 10; padding: 0 20px; flex-wrap: wrap; }
          .stat-card { background: white; padding: 25px; border-radius: 8px; width: 220px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-top: 5px solid var(--primary); }
          .stat-num { font-size: 2rem; font-weight: 800; color: var(--primary); display: block; margin-bottom: 5px; }

          /* FEATURES */
          .section-title { text-align: center; font-family: 'Merriweather', serif; font-size: 2.2rem; color: var(--primary); margin: 60px 0 40px; }
          .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto; padding: 0 20px; }
          .feature-card { background: white; padding: 30px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }

          /* SLIDER CSS */
          .explore-container { padding-bottom: 60px; }
          .explore-wrapper { background: white; box-shadow: 0 10px 40px rgba(0,0,0,0.1); margin: 0 auto; max-width: 1300px; display: flex; flex-wrap: wrap; border-radius: 8px; overflow: hidden; }
          .slider-side { flex: 1.5; min-width: 300px; position: relative; height: 500px; overflow: hidden; background: #0f172a; }
          .slide-img { width: 100%; height: 100%; object-fit: cover; transition: opacity 0.5s ease; display: block; opacity: 0.85; }
          .slide-content { position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(to top, rgba(0,0,0,0.95), transparent); color: white; padding: 50px 30px 30px; z-index: 2; box-sizing: border-box; }
          .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); border: none; color: white; padding: 15px; cursor: pointer; border-radius: 50%; backdrop-filter: blur(5px); font-size: 1.2rem; transition: 0.3s; z-index: 3; }
          .nav-btn:hover { background: white; color: black; }
          .prev { left: 20px; } .next { right: 20px; }

          /* INFO SIDE */
          .info-side { flex: 1; min-width: 300px; background: #1e3a8a; color: white; padding: 40px; display: flex; flex-direction: column; justify-content: center; }
          .scheme-link { display: flex; align-items: center; background: rgba(255,255,255,0.1); padding: 15px; margin-bottom: 15px; border-radius: 6px; cursor: pointer; transition: 0.3s; border: 1px solid rgba(255,255,255,0.1); }
          .scheme-link:hover { background: white; color: #1e3a8a; transform: translateX(10px); }
          .scheme-icon { font-size: 1.5rem; margin-right: 15px; }
          .scheme-text { font-weight: 600; font-size: 1rem; }

          /* SERVICE CARDS (E-SEVAI) */
          .service-card { background: white; padding: 25px; border-radius: 10px; text-align: center; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; position: relative; overflow: hidden; }
          .service-card:hover { transform: translateY(-7px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
          .service-icon { font-size: 2.5rem; margin-bottom: 15px; display: inline-block; }

          /* SOS & FOOTER */
          .sos-float { position: fixed; bottom: 30px; right: 30px; display: flex; flex-direction: column; gap: 10px; z-index: 1002; }
          .sos-btn { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer; text-decoration: none; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: 0.3s; font-size: 1.2rem; }
          .sos-main { background: #ef4444; color: white; animation: pulse 2s infinite; border: 2px solid white; }
          .sos-main:hover { animation: none; transform: scale(1.1); }
          @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

          .footer-link { cursor: pointer; margin: 0 10px; display: inline-block; }
          .footer-link:hover { text-decoration: underline; color: #fca5a5; }

          /* --- CHATBOT STYLES --- */
          .chat-float-btn {
            position: fixed; bottom: 30px; left: 30px; width: 60px; height: 60px;
            background: var(--primary); color: white; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.8rem; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 2000; border: 2px solid white; transition: transform 0.3s;
          }
          .chat-float-btn:hover { transform: scale(1.1); }

          .chat-window {
            position: fixed; bottom: 100px; left: 30px; width: 320px; height: 450px;
            background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 2000; display: flex; flex-direction: column; overflow: hidden;
            border: 1px solid #e2e8f0; animation: slideUp 0.3s ease-out;
          }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

          .chat-header {
            background: var(--primary); color: white; padding: 15px; display: flex;
            justify-content: space-between; align-items: center; font-weight: bold;
          }
          .chat-body {
            flex: 1; padding: 15px; overflow-y: auto; background: #f8fafc;
            display: flex; flex-direction: column; gap: 10px;
          }
          .msg { max-width: 80%; padding: 8px 12px; border-radius: 10px; font-size: 0.9rem; line-height: 1.4; }
          .msg.bot { align-self: flex-start; background: #e2e8f0; color: #1e293b; border-bottom-left-radius: 2px; }
          .msg.user { align-self: flex-end; background: var(--accent); color: black; border-bottom-right-radius: 2px; }

          .chat-footer {
            padding: 10px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white;
          }
          .chat-input {
            flex: 1; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 20px; outline: none;
          }
          .chat-send {
            background: var(--primary); color: white; border: none; width: 35px; height: 35px;
            border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
          }
        `}
      </style>

      {/* --- TOP BAR --- */}
      <div className="top-bar">
        <div>🏛️ Government of Tamil Nadu Initiative</div>
        <div className="top-links">
          <span>📞 Helpline: 1913</span>
          <span>📧 support@civiceye.tn.gov.in</span>
          <span>தமிழ் / English</span>
        </div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigate('/')} style={{cursor:'pointer'}}>
          <img src={myLogo} alt="Logo" />
          <div>
            <h2>CIVIC EYE</h2>
            <span>Smart City Governance</span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="nav-menu">
          <a className="nav-link" onClick={() => navigate('/')}>Home</a>
          <a className="nav-link" onClick={() => navigate('/jobs')}>Employment</a>
          <a className="nav-link" onClick={() => navigate('/transport')}>Education</a>
          <a className="nav-link" onClick={() => navigate('/news')}>Blood Help</a>

          {/* 🔥 NOTIFICATION BELL 🔥 */}
          {isLoggedIn && (
             <div className="notif-wrapper">
                <button className="notif-btn" onClick={() => setShowNotifications(!showNotifications)}>
                    🔔
                    {myNotifications.length > 0 && <span className="notif-badge">{myNotifications.length}</span>}
                </button>
                {showNotifications && (
                   <div className="notif-dropdown">
                      <div style={{padding:'10px', fontWeight:'bold', background:'#f8fafc', borderBottom:'1px solid #eee'}}>Alerts</div>
                      {myNotifications.length === 0 ? (
                         <div style={{padding:'15px', color:'#999', fontSize:'0.8rem', textAlign:'center'}}>No new updates</div>
                      ) : (
                         myNotifications.map((n, i) => (
                             <div key={i} className="notif-item">
                                 <span style={{fontSize:'1.2rem'}}>{n.status === 'Solved' ? '✅' : '🛠️'}</span>
                                 <div>
                                     <div style={{fontWeight:'bold'}}>{n.status}</div>
                                     <div style={{color:'#64748b'}}>{n.category} issue updated</div>
                                 </div>
                             </div>
                         ))
                      )}
                   </div>
                )}
             </div>
          )}

          <button className="btn-login-main" onClick={handleAuthAction}>
            {isLoggedIn ? 'LOGOUT' : 'OFFICIAL LOGIN'}
          </button>
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
           {mobileMenuOpen ? '✖' : '☰'}
        </div>
      </nav>

      {/* --- MOBILE DROPDOWN MENU --- */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
          <a className="mobile-menu-link" onClick={() => {navigate('/'); setMobileMenuOpen(false)}}>Home</a>
          <a className="mobile-menu-link" onClick={() => {navigate('/jobs'); setMobileMenuOpen(false)}}>Employment</a>
          <a className="mobile-menu-link" onClick={() => {navigate('/transport'); setMobileMenuOpen(false)}}>Transport</a>
          <a className="mobile-menu-link" onClick={() => {navigate('/news'); setMobileMenuOpen(false)}}>News</a>
          <div style={{textAlign:'center', padding:'15px'}}>
             <button className="btn-login-main" onClick={handleAuthAction} style={{width:'100%'}}>
               {isLoggedIn ? 'LOGOUT' : 'OFFICIAL LOGIN'}
             </button>
          </div>
      </div>

      {/* --- TICKER --- */}
      <div className="ticker-section">
        <div className="ticker-label">LATEST NEWS</div>
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div className="ticker-content">{publicAnnouncements.join("    ✦    ")}</div>
        </div>
      </div>

      {/* --- HERO --- */}
      <section className="hero">
        <div className="hero-content">
          <div style={{textTransform:'uppercase', letterSpacing:'2px', fontSize:'0.9rem', marginBottom:'10px', opacity:0.9}}>Official Public Grievance Portal</div>
          <h1>Building a <span style={{color:'var(--accent)'}}>Smarter</span> Future Together</h1>
          <p>Report civic issues directly to the Corporation.</p>
          <div style={{marginTop:'30px'}}>
            <button className="hero-btn btn-primary" onClick={handleReportClick}>FILE A COMPLAINT</button>
          </div>
        </div>
      </section>

      {/* --- STATS --- */}
      <div className="stats-container">
        <div className="stat-card">
          <span className="stat-num">120+</span>
          <span style={{color:'#64748b', fontWeight:'600', textTransform:'uppercase', fontSize:'0.8rem'}}>Active Complaints</span>
        </div>
        <div className="stat-card">
          <span className="stat-num" style={{color:'#10b981'}}>98%</span>
          <span style={{color:'#64748b', fontWeight:'600', textTransform:'uppercase', fontSize:'0.8rem'}}>Resolution Rate</span>
        </div>
        <div className="stat-card">
          <span className="stat-num" style={{color:'#f59e0b'}}>24h</span>
          <span style={{color:'#64748b', fontWeight:'600', textTransform:'uppercase', fontSize:'0.8rem'}}>Avg Response Time</span>
        </div>
      </div>

      {/* --- FEATURES --- */}
      <div style={{padding: '80px 0'}}>
        <h2 className="section-title">Citizen Services</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div style={{fontSize:'2.5rem', marginBottom:'15px'}}>📸</div>
            <h3 style={{color:'var(--primary)'}}>Smart Reporting</h3>
            <p style={{color:'#64748b', fontSize:'0.9rem'}}>AI-powered issue detection using geo-tagging.</p>
          </div>
          <div className="feature-card">
            <div style={{fontSize:'2.5rem', marginBottom:'15px'}}>🏛️</div>
            <h3 style={{color:'var(--primary)'}}>Direct Routing</h3>
            <p style={{color:'#64748b', fontSize:'0.9rem'}}>Issues are automatically routed to the specific department.</p>
          </div>
          <div className="feature-card">
            <div style={{fontSize:'2.5rem', marginBottom:'15px'}}>✅</div>
            <h3 style={{color:'var(--primary)'}}>Verified Resolution</h3>
            <p style={{color:'#64748b', fontSize:'0.9rem'}}>Get photographic proof of resolution before closure.</p>
          </div>
        </div>
      </div>

      {/* --- GOVERNMENT SCHEMES --- */}
      <div className="explore-container">
          <h2 className="section-title">Latest Government Schemes</h2>
          <div className="explore-wrapper">
             <div className="slider-side">
                 <img src={govtSchemes[currentSlide].img} alt={govtSchemes[currentSlide].title} className="slide-img" />
                 <div className="slide-content">
                     <span style={{background: '#f59e0b', color:'black', padding:'4px 10px', fontSize:'0.75rem', borderRadius:'4px', fontWeight:'bold', marginBottom:'10px', display:'inline-block'}}>
                         {govtSchemes[currentSlide].status}
                     </span>
                     <h3 style={{fontSize: '2rem', margin: '5px 0', fontFamily:'Merriweather'}}>{govtSchemes[currentSlide].title}</h3>
                     <p style={{margin:'10px 0 0 0', fontSize:'1.1rem', opacity:0.95}}>{govtSchemes[currentSlide].desc}</p>
                 </div>
                 <button className="nav-btn prev" onClick={prevSlide}>&#10094;</button>
                 <button className="nav-btn next" onClick={nextSlide}>&#10095;</button>
             </div>
             <div className="info-side">
                 <h3 style={{marginTop:0, borderBottom:'1px solid rgba(255,255,255,0.2)', paddingBottom:'10px'}}>Quick Actions</h3>
                 <div className="scheme-link"><div className="scheme-icon">📋</div><div className="scheme-text">Check Eligibility</div></div>
                 <div className="scheme-link"><div className="scheme-icon">✍️</div><div className="scheme-text">Apply Online</div></div>
                 <div className="scheme-link"><div className="scheme-icon">🔍</div><div className="scheme-text">Application Status</div></div>
                 <div className="scheme-link"><div className="scheme-icon">📞</div><div className="scheme-text">Scheme Helpline</div></div>
             </div>
          </div>
      </div>

      {/* --- ONLINE SERVICES --- */}
      <div style={{background: '#f1f5f9', padding: '60px 20px', borderTop:'1px solid #e2e8f0'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <h2 className="section-title" style={{marginTop:0, marginBottom:'10px'}}>Online Services (E-Sevai)</h2>
          <p style={{textAlign:'center', color:'#64748b', marginBottom:'50px', maxWidth:'600px', margin:'0 auto 50px'}}>
              Access official government portals directly. We redirect you to the secure state government servers for payments and certificates.
          </p>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px'}}>
            <div className="service-card" style={{borderBottom:'4px solid #1e40af'}}>
              <div className="service-icon">🏠</div>
              <h3 style={{fontSize:'1.2rem', color:'#1e3a8a', margin:'10px 0'}}>Property Tax</h3>
              <p style={{fontSize:'0.9rem', color:'#64748b', lineHeight:'1.5'}}>Pay your half-yearly property tax (Chennai Corporation).</p>
              <button 
                onClick={() => window.open('https://chennaicorporation.gov.in/gcc/online-payment/property-tax/', '_blank')}
                style={{marginTop:'15px', padding:'8px 20px', border:'1px solid #1e40af', background:'transparent', color:'#1e40af', borderRadius:'20px', fontWeight:'600', cursor:'pointer'}}>
                Pay Now ↗
              </button>
            </div>
            <div className="service-card" style={{borderBottom:'4px solid #059669'}}>
              <div className="service-icon">📜</div>
              <h3 style={{fontSize:'1.2rem', color:'#1e3a8a', margin:'10px 0'}}>Birth/Death Cert</h3>
              <p style={{fontSize:'0.9rem', color:'#64748b', lineHeight:'1.5'}}>Download certificates from Civil Registration System (CRS).</p>
              <button 
                onClick={() => window.open('https://www.crstn.org/', '_blank')}
                style={{marginTop:'15px', padding:'8px 20px', border:'1px solid #059669', background:'transparent', color:'#059669', borderRadius:'20px', fontWeight:'600', cursor:'pointer'}}>
                Download ↗
              </button>
            </div>
            <div className="service-card" style={{borderBottom:'4px solid #0891b2'}}>
              <div className="service-icon">💧</div>
              <h3 style={{fontSize:'1.2rem', color:'#1e3a8a', margin:'10px 0'}}>Water Charges</h3>
              <p style={{fontSize:'0.9rem', color:'#64748b', lineHeight:'1.5'}}>Pay CMWSSB water and sewage tax dues online.</p>
              <button 
                onClick={() => window.open('https://cmwssb.tn.gov.in/', '_blank')}
                style={{marginTop:'15px', padding:'8px 20px', border:'1px solid #0891b2', background:'transparent', color:'#0891b2', borderRadius:'20px', fontWeight:'600', cursor:'pointer'}}>
                Pay Dues ↗
              </button>
            </div>
            <div className="service-card" style={{borderBottom:'4px solid #d97706'}}>
              <div className="service-icon">🏗️</div>
              <h3 style={{fontSize:'1.2rem', color:'#1e3a8a', margin:'10px 0'}}>Building Approval</h3>
              <p style={{fontSize:'0.9rem', color:'#64748b', lineHeight:'1.5'}}>TN Single Window Portal for Building Plan Approvals.</p>
              <button 
                onClick={() => window.open('https://tnswp.com/', '_blank')}
                style={{marginTop:'15px', padding:'8px 20px', border:'1px solid #d97706', background:'transparent', color:'#d97706', borderRadius:'20px', fontWeight:'600', cursor:'pointer'}}>
                Apply ↗
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- NEW SECTIONS: EMPLOYMENT & EDUCATION --- */}
      <div style={{padding: '80px 0', background: 'white'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <h2 className="section-title" style={{marginTop:0}}>Employment & Education</h2>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', padding: '0 20px'}}>
            {/* Employment Card */}
            <div className="feature-card" style={{textAlign:'left', borderLeft:'5px solid #1e3a8a'}}>
               <h3 style={{color:'var(--primary)', marginTop:0}}>💼 Employment News</h3>
               <ul style={{color:'#64748b', paddingLeft:'20px', fontSize:'0.9rem', lineHeight:'1.8'}}>
                  <li><strong>TNPSC Gr-IV:</strong> Notification released (3000 vacancies)</li>
                  <li><strong>TRB:</strong> Asst. Professor Recruitment 2024</li>
                  <li><strong>TN Police:</strong> Constable selection process started</li>
               </ul>
               <button onClick={() => navigate('/jobs')} style={{color:'#2563eb', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', padding:0, marginTop:'10px'}}>
                  View All Jobs →
               </button>
            </div>

            {/* Education/Scholarship Card */}
            <div className="feature-card" style={{textAlign:'left', borderLeft:'5px solid #059669'}}>
               <h3 style={{color:'var(--primary)', marginTop:0}}>🎓 Student Scholarships</h3>
               <ul style={{color:'#64748b', paddingLeft:'20px', fontSize:'0.9rem', lineHeight:'1.8'}}>
                  <li><strong>Post-Matric:</strong> SC/ST Scholarship Open</li>
                  <li><strong>First Graduate:</strong> Tuition fee waiver status</li>
                  <li><strong>Naan Mudhalvan:</strong> Free skill training registration</li>
               </ul>
               <button onClick={() => navigate('/transport')} style={{color:'#059669', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', padding:0, marginTop:'10px'}}>
                  View Scholarships →
               </button>
            </div>

             {/* Exam Results Card */}
            <div className="feature-card" style={{textAlign:'left', borderLeft:'5px solid #d97706'}}>
               <h3 style={{color:'var(--primary)', marginTop:0}}>📝 Exam Results</h3>
               <ul style={{color:'#64748b', paddingLeft:'20px', fontSize:'0.9rem', lineHeight:'1.8'}}>
                  <li><strong>10th & 12th:</strong> Public Exam Time Table</li>
                  <li><strong>TANCET:</strong> Hall Tickets Available</li>
                  <li><strong>NEET:</strong> Counselling Schedule 2024</li>
               </ul>
               <button style={{color:'#d97706', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', padding:0, marginTop:'10px'}}>
                  Check Results →
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- NEW SECTION: BLOOD DONATION (FIND A HERO) --- */}
      <div style={{background: '#fef2f2', padding: '60px 20px', borderTop:'1px solid #fee2e2', borderBottom:'1px solid #fee2e2', textAlign:'center'}}>
         <div style={{maxWidth:'800px', margin:'0 auto'}}>
            <div style={{fontSize:'3rem', marginBottom:'10px'}}></div>
            <h2 style={{color:'#991b1b', margin:'0 0 15px 0', fontFamily:'Merriweather'}}>Find a Hero - Blood Donation</h2>
            <p style={{color:'#7f1d1d', fontSize:'1.1rem', marginBottom:'30px'}}>
               Connect with voluntary blood donors in your area during emergencies. 
               Your one step can save a life.
            </p>
            <div style={{display:'flex', gap:'20px', justifyContent:'center', flexWrap:'wrap'}}>
               <button onClick={() => navigate('/news')} style={{padding:'12px 30px', background:'#dc2626', color:'white', border:'none', borderRadius:'30px', fontWeight:'bold', cursor:'pointer', boxShadow:'0 5px 15px rgba(220, 38, 38, 0.3)'}}>
                  Find Donor
               </button>
               <button style={{padding:'12px 30px', background:'white', color:'#dc2626', border:'2px solid #dc2626', borderRadius:'30px', fontWeight:'bold', cursor:'pointer'}}>
                  Register as Donor
               </button>
            </div>
         </div>
      </div>

      <div style={{height:'60px'}}></div>

      {/* --- FOOTER --- */}
      <footer style={{background: '#1e3a8a', color: 'white', marginTop:'auto', borderTop:'5px solid #f59e0b', fontSize:'0.9rem'}}>
        {/* LandingPage.js - Footer Section la idha maathunga */}

        
        {/* LandingPage.js - Footer Section la idha maathunga */}

        <div style={{background: '#172554', padding: '12px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize:'0.85rem'}}>
          <span className="footer-link" onClick={() => navigate('/')}>Home</span>|

          {/* 👇 Inga dhaan change panrom */}
          <span className="footer-link" onClick={() => navigate('/about')}>About Civic Eye</span>|
          <span className="footer-link" onClick={() => navigate('/departments')}>Departments</span>|
          <span className="footer-link" onClick={() => navigate('/privacy')}>Privacy Policy</span>
        </div>
        <div style={{padding: '30px 20px', maxWidth: '1200px', margin: '0 auto', textAlign:'center'}}>
          <div style={{color: '#fca5a5', fontWeight: 'bold', marginBottom: '25px', fontSize:'1.1rem', border: '1px dashed #fca5a5', padding: '15px', display:'inline-block', borderRadius:'4px'}}>
            "Zero Tolerance towards Corruption. Report issues directly to the Civic Eye Vigilance Wing."
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '50px', textAlign: 'left', marginTop: '10px'}}>
            <div style={{maxWidth: '450px'}}>
               <h4 style={{color: '#f59e0b', borderBottom: '2px solid #f59e0b', display: 'inline-block', marginBottom: '10px', paddingBottom:'5px'}}>Control Room Contact</h4>
               <p style={{margin:'5px 0'}}><strong>Website:</strong> www.civiceye.tn.gov.in</p>
               <p style={{margin:'5px 0'}}><strong>Helpline:</strong> 1913 / 044-25303604</p>
            </div>
          </div>
        </div>
        <div style={{background: '#0f172a', padding: '10px', textAlign: 'center', fontSize: '0.9rem', letterSpacing:'1px', borderTop:'1px solid #334155'}}>
           Total Complaints Resolved : <span style={{color: '#f59e0b', fontWeight: 'bold', fontSize:'1.1em'}}>1,24,580</span>
        </div>
      </footer>

      {/* --- SOS --- */}
      <div className="sos-float">
        <div className="sos-btn sos-main">SOS</div>
        <a href="tel:100" className="sos-btn" style={{background:'#1e293b', color:'white'}}>👮‍♂️</a>
        <a href="tel:108" className="sos-btn" style={{background:'#dc2626', color:'white'}}>🚑</a>
      </div>

      {/* --- CHATBOT --- */}
      <div className="chat-float-btn" onClick={() => setChatOpen(!chatOpen)}>
        {chatOpen ? '✖' : '💬'}
      </div>

      {chatOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>Civic Assistant</span>
            <span onClick={() => setChatOpen(false)} style={{cursor:'pointer'}}>✖</span>
          </div>
          <div className="chat-body">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`msg ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-footer">
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Type your query..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
            />
            <button className="chat-send" onClick={handleChatSend}>➤</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default LandingPage;