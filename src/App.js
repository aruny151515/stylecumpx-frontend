import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://stylecumpx-backend.onrender.com/api";

function App() {
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [authData, setAuthData] = useState({ username: "", email: "", password: "" });
  const [wardrobe, setWardrobe] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", category: "Shirt", type: "Casual", color: "", brand: "" });
  
  // Feature 3: Student Profile state
  const [profile, setProfile] = useState({ fullName: "", department: "", course: "", year: "" });
  
  // Feature 2: Campus Recommendation state
  const [occasion, setOccasion] = useState("casual");
  const [recommendation, setRecommendation] = useState(null);
  const [message, setMessage] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");
    const path = isRegister ? "/auth/register" : "/auth/login";
    try {
      const payload = isRegister ? { ...authData, role: "ROLE_USER" } : authData;
      const res = await axios.post(`${API_BASE}${path}`, payload);
      setUser(res.data);
      setMessage(isRegister ? "Account created! Signed in." : "Logged in successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Authentication error.");
    }
  };

  const loadData = async () => {
    if (!user) return;
    try {
      const wardrobeRes = await axios.get(`${API_BASE}/wardrobe/user/${user.id}`);
      setWardrobe(wardrobeRes.data);
      
      const profileRes = await axios.get(`${API_BASE}/profile/user/${user.id}`);
      if (profileRes.data) setProfile(profileRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/wardrobe/add`, { ...newItem, user: { id: user.id } });
      setNewItem({ name: "", category: "Shirt", type: "Casual", color: "", brand: "" });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Feature 1: Delete Wardrobe Item
  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`${API_BASE}/wardrobe/${id}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Feature 3: Save Student Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/profile/save`, { ...profile, user: { id: user.id } });
      setMessage("Profile details saved successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  // Feature 2: Fetch Styling Recommendation
  const getRecommendation = async () => {
    try {
      const res = await axios.get(`${API_BASE}/recommendations/user/${user.id}?occasion=${occasion}`);
      setRecommendation(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <header style={{ borderBottom: "2px solid #eee", paddingBottom: "10px", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, color: "#222" }}>StyleCumpX</h1>
        <p style={{ margin: "4px 0 0", color: "#666" }}>Smart Campus Fashion & Personalized Recommendations</p>
      </header>

      {message && <div style={{ padding: "10px", background: "#e8f4fd", marginBottom: "15px", borderRadius: "5px" }}>{message}</div>}

      {!user ? (
        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
          <h2>{isRegister ? "Register" : "Login"}</h2>
          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="text" placeholder="Username" value={authData.username} onChange={(e) => setAuthData({ ...authData, username: e.target.value })} required style={{ padding: "8px" }} />
            {isRegister && (
              <input type="email" placeholder="Email" value={authData.email} onChange={(e) => setAuthData({ ...authData, email: e.target.value })} required style={{ padding: "8px" }} />
            )}
            <input type="password" placeholder="Password" value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })} required style={{ padding: "8px" }} />
            <button type="submit" style={{ padding: "10px", background: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>
              {isRegister ? "Sign Up" : "Log In"}
            </button>
          </form>
          <p style={{ marginTop: "10px", cursor: "pointer", color: "#007bff" }} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Have an account? Log In" : "Need an account? Register"}
          </p>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2>Welcome, {user.username}!</h2>
            <button onClick={() => { setUser(null); setRecommendation(null); }} style={{ padding: "6px 12px", background: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Logout</button>
          </div>

          {/* Section 1: Campus Recommendation Engine */}
          <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px", marginBottom: "20px", background: "#fbfbfb" }}>
            <h3>Campus Occasion Styling Advice</h3>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <select value={occasion} onChange={(e) => setOccasion(e.target.value)} style={{ padding: "8px" }}>
                <option value="casual">Everyday Lectures (Casual)</option>
                <option value="interview">Placement Drive / Interview (Formal)</option>
                <option value="fest">College Fest (Trendy / Streetwear)</option>
                <option value="traditional">Traditional Day</option>
                <option value="sports">Sports Meet / Gym</option>
              </select>
              <button onClick={getRecommendation} style={{ padding: "8px 16px", background: "#6f42c1", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Get Recommendation</button>
            </div>

            {recommendation && (
              <div style={{ marginTop: "15px", background: "white", padding: "12px", borderRadius: "6px", border: "1px solid #ddd" }}>
                <h4 style={{ margin: "0 0 10px 0" }}>Suggested Outfit for: {recommendation.occasion?.toUpperCase()}</h4>
                <p><strong>Top:</strong> {recommendation.top ? `${recommendation.top.name} (${recommendation.top.color})` : "No matching top in wardrobe"}</p>
                <p><strong>Bottom:</strong> {recommendation.bottom ? `${recommendation.bottom.name} (${recommendation.bottom.color})` : "No matching pants in wardrobe"}</p>
                <p><strong>Shoes:</strong> {recommendation.shoes ? `${recommendation.shoes.name} (${recommendation.shoes.color})` : "No shoes added yet"}</p>
              </div>
            )}
          </div>

          {/* Section 2: Wardrobe Management with Delete Buttons */}
          <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
            <h3>Add New Clothes to My Wardrobe</h3>
            <form onSubmit={handleAddItem} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              <input type="text" placeholder="Item Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} required style={{ padding: "8px" }} />
              <input type="text" placeholder="Color" value={newItem.color} onChange={(e) => setNewItem({ ...newItem, color: e.target.value })} required style={{ padding: "8px" }} />
              <input type="text" placeholder="Brand" value={newItem.brand} onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })} style={{ padding: "8px" }} />
              <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} style={{ padding: "8px" }}>
                <option value="Shirt">Shirt / Top</option>
                <option value="Pant">Pant / Bottom</option>
                <option value="Shoes">Shoes</option>
                <option value="Jacket">Jacket</option>
                <option value="Ethnic">Ethnic Wear</option>
              </select>
              <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value })} style={{ padding: "8px" }}>
                <option value="Casual">Casual</option>
                <option value="Formal">Formal</option>
                <option value="Trendy">Trendy</option>
                <option value="Traditional">Traditional</option>
                <option value="Sporty">Sporty</option>
              </select>
              <button type="submit" style={{ gridColumn: "span 2", padding: "10px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Save Item</button>
            </form>

            <h4>Your Current Wardrobe ({wardrobe.length} items)</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
              {wardrobe.map((item) => (
                <div key={item.id} style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "6px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fff" }}>
                  <div>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: "13px", color: "#555", marginTop: "4px" }}>Category: {item.category}</div>
                    <div style={{ fontSize: "13px", color: "#555" }}>Color: {item.color}</div>
                    <span style={{ fontSize: "12px", background: "#eee", padding: "2px 6px", borderRadius: "4px", display: "inline-block", marginTop: "6px" }}>{item.type}</span>
                  </div>
                  <button onClick={() => handleDeleteItem(item.id)} style={{ marginTop: "12px", padding: "6px", background: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Student Profile Details */}
          <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px" }}>
            <h3>Student Profile Information</h3>
            <form onSubmit={handleSaveProfile} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <input type="text" placeholder="Full Name" value={profile.fullName || ""} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} style={{ padding: "8px" }} />
              <input type="text" placeholder="Department (e.g. CSE)" value={profile.department || ""} onChange={(e) => setProfile({ ...profile, department: e.target.value })} style={{ padding: "8px" }} />
              <input type="text" placeholder="Course (e.g. B.Tech)" value={profile.course || ""} onChange={(e) => setProfile({ ...profile, course: e.target.value })} style={{ padding: "8px" }} />
              <input type="text" placeholder="Graduation Year (e.g. 2026)" value={profile.year || ""} onChange={(e) => setProfile({ ...profile, year: e.target.value })} style={{ padding: "8px" }} />
              <button type="submit" style={{ gridColumn: "span 2", padding: "10px", background: "#17a2b8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Save Profile</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;