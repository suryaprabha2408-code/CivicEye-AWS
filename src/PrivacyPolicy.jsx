import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.paper}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
        <h1 style={{color:'#1e3a8a', fontFamily:'Merriweather'}}>🔒 Privacy & Data Policy</h1>
        <p style={{color:'#64748b', fontSize:'0.9rem'}}>Last Updated: 2024 | Govt of TN</p>
        <hr style={{borderColor:'#e2e8f0', margin:'20px 0'}}/>

        <h3>1. Information We Collect</h3>
        <p>Civic Eye collects your Name, Mobile Number, and Geo-Location (GPS coordinates) solely for the purpose of verifying and resolving grievances.</p>

        <h3>2. Use of Images</h3>
        <p>Photos uploaded by users are treated as "Public Evidence." These images are shared *only* with the respective department officials to identify the issue.</p>

        <h3>3. Data Security</h3>
        <p>All citizen data is encrypted using <strong>AES-256 standards</strong> and stored in government-authorized secure servers (TNSDC). We do not sell or share data with third-party advertisers.</p>

        <h3>4. User Rights</h3>
        <p>You have the right to request the deletion of your personal data after your complaint has been officially closed.</p>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#1e293b', padding: '40px 20px', display:'flex', justifyContent:'center', fontFamily: 'Roboto, sans-serif' },
  paper: { background: 'white', padding: '50px', borderRadius: '10px', maxWidth: '800px', width:'100%', height:'fit-content' },
  backBtn: { background: '#f1f5f9', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px', fontWeight:'bold' }
};

export default PrivacyPolicy;