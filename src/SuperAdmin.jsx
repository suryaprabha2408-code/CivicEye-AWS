import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebaseConfig'; 
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import myLogo from './logo.png'; 
// --- ICONS ---
const Icons = {
  Dashboard: "📊",
  Complaints: "📢",
  Jobs: "💼",
  Scholarships: "🎓",
  News: "📰",
  Blood: "❤️",
  Logout: "🚪",
  Menu: "",
  Delete: "🗑️",
  Search: "🔍",
  Bell: "🔔",
  User: "👤"
};

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // --- STATE ---
  const [complaints, setComplaints] = useState([]);
  const [complaintFilter, setComplaintFilter] = useState('All');
  const [solvingId, setSolvingId] = useState(null);

  // News State
  const [newsList, setNewsList] = useState([]);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');

  // Blood State
  const [bloodList, setBloodList] = useState([]);

  // Jobs & Scholarships State
  const [jobs, setJobs] = useState([]); 
  const [jobApps, setJobApps] = useState([]); 
  const [newJob, setNewJob] = useState({ title: '', dept: '', salary: '', location: '', deadline: '', type: 'Full Time' });
  const [jobModal, setJobModal] = useState(null); 
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);

  const [scholarships, setScholarships] = useState([]); 
  const [scholarApps, setScholarApps] = useState([]); 
  const [newScholarship, setNewScholarship] = useState({ name: '', amount: '', criteria: '', deadline: '' });
  const [scholarModal, setScholarModal] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const qComp = query(collection(db, "complaints"), orderBy("time", "desc"));
    const unsubComp = onSnapshot(qComp, (snap) => setComplaints(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const qNews = query(collection(db, "news"), orderBy("date", "desc"));
    const unsubNews = onSnapshot(qNews, (snap) => setNewsList(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const qBlood = query(collection(db, "blood_donors")); 
    const unsubBlood = onSnapshot(qBlood, (snap) => setBloodList(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const qJobApps = query(collection(db, "applications"), orderBy("appliedAt", "desc"));
    const unsubJobApps = onSnapshot(qJobApps, (snap) => setJobApps(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const qScholarApps = query(collection(db, "scholarship_applications"), orderBy("appliedAt", "desc"));
    let unsubScholarApps = () => {};
    try {
        unsubScholarApps = onSnapshot(qScholarApps, (snap) => setScholarApps(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    } catch(e) { console.log("Scholarship collection might not exist yet"); }

    return () => { unsubComp(); unsubJobApps(); unsubScholarApps(); unsubNews(); unsubBlood(); };
  }, []);

  // --- LOGIC HANDLERS ---
  const handleDeleteComplaint = async (id) => {
    if(window.confirm("Are you sure you want to DELETE this complaint?")) {
        await deleteDoc(doc(db, "complaints", id));
    }
  };

  const handleDeleteNews = async (id) => {
    if(window.confirm("Delete this news post?")) {
        await deleteDoc(doc(db, "news", id));
    }
  };

  const handleDeleteBlood = async (id) => {
    if(window.confirm("Remove this donor?")) {
        await deleteDoc(doc(db, "blood_donors", id));
    }
  };

  const handlePostNews = async (e) => {
    e.preventDefault();
    if(!newsTitle || !newsContent) return alert("Fill all fields");

    await addDoc(collection(db, "news"), {
        title: newsTitle,
        content: newsContent,
        date: new Date().toISOString()
    });
    alert("News Posted Successfully! 📢");
    setNewsTitle('');
    setNewsContent('');
  };

  const updateComplaintStatus = async (id, newStatus, file = null) => {
    let data = { status: newStatus };
    if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            await updateDoc(doc(db, "complaints", id), { status: newStatus, admin_proof_url: reader.result });
            setSolvingId(null);
        };
        reader.readAsDataURL(file);
    } else {
        await updateDoc(doc(db, "complaints", id), data);
    }
  };

  const getCatColor = (cat) => {
    const colors = { Road: '#2563eb', Water: '#0891b2', Electricity: '#d97706', Garbage: '#dc2626' };
    return colors[cat] || '#64748b';
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "jobs"), newJob);
    alert("✅ Job Posted!");
    setNewJob({ title: '', dept: '', salary: '', location: '', deadline: '', type: 'Full Time' });
  };

  const handleJobApprove = async () => {
    if (!jobModal || !interviewDate || !interviewTime) return alert("Select Date & Time");
    await updateDoc(doc(db, "applications", jobModal.id), { 
        status: 'Accepted', interviewDate, interviewTime 
    });
    const msg = `Approved! Interview for ${jobModal.jobTitle} on ${interviewDate} at ${interviewTime}.`;
    window.open(`sms:${jobModal.mobile}?body=${encodeURIComponent(msg)}`);
    setJobModal(null); setShowSchedule(false);
  };

  const handleJobReject = async (id) => {
    await updateDoc(doc(db, "applications", id), { status: 'Rejected' });
    if(jobModal) setJobModal(null);
  };

  const handlePostScholarship = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "scholarships"), newScholarship);
    alert("✅ Scholarship Scheme Posted!");
    setNewScholarship({ name: '', amount: '', criteria: '', deadline: '' });
  };

  const handleScholarshipAction = async (app, action) => {
    await updateDoc(doc(db, "scholarship_applications", app.id), { status: action });
    if (action === 'Approved') {
        const msg = `Congrats! Your Scholarship (${app.scholarshipName}) is APPROVED. Amount: ₹${app.amount}`;
        window.open(`sms:${app.mobile}?body=${encodeURIComponent(msg)}`);
    }
    setScholarModal(null);
  };

  // --- MODERN DASHBOARD STYLES (Based on Image) ---
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

    :root {
        --sidebar-bg: #0f172a; /* Deep Navy Blue from image */
        --active-bg: #1e293b;
        --accent: #f59e0b; /* Orange/Gold accent from image */
        --bg-color: #f3f4f6;
        --text-dark: #1f2937;
        --text-light: #9ca3af;
        --card-bg: #ffffff;
    }

    body { margin: 0; font-family: 'Poppins', sans-serif; background: var(--bg-color); }

    .dashboard-container { display: flex; height: 100vh; overflow: hidden; }

    /* SIDEBAR */
    .sidebar { 
        width: 260px; 
        background: var(--sidebar-bg); 
        color: white; 
        display: flex; 
        flex-direction: column; 
        transition: 0.3s; 
        padding: 20px 0;
        box-shadow: 5px 0 15px rgba(0,0,0,0.1);
        z-index: 100;
    }
    .sidebar.closed { width: 70px; }

    .profile-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-bottom: 30px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        margin-bottom: 20px;
        text-align: center;
    }
    .logo-img { 
        width: 60px; height: 60px; 
        border-radius: 50%; 
        background: white; 
        padding: 5px; 
        object-fit: contain;
        margin-bottom: 10px;
        box-shadow: 0 0 10px rgba(255,255,255,0.2);
    }
    .admin-name { font-weight: 600; font-size: 1.1rem; opacity: ${isSidebarOpen ? 1 : 0}; transition: 0.2s; white-space: nowrap; }
    .admin-role { font-size: 0.8rem; color: var(--text-light); opacity: ${isSidebarOpen ? 1 : 0}; transition: 0.2s; }

    .menu-item { 
        padding: 15px 30px; 
        cursor: pointer; 
        display: flex; 
        align-items: center; 
        gap: 15px; 
        color: #cbd5e1;
        transition: 0.2s; 
        font-size: 0.95rem;
        border-left: 3px solid transparent;
    }
    .menu-item:hover, .menu-item.active { 
        background: var(--active-bg); 
        color: white;
        border-left-color: var(--accent);
    }
    .menu-text { white-space: nowrap; opacity: ${isSidebarOpen ? 1 : 0}; transition: 0.2s; font-weight: 500; }

    /* MAIN CONTENT */
    .main-content { flex: 1; padding: 30px; overflow-y: auto; background: var(--bg-color); }

    /* TOP HEADER (Like the reference image) */
    .header-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 35px;
    }
    .header-title h2 { margin: 0; font-size: 1.8rem; color: var(--text-dark); font-weight: 700; }
    .header-title p { margin: 0; color: var(--text-light); font-size: 0.9rem; }

    .header-actions { display: flex; gap: 20px; align-items: center; }
    .search-box {
        background: white;
        padding: 10px 20px;
        border-radius: 30px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text-light);
    }
    .icon-btn { 
        background: white; 
        width: 40px; height: 40px; 
        border-radius: 50%; 
        display: flex; align-items: center; justify-content: center; 
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        cursor: pointer;
        position: relative;
    }
    .badge-dot { position: absolute; top: 10px; right: 10px; width: 8px; height: 8px; background: var(--accent); border-radius: 50%; }

    /* CARDS */
    .stats-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
        gap: 25px; 
        margin-bottom: 30px; 
    }
    .stat-card { 
        background: var(--card-bg); 
        padding: 25px; 
        border-radius: 15px; 
        box-shadow: 0 4px 20px rgba(0,0,0,0.03); 
        display: flex; 
        flex-direction: column; 
        justify-content: space-between;
        position: relative;
        overflow: hidden;
    }
    .stat-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; width: 4px; height: 100%;
        background: var(--accent);
    }
    .stat-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .stat-title { color: var(--text-light); font-size: 0.9rem; font-weight: 500; }
    .stat-icon { font-size: 1.2rem; color: var(--accent); }
    .stat-value { font-size: 2rem; font-weight: 700; color: var(--text-dark); margin: 0; }

    /* CONTENT SECTION */
    .content-box { 
        background: var(--card-bg); 
        padding: 30px; 
        border-radius: 15px; 
        box-shadow: 0 4px 20px rgba(0,0,0,0.03); 
        margin-bottom: 25px; 
    }
    .section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .section-head h3 { margin: 0; font-size: 1.2rem; color: var(--text-dark); }

    /* FORMS & INPUTS */
    .input-row { display: flex; gap: 15px; margin-bottom: 15px; }
    .input-box { 
        flex: 1; padding: 12px 15px; 
        border: 1px solid #e5e7eb; border-radius: 8px; 
        outline: none; transition: 0.2s; background: #f9fafb;
        font-family: 'Poppins', sans-serif;
    }
    .input-box:focus { border-color: var(--accent); background: white; }

    .btn-primary { 
        background: var(--sidebar-bg); color: white; 
        padding: 12px 25px; border: none; border-radius: 8px; 
        cursor: pointer; font-weight: 600; width: 100%;
    }
    .btn-primary:hover { opacity: 0.9; }

    /* LISTS & ITEMS */
    .grid-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .item-card { 
        background: white; border: 1px solid #f3f4f6; 
        padding: 20px; border-radius: 12px; 
        transition: 0.2s;
        border-left: 4px solid transparent;
    }
    .item-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px rgba(0,0,0,0.05); }

    .status-badge { 
        padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; 
        font-weight: 600; color: white; display: inline-block;
    }

    /* ACTION BUTTONS */
    .action-group { display: flex; gap: 10px; margin-top: 15px; }
    .btn-approve { flex: 1; background: #10b981; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; }
    .btn-reject { flex: 1; background: #ef4444; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; }
    .btn-view { flex: 1; background: var(--sidebar-bg); color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; }

    /* MODAL */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px); }
    .modal-box { background: white; padding: 30px; border-radius: 15px; width: 90%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
  `;

  // --- RENDER FUNCTIONS ---

  const renderDashboard = () => (
    <div className="fade-in">
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-head">
                    <span className="stat-title">Total Complaints</span>
                    <span className="stat-icon" style={{color:'#ef4444'}}>{Icons.Complaints}</span>
                </div>
                <h3 className="stat-value">{complaints.length}</h3>
                <small style={{color:'#10b981', marginTop:'5px'}}>+2 New today</small>
            </div>
            <div className="stat-card">
                <div className="stat-head">
                    <span className="stat-title">Blood Donors</span>
                    <span className="stat-icon" style={{color:'#db2777'}}>{Icons.Blood}</span>
                </div>
                <h3 className="stat-value">{bloodList.length}</h3>
                <small style={{color:'var(--text-light)', marginTop:'5px'}}>Active Donors</small>
            </div>
            <div className="stat-card">
                <div className="stat-head">
                    <span className="stat-title">Job Applications</span>
                    <span className="stat-icon" style={{color:'#2563eb'}}>{Icons.Jobs}</span>
                </div>
                <h3 className="stat-value">{jobApps.length}</h3>
                <small style={{color:'#10b981', marginTop:'5px'}}>+5% Increase</small>
            </div>
            <div className="stat-card">
                <div className="stat-head">
                    <span className="stat-title">Scholarships</span>
                    <span className="stat-icon" style={{color:'#f59e0b'}}>{Icons.Scholarships}</span>
                </div>
                <h3 className="stat-value">{scholarApps.length}</h3>
                <small style={{color:'var(--text-light)', marginTop:'5px'}}>Applications Pending</small>
            </div>
        </div>

        <div className="content-box">
             <div className="section-head">
                 <h3>Recent Activity Overview</h3>
                 <button style={{background:'transparent', border:'1px solid #e5e7eb', padding:'5px 15px', borderRadius:'20px', cursor:'pointer'}}>View All</button>
             </div>
             <div style={{color:'#6b7280', padding:'20px', textAlign:'center', background:'#f9fafb', borderRadius:'10px'}}>
                 Chart Visualization Placeholder (Graph data would appear here)
             </div>
        </div>
    </div>
  );

  const renderComplaints = () => {
    const filtered = complaintFilter === 'All' ? complaints : complaints.filter(c => c.category === complaintFilter);
    return (
        <div className="fade-in">
            <div className="content-box">
                <div className="section-head">
                    <h3>Public Grievances</h3>
                    <select className="input-box" style={{maxWidth:'200px'}} onChange={(e) => setComplaintFilter(e.target.value)}>
                        <option value="All">All Categories</option>
                        <option value="Road">Road</option>
                        <option value="Water">Water</option>
                        <option value="Electricity">Electricity</option>
                    </select>
                </div>
                <div className="grid-list">
                    {filtered.map(c => (
                        <div key={c.id} className="item-card" style={{borderLeftColor: getCatColor(c.category)}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                                <span className="status-badge" style={{background: getCatColor(c.category)}}>{c.category}</span>
                                <button className="btn-delete" style={{background:'none', border:'none', cursor:'pointer'}} onClick={()=>handleDeleteComplaint(c.id)}>{Icons.Delete}</button>
                            </div>
                            <h4 style={{margin:'0 0 5px', color: '#1f2937'}}>{c.title}</h4>
                            <p style={{fontSize:'0.85rem', color:'#6b7280', margin:'0 0 10px'}}>{c.address}</p>

                            <div style={{borderTop:'1px solid #f3f4f6', paddingTop:'10px'}}>
                                {c.status === 'Solved' ? (
                                    <div style={{color:'#10b981', fontWeight:'600', textAlign:'center'}}>✅ Issue Resolved</div>
                                ) : (
                                    <div className="action-group">
                                        {c.status === 'Pending' && 
                                            <button className="btn-view" style={{background:'#3b82f6'}} onClick={()=>updateComplaintStatus(c.id, 'In Progress')}>Deploy</button>
                                        }
                                        <button className="btn-view" style={{background:'#1f2937'}} onClick={()=>setSolvingId(solvingId===c.id?null:c.id)}>Resolve</button>
                                    </div>
                                )}
                                {solvingId === c.id && (
                                    <div style={{marginTop:'10px'}}>
                                        <input type="file" className="input-box" onChange={(e)=>updateComplaintStatus(c.id, 'Solved', e.target.files[0])} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  const renderNews = () => (
    <div className="fade-in">
        <div className="content-box">
            <h3>Post Announcement</h3>
            <form onSubmit={handlePostNews}>
                <div className="input-row">
                    <input className="input-box" placeholder="Headline" value={newsTitle} onChange={e=>setNewsTitle(e.target.value)} required />
                </div>
                <div className="input-row">
                    <textarea className="input-box" rows="3" placeholder="Details..." value={newsContent} onChange={e=>setNewsContent(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary">Publish Update</button>
            </form>
        </div>
        <div className="grid-list">
            {newsList.map(item => (
                <div key={item.id} className="item-card" style={{borderLeftColor:'#8b5cf6'}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <small style={{color:'#9ca3af'}}>{new Date(item.date).toDateString()}</small>
                        <button style={{border:'none', background:'transparent', cursor:'pointer'}} onClick={()=>handleDeleteNews(item.id)}>{Icons.Delete}</button>
                    </div>
                    <h4 style={{margin:'10px 0'}}>{item.title}</h4>
                    <p style={{color:'#4b5563', fontSize:'0.9rem'}}>{item.content}</p>
                </div>
            ))}
        </div>
    </div>
  );

  const renderBlood = () => (
    <div className="fade-in">
        <div className="content-box">
            <h3>🩸 Blood Donor Registry</h3>
        </div>
        <div className="grid-list">
            {bloodList.map(donor => (
                <div key={donor.id} className="item-card" style={{borderLeftColor:'#ef4444'}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                         <span className="status-badge" style={{background: '#ef4444'}}>Group: {donor.bloodGroup}</span>
                         <button style={{border:'none', background:'transparent', cursor:'pointer'}} onClick={()=>handleDeleteBlood(donor.id)}>{Icons.Delete}</button>
                    </div>
                    <h4 style={{margin:'10px 0'}}>{donor.name}</h4>
                    <p style={{margin:'5px 0', fontSize:'0.9rem'}}>📍 {donor.location}</p>
                    <a href={`tel:${donor.mobile}`} className="btn-primary" style={{display:'block', textAlign:'center', marginTop:'10px', textDecoration:'none', background:'#ef4444', color:'white', padding:'8px', borderRadius:'6px'}}>Call: {donor.mobile}</a>
                </div>
            ))}
        </div>
    </div>
  );

  const renderJobs = () => (
    <div className="fade-in">
        <div className="content-box">
            <h3>Post Job Vacancy</h3>
            <form onSubmit={handlePostJob}>
                <div className="input-row">
                    <input className="input-box" placeholder="Job Title" value={newJob.title} onChange={e=>setNewJob({...newJob, title:e.target.value})} required />
                    <input className="input-box" placeholder="Department" value={newJob.dept} onChange={e=>setNewJob({...newJob, dept:e.target.value})} required />
                </div>
                <div className="input-row">
                    <input className="input-box" placeholder="Salary" value={newJob.salary} onChange={e=>setNewJob({...newJob, salary:e.target.value})} />
                    <input className="input-box" placeholder="Deadline" value={newJob.deadline} onChange={e=>setNewJob({...newJob, deadline:e.target.value})} />
                </div>
                <button type="submit" className="btn-primary">Post Job</button>
            </form>
        </div>
        <h3 style={{margin:'20px 0'}}>Applications</h3>
        <div className="grid-list">
            {jobApps.map(app => (
                <div key={app.id} className="item-card" style={{borderLeftColor: app.status==='Accepted'?'#10b981':(app.status==='Rejected'?'#ef4444':'#f59e0b')}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h4 style={{margin:0}}>{app.fullName}</h4>
                        <span className="status-badge" style={{background: app.status==='Accepted'?'#10b981':(app.status==='Rejected'?'#ef4444':'#f59e0b')}}>{app.status || 'Pending'}</span>
                    </div>
                    <p style={{fontSize:'0.85rem', color:'#6b7280', marginTop:'5px'}}>Applied for: <b>{app.jobTitle}</b></p>
                    <button className="btn-view" style={{width:'100%', marginTop:'10px', background:'#f3f4f6', color:'#1f2937'}} onClick={()=>{setJobModal(app); setShowSchedule(false);}}>Review Application</button>
                </div>
            ))}
        </div>
    </div>
  );

  const renderScholarships = () => (
    <div className="fade-in">
        <div className="content-box">
            <h3>Scholarship Scheme</h3>
            <form onSubmit={handlePostScholarship}>
                <div className="input-row">
                    <input className="input-box" placeholder="Scheme Name" value={newScholarship.name} onChange={e=>setNewScholarship({...newScholarship, name:e.target.value})} required />
                    <input className="input-box" placeholder="Amount (₹)" value={newScholarship.amount} onChange={e=>setNewScholarship({...newScholarship, amount:e.target.value})} required />
                </div>
                <div className="input-row">
                    <input className="input-box" placeholder="Criteria" value={newScholarship.criteria} onChange={e=>setNewScholarship({...newScholarship, criteria:e.target.value})} />
                    <input className="input-box" type="date" value={newScholarship.deadline} onChange={e=>setNewScholarship({...newScholarship, deadline:e.target.value})} />
                </div>
                <button type="submit" className="btn-primary">Launch Scheme</button>
            </form>
        </div>
        <div className="grid-list">
            {scholarApps.map(app => (
                <div key={app.id} className="item-card" style={{borderLeftColor: '#f59e0b'}}>
                    <h4 style={{margin:0}}>{app.studentName}</h4>
                    <p style={{fontSize:'0.85rem', color:'#6b7280'}}>Scheme: {app.scholarshipName}</p>
                    <div className="action-group">
                         {app.status === 'Approved' ? <span style={{color:'green', fontWeight:'bold', margin:'auto'}}>Granted</span> : 
                           <button className="btn-view" onClick={()=>setScholarModal(app)}>Take Action</button>
                         }
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <style>{styles}</style>

      {/* SIDEBAR - Dark Blue like reference image */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="profile-section">
             <img src={myLogo} alt="Logo" style={{ height: '78px', background:'white', borderRadius:'50%' }} />
            
            <div className="admin-name">{isSidebarOpen ? " Admin" : ""}</div>
            <div className="admin-role">{isSidebarOpen ? "Super Administrator" : ""}</div>
        </div>

        <div className={`menu-item ${activeTab==='dashboard'?'active':''}`} onClick={()=>setActiveTab('dashboard')}>
            <span>{Icons.Dashboard}</span> <span className="menu-text">Dashboard</span>
        </div>
        <div className={`menu-item ${activeTab==='complaints'?'active':''}`} onClick={()=>setActiveTab('complaints')}>
            <span>{Icons.Complaints}</span> <span className="menu-text">Complaints</span>
        </div>
        <div className={`menu-item ${activeTab==='blood'?'active':''}`} onClick={()=>setActiveTab('blood')}>
            <span>{Icons.Blood}</span> <span className="menu-text">Blood Donors</span>
        </div>
        <div className={`menu-item ${activeTab==='news'?'active':''}`} onClick={()=>setActiveTab('news')}>
            <span>{Icons.News}</span> <span className="menu-text">Announcements</span>
        </div>
        <div className={`menu-item ${activeTab==='jobs'?'active':''}`} onClick={()=>setActiveTab('jobs')}>
            <span>{Icons.Jobs}</span> <span className="menu-text">Recruitment</span>
        </div>
        <div className={`menu-item ${activeTab==='scholarships'?'active':''}`} onClick={()=>setActiveTab('scholarships')}>
            <span>{Icons.Scholarships}</span> <span className="menu-text">Education</span>
        </div>

        <div style={{marginTop:'auto'}}>
             <div className="menu-item" onClick={()=>{localStorage.clear(); navigate('/');}}>
                <span style={{color:'#ef4444'}}>{Icons.Logout}</span> <span className="menu-text">Logout</span>
             </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content">
        {/* Header like reference image */}
        <div className="header-bar">
            <div className="header-title">
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <span style={{cursor:'pointer', fontSize:'1.5rem'}} onClick={()=>setSidebarOpen(!isSidebarOpen)}>{Icons.Menu}</span>
                    <div>
                        <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                        <p>Welcome back, here is your daily overview</p>
                    </div>
                </div>
            </div>
            <div className="header-actions">
                <div className="search-box">
                    <span>{Icons.Search}</span>
                    <input placeholder="Search..." style={{border:'none', outline:'none', fontSize:'0.9rem'}} />
                </div>
                <div className="icon-btn">
                    {Icons.Bell}
                    <div className="badge-dot"></div>
                </div>
                <div className="icon-btn">
                    {Icons.User}
                </div>
            </div>
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'complaints' && renderComplaints()}
        {activeTab === 'blood' && renderBlood()}
        {activeTab === 'news' && renderNews()}
        {activeTab === 'jobs' && renderJobs()}
        {activeTab === 'scholarships' && renderScholarships()}
      </div>

      {/* MODALS (Kept same logic, updated style) */}
      {jobModal && (
        <div className="modal-overlay" onClick={()=>setJobModal(null)}>
            <div className="modal-box" onClick={e=>e.stopPropagation()}>
                <h3 style={{marginTop:0}}>Applicant: {jobModal.fullName}</h3>
                <p><b>Role:</b> {jobModal.jobTitle}</p>
                <p><b>Qualification:</b> {jobModal.qualification} ({jobModal.percentage}%)</p>
                <p><b>Contact:</b> {jobModal.mobile}</p>

                {!showSchedule ? (
                    <div className="action-group">
                        <button className="btn-approve" onClick={()=>setShowSchedule(true)}>Approve & Schedule</button>
                        <button className="btn-reject" onClick={()=>handleJobReject(jobModal.id)}>Reject</button>
                    </div>
                ) : (
                    <div style={{marginTop:'15px', background:'#f0fdf4', padding:'15px', borderRadius:'10px'}}>
                        <p><b>Schedule Interview:</b></p>
                        <input type="date" className="input-box" style={{marginBottom:'10px', width:'100%'}} value={interviewDate} onChange={e=>setInterviewDate(e.target.value)}/>
                        <input type="time" className="input-box" style={{marginBottom:'10px', width:'100%'}} value={interviewTime} onChange={e=>setInterviewTime(e.target.value)}/>
                        <button className="btn-primary" onClick={handleJobApprove}>Confirm & SMS</button>
                    </div>
                )}
            </div>
        </div>
      )}

      {scholarModal && (
        <div className="modal-overlay" onClick={()=>setScholarModal(null)}>
            <div className="modal-box" onClick={e=>e.stopPropagation()}>
                <h3 style={{marginTop:0}}>Student: {scholarModal.studentName}</h3>
                <p><b>Scheme:</b> {scholarModal.scholarshipName}</p>
                <p><b>Income:</b> ₹{scholarModal.income}</p>
                <div className="action-group">
                    <button className="btn-approve" onClick={()=>handleScholarshipAction(scholarModal, 'Approved')}>Approve Grant</button>
                    <button className="btn-reject" onClick={()=>handleScholarshipAction(scholarModal, 'Rejected')}>Reject</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;