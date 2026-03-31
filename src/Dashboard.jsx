import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import myLogo from "./logo.png";
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- LEAFLET ICONS FIX ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// --- TRANSLATIONS ---
const translations = {
  en: {
    appTitle: "Civic Eye Portal",
    adminTitle: "Command Center",
    logout: "Logout",
    gps: "📍 Locate Me",
    gpsActive: "✅ Location Locked",
    gpsTip: "Tap map to pin exact location",
    createReport: "New Report",
    yourReports: "Community Feed",
    submit: "Submit Report",
    road: "Roads",
    water: "Water Supply",
    electricity: "Electricity",
    garbage: "Sanitation",
    descPlaceholder: "Describe the issue clearly...",
    titlePlaceholder: "Issue Title (Auto-generated)",
    addrPlaceholder: "📍 Select on Map or type Landmark",
    aiBtn: "✨ Auto-Detect Category (AI)",
    aiLoading: "🤖 Analyzing...",
  },
  ta: {
    appTitle: "சிவில் ஐ - பொதுமக்கள் தளம்",
    adminTitle: "நிர்வாகக் கட்டுப்பாட்டு அறை",
    logout: "வெளியேறு",
    gps: "📍 என் இடம்",
    gpsActive: "✅ இடம் குறிக்கப்பட்டது",
    gpsTip: "வரைபடத்தில் இடத்தை தேர்வு செய்",
    createReport: "புதிய புகார்",
    yourReports: "சமூக புகார்கள்",
    submit: "புகாரை பதிவு செய்",
    road: "சாலை",
    water: "தண்ணீர்",
    electricity: "மின்சாரம்",
    garbage: "சுகாதாரம்",
    descPlaceholder: "பிரச்சனையை விவரிக்கவும்...",
    titlePlaceholder: "தலைப்பு (AI)",
    addrPlaceholder: "📍 முகவரி / அடையாளம்",
    aiBtn: "✨ AI மூலம் கண்டுபிடி",
    aiLoading: "🤖 யோசிக்கிறது...",
  },
};

// --- COMPONENTS ---
const ProgressBar = ({ status }) => {
  const getProgress = () => {
    if (status === "Solved") return 100;
    if (status === "In Progress") return 50;
    return 10;
  };
  const progress = getProgress();
  const color =
    status === "Solved"
      ? "#10b981"
      : status === "In Progress"
        ? "#f59e0b"
        : "#ef4444";

  return (
    <div className="progress-container">
      <div className="steps-text">
        <span className={progress >= 10 ? "active" : ""}>Reported</span>
        <span className={progress >= 50 ? "active" : ""}>Action</span>
        <span className={progress >= 100 ? "active" : ""}>Resolved</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progress}%`, background: color }}
        ></div>
      </div>
    </div>
  );
};

function LocationButton({ setPos, t }) {
  const map = useMap();
  const handleLocation = () => {
    map.locate().on("locationfound", function (e) {
      setPos(e.latlng);
      map.flyTo(e.latlng, 16);
    });
  };
  return (
    <button onClick={handleLocation} className="map-gps-btn">
      {t.gps}
    </button>
  );
}

function LocationMarker({ setPos }) {
  useMapEvents({
    click(e) {
      setPos(e.latlng);
    },
  });
  return null;
}

// --- MAIN COMPONENT ---
function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Road",
    image_url: "",
    address: "",
  });
  const [selectedPos, setSelectedPos] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState("All");
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [lang, setLang] = useState("en");
  const t = translations[lang];
  const [adminProof, setAdminProof] = useState(null);
  const [solvingId, setSolvingId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("report");

  // S3 File Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const [adminFile, setAdminFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ⚠️⚠️ INGA UNGA LAMBDA URL PASTE PANNUNGA ⚠️⚠️

  const LAMBDA_URL = import.meta.env.VITE_LAMBDA_URL;
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // LOGO URL
  const LOGO_URL = myLogo;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const q = query(collection(db, "complaints"), orderBy("time", "desc"));
    const unsubscribeComplaints = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComplaints(data);
    });

    const qNews = query(collection(db, "news"), orderBy("time", "desc"));
    const unsubscribeNews = onSnapshot(qNews, (snapshot) => {
      setAnnouncements(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });

    return () => {
      unsubscribeComplaints();
      unsubscribeNews();
    };
  }, []);

  const uniqueComplaints = complaints.filter(
    (issue, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.category === issue.category && t.description === issue.description,
      ),
  );

  const handleAIAnalyze = () => {
    if (!form.description) return alert("Description required!");
    setAiLoading(true);
    setTimeout(() => {
      const desc = form.description.toLowerCase();
      let detectedCategory = "Road";
      if (desc.includes("water") || desc.includes("leak"))
        detectedCategory = "Water";
      else if (desc.includes("current") || desc.includes("power"))
        detectedCategory = "Electricity";
      else if (desc.includes("garbage") || desc.includes("waste"))
        detectedCategory = "Garbage";

      setForm((prev) => ({
        ...prev,
        category: detectedCategory,
        title: `${detectedCategory} Issue (AI Detected)`,
      }));
      setAiLoading(false);
    }, 1000);
  };
  // S3 Upload Function (The Core Logic)
  const uploadToS3 = async (file) => {
    if (!file) return null;

    try {
      // Step 1: Request Presigned URL from Lambda
      const response = await fetch(LAMBDA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      const data = await response.json();
      console.log("Lambda Data Check:", data);

      // Extracting URLs safely (either from direct keys or from body string)
      const parsedBody = data.body ? JSON.parse(data.body) : data;
      const finalUploadUrl = parsedBody.uploadUrl;
      const finalFileUrl = parsedBody.fileUrl;

      if (!finalUploadUrl) {
        console.error("Oops! Lambda link anupala, 'uploadUrl' missing!");
        return null;
      }

      // Step 2: Upload file directly to S3 using finalUploadUrl
      const uploadResponse = await fetch(finalUploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("S3 Upload failed with status: " + uploadResponse.status);
      }

      console.log("S3 Upload Success!");
      return finalFileUrl; // Return this to save in Firebase

    } catch (error) {
      console.error("Error uploading to S3:", error);
      alert("Photo upload failed! Please try again.");
      return null;
    }
  };

  // Updated handleFileUpload
  // Corrected handleFileUpload
  const handleFileUpload = (e, isUser = true) => {
    const file = e.target.files; // <--- Inga kandippa venum!
    if (file) {
      if (isUser) {
        setSelectedFile(file); // Ippo correct-ana file store aagum
      } else {
        setAdminFile(file);
      }
    }
  };

  // Updated handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPos && !form.address) return alert("⚠️ Location Required!");

    const isDuplicate = complaints.some(
      (c) => c.description === form.description && c.category === form.category,
    );
    if (isDuplicate) {
      alert("⚠️ This issue is already reported! Check the feed.");
      return;
    }

    setIsUploading(true);

    // Upload image to S3 first
    const s3ImageUrl = await uploadToS3(selectedFile);

    try {
      await addDoc(collection(db, "complaints"), {
        user_name: user.username || "Anonymous",
        ...form,
        image_url: s3ImageUrl || "", // Save S3 URL in Firebase
        latitude: selectedPos ? selectedPos.lat : 13.0827,
        longitude: selectedPos ? selectedPos.lng : 80.2707,
        status: "Pending",
        time: new Date().toISOString(),
      });

      alert("✅ Report Submitted!");

      const smsBody = `ALERT: New ${form.category} Complaint filed at ${form.address || "GPS Location"}. Description: ${form.description}.`;
      window.open(`sms:1913?&body=${encodeURIComponent(smsBody)}`, "_blank");

      setForm({
        title: "",
        description: "",
        category: "Road",
        image_url: "",
        address: "",
      });
      setSelectedPos(null);
      setSelectedFile(null);
      setIsUploading(false);
      setActiveTab("feed");
    } catch (err) {
      alert("Error submitting");
      setIsUploading(false);
    }
  };

  // Updated updateStatus (For Admin)
  const updateStatus = async (id, newStatus) => {
    setIsUploading(true);

    let adminProofUrl = "";
    if (newStatus === "Solved" && adminFile) {
      adminProofUrl = await uploadToS3(adminFile);
    }

    await updateDoc(doc(db, "complaints", id), {
      status: newStatus,
      ...(adminProofUrl && { admin_proof_url: adminProofUrl }),
    });

    setSolvingId(null);
    setAdminFile(null);
    setIsUploading(false);
  };

  const handlePostNews = async () => {
    if (!newAnnouncement.trim()) return;
    await addDoc(collection(db, "news"), {
      text: newAnnouncement,
      time: new Date().toISOString(),
    });
    setNewAnnouncement("");
  };

  const getCatColor = (cat) => {
    const colors = {
      Road: "#2563eb",
      Water: "#0891b2",
      Electricity: "#d97706",
      Garbage: "#dc2626",
    };
    return colors[cat] || "#64748b";
  };

  // Styles
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
    :root { --primary: #4f46e5; --bg: #f8fafc; --glass: rgba(255, 255, 255, 0.95); }
    body { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: #1e293b; overflow: hidden; }
    .app-container { display: flex; height: 100vh; flex-direction: column; }

    /* Navbar */
    .gov-top-bar { background: #0f172a; color: white; padding: 6px 25px; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; z-index: 51; }
    .navbar { height: 70px; background: white; padding: 0 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.04); z-index: 50; position: relative; }
    .nav-left { display: flex; align-items: center; gap: 20px; }
    .nav-home-link { font-weight: 700; color: #334155; text-decoration: none; cursor: pointer; font-size: 1rem; padding: 8px 12px; border-radius: 8px; transition: 0.2s; background: #f1f5f9; }
    .nav-home-link:hover { background: #e2e8f0; color: var(--primary); }
    .logo-area { display: flex; align-items: center; gap: 12px; border-left: 2px solid #e2e8f0; padding-left: 20px; }
    .brand { font-size: 1.4rem; font-weight: 800; background: linear-gradient(90deg, #4f46e5, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    /* Layout */
    .content-wrapper { display: flex; flex: 1; position: relative; height: calc(100vh - 105px); }
    .map-area { flex: 2; height: 100%; position: relative; }
    .panel-area { flex: 1; min-width: 400px; max-width: 480px; background: var(--glass); backdrop-filter: blur(10px); border-left: 1px solid rgba(255,255,255,0.5); display: flex; flex-direction: column; box-shadow: -5px 0 20px rgba(0,0,0,0.05); z-index: 20; }
    .tab-row { display: flex; padding: 15px 20px 0; gap: 10px; }
    .tab-btn { flex: 1; padding: 10px; border: none; background: #e2e8f0; color: #64748b; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .tab-btn.active { background: var(--primary); color: white; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3); }
    .scroll-content { flex: 1; overflow-y: auto; padding: 20px; }
    .card { background: white; padding: 20px; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; transition: 0.2s; }
    .input-box { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; margin-bottom: 12px; outline: none; transition: 0.2s; box-sizing: border-box; font-family: inherit; }
    .btn-main { width: 100%; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; padding: 30px; overflow-y: auto; height: calc(100vh - 80px); }
    .badge { padding: 4px 10px; border-radius: 20px; color: white; font-size: 0.75rem; font-weight: 700; }
    .map-gps-btn { position: absolute; top: 20px; right: 20px; background: white; padding: 10px 15px; border-radius: 10px; border: none; font-weight: 600; box-shadow: 0 4px 10px rgba(0,0,0,0.1); z-index: 1000; cursor: pointer; }

    .sos-fab { position: fixed; bottom: 30px; left: 30px; display: flex; flex-direction: column; gap: 15px; z-index: 2000; }
    .fab-btn { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 10px 15px rgba(0,0,0,0.2); border: 3px solid white; text-decoration: none; transition: 0.2s; }

    @media (max-width: 768px) { .content-wrapper { flex-direction: column; } .map-area { height: 40vh; } .panel-area { flex: 1; min-width: 100%; } }
  `;

  // --- ADMIN VIEW ---
  if (user?.role === "admin" || user?.username === "admin") {
    const filteredList =
      filter === "All"
        ? uniqueComplaints
        : uniqueComplaints.filter((c) => c.category === filter);

    return (
      <div className="app-container">
        <style>{styles}</style>
        <div
          className="navbar"
          style={{ background: "#1e293b", color: "white" }}
        >
          <div className="nav-left">
            <img
              src={LOGO_URL}
              alt="Logo"
              style={{ height: "35px", width: "35px", objectFit: "contain" }}
            />
            <div
              className="nav-home-link"
              onClick={() => navigate("/")}
              style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
            >
              Home
            </div>
            <div
              className="brand"
              style={{ background: "none", color: "white" }}
            >
              🛡️ {t.adminTitle}
            </div>
          </div>
          <button
            className="btn-main"
            style={{ width: "auto", background: "red" }}
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/");
            }}
          >
            {t.logout}
          </button>
        </div>

        {/* Admin Dashboard */}
        <div style={{ background: "#f1f5f9", height: "100%" }}>
          <div
            style={{
              padding: "20px 30px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ margin: 0 }}>Incoming Reports (Filtered)</h2>
            <select
              className="input-box"
              style={{ width: "200px", margin: 0 }}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Road">Road</option>
              <option value="Water">Water</option>
              <option value="Electricity">Electricity</option>
            </select>
          </div>

          <div className="admin-grid">
            {/* Broadcast Card */}
            <div
              className="card"
              style={{
                border: "2px dashed #94a3b8",
                background: "transparent",
              }}
            >
              <h3>📢 Broadcast Alert</h3>
              <input
                className="input-box"
                placeholder="Type alert message..."
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
              />
              <button className="btn-main" onClick={handlePostNews}>
                Post Alert
              </button>
              <div style={{ marginTop: "10px" }}>
                {announcements.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      fontSize: "0.8rem",
                      padding: "5px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    {n.text}{" "}
                    <span
                      style={{ color: "red", cursor: "pointer" }}
                      onClick={() => deleteDoc(doc(db, "news", n.id))}
                    >
                      x
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Issue Cards */}
            {filteredList.map((c) => (
              <div key={c.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    className="badge"
                    style={{ background: getCatColor(c.category) }}
                  >
                    {c.category}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    {new Date(c.time).toLocaleDateString()}
                    <br />
                    User: {c.user_name}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 5px 0" }}>{c.title}</h3>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  {c.description}
                </p>

                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  {c.image_url && (
                    <img
                      src={c.image_url}
                      alt="Proof"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedImage(c.image_url)}
                    />
                  )}
                  {c.admin_proof_url && (
                    <img
                      src={c.admin_proof_url}
                      alt="Solved"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "8px",
                        border: "2px solid green",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedImage(c.admin_proof_url)}
                    />
                  )}
                </div>

                <div
                  style={{
                    marginTop: "15px",
                    paddingTop: "15px",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  {c.status === "Solved" ? (
                    <div
                      style={{
                        color: "green",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      ✅ Issue Resolved
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "10px" }}>
                      {c.status === "Pending" && (
                        <button
                          className="btn-main"
                          style={{ background: "#eff6ff", color: "#2563eb" }}
                          onClick={() => updateStatus(c.id, "In Progress")}
                        >
                          Deploy Team
                        </button>
                      )}
                      <button
                        className="btn-main"
                        style={{ background: "#f0fdf4", color: "#16a34a" }}
                        onClick={() =>
                          setSolvingId(solvingId === c.id ? null : c.id)
                        }
                      >
                        Mark Solved
                      </button>
                    </div>
                  )}

                  {solvingId === c.id && (
                    <div
                      style={{
                        marginTop: "10px",
                        background: "#f8fafc",
                        padding: "10px",
                        borderRadius: "8px",
                      }}
                    >
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, false)}
                        style={{ fontSize: "0.8rem" }}
                      />
                      <button
                        className="btn-main"
                        style={{ marginTop: "5px" }}
                        onClick={() => updateStatus(c.id, "Solved")}
                        disabled={isUploading}
                      >
                        {isUploading ? "Uploading & Solving..." : "Confirm"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- USER VIEW ---
  return (
    <div className="app-container">
      <style>{styles}</style>

      {/* --- Government Top Bar --- */}
      <div className="gov-top-bar">
        <span style={{ fontSize: "1.2em" }}>🏛️</span>
        <span>Government of Tamil Nadu Initiative</span>
      </div>

      {/* --- Navbar --- */}
      <div className="navbar">
        <div className="nav-left">
          <div className="nav-home-link" onClick={() => navigate("/")}>
            Home
          </div>
          <div className="logo-area">
            <img
              src={LOGO_URL}
              alt="Logo"
              style={{ height: "45px", width: "auto", objectFit: "contain" }}
              onError={(e) => (e.target.style.display = "none")}
            />
            <div className="brand">{t.appTitle}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <button
            className="btn-main"
            style={{ width: "auto", background: "#f1f5f9", color: "#334155" }}
            onClick={() => navigate("/voting")}
          >
            🗳️ Vote
          </button>
          <button
            className="btn-main"
            style={{ width: "auto", background: "#f1f5f9", color: "#334155" }}
            onClick={() => setLang(lang === "en" ? "ta" : "en")}
          >
            {lang === "en" ? "தமிழ்" : "ENG"}
          </button>
          <button
            className="btn-main"
            style={{ width: "auto", background: "#fee2e2", color: "red" }}
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/");
            }}
          >
            {t.logout}
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="content-wrapper">
        {/* Map */}
        <div className="map-area">
          <MapContainer
            center={[13.0827, 80.2707]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            <LocationMarker setPos={setSelectedPos} />
            <LocationButton setPos={setSelectedPos} t={t} />
            {selectedPos && (
              <Marker position={selectedPos}>
                <Popup>{t.gpsActive}</Popup>
              </Marker>
            )}

            {uniqueComplaints.map((c) => (
              <Marker key={c.id} position={[c.latitude, c.longitude]}>
                <Popup>
                  <strong>{c.title}</strong>
                  <br />
                  {c.status}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Panel */}
        <div className="panel-area">
          <div className="tab-row">
            <button
              className={`tab-btn ${activeTab === "report" ? "active" : ""}`}
              onClick={() => setActiveTab("report")}
            >
              {t.createReport}
            </button>
            <button
              className={`tab-btn ${activeTab === "feed" ? "active" : ""}`}
              onClick={() => setActiveTab("feed")}
            >
              {t.yourReports}
            </button>
          </div>

          <div className="scroll-content">
            {activeTab === "report" ? (
              <div
                className="card"
                style={{ border: "none", boxShadow: "none", padding: 0 }}
              >
                <h2 style={{ margin: "0 0 15px 0" }}>📝 File Complaint</h2>
                <form onSubmit={handleSubmit}>
                  <textarea
                    className="input-box"
                    style={{ height: "100px", resize: "none" }}
                    placeholder={t.descPlaceholder}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    required
                  />

                  <button
                    type="button"
                    className="btn-main"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
                      marginBottom: "15px",
                    }}
                    onClick={handleAIAnalyze}
                    disabled={aiLoading}
                  >
                    {aiLoading ? t.aiLoading : t.aiBtn}
                  </button>

                  <select
                    className="input-box"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="Road">🛣️ {t.road}</option>
                    <option value="Water">🚰 {t.water}</option>
                    <option value="Electricity">💡 {t.electricity}</option>
                    <option value="Garbage">🗑️ {t.garbage}</option>
                  </select>

                  <input
                    className="input-box"
                    placeholder={t.titlePlaceholder}
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                  />

                  <input
                    className="input-box"
                    placeholder={t.addrPlaceholder}
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />

                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: selectedPos ? "green" : "#94a3b8",
                      marginBottom: "15px",
                    }}
                  >
                    {selectedPos ? t.gpsActive : t.gpsTip}
                  </div>

                  <input
                    type="file"
                    className="input-box"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, true)}
                  />

                  <button
                    type="submit"
                    className="btn-main"
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading & Submitting..." : t.submit}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                {uniqueComplaints.map((c) => (
                  <div key={c.id} className="card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                      }}
                    >
                      <span
                        className="badge"
                        style={{ background: getCatColor(c.category) }}
                      >
                        {c.category}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                        {new Date(c.time).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 style={{ margin: "0 0 5px 0" }}>{c.title}</h4>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      📍 {c.address || "Location on Map"}
                    </div>

                    <div
                      style={{ display: "flex", gap: "5px", margin: "10px 0" }}
                    >
                      {c.image_url && (
                        <img
                          src={c.image_url}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "6px",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedImage(c.image_url)}
                          alt="proof"
                        />
                      )}
                      {c.admin_proof_url && (
                        <img
                          src={c.admin_proof_url}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "6px",
                            border: "1px solid green",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedImage(c.admin_proof_url)}
                          alt="solved"
                        />
                      )}
                    </div>

                    <ProgressBar status={c.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SOS Buttons */}
      <div className="sos-fab">
        <div
          style={{
            background: "red",
            color: "white",
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "0.75rem",
            fontWeight: "bold",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
          }}
        >
          SOS
        </div>
        <a
          href="tel:100"
          className="fab-btn"
          style={{ background: "#1e293b", color: "white" }}
        >
          👮‍♂️
        </a>
        <a
          href="tel:108"
          className="fab-btn"
          style={{ background: "#ef4444", color: "white" }}
        >
          🚑
        </a>
        <a
          href="tel:101"
          className="fab-btn"
          style={{ background: "#d97706", color: "white" }}
        >
          🚒
        </a>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={selectedImage}
            style={{
              maxHeight: "90vh",
              maxWidth: "90vw",
              borderRadius: "12px",
              border: "2px solid white",
            }}
            alt="Preview"
          />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
