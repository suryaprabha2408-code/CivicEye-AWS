import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

// --- IMPORT YOUR LOGO HERE ---
import logo from './logo.png'; 

// --- DUMMY DATA ---
const DUMMY_DONORS = [
  { id: 'd1', name: 'Karthik Raja', bloodGroup: 'O+', city: 'Chennai', phone: '9876543210', lastDonated: '2023-10-15' },
  { id: 'd2', name: 'Sarah Jenkins', bloodGroup: 'A+', city: 'Bangalore', phone: '9876543211', lastDonated: '2023-11-20' },
  { id: 'd3', name: 'Mohamed Ali', bloodGroup: 'B+', city: 'Coimbatore', phone: '9876543212', lastDonated: '2023-09-05' },
  { id: 'd4', name: 'Anita Desai', bloodGroup: 'AB+', city: 'Chennai', phone: '9876543213', lastDonated: '2023-12-01' },
  { id: 'd5', name: 'John Peter', bloodGroup: 'O-', city: 'Madurai', phone: '9876543214', lastDonated: '2023-08-15' },
  { id: 'd6', name: 'Lakshmi Priya', bloodGroup: 'A-', city: 'Trichy', phone: '9876543215', lastDonated: '2023-11-10' },
  { id: 'd7', name: 'Robert Wilson', bloodGroup: 'B-', city: 'Chennai', phone: '9876543216', lastDonated: '2023-10-30' },
  { id: 'd8', name: 'Divya S', bloodGroup: 'AB-', city: 'Salem', phone: '9876543217', lastDonated: '2023-07-22' },
  { id: 'd9', name: 'Rahul Dravid', bloodGroup: 'O+', city: 'Bangalore', phone: '9876543218', lastDonated: '2023-12-10' },
  { id: 'd10', name: 'Praveen Kumar', bloodGroup: 'A+', city: 'Chennai', phone: '9876543219', lastDonated: '2023-09-25' }
];

// --- ICONS (SVGs) ---
const Icons = {
  MapPin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  Phone: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  User: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
};

const BloodDonation = () => {
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [filterGroup, setFilterGroup] = useState('All');
  const [filterCity, setFilterCity] = useState('');

  // Modals Control
  const [showModal, setShowModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isRequestMode, setIsRequestMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: 'O+',
    city: '',
    phone: '',
    lastDonated: ''
  });

  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      alert("🔒 Login Required!\n\nPlease login to access this feature.");
      navigate('/login');
      return false;
    }
    return true;
  };

  useEffect(() => {
    const q = query(collection(db, "blood_donors"), orderBy("city"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setDonors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setDonors(DUMMY_DONORS);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    if(!formData.name || !formData.city) return alert("Please fill relevant details!");

    if (isRequestMode) {
      const available = donors.filter(d => 
        d.bloodGroup === formData.bloodGroup && 
        d.city.toLowerCase().includes(formData.city.toLowerCase())
      );
      if (available.length > 0) {
        alert(`🎉 Found ${available.length} donors! Check the list below.`);
        setFilterGroup(formData.bloodGroup);
        setFilterCity(formData.city);
      } else {
        alert(`⚠️ No matches currently for ${formData.bloodGroup} in ${formData.city}. We have logged your request.`);
      }
      setShowModal(false);
    } else {
      if(!formData.phone) return alert("Phone number is required!");
      await addDoc(collection(db, "blood_donors"), formData);
      alert("✅ Registered Successfully!");
      setShowModal(false);
    }
    setFormData({ name: '', bloodGroup: 'O+', city: '', phone: '', lastDonated: '' });
  };

  const filteredDonors = donors.filter(donor => {
    const matchesGroup = filterGroup === 'All' || donor.bloodGroup === filterGroup;
    const matchesCity = donor.city.toLowerCase().includes(filterCity.toLowerCase());
    return matchesGroup && matchesCity;
  });

  return (
    <div className="blood-page">
      <style>{`
        /* --- RESET & BASICS --- */
        :root {
          --primary-red: #e63946;
          --deep-blue: #1d3557;
          --light-blue: #a8dadc;
          --bg-gray: #f8f9fa;
          --text-dark: #2b2d42;
          --text-light: #8d99ae;
          --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          --hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .blood-page { 
          font-family: 'Inter', system-ui, -apple-system, sans-serif; 
          background: var(--bg-gray); 
          min-height: 100vh;
          color: var(--text-dark);
        }

        /* --- NAVBAR --- */
        .top-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          height: 70px;
          padding: 0 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .nav-logo-group { display: flex; align-items: center; gap: 12px; }
        .nav-logo-img{ height: 65px; }
        .nav-text  h3 { font-family: 'Merriweather', serif; font-size: 1.5rem; color: var(--primary); margin: 0; line-height: 1.2; }
        .nav-text span { font-size: 0.75rem; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; display: block; }
        .btn-home {
           background: transparent; color: var(--deep-blue); border: 1px solid var(--deep-blue);
           padding: 8px 18px; border-radius: 50px; font-weight: 600; cursor: pointer; transition: 0.2s;
        }
        .btn-home:hover { background: var(--deep-blue); color: white; }

        /* --- HEADER & SEARCH (UPDATED) --- */
        .header-section {
          background: linear-gradient(rgba(29, 53, 87, 0.9), rgba(69, 123, 157, 0.8)), 
                      url('https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1600&auto=format&fit=crop');
          background-size: cover;       
          background-position: center;  
          background-repeat: no-repeat;
          height:40vh;

          color: white;
          padding: 80px 20px; /* FIXED: Removed the extra bottom padding */
          text-align: center;
          border-bottom-left-radius: 40px;
          border-bottom-right-radius: 40px;
          position: relative; 
        }
        .header-title { font-size: 3rem; font-weight: 800; margin-bottom: 10px; }
        .header-sub { font-size: 1.1rem; opacity: 0.9; max-width: 500px; margin: 0 auto; }

        .search-bar-wrapper {
          max-width: 900px;
          margin: 30px auto 50px auto; /* FIXED: Changed -60px to 30px to push it down */
          background: white;
          padding: 15px;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-input-group {
          display: flex;
          align-items: center;
          background: #f1f5f9;
          border-radius: 10px;
          padding: 0 15px;
          flex: 1;
          height: 55px;
          border: 1px solid transparent;
          transition: 0.2s;
        }
        .search-input-group:focus-within { border-color: var(--primary-red); background: white; }
        .search-input-group input, .search-input-group select {
          border: none; background: transparent; width: 100%; height: 100%;
          outline: none; font-size: 1rem; color: var(--text-dark); margin-left: 10px;
        }

        .btn-action {
          background: var(--primary-red);
          color: white;
          height: 55px;
          padding: 0 30px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(230, 57, 70, 0.3);
        }
        .btn-action:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(230, 57, 70, 0.4); }

        /* --- CARD GRID --- */
        .content-container { max-width: 1200px; margin: 0 auto; padding: 0 20px 60px 20px; }
        .grid-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .grid-header h2 { font-size: 1.5rem; color: var(--deep-blue); display: flex; align-items: center; gap: 10px; }
        .count-badge { background: #e9ecef; color: var(--text-light); padding: 4px 12px; border-radius: 20px; font-size: 0.9rem; }

        .donor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
        }

        /* --- PROFESSIONAL CARD DESIGN --- */
        .pro-card {
          background: white;
          border-radius: 16px;
          padding: 25px;
          position: relative;
          border: 1px solid #f0f0f0;
          box-shadow: var(--card-shadow);
          transition: all 0.3s ease;
          overflow: hidden;
          cursor: pointer;
        }
        .pro-card:hover { transform: translateY(-5px); box-shadow: var(--hover-shadow); border-color: var(--light-blue); }

        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }

        /* Blood Group Badge */
        .blood-badge {
          width: 50px; height: 50px;
          background: linear-gradient(135deg, #ff4d4d, #c0392b);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          box-shadow: 0 4px 10px rgba(230, 57, 70, 0.2);
        }

        .status-dot { width: 8px; height: 8px; background: #2ecc71; border-radius: 50%; box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.1); }

        .donor-name { font-size: 1.2rem; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; }
        .donor-info { display: flex; align-items: center; gap: 6px; color: var(--text-light); font-size: 0.9rem; margin-bottom: 20px; }

        .card-footer {
          border-top: 1px solid #f1f5f9;
          padding-top: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .last-donated { font-size: 0.8rem; color: #adb5bd; }
        .view-btn { color: var(--primary-red); font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 5px; }

        /* --- MODAL --- */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(29, 53, 87, 0.6);
          backdrop-filter: blur(4px); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: white;
          width: 90%; max-width: 450px;
          border-radius: 20px;
          padding: 30px;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.3s ease;
        }

        .modal-close { position: absolute; top: 20px; right: 20px; cursor: pointer; color: var(--text-light); }
        .modal-close:hover { color: var(--text-dark); }

        /* Toggle */
        .modal-toggle {
          background: #f1f5f9; padding: 5px; border-radius: 10px; display: flex; margin-bottom: 25px;
        }
        .toggle-opt {
          flex: 1; padding: 10px; text-align: center; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; color: var(--text-light); transition: 0.2s; border: none; background: transparent;
        }
        .toggle-opt.active { background: white; color: var(--deep-blue); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .request-mode .toggle-opt.active { color: #d35400; }

        .form-label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
        .modal-input {
          width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.95rem; margin-bottom: 15px;
          transition: border-color 0.2s;
        }
        .modal-input:focus { outline: none; border-color: var(--deep-blue); }

        .btn-submit {
          width: 100%; padding: 14px; background: var(--deep-blue); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 1rem; margin-top: 10px;
        }
        .btn-submit:hover { background: #162942; }

        /* Contact View */
        .contact-card { text-align: center; }
        .contact-avatar { 
          width: 80px; height: 80px; background: #e2e8f0; border-radius: 50%; margin: 0 auto 15px auto; 
          display: flex; align-items: center; justify-content: center; color: var(--deep-blue);
        }
        .btn-call {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          background: #25d366; color: white; padding: 12px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px;
        }

        /* Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        @media (max-width: 768px) {
          .header-title { font-size: 2.2rem; }
          .search-bar-wrapper { flex-direction: column; padding: 15px; margin-top: 30px; } /* Updated margin here too */
          .search-input-group { width: 100%; }
          .btn-action { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* --- NAVIGATION --- */}
      <nav className="top-nav">
        <div className="nav-logo-group">
          <img src={logo} alt="Logo" className="nav-logo-img" />
          <div className="nav-text">
            <h3>CIVIC EYE</h3>
            <span>Life Line</span>
          </div>
        </div>
        <button className="btn-home" onClick={() => navigate('/')}>Dashboard</button>
      </nav>

      {/* --- HERO HEADER --- */}
      <header className="header-section">
        <h1 className="header-title">Find a Hero. Be a Hero.</h1>
        <p className="header-sub">Connecting blood donors with those in need instantly across your city.</p>
      </header>

      {/* --- SEARCH BAR --- */}
      <div className="search-bar-wrapper">
        <div className="search-input-group" style={{flex: 0.4}}>
          <span style={{color:'#888'}}>🩸</span>
          <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
            <option value="All">All Blood Groups</option>
            <option value="A+">A+</option><option value="A-">A-</option>
            <option value="B+">B+</option><option value="B-">B-</option>
            <option value="O+">O+</option><option value="O-">O-</option>
            <option value="AB+">AB+</option><option value="AB-">AB-</option>
          </select>
        </div>

        <div className="search-input-group">
          <Icons.MapPin />
          <input 
            type="text" 
            placeholder="Search by City (e.g. Chennai)" 
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
          />
        </div>

        <button className="btn-action" onClick={() => { 
            if(checkAuth()) {
                setIsRequestMode(false); 
                setShowModal(true); 
            }
        }}>
          + Register / Request
        </button>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="content-container">
        <div className="grid-header">
          <h2>Available Donors <span className="count-badge">{filteredDonors.length}</span></h2>
        </div>

        <div className="donor-grid">
          {filteredDonors.length > 0 ? filteredDonors.map((donor) => (
            <div key={donor.id} className="pro-card" onClick={() => checkAuth() && setSelectedDonor(donor)}>
              <div className="card-top">
                <div className="blood-badge">{donor.bloodGroup}</div>
                <div className="status-dot" title="Active"></div>
              </div>

              <h3 className="donor-name">{donor.name}</h3>
              <div className="donor-info">
                <Icons.MapPin /> <span>{donor.city}</span>
              </div>

              <div className="card-footer">
                <span className="last-donated">Last: {donor.lastDonated || 'N/A'}</span>
                <span className="view-btn">Contact <Icons.Phone /></span>
              </div>
            </div>
          )) : (
            <div style={{gridColumn:'1/-1', textAlign:'center', padding:'60px', background:'white', borderRadius:'16px'}}>
              <h3 style={{color:'#888'}}>No donors found nearby.</h3>
              <p style={{color:'#aaa'}}>Try changing the city or blood group.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL 1: REGISTER / REQUEST --- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className={`modal-content ${isRequestMode ? 'request-mode' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="modal-close" onClick={() => setShowModal(false)}><Icons.Close /></div>

            <div className="modal-toggle">
              <button className={`toggle-opt ${!isRequestMode ? 'active' : ''}`} onClick={() => setIsRequestMode(false)}>Donate Blood</button>
              <button className={`toggle-opt ${isRequestMode ? 'active' : ''}`} onClick={() => setIsRequestMode(true)}>Request Blood</button>
            </div>

            <h2 style={{textAlign:'center', marginBottom:'20px', color:'var(--text-dark)'}}>
              {isRequestMode ? 'Find Blood Donors' : 'Register as Donor'}
            </h2>

            <form onSubmit={handleSubmit}>
              <label className="form-label">{isRequestMode ? 'Patient Name' : 'Full Name'}</label>
              <input className="modal-input" required value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} placeholder="Enter Name" />

              <div style={{display:'flex', gap:'15px'}}>
                <div style={{flex:1}}>
                  <label className="form-label">Group</label>
                  <select className="modal-input" value={formData.bloodGroup} onChange={e=>setFormData({...formData, bloodGroup:e.target.value})}>
                    <option value="O+">O+</option><option value="O-">O-</option>
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label className="form-label">City</label>
                  <input className="modal-input" required placeholder="City" value={formData.city} onChange={e=>setFormData({...formData, city:e.target.value})} />
                </div>
              </div>

              {!isRequestMode && (
                <>
                <label className="form-label">Phone Number</label>
                <input type="number" className="modal-input" required placeholder="Mobile Number" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} />

                <label className="form-label">Last Donated (Optional)</label>
                <input type="date" className="modal-input" value={formData.lastDonated} onChange={e=>setFormData({...formData, lastDonated:e.target.value})} />
                </>
              )}

              <button type="submit" className="btn-submit" style={{background: isRequestMode ? '#d35400' : 'var(--deep-blue)'}}>
                {isRequestMode ? 'Search Availability' : 'Register Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: DONOR CONTACT --- */}
      {selectedDonor && (
        <div className="modal-overlay" onClick={() => setSelectedDonor(null)}>
          <div className="modal-content contact-card" onClick={e => e.stopPropagation()}>
            <div className="modal-close" onClick={() => setSelectedDonor(null)}><Icons.Close /></div>

            <div className="contact-avatar">
               <span style={{fontSize:'2rem', fontWeight:'bold'}}>{selectedDonor.bloodGroup}</span>
            </div>

            <h2 style={{margin:'0 0 5px 0'}}>{selectedDonor.name}</h2>
            <p style={{color:'gray', margin:0}}>📍 {selectedDonor.city}</p>

            <div style={{background:'#f8f9fa', padding:'15px', borderRadius:'10px', marginTop:'20px'}}>
              <small style={{display:'block', color:'#888', marginBottom:'5px'}}>Phone Number</small>
              <div style={{fontSize:'1.4rem', fontWeight:'bold', color:'var(--deep-blue)'}}>
                {selectedDonor.phone}
              </div>
            </div>

            <a href={`tel:${selectedDonor.phone}`} className="btn-call">
              <Icons.Phone /> Call Donor
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodDonation;