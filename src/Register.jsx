import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from './api';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/register', { username, password });

      // CHANGE IS HERE: Direct ah login pandrom
      // Server response la irunthu user data va eduthu save pandrom
      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert("Account Created Successfully! Welcome! 🎉");
      navigate('/dashboard'); // Direct ah Dashboard ku pogum
    } catch (err) {
      console.error(err);
      alert("Username already taken! Try another name.");
    }
  };

  return (
    <div style={{textAlign: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif'}}>
      <h2>📝 Create Public Account</h2>
      <form onSubmit={handleRegister} style={{display: 'flex', flexDirection: 'column', gap: '15px', width: '300px', margin: 'auto', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>

        <input 
          type="text" placeholder="Choose Username" 
          onChange={e => setUsername(e.target.value)} 
          required
          style={{padding: '12px', borderRadius: '5px', border: '1px solid #ccc'}} 
        />

        <input 
          type="password" placeholder="Choose Password" 
          onChange={e => setPassword(e.target.value)} 
          required
          style={{padding: '12px', borderRadius: '5px', border: '1px solid #ccc'}} 
        />

        <button type="submit" style={{padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'}}>
          Register & Login
        </button>

      </form>

      <div style={{marginTop: '20px'}}>
        <p>Already have an account? <br/>
          <Link to="/" style={{color: '#007bff', fontWeight: 'bold', textDecoration: 'none'}}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;