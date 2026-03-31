import React from 'react';
import { useNavigate } from 'react-router-dom';

const Departments = () => {
  const navigate = useNavigate();

  const depts = [
    { name: "Highways & Roads", icon: "🛣️", desc: "Repair of potholes, relaying of damaged roads, and removal of encroachments." },
    { name: "TNEB (Electricity)", icon: "⚡", desc: "Power cut resolution, transformer maintenance, and street light repairs." },
    { name: "TWAD (Water Supply)", icon: "🚰", desc: "Drinking water supply, pipeline leakage fixes, and sewage management." },
    { name: "Public Health", icon: "🏥", desc: "Dengue prevention, garbage collection, and sanitation monitoring." },
    { name: "City Police", icon: "👮‍♂️", desc: "Traffic regulation, public safety, and law & order maintenance." },
    { name: "Fire & Rescue", icon: "🚒", desc: "Emergency fire response and disaster management services." }
  ];

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
      <h1 style={styles.title}>🏛️ Connected Departments</h1>
      <p style={styles.sub}>Your complaints are automatically routed to these nodal agencies.</p>

      <div style={styles.grid}>
        {depts.map((d, index) => (
          <div key={index} style={styles.card}>
            <div style={{fontSize:'3rem', marginBottom:'15px'}}>{d.icon}</div>
            <h3 style={{color:'#1e3a8a', margin:'10px 0'}}>{d.name}</h3>
            <p style={{color:'#64748b', fontSize:'0.9rem'}}>{d.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f1f5f9', padding: '40px 20px', fontFamily: 'Roboto, sans-serif' },
  backBtn: { padding: '10px 20px', background: 'white', border: 'none', borderRadius:'8px', cursor: 'pointer', marginBottom:'20px', fontWeight:'bold', color:'#1e3a8a' },
  title: { textAlign: 'center', color: '#1e3a8a', fontFamily: 'Merriweather, serif', fontSize:'2.5rem' },
  sub: { textAlign: 'center', color: '#64748b', marginBottom: '50px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth:'1200px', margin:'0 auto' },
  card: { background: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', transition: '0.3s' }
};

export default Departments;