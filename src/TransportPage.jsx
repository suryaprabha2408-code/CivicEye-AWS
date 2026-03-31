import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
import { db } from './firebaseConfig'; 
import myLogo from './logo.png'; 

function StudentReliefWide() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('school');
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Form Data State ---
  const [formData, setFormData] = useState({
    fullName: '',
    regNo: '',
    community: '',
    cgpa: '',
    income: '',
    requestedAmount: '',
    reason: ''
  });

  // --- DATA ---
  const schoolSchemes = [
    { id: 1, title: "10th & 12th Exam Fee Aid", dept: "Govt Education Dept", deadline: "Feb 28", amount: "₹2,500", type: "Exam Fee", color: "#2563eb", eligibility: ["Must be in Govt/Aided School", "Family Income < ₹1 Lakh", "Attendance > 75%"], documents: ["Bonafide Certificate", "Income Certificate", "Aadhar Card"] }, 
    { id: 2, title: "Free Uniform & Books Support", dept: "Social Welfare", deadline: "Mar 15", amount: "₹1,500", type: "Materials", color: "#0f766e", eligibility: ["Class 1 to 8 Students", "Rural Area Residence", "Single Parent / Orphan"], documents: ["Community Certificate", "School ID Card", "Ration Card"] }, 
    { id: 3, title: "Bus Pass / Transport Aid", dept: "Transport Dept", deadline: "Monthly", amount: "Free Pass", type: "Transport", color: "#475569", eligibility: ["Distance > 5km from School", "No Govt Bus in Route"], documents: ["Address Proof", "School Letter", "Photo"] } 
  ];

  const collegeSchemes = [
    { id: 101, title: "First Graduate Scholarship", dept: "Higher Edu Dept", deadline: "Aug 30", amount: "₹25,000", type: "Tuition", color: "#1e40af", eligibility: ["First person in family to study", "Counseling Admission only", "No arrears in previous sem"], documents: ["First Graduate Cert", "Allotment Order", "Mark Sheets"] }, 
    { id: 102, title: "Hostel Fee Waiver", dept: "Adi Dravidar Welfare", deadline: "Sep 15", amount: "₹40,000", type: "Hostel", color: "#334155", eligibility: ["SC/ST Students", "Staying in Govt Hostel", "Distance > 20km from home"], documents: ["Caste Certificate", "Hostel Admission Slip", "Income Cert"] }, 
    { id: 103, title: "Project Work Funding", dept: "Tech Innovation", deadline: "Open", amount: "₹10,000", type: "Research", color: "#0e7490", eligibility: ["Final Year Engineering", "Innovative Social Project", "Team of 3 max"], documents: ["Project Abstract", "HOD Recommendation", "Budget Plan"] } 
  ];

  const toggleDetails = (id) => setExpandedId(expandedId === id ? null : id);

  const handleApplyClick = (e, scheme) => { 
    e.stopPropagation(); 
    setShowForm(scheme); 
    setFormData({ fullName: '', regNo: '', community: '', cgpa: '', income: '', requestedAmount: '', reason: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- SUBMIT FUNCTION (Confirmed: Stores in scholarship_applications) ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Submitting to scholarship_applications...");

      await addDoc(collection(db, "scholarship_applications"), {
        ...formData,
        schemeTitle: showForm.title,
        schemeId: showForm.id,
        schemeType: showForm.type,
        status: "Pending",
        appliedAt: serverTimestamp()
      });

      console.log("Success!"); 
      alert(`✅ Application Submitted for ${showForm.title}!\nSaved to 'scholarship_applications' collection.`);
      setShowForm(null);

    } catch (error) {
      console.error("Error adding document: ", error); 
      alert("❌ Error submitting application. Check Console (F12).");
    }

    setIsSubmitting(false);
  };

  const currentList = activeTab === 'school' ? schoolSchemes : collegeSchemes;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", minHeight: '100vh', background: '#f8fafc', paddingBottom: '50px' }}>

      {/* --- HERO SECTION --- */}
      <div style={{ 
          position: 'relative', 
          height: '400px', 
          background: 'linear-gradient(rgba(30, 58, 138, 0.8), rgba(30, 58, 138, 0.6)), url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '0 20px',
          borderBottomLeftRadius: '50px',
          borderBottomRightRadius: '50px'
      }}>
          <nav style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={myLogo} alt="Logo" style={{ height: '40px', background:'white', borderRadius:'50%' }} />
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>CIVIC EYE</span>
              </div>
              <button onClick={() => navigate('/')} style={{ background: 'white', color: '#1e3a8a', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', cursor:'pointer' }}>Home</button>
          </nav>

          <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', fontWeight: '800' }}>Student Support Schemes</h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 30px', opacity: 0.9 }}>Find government and private scholarships, fee waivers, and material support tailored for your education.</p>
      </div>

      {/* --- TABS --- */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '-30px', position: 'relative', zIndex: 10 }}>
        {['school', 'college'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '15px 50px', borderRadius: '15px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem',
                background: activeTab === tab ? '#ffffff' : '#e2e8f0',
                color: activeTab === tab ? '#1e3a8a' : '#64748b',
                boxShadow: activeTab === tab ? '0 10px 20px rgba(0,0,0,0.1)' : 'inset 0 2px 5px rgba(0,0,0,0.05)', 
                transition: '0.3s',
                transform: activeTab === tab ? 'translateY(-5px)' : 'none'
            }}>
                {tab === 'school' ? '🎒 School Schemes' : '🎓 College Grants'}
            </button>
        ))}
      </div>

      {/* --- WIDE CARDS LIST --- */}
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', display:'flex', flexDirection:'column', gap:'20px' }}>
        {currentList.map((item, index) => (
            <div key={item.id} onClick={() => toggleDetails(item.id)}
                 style={{ 
                     background: 'white', 
                     borderRadius: '20px', 
                     boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
                     cursor: 'pointer', 
                     borderLeft: `8px solid ${item.color}`,
                     transition: 'all 0.3s ease',
                     overflow: 'hidden'
                 }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <div style={{ padding: '25px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 300px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                            {item.title.includes("Bus") ? "🚌" : item.title.includes("Fee") ? "💰" : "🎓"}
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: item.color, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.type}</span>
                            <h3 style={{ margin: '5px 0', fontSize: '1.3rem', color: '#1e293b' }}>{item.title}</h3>
                            <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#64748b' }}>
                                <span>🏛 {item.dept}</span>
                                <span style={{ color: '#ef4444' }}>⏳ {item.deadline}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: '0 1 auto' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>Value</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{item.amount}</div>
                        </div>
                        <button onClick={(e) => handleApplyClick(e, item)} 
                            style={{ 
                                background: '#1e3a8a', color: 'white', border: 'none', 
                                padding: '12px 25px', borderRadius: '12px', fontWeight: '600', 
                                cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 10px rgba(30, 58, 138, 0.3)' 
                            }}>
                            Apply Now
                        </button>
                    </div>
                </div>

                {expandedId === item.id && (
                    <div style={{ background: '#f8fafc', padding: '25px', borderTop: '1px solid #e2e8f0', display:'flex', flexWrap:'wrap', gap:'40px' }}>
                        <div style={{ flex: 1, minWidth:'250px' }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#334155' }}>✅ Eligibility Criteria</h4>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', lineHeight: '1.6' }}>
                                {item.eligibility.map((e, i) => <li key={i}>{e}</li>)}
                            </ul>
                        </div>
                        <div style={{ flex: 1, minWidth:'250px' }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#334155' }}>📄 Required Documents</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {item.documents.map((d, i) => (
                                    <span key={i} style={{ fontSize: '0.85rem', background: 'white', padding: '8px 15px', borderRadius: '20px', border: '1px solid #cbd5e1', color: '#475569' }}>
                                        {d}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        ))}
      </div>

      {/* --- FORM MODAL --- */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ width: '90%', maxWidth: '650px', padding: '30px', borderRadius: '25px', background: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight:'90vh', overflowY:'auto' }}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                    <div>
                        <h3 style={{ margin: 0, color: '#1e3a8a', fontSize:'1.4rem' }}>Official Application</h3>
                        <p style={{ margin: '5px 0 0', fontSize:'0.85rem', color:'#64748b' }}>Provide accurate details for eligibility verification.</p>
                    </div>
                    <button onClick={()=>setShowForm(null)} style={{background:'none', border:'none', fontSize:'1.8rem', cursor:'pointer', color:'#94a3b8'}}>×</button>
                </div>
                <div style={{ background: '#eff6ff', padding: '12px 20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #bfdbfe', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 'bold', letterSpacing:'0.5px' }}>APPLYING FOR</span>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>{showForm.title}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                         <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Grant Value</span>
                         <div style={{ fontSize: '1rem', fontWeight: '800', color: '#059669' }}>{showForm.amount}</div>
                    </div>
                </div>
                <form onSubmit={handleFormSubmit}>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{fontSize:'0.85rem', fontWeight:'600', color:'#475569', display:'block', marginBottom:'5px'}}>Full Name</label>
                            <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="As per Aadhaar" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', background:'#f8fafc', boxSizing:'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{fontSize:'0.85rem', fontWeight:'600', color:'#475569', display:'block', marginBottom:'5px'}}>Register / Roll No</label>
                            <input required type="text" name="regNo" value={formData.regNo} onChange={handleChange} placeholder="e.g. 9125..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', background:'#f8fafc', boxSizing:'border-box' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                         <div style={{ flex: 1 }}>
                            <label style={{fontSize:'0.85rem', fontWeight:'600', color:'#475569', display:'block', marginBottom:'5px'}}>Community / Category</label>
                            <select required name="community" value={formData.community} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', background:'#f8fafc', boxSizing:'border-box', color:'#334155' }}>
                                <option value="">Select Category</option>
                                <option value="gen">General / OC</option>
                                <option value="obc">OBC / BC / MBC</option>
                                <option value="sc">SC / ST</option>
                                <option value="min">Minority</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{fontSize:'0.85rem', fontWeight:'600', color:'#475569', display:'block', marginBottom:'5px'}}>Prev. Year % / CGPA</label>
                            <input required type="number" step="0.1" name="cgpa" value={formData.cgpa} onChange={handleChange} placeholder="e.g. 8.5 or 85%" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', background:'#f8fafc', boxSizing:'border-box' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{fontSize:'0.85rem', fontWeight:'600', color:'#475569', display:'block', marginBottom:'5px'}}>Annual Family Income</label>
                            <input required type="number" name="income" value={formData.income} onChange={handleChange} placeholder="₹ As per Income Cert." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', background:'#f8fafc', boxSizing:'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                             <label style={{fontSize:'0.85rem', fontWeight:'600', color:'#475569', display:'block', marginBottom:'5px'}}>Requested Amount (₹)</label>
                             <input required type="number" name="requestedAmount" value={formData.requestedAmount} onChange={handleChange} placeholder="Enter Amount" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', background:'#fff', fontWeight:'bold', color:'#1e3a8a', boxSizing:'border-box' }} />
                        </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{fontSize:'0.85rem', fontWeight:'600', color:'#475569', display:'block', marginBottom:'5px'}}>Reason for Application / Statement</label>
                        <textarea required rows="2" name="reason" value={formData.reason} onChange={handleChange} placeholder="Briefly explain why you need this scholarship..." style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', background:'#f8fafc', resize:'none', boxSizing:'border-box' }}></textarea>
                    </div>
                    <div style={{ display:'flex', gap:'10px', alignItems:'start', marginBottom:'20px', padding:'10px', background:'#f1f5f9', borderRadius:'10px' }}>
                        <input type="checkbox" required style={{ marginTop:'4px' }} />
                        <span style={{ fontSize:'0.8rem', color:'#64748b' }}>
                            I declare that I am an Indian Citizen and the details furnished above (Income, Marks, Community) are true. I will produce original documents when asked.
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button type="button" onClick={()=>setShowForm(null)} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', fontWeight: 'bold', fontSize: '1rem', cursor:'pointer' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} style={{ flex: 2, padding: '15px', borderRadius: '12px', background: isSubmitting ? '#94a3b8' : '#1e3a8a', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(30, 58, 138, 0.2)' }}>
                            {isSubmitting ? 'Saving to Database...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

export default StudentReliefWide;