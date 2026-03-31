import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebaseConfig'; 
import { collection, addDoc, onSnapshot } from 'firebase/firestore'; 
import myLogo from './logo.png';

const JobsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NEW: State for Firebase Jobs ---
  const [firebaseJobs, setFirebaseJobs] = useState([]);

  // --- Detailed Form State ---
  const initialFormState = { 
    fullName: '', fatherName: '', dob: '', gender: '', community: 'General',
    mobile: '', email: '', aadhar: '',
    address: '', district: '', pincode: '',
    qualification: '', passedOutYear: '', percentage: '',
    resume: null, photo: null 
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- STATIC JOBS DATA ---
  const staticJobs = [
    { id: 1, title: "Sub-Inspector (Taluk)", dept: "TN Police", deadline: "Feb 15", salary: "₹36,900+", location: "Anywhere in TN", type: "Uniform", color: "#e74c3c" },
    { id: 2, title: "Police Constable (PC)", dept: "TN Police", deadline: "Mar 10", salary: "₹18,200+", location: "District Wise", type: "Uniform", color: "#e74c3c" },
    { id: 3, title: "Fireman / Rescuer", dept: "Fire Service", deadline: "Mar 05", salary: "₹19,000+", location: "Chennai", type: "Uniform", color: "#c0392b" },
    { id: 4, title: "Forest Guard", dept: "Forest Dept", deadline: "Apr 01", salary: "₹19,500+", location: "Nilgiris/Salem", type: "Field Work", color: "#27ae60" },
    { id: 5, title: "Junior Assistant", dept: "TNPSC Gr-4", deadline: "Closing Soon", salary: "₹19,500 - ₹62k", location: "All TN", type: "Full Time", color: "#2980b9" },
    { id: 6, title: "Village Admin Officer", dept: "Revenue", deadline: "Open Now", salary: "₹19,500+", location: "Rural Areas", type: "Admin", color: "#3498db" },
    { id: 7, title: "Stenographer Gr-III", dept: "Judicial Dept", deadline: "Feb 20", salary: "₹20,600+", location: "High Court", type: "Desk Job", color: "#8e44ad" },
    { id: 8, title: "Record Clerk", dept: "School Edu", deadline: "Feb 28", salary: "₹15,900+", location: "Madurai", type: "Clerical", color: "#9b59b6" },
    { id: 9, title: "Office Assistant", dept: "PWD", deadline: "Mar 15", salary: "₹15,700+", location: "Trichy", type: "Support", color: "#8e44ad" },
    { id: 10, title: "Asst. Engineer (Civil)", dept: "PWD / Highways", deadline: "Coming Soon", salary: "₹56,100+", location: "Chennai", type: "Engineer", color: "#f39c12" },
    { id: 11, title: "Electrical Line Man", dept: "TNEB", deadline: "Urgent", salary: "₹15,000+", location: "Coimbatore", type: "Technical", color: "#d35400" },
    { id: 12, title: "Draftsman", dept: "Town Planning", deadline: "Feb 25", salary: "₹35,400+", location: "Erode", type: "Technical", color: "#e67e22" },
    { id: 13, title: "Surveyor", dept: "Land Records", deadline: "Mar 05", salary: "₹19,500+", location: "Villupuram", type: "Field Work", color: "#f39c12" },
    { id: 14, title: "Bus Conductor", dept: "TNSTC", deadline: "Feb 28", salary: "₹17,000+", location: "Salem/CBE", type: "Transport", color: "#16a085" },
    { id: 15, title: "Heavy Driver", dept: "MTC Chennai", deadline: "Mar 02", salary: "₹18,500+", location: "Chennai", type: "Transport", color: "#1abc9c" },
    { id: 16, title: "Mechanic (Diesel)", dept: "Transport Dept", deadline: "Mar 12", salary: "₹19,000+", location: "Workshops", type: "Technical", color: "#16a085" },
    { id: 17, title: "Staff Nurse", dept: "Govt Hospital", deadline: "Feb 18", salary: "₹36,000+", location: "District HQ", type: "Medical", color: "#e84393" },
    { id: 18, title: "Lab Technician", dept: "Public Health", deadline: "Feb 22", salary: "₹25,000+", location: "PHC Centers", type: "Medical", color: "#fd79a8" },
    { id: 19, title: "Pharmacist", dept: "Medical Services", deadline: "Mar 01", salary: "₹35,000+", location: "All TN", type: "Medical", color: "#e84393" },
    { id: 20, title: "Data Entry Operator", dept: "E-Seva Kendra", deadline: "Mar 20", salary: "₹12,000", location: "Local Taluks", type: "Contract", color: "#34495e" },
    { id: 21, title: "Noon Meal Organizer", dept: "Social Welfare", deadline: "Apr 10", salary: "₹10,000+", location: "Schools", type: "Social", color: "#2c3e50" },
  ];

  // --- FETCH JOBS FROM FIREBASE ---
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
        const newJobs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setFirebaseJobs(newJobs);
    });
    return () => unsubscribe();
  }, []);

  const allJobs = [...firebaseJobs, ...staticJobs]; 

  const filteredJobs = allJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApplyClick = (job) => {
    const checkLogin = localStorage.getItem("isLoggedIn");
    if (checkLogin !== "true") {
        if(window.confirm("🔒 Please Login to Apply!")) navigate('/login');
    } else {
        setSelectedJob(job);
        setShowModal(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.resume) { alert("⚠️ Please upload your Resume PDF!"); return; }
    setIsSubmitting(true);
    try {
        await addDoc(collection(db, "applications"), {
            ...formData,
            resume: formData.resume.name, 
            photo: formData.photo ? formData.photo.name : "No Photo",
            jobTitle: selectedJob.title,
            jobId: selectedJob.id,
            dept: selectedJob.dept,
            status: "Pending",
            appliedAt: new Date().toISOString()
        });
        alert(`✅ Application Submitted for ${selectedJob.title} Successfully!`);
        setShowModal(false);
        setFormData(initialFormState);
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("❌ Error submitting application. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        body { 
            margin: 0; 
            font-family: 'Inter', sans-serif; 
            background-color: #f0f2f5; 
            color: #1e293b;
        }

        /* --- Navbar Professional --- */
        .navbar { 
            background: rgba(255, 255, 255, 0.95); 
            padding: 12px 6%; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.04); 
            position: sticky; 
            top: 0; 
            z-index: 1000; 
            backdrop-filter: blur(10px);
        }
        .logo { font-weight: 800; font-size: 1.4rem; color: #0f172a; display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .nav-home-btn { 
            padding: 10px 24px; 
            border: none; 
            color: white; 
            background: #1e293b; 
            border-radius: 8px; 
            font-weight: 600; 
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            transition: 0.3s ease; 
            box-shadow: 0 4px 12px rgba(30, 41, 59, 0.2);
        }
        .nav-home-btn:hover { background: #334155; transform: translateY(-2px); }

        /* --- Header Section --- */
        .jobs-header { 
            background-image: linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(30, 58, 138, 0.8)), 
            url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80');
            background-size: cover;      
            background-position: center; 
            background-repeat: no-repeat;
            color: white; 
            padding: 80px 20px 100px; 
            text-align: center; 
            border-radius: 0 0 50px 50px;
            margin-bottom: -50px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            position: relative;
        }

        .jobs-header h1 { font-size: 2.8rem; font-weight: 800; margin: 0; letter-spacing: -1px; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
        .jobs-header p { font-size: 1.1rem; color: #cbd5e1; margin-top: 15px; max-width: 600px; margin-left: auto; margin-right: auto; }

        .search-box { 
            margin-top: 40px; 
            display: inline-block; 
            position: relative; 
            width: 100%; 
            max-width: 650px; 
        }
        .search-input { 
            width: 100%; 
            padding: 20px 30px 20px 60px; 
            border-radius: 12px; 
            border: none; 
            outline: none; 
            font-size: 1rem; 
            box-shadow: 0 15px 40px rgba(0,0,0,0.2); 
            transition: 0.3s ease;
            font-weight: 500;
        }
        .search-input:focus { transform: translateY(-2px); box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
        .search-icon { position: absolute; left: 25px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 1.2rem; }

        /* --- Grid System --- */
        .container { max-width: 1280px; margin: 0 auto; padding: 40px 20px; }
        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
            gap: 30px; 
            margin-top: 20px; 
        }

        /* --- 🌟 CARD DESIGN (WITH VISIBLE OUTLINE) 🌟 --- */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .card { 
            background: #ffffff;
            border-radius: 16px;
            padding: 28px;
            position: relative;

            /* --- 🔴 VISIBLE GREY OUTLINE ADDED HERE --- */
            border: 1.5px solid #cbd5e1; 

            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            animation: fadeInUp 0.6s ease-out forwards;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        }

        /* --- HOVER: BLUE OUTLINE & ZOOM --- */
        .card:hover {
            transform: translateY(-10px) scale(1.05); /* ZOOM */
            box-shadow: 0 20px 40px rgba(59, 130, 246, 0.25); 

            /* --- 🔵 BLUE OUTLINE ON HOVER --- */
            border-color: #2563eb; 
            border-width: 2px;

            z-index: 10;
        }

        .color-strip { 
            position: absolute; 
            top: 0; 
            left: 0; 
            right: 0; 
            height: 4px; 
            border-radius: 16px 16px 0 0;
        }

        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }

        .badge { 
            font-size: 0.7rem; 
            padding: 5px 12px; 
            border-radius: 50px; 
            font-weight: 700; 
            background: #f8fafc; 
            color: #64748b; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            border: 1px solid #e2e8f0;
        }

        .deadline-tag {
            font-size: 0.75rem; 
            font-weight: 600; 
            color: #d946ef; 
            background: #fdf4ff; 
            padding: 6px 10px; 
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .job-title { 
            font-size: 1.35rem; 
            font-weight: 700; 
            color: #1e293b; 
            margin: 0 0 8px 0; 
            line-height: 1.4; 
        }

        .job-dept { 
            color: #64748b; 
            font-size: 0.95rem; 
            font-weight: 500; 
            margin-bottom: 25px; 
            display: flex; 
            align-items: center; 
            gap: 6px; 
        }

        .info-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f8fafc;
            padding: 12px 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            border: 1px solid #f1f5f9;
        }

        .info-item { display: flex; flex-direction: column; gap: 2px; }
        .info-label { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
        .info-value { font-size: 0.9rem; font-weight: 600; color: #334155; }

        .apply-btn { 
            width: 100%; 
            padding: 14px; 
            background: #0f172a; 
            color: white; 
            border: none; 
            border-radius: 10px; 
            font-weight: 600; 
            font-size: 0.95rem;
            cursor: pointer; 
            transition: all 0.3s ease; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            gap: 8px; 
        }
        .apply-btn:hover { 
            background: #2563eb; 
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
            transform: translateY(-2px);
        }

        /* --- Modal Professional --- */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(5px); animation: fadeIn 0.3s; }
        .modal-content { background: white; border-radius: 20px; width: 100%; max-width: 750px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: slideUpModal 0.4s cubic-bezier(0.16, 1, 0.3, 1); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpModal { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .modal-header { padding: 25px 30px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #fff; position: sticky; top: 0; z-index: 10; }
        .modal-body { padding: 30px; }

        .form-section-title { font-size: 0.9rem; font-weight: 700; color: #64748b; margin: 25px 0 15px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .full-width { grid-column: span 2; }

        .form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; color: #334155; }
        .form-input { 
            width: 100%; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; transition: 0.2s; box-sizing: border-box; background: #f8fafc;
        }
        .form-input:focus { border-color: #2563eb; background: #fff; outline: none; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

        .modal-footer { margin-top: 35px; display: flex; gap: 15px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
        .btn-cancel { flex: 1; padding: 14px; background: white; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 600; cursor: pointer; color: #475569; transition: 0.2s; }
        .btn-cancel:hover { background: #f1f5f9; }
        .btn-submit { flex: 1; padding: 14px; background: #0f172a; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-submit:hover { background: #2563eb; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }

        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } .jobs-header { padding: 60px 20px 80px; } .jobs-header h1 { font-size: 2rem; } }
      `}</style>

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo" onClick={() => navigate('/')}>
            <img src={myLogo} alt="Logo" style={{height:'60px', borderRadius:'8px'}} />
            <div style={{display:'flex', flexDirection:'column', lineHeight:'1.1'}}>
                <span style={{fontFamily:'Inter', letterSpacing:'-0.5px'}}>CIVIC EYE</span>
                <span style={{fontSize:'0.65rem', color:'#64748b', fontWeight:'600', letterSpacing:'1px'}}>RECRUITMENT PORTAL</span>
            </div>
        </div>
        <button className="nav-home-btn" onClick={() => navigate('/')}>
           <span>🏠</span> Home
        </button>
      </nav>

      {/* Professional Header */}
      <header className="jobs-header">
        <h1>Career Opportunities</h1>
        <p>Explore premium roles in Government & Private sectors. Build your future today.</p>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search by Job Title, Dept, or Keywords..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </header>

      {/* Jobs Grid */}
      <div className="container">
        <div className="grid">
          {filteredJobs.length === 0 ? (
            <div style={{gridColumn:'1/-1', textAlign:'center', padding:'80px', color:'#94a3b8'}}>
              <h2 style={{fontSize:'1.5rem', fontWeight:'500'}}>No opportunities found matching your criteria.</h2>
            </div>
          ) : (
            filteredJobs.map((job, index) => (
              <div key={job.id} className="card" style={{animationDelay: `${index * 0.05}s`}}>
                <div className="color-strip" style={{background: job.color || '#3b82f6'}}></div>

                <div>
                  <div className="card-header">
                    <span className="badge">{job.type}</span>
                    <span className="deadline-tag">⏳ {job.deadline}</span>
                  </div>

                  <h3 className="job-title">{job.title}</h3>
                  <div className="job-dept">
                     <span style={{width:'8px', height:'8px', borderRadius:'50%', background: job.color || '#3b82f6', display:'inline-block'}}></span>
                     {job.dept}
                  </div>

                  <div className="info-row">
                    <div className="info-item">
                        <span className="info-label">Location</span>
                        <span className="info-value">{job.location}</span>
                    </div>
                    <div className="info-item" style={{textAlign:'right'}}>
                        <span className="info-label">Salary</span>
                        <span className="info-value">{job.salary}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => handleApplyClick(job)} className="apply-btn">
                    Apply Now <span style={{fontSize:'1.1rem'}}>→</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Professional Modal */}
      {showModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                  <h3 style={{margin:0, color:'#0f172a', fontSize:'1.4rem'}}>Application Form</h3>
                  <span style={{fontSize:'0.85rem', color:'#64748b'}}>Applying for: <b>{selectedJob.title}</b></span>
              </div>
              <button onClick={() => setShowModal(false)} style={{background:'white', border:'1px solid #e2e8f0', borderRadius:'50%', width:'36px', height:'36px', fontSize:'1.2rem', cursor:'pointer', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center'}}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-section-title">👤 Personal Details</div>
                <div className="form-grid">
                  <div className="form-group full-width"><label>Full Name</label><input className="form-input" required name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="As per Govt ID" /></div>
                  <div className="form-group"><label>Father's Name</label><input className="form-input" required name="fatherName" value={formData.fatherName} onChange={handleInputChange} /></div>
                  <div className="form-group"><label>Date of Birth</label><input type="date" className="form-input" required name="dob" value={formData.dob} onChange={handleInputChange} /></div>
                  <div className="form-group"><label>Gender</label><select className="form-input" name="gender" value={formData.gender} onChange={handleInputChange}><option value="">Select Gender</option><option>Male</option><option>Female</option><option>Other</option></select></div>
                  <div className="form-group"><label>Community</label><select className="form-input" name="community" value={formData.community} onChange={handleInputChange}><option>General</option><option>OBC</option><option>SC/ST</option><option>MBC</option></select></div>
                </div>

                <div className="form-section-title">📞 Contact Information</div>
                <div className="form-grid">
                  <div className="form-group"><label>Mobile Number</label><input className="form-input" required name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="+91" /></div>
                  <div className="form-group"><label>Email ID</label><input type="email" className="form-input" required name="email" value={formData.email} onChange={handleInputChange} placeholder="example@mail.com" /></div>
                  <div className="form-group full-width"><label>Permanent Address</label><input className="form-input" required name="address" value={formData.address} onChange={handleInputChange} /></div>
                </div>

                <div className="form-section-title">🎓 Education & Documents</div>
                <div className="form-grid">
                  <div className="form-group"><label>Highest Qualification</label><input className="form-input" required name="qualification" value={formData.qualification} onChange={handleInputChange} placeholder="e.g. B.E / B.Sc" /></div>
                  <div className="form-group"><label>Percentage / CGPA</label><input className="form-input" name="percentage" value={formData.percentage} onChange={handleInputChange} /></div>
                  <div className="form-group full-width" style={{background:'#eff6ff', padding:'20px', borderRadius:'12px', border:'1px dashed #3b82f6'}}><label style={{color:'#1e40af'}}>Upload Resume (PDF only) *</label><input type="file" required accept=".pdf" name="resume" onChange={handleFileChange} style={{marginTop:'5px'}} /></div>
                </div>

                <div className="modal-footer">
                   <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                   <button type="submit" className="btn-submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting Application...' : 'Submit Application'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;