import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, getDoc } from 'firebase/firestore';

function VotingPage() {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);

  // --- 1. GET DATA ---
  useEffect(() => {
    // Debug: Data varudha nu check panrom
    console.log("Fetching data...");

    const q = query(collection(db, "complaints"), orderBy("votes", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Force convert to Number
          votes: Number(data.votes) || 0, 
          status: data.status || 'Pending',
          title: data.title || "No Title",
          description: data.description || "No Description"
        };
      });
      console.log("Data Received:", list); // Console la data varudha paarunga
      setPolls(list);
      setLoading(false);
    }, (error) => {
        console.error("Snapshot Error:", error);
        alert("Error fetching data! Check Console.");
    });

    return () => unsubscribe();
  }, []);

  // --- 2. HANDLE VOTE (DEBUG MODE) ---
  const handleVote = async (id, currentStatus) => {
    console.log("--- VOTE CLICKED ---");
    console.log("ID:", id);
    console.log("Status:", currentStatus);

    if (currentStatus === 'Solved') {
        alert("This issue is already solved!");
        return;
    }

    setVotingId(id);

    try {
        // 1. Local UI Update (Instant)
        setPolls(prevPolls => 
            prevPolls.map(poll => {
                if (poll.id === id) {
                    console.log(`Updating UI locally for ${poll.title}: ${poll.votes} -> ${poll.votes + 1}`);
                    return { ...poll, votes: poll.votes + 1 };
                }
                return poll;
            })
        );

        // 2. Firebase Update
        const issueRef = doc(db, "complaints", id);

        // Check if doc exists first (Safety)
        const docSnap = await getDoc(issueRef);
        if (!docSnap.exists()) {
            alert("Error: Document not found in Database!");
            setVotingId(null);
            return;
        }

        await updateDoc(issueRef, { 
            votes: increment(1) 
        });

        console.log("✅ Firebase Update Success!");

    } catch (error) {
        console.error("❌ Voting Failed Error:", error);
        alert(`Voting Failed: ${error.message}`);

        // Revert UI on error
        setPolls(prevPolls => 
            prevPolls.map(poll => 
              poll.id === id ? { ...poll, votes: poll.votes - 1 } : poll
            )
        );
    }

    setTimeout(() => setVotingId(null), 500); 
  };

  // --- 3. DUPLICATE FILTER ---
  const uniquePolls = polls.filter((poll, index, self) =>
    index === self.findIndex((p) => (
      p.title.trim().toLowerCase() === poll.title.trim().toLowerCase() &&
      p.description.trim().toLowerCase() === poll.description.trim().toLowerCase()
    ))
  );

  const isResolved = (status) => ['solved', 'resolved', 'completed'].includes(status?.toLowerCase());

  const getProgressColor = (votes) => {
      if (votes > 50) return 'linear-gradient(90deg, #ef4444, #b91c1c)';
      if (votes > 20) return 'linear-gradient(90deg, #f59e0b, #d97706)';
      return 'linear-gradient(90deg, #3b82f6, #2563eb)';
  };

  return (
    <div className="voting-wrapper">
      {/* Styles same as before */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        body { margin: 0; font-family: 'Inter', sans-serif; background-color: #f8fafc; }
        .voting-wrapper { min-height: 100vh; display: flex; flex-direction: column; }
        .glass-header { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100; padding: 15px 0; }
        .header-content { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
        .page-title h1 { margin: 0; font-size: 1.5rem; color: #0f172a; }
        .back-btn { background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 50px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .polls-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; max-width: 1200px; margin: 40px auto; padding: 0 20px; }
        .poll-card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; transition: all 0.3s ease; position: relative; display: flex; flex-direction: column; }
        .poll-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.1); }
        .status-badge { position: absolute; top: 20px; right: 20px; padding: 6px 12px; border-radius: 30px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
        .badge-solved { background: #dcfce7; color: #166534; }
        .badge-pending { background: #fff7ed; color: #9a3412; }
        .card-body { padding: 25px; flex: 1; }
        .card-category { font-size: 0.8rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
        .card-title { font-size: 1.25rem; margin: 0 0 10px 0; color: #1e293b; }
        .card-desc { color: #64748b; font-size: 0.95rem; margin-bottom: 20px; }
        .location-tag { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #94a3b8; }
        .vote-section { background: #f8fafc; padding: 20px 25px; border-top: 1px solid #f1f5f9; }
        .vote-stats { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; }
        .vote-count { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
        .progress-bar-bg { height: 8px; background: #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
        .progress-fill { height: 100%; border-radius: 10px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .vote-btn { width: 100%; padding: 14px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; }
        .btn-disabled { background: #cbd5e1 !important; color: #64748b; cursor: not-allowed; box-shadow: none; }
        .spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <header className="glass-header">
        <div className="header-content">
          <div className="page-title">
            <h1>🗳️ Voice of the City</h1>
            <span>Vote to prioritize issues in your area</span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            <span>⬅</span> Dashboard
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{textAlign:'center', padding:'50px', color:'#94a3b8'}}>Loading community polls...</div>
      ) : (
        <div className="polls-grid">
          {uniquePolls.length === 0 ? <p style={{textAlign:'center', width:'100%'}}>No complaints found.</p> : null}

          {uniquePolls.map((poll, index) => {
             const solved = isResolved(poll.status);
             const isVoting = votingId === poll.id;
             const percentage = Math.min((poll.votes / 50) * 100, 100);

             return (
               <div key={poll.id} className="poll-card" style={{opacity: solved ? 0.9 : 1}}>

                 <div className={`status-badge ${solved ? 'badge-solved' : 'badge-pending'}`}>
                    {poll.status}
                 </div>

                 <div className="card-body">
                   <div className="card-category">#{index + 1} Trending • {poll.category}</div>
                   <h3 className="card-title">{poll.title}</h3>
                   <p className="card-desc">{poll.description}</p>
                   <div className="location-tag">
                     <span>📍</span> {poll.address || "Location not updated"}
                   </div>
                 </div>

                 <div className="vote-section">
                   <div className="vote-stats">
                     <span className="vote-count">{poll.votes}</span>
                     <span className="vote-label">Citizens Voted</span>
                   </div>

                   <div className="progress-bar-bg">
                     <div className="progress-fill" 
                        style={{ width: `${percentage}%`, background: solved ? '#22c55e' : getProgressColor(poll.votes) }}>
                     </div>
                   </div>

                   {solved ? (
                     <button className="vote-btn btn-disabled" disabled>✅ Issue Resolved</button>
                   ) : (
                     <button 
                       className="vote-btn" 
                       onClick={() => handleVote(poll.id, poll.status)} 
                       disabled={isVoting}
                     >
                       {isVoting ? <div className="spinner"></div> : "👍 Upvote Issue"}
                     </button>
                   )}
                 </div>
               </div>
             );
          })}
        </div>
      )}
    </div>
  );
}

export default VotingPage;