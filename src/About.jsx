import React from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.pageWrapper}>
      {/* --- HERO SECTION --- */}
      <div style={styles.heroSection}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
        <h1 style={styles.heroTitle}>About Civic Eye</h1>
        <p style={styles.heroSubtitle}>Empowering Citizens. Transforming Governance.</p>
      </div>

      <div style={styles.container}>
        {/* --- INTRODUCTION CARD --- */}
        <div style={styles.mainCard}>
          <div style={styles.row}>
            <div style={styles.textCol}>
              <h2 style={styles.sectionTitle}>Who We Are</h2>
              <p style={styles.text}>
                <strong>Civic Eye</strong> is Tamil Nadu's next-gen digital grievance redressal platform. 
                Unlike traditional systems, we bridge the gap between the <strong>Public</strong> and the <strong>Government</strong> seamlessly.
                We believe that a smart city isn't just about technology, but about <span style={{color:'#1d4ed8', fontWeight:'bold'}}>smart citizens</span> who care.
              </p>
            </div>
            <div style={styles.imageCol}>
              {/* Simple visual placeholder using emoji or you can put an image tag here */}
              <div style={styles.visualIcon}>🏛️</div>
            </div>
          </div>
        </div>

        {/* --- MISSION STRIP --- */}
        <div style={styles.missionBox}>
          <h3 style={styles.missionTitle}>🚀 Our Mission</h3>
          <p style={styles.missionText}>
            To resolve every reported civic issue within <strong>24 to 48 Hours</strong> using AI-based routing and real-time officer accountability.
          </p>
        </div>

        {/* --- FEATURES GRID (The Professional Look) --- */}
        <h2 style={{textAlign:'center', color:'#1e3a8a', margin:'40px 0 20px', fontFamily:'Merriweather, serif'}}>Why Use Civic Eye?</h2>

        <div style={styles.grid}>
          {/* Card 1 */}
          <div style={styles.featureCard}>
            <div style={styles.iconCircle}>🛡️</div>
            <h3 style={styles.cardTitle}>Zero Corruption</h3>
            <p style={styles.cardText}>Direct reporting to vigilance teams. No middlemen, no bribes, just action.</p>
          </div>

          {/* Card 2 */}
          <div style={styles.featureCard}>
            <div style={styles.iconCircle}>⚡</div>
            <h3 style={styles.cardTitle}>Lightning Fast</h3>
            <p style={styles.cardText}>AI automatically assigns your complaint to the nearest available officer.</p>
          </div>

          {/* Card 3 */}
          <div style={styles.featureCard}>
            <div style={styles.iconCircle}>🕵️‍♂️</div>
            <h3 style={styles.cardTitle}>100% Anonymous</h3>
            <p style={styles.cardText}>Fearlessly report illegal activities. Your identity remains hidden forever.</p>
          </div>
        </div>

        {/* --- QUOTE SECTION --- */}
        <div style={styles.quoteBox}>
          <p style={{fontStyle:'italic', fontSize:'1.1rem', margin:0}}>
            "Democracy is not just about voting once in 5 years. It's about participating every single day."
          </p>
          <div style={{marginTop:'10px', fontWeight:'bold', color:'#f59e0b'}}>- Civic Eye Initiative</div>
        </div>

      </div>
    </div>
  );
};

// --- STYLES (Modern CSS) ---
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Roboto', sans-serif",
    paddingBottom: '50px'
  },
  // Hero Banner
  heroSection: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
    color: 'white',
    padding: '40px 20px 60px',
    textAlign: 'center',
    borderBottomLeftRadius: '30px',
    borderBottomRightRadius: '30px',
    boxShadow: '0 10px 30px rgba(30, 58, 138, 0.2)'
  },
  backBtn: {
    position: 'absolute',
    left: '20px',
    top: '20px',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    padding: '8px 15px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    backdropFilter: 'blur(5px)'
  },
  heroTitle: {
    fontFamily: "'Merriweather', serif",
    fontSize: '3rem',
    margin: '10px 0',
    letterSpacing: '1px'
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    opacity: 0.9,
    fontWeight: '300',
    letterSpacing: '0.5px'
  },

  // Layout
  container: {
    maxWidth: '1000px',
    margin: '-40px auto 0', // Overlaps the banner slightly for style
    padding: '0 20px'
  },

  // Main Intro Card
  mainCard: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    marginBottom: '30px'
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '30px'
  },
  textCol: { flex: 2 },
  imageCol: { flex: 1, display: 'flex', justifyContent: 'center' },
  visualIcon: { fontSize: '5rem' }, // Large Icon placeholder
  sectionTitle: { color: '#1e3a8a', marginTop: 0, fontSize: '1.8rem' },
  text: { color: '#475569', lineHeight: '1.8', fontSize: '1.05rem' },

  // Mission Box
  missionBox: {
    background: '#1e40af',
    color: 'white',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 5px 15px rgba(30, 64, 175, 0.3)'
  },
  missionTitle: { margin: '0 0 10px 0', fontSize: '1.5rem', color: '#f59e0b' },
  missionText: { fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto' },

  // Grid Section
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Responsive Grid
    gap: '25px',
    marginBottom: '40px'
  },
  featureCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    transition: 'transform 0.3s',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  iconCircle: {
    width: '60px',
    height: '60px',
    background: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    margin: '0 auto 15px'
  },
  cardTitle: { color: '#1e293b', margin: '10px 0', fontSize: '1.2rem' },
  cardText: { color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' },

  // Quote
  quoteBox: {
    textAlign: 'center',
    padding: '40px',
    color: '#475569',
    borderTop: '1px solid #e2e8f0'
  }
};

export default About;