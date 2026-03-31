import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebaseConfig';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

const AdminJobs = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [newJob, setNewJob] = useState({
    title: '', dept: '', salary: '', location: '', deadline: '', type: 'Full Time', color: '#3498db'
  });
  const [applications, setApplications] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // --- POPUP STATE ---
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- NEW: Interview Schedule State (புதிதாகச் சேர்க்கப்பட்டது) ---
  const [showSchedule, setShowSchedule] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');

  const adminName = "Administrator"; 

  // --- 1. FETCH APPLICATIONS ---
  useEffect(() => {
    const q = query(collection(db, "applications"), orderBy("appliedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(appsList);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. POST NEW JOB ---
  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "jobs"), newJob);
      alert("✅ Job Posted Successfully!");
      setNewJob({ title: '', dept: '', salary: '', location: '', deadline: '', type: 'Full Time', color: '#3498db' });
    } catch (error) {
      alert("Error posting job: " + error.message);
    }
  };

  // --- 3. OPEN DETAILS MODAL ---
  const handleViewDetails = (app) => {
      setSelectedApp(app);
      // Reset Schedule Inputs when opening
      setShowSchedule(false);
      setInterviewDate('');
      setInterviewTime('');
      setShowModal(true);
  };

  // --- 4. NEW: APPROVE WITH SMS & SCHEDULE ---
  const handleApproveWithSMS = async () => {
    if (!selectedApp) return;
    if (!interviewDate || !interviewTime) {
        alert("⚠️ Please select Interview Date and Time!");
        return;
    }

    try {
      const appRef = doc(db, "applications", selectedApp.id);

      // 1. Update Firebase
      await updateDoc(appRef, { 
          status: 'Accepted',
          interviewDate: interviewDate,
          interviewTime: interviewTime
      });

      // 2. Open SMS App (SMS Logic)
      const mobileNumber = selectedApp.mobile || selectedApp.phone;
      const message = `Dear ${selectedApp.fullName}, Your application for ${selectedApp.jobTitle} is APPROVED. Please attend the interview on ${interviewDate} at ${interviewTime}.`;

      if(mobileNumber) {
          window.open(`sms:${mobileNumber}?body=${encodeURIComponent(message)}`);
      }

      alert(`✅ Application Approved & SMS Drafted!`);
      setShowModal(false);
      setSelectedApp(null);
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  // --- 5. REJECT ONLY (Old Logic) ---
  const handleReject = async () => {
    if (!selectedApp) return;
    try {
      const appRef = doc(db, "applications", selectedApp.id);
      await updateDoc(appRef, { status: 'Rejected' });
      alert(`❌ Application Rejected!`);
      setShowModal(false);
      setSelectedApp(null);
    } catch (error) {
       alert("Error: " + error.message);
    }
  };

  // --- 6. DELETE APPLICATION ---
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await deleteDoc(doc(db, "applications", id));
      } catch (error) {
        alert("Error deleting application");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    alert("🔒 Logged out successfully!");
    navigate('/'); 
  };

  // --- HELPER FOR STATUS COLOR ---
  const getStatusColor = (status) => {
    if (status === 'Accepted') return '#2ecc71';
    if (status === 'Rejected') return '#e74c3c';
    return '#f39c12';
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f4f6f7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Styles */}
      <style>
        {`
          .profile-circle { width: 40px; height: 40px; background: #e74c3c; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer; font-size: 1.2em; border: 2px solid white; transition: 0.3s; }
          .dropdown-menu { position: absolute; top: 60px; right: 20px; background: white; width: 220px; padding: 20px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); z-index: 200; }

          /* Modal Styles */
          .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(3px); }
          .modal-content { background: white; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; border-radius: 15px; padding: 0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); animation: popIn 0.3s ease-out; }
          .modal-header { background: #2c3e50; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; }
          .modal-body { padding: 25px; }
          .detail-row { display: flex; border-bottom: 1px solid #eee; padding: 10px 0; }
          .detail-label { width: 140px; font-weight: bold; color: #7f8c8d; }
          .detail-value { flex: 1; color: #2c3e50; font-weight: 500; }

          .btn-approve { flex: 1; padding: 12px; border: none; background: #2ecc71; color: white; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 1rem; }
          .btn-reject { flex: 1; padding: 12px; border: none; background: #e74c3c; color: white; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 1rem; }
          .btn-approve:hover { background: #27ae60; }
          .btn-reject:hover { background: #c0392b; }

          @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}
      </style>

      {/* --- NAVBAR --- */}
        <nav style={{ background: '#2c3e50', padding: '15px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5em' }}>👮‍♂️</span>
              <h3 style={{ margin: 0 }}>Admin Control Panel</h3>
          </div>

          <button onClick={handleLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Logout 🚪
          </button>
        </nav>

        <div style={{ position: 'relative' }}>
            <div className="profile-circle" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                {adminName.charAt(0).toUpperCase()}
            </div>
            {showProfileMenu && (
                <div className="dropdown-menu">
                    <div className="logout-btn" onClick={handleLogout} style={{color:'red', cursor:'pointer', textAlign:'center', fontWeight:'bold'}}>🚪 Logout</div>
                </div>
            )}
        </div>


      {/* --- CONTENT --- */}
      <div style={{ padding: '30px', flex: 1 }}>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

            {/* POST JOB FORM */}
            <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                <h2 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px', color: '#2980b9' }}>📢 Post New Vacancy</h2>
                <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input placeholder="Job Title" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} style={styles.input} />
                    <input placeholder="Department" required value={newJob.dept} onChange={e => setNewJob({...newJob, dept: e.target.value})} style={styles.input} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input placeholder="Salary" required value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} style={styles.input} />
                        <input placeholder="Location" required value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} style={styles.input} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input placeholder="Deadline" required value={newJob.deadline} onChange={e => setNewJob({...newJob, deadline: e.target.value})} style={styles.input} />
                        <select value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})} style={styles.input}>
                            <option>Full Time</option>
                            <option>Contract</option>
                            <option>Uniform Service</option>
                        </select>
                    </div>
                    <button type="submit" style={styles.btn}>🚀 Post Job</button>
                </form>
            </div>

            {/* APPLICATIONS LIST */}
            <div style={{ flex: 1.5, minWidth: '300px', background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                <h2 style={{ borderBottom: '2px solid #e74c3c', paddingBottom: '10px', color: '#c0392b' }}>
                    📄 Applications Received ({applications.length})
                </h2>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {applications.length === 0 ? <p style={{textAlign:'center', color:'#777'}}>No applications yet.</p> : applications.map(app => (
                        <div key={app.id} style={{ background: '#f8f9fa', borderLeft: `5px solid ${getStatusColor(app.status)}`, padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                            <div>
                                <strong style={{fontSize:'1.1em', display:'block'}}>{app.fullName || app.name}</strong>
                                <span style={{fontSize:'0.9em', color:'#555'}}>Applying for: <b>{app.jobTitle}</b></span>
                                <br/>
                                <span style={{ fontSize:'0.75em', background: getStatusColor(app.status || 'Pending'), color:'white', padding:'2px 8px', borderRadius:'10px', marginTop:'5px', display:'inline-block' }}>
                                    {app.status || 'Pending'}
                                </span>
                            </div>

                            <div style={{display:'flex', gap:'10px'}}>
                                <button onClick={() => handleViewDetails(app)} style={{background:'#3498db', color:'white', border:'none', padding:'8px 12px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>
                                     View Details
                                </button>
                                <button onClick={(e) => handleDelete(app.id, e)} style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer'}}>
                                    🗑️
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* --- DETAILS MODAL (POPUP) --- */}
      {showModal && selectedApp && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>

                  {/* Modal Header */}
                  <div className="modal-header">
                      <h3 style={{margin:0}}>Applicant Details</h3>
                      <button onClick={() => setShowModal(false)} style={{background:'none', border:'none', color:'white', fontSize:'1.5rem', cursor:'pointer'}}>×</button>
                  </div>

                  {/* Modal Body */}
                  <div className="modal-body">

                      <h4 style={{marginTop:0, color:'#2c3e50', borderBottom:'2px solid #3498db', display:'inline-block'}}>📋 Application Info</h4>
                      <div className="detail-row"><div className="detail-label">Job Role:</div> <div className="detail-value">{selectedApp.jobTitle}</div></div>
                      <div className="detail-row"><div className="detail-label">Status:</div> <div className="detail-value" style={{color: getStatusColor(selectedApp.status || 'Pending'), fontWeight:'bold'}}>{selectedApp.status || 'Pending'}</div></div>

                      <h4 style={{marginTop:'20px', color:'#2c3e50', borderBottom:'2px solid #3498db', display:'inline-block'}}>👤 Personal Details</h4>
                      <div className="detail-row"><div className="detail-label">Full Name:</div> <div className="detail-value">{selectedApp.fullName || selectedApp.name}</div></div>
                      <div className="detail-row"><div className="detail-label">Father's Name:</div> <div className="detail-value">{selectedApp.fatherName || '-'}</div></div>
                      <div className="detail-row"><div className="detail-label">Date of Birth:</div> <div className="detail-value">{selectedApp.dob || '-'}</div></div>
                      <div className="detail-row"><div className="detail-label">Gender:</div> <div className="detail-value">{selectedApp.gender || '-'}</div></div>
                      <div className="detail-row"><div className="detail-label">Community:</div> <div className="detail-value">{selectedApp.community || '-'}</div></div>

                      <h4 style={{marginTop:'20px', color:'#2c3e50', borderBottom:'2px solid #3498db', display:'inline-block'}}>📞 Contact Info</h4>
                      <div className="detail-row"><div className="detail-label">Mobile:</div> <div className="detail-value">{selectedApp.mobile || selectedApp.phone}</div></div>
                      <div className="detail-row"><div className="detail-label">Email:</div> <div className="detail-value">{selectedApp.email}</div></div>
                      <div className="detail-row"><div className="detail-label">Address:</div> <div className="detail-value">{selectedApp.address}</div></div>

                      <h4 style={{marginTop:'20px', color:'#2c3e50', borderBottom:'2px solid #3498db', display:'inline-block'}}>🎓 Education</h4>
                      <div className="detail-row"><div className="detail-label">Qualification:</div> <div className="detail-value">{selectedApp.qualification}</div></div>
                      <div className="detail-row"><div className="detail-label">Percentage:</div> <div className="detail-value">{selectedApp.percentage ? selectedApp.percentage + '%' : '-'}</div></div>

                      {/* --- MODIFIED ACTION SECTION --- */}
                      <div style={{marginTop:'30px', borderTop:'1px solid #eee', paddingTop:'20px'}}>

                        {selectedApp.status === 'Accepted' ? (
                             <p style={{textAlign:'center', color:'green', fontWeight:'bold'}}>✅ Already Approved</p>
                        ) : (
                            <>
                                {!showSchedule ? (
                                    <div style={{display:'flex', gap:'15px'}}>
                                        <button className="btn-approve" onClick={() => setShowSchedule(true)}>
                                            ✅ Approve
                                        </button>
                                        <button className="btn-reject" onClick={handleReject}>
                                            ❌ Reject
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{background:'#f9f9f9', padding:'15px', borderRadius:'10px', border:'1px solid #ddd'}}>
                                        <h4 style={{marginTop:0}}>📅 Schedule Interview & Send SMS</h4>
                                        <input 
                                            type="date" 
                                            value={interviewDate} 
                                            onChange={(e) => setInterviewDate(e.target.value)}
                                            style={{...styles.input, marginBottom:'10px'}}
                                        />
                                        <input 
                                            type="time" 
                                            value={interviewTime} 
                                            onChange={(e) => setInterviewTime(e.target.value)}
                                            style={{...styles.input, marginBottom:'10px'}}
                                        />
                                        <div style={{display:'flex', gap:'10px'}}>
                                            <button onClick={handleApproveWithSMS} style={{flex:1, background:'#27ae60', color:'white', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer'}}>
                                                📨 Confirm & SMS
                                            </button>
                                            <button onClick={() => setShowSchedule(false)} style={{background:'#95a5a6', color:'white', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer'}}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                      </div>

                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

const styles = {
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' },
  btn: { padding: '12px', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default AdminJobs;