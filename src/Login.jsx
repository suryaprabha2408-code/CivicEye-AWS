import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebaseConfig'; 
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'; 

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ---------------------------------------------------------
    // 🚧 1. OLD ADMIN (Roads & Electricity Issues)
    // ---------------------------------------------------------
    if (username === 'admin' && password === 'admin123') {
        const adminUser = { username: 'admin', role: 'admin' };
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem("isLoggedIn", "true"); 

        setTimeout(() => {
            alert("👑 Welcome Main Admin! (Complaints Dashboard)");
            navigate('/dashboard');
        }, 1000);
        return; 
    }

    // ---------------------------------------------------------
    // 💼 2. NEW JOB ADMIN (Recruitment Portal)
    // ---------------------------------------------------------
    else if (username === 'jobadmin' && password === 'job123') {
        const jobUser = { username: 'jobadmin', role: 'recruiter' };
        localStorage.setItem('user', JSON.stringify(jobUser));
        localStorage.setItem("isLoggedIn", "true"); 

        setTimeout(() => {
            alert("💼 Welcome Recruitment Officer! Opening Job Portal...");
            navigate('/admin'); 
        }, 1000);
        return;
    }

    // ---------------------------------------------------------
    // 👑 3. SUPER ADMIN (All Data: Complaints + Jobs + Scholarships)
    // ---------------------------------------------------------
    else if (username === 'superadmin' && password === 'power123') {
        const superUser = { username: 'superadmin', role: 'super_admin' };
        localStorage.setItem('user', JSON.stringify(superUser));
        localStorage.setItem("isLoggedIn", "true"); 

        setTimeout(() => {
            alert("👑 Welcome Super Admin! Loading Full Dashboard...");
            navigate('/super-admin'); // Ithu puthu page ku pogum
        }, 1000);
        return;
    }

    // ---------------------------------------------------------
    // 👤 4. NORMAL USER (Firebase)
    // ---------------------------------------------------------
    try {
      const usersRef = collection(db, "users");

      if (isLogin) {
        // --- FIREBASE LOGIN ---
        const q = query(usersRef, where("username", "==", username), where("password", "==", password));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            const userId = querySnapshot.docs[0].id;
            localStorage.setItem('user', JSON.stringify({ id: userId, ...userData }));
            localStorage.setItem("isLoggedIn", "true");

            alert("Login Success! 🚀");
            navigate('/'); 
        } else {
            alert("❌ User not found or Wrong Password!");
            setLoading(false);
        }

      } else {
        // --- FIREBASE REGISTER ---
        const docRef = await addDoc(usersRef, {
            username: username,
            password: password,
            email: email || "user@civic.com",
            role: "user" 
        });

        localStorage.setItem('user', JSON.stringify({ id: docRef.id, username, role: "user" }));
        localStorage.setItem("isLoggedIn", "true");

        alert("Account Created! Welcome inside! 🎉");
        navigate('/'); 
      }
    } catch (err) {
      console.error(err);
      alert("Error: Internet check pannunga or Database permission.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* CSS Styles applied internally for this component */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

        body { margin: 0; font-family: 'Poppins', sans-serif; }

        .login-container {
            height: 100vh;
            width: 100vw;
            background-image: url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop');
            background-size: cover;
            background-position: center;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
        }

        /* Dark Overlay to make text readable */
        .login-container::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.6); 
            backdrop-filter: blur(4px);
        }

        .glass-card {
            position: relative;
            background: rgba(255, 255, 255, 0.95);
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 400px;
            text-align: center;
            animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .logo-icon {
            font-size: 3rem;
            margin-bottom: 10px;
            display: inline-block;
            background: linear-gradient(135deg, #2563eb, #9333ea);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .title {
            color: #1e293b;
            font-size: 1.8rem;
            font-weight: 700;
            margin: 0;
        }

        .subtitle {
            color: #64748b;
            font-size: 0.9rem;
            margin-bottom: 30px;
        }

        .input-group {
            margin-bottom: 20px;
            text-align: left;
        }

        .input-label {
            display: block;
            margin-bottom: 8px;
            color: #475569;
            font-weight: 500;
            font-size: 0.9rem;
        }

        .custom-input {
            width: 100%;
            padding: 14px 16px;
            border-radius: 12px;
            border: 2px solid #e2e8f0;
            font-size: 1rem;
            outline: none;
            transition: all 0.3s;
            background: #f8fafc;
            box-sizing: border-box;
        }

        .custom-input:focus {
            border-color: #2563eb;
            background: white;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .action-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 10px;
        }

        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2);
        }

        .action-btn:active {
            transform: translateY(0);
        }

        .toggle-text {
            margin-top: 25px;
            font-size: 0.9rem;
            color: #64748b;
        }

        .toggle-link {
            color: #2563eb;
            font-weight: 600;
            cursor: pointer;
            margin-left: 5px;
            text-decoration: none;
        }
        .toggle-link:hover { text-decoration: underline; }

      `}</style>

      <div className="glass-card">
        <div className="logo-icon"></div>
        <h1 className="title">Civic Eye</h1>
        <p className="subtitle">Smart City, Smarter Citizens.</p>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label className="input-label">Username</label>
            <input
              type="text"
              className="custom-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
             <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  className="custom-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
             </div>
          )}

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="custom-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="action-btn" disabled={loading}>
            {loading ? "Processing..." : (isLogin ? 'Login to Dashboard' : 'Create Account')}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "New to Civic Eye?" : "Already have an account?"}
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            className="toggle-link"
          >
            {isLogin ? "Register Now" : "Login Here"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;