# 🏛️ Civic Eye Portal | Smart City & Governance Suite

Civic Eye is a **Smart City Management System** designed to bridge the gap between citizens and government authorities.  

It goes beyond simple issue reporting by integrating **Employment, Education, and Healthcare (Blood Donation)** services into one unified platform.  

---

## 🚀 Key Features

### 🛠️ Civic Grievance System
- Report issues like potholes, water leakage, and garbage
- Upload photo evidence for better tracking
- Real-time complaint management

### 💼 Employment Portal
- Apply for local government and community jobs
- Streamlined job application system

### 🎓 Education & Scholarships
- Apply for government scholarships
- Easy access to student support programs

### 🩸 Blood Help (SOS)
- Emergency blood request system
- Connects donors and recipients across the city

### 📢 Real-time Notifications
- Alerts for power cuts, health camps, and announcements

---

## ⚙️ System Architecture (Presigned URL Flow)

1. **Request:**  
   React app sends `fileName` and `fileType` to AWS Lambda  

2. **URL Generation:**  
   Lambda generates a secure **Presigned URL** using AWS S3  

3. **Response:**  
   URL is returned to the frontend  

4. **Direct Upload:**  
   File is uploaded directly to S3 using the Presigned URL  

5. **Storage:**  
   File URL is stored in Firebase Firestore along with complaint data  

---
## ⚙️ System Architecture
![Civic Eye Architecture](./aws-architecture.png)
---

## 🏗️ Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | React.js, Tailwind CSS, Leaflet Maps |
| Backend | Firebase (Firestore & Authentication) |
| Cloud Integration | AWS Lambda |
| Storage | AWS S3 |
| Image Handling | Presigned URL Strategy |

---

## 🛡️ Security & Optimization

- **Presigned URLs**  
  → Keeps S3 bucket private while allowing secure uploads  

- **CORS Configuration**  
  → Handles cross-origin requests for Lambda Function URLs  

- **Serverless Architecture**  
  → No server maintenance, auto-scaling with AWS Lambda  

---

## 💡 Future Enhancements

- Full AWS deployment (S3 + CloudFront hosting)
- Advanced analytics dashboard for authorities
- AI-based issue prioritization

---

## 👩‍💻 Author

**Surya Prabha**  
Aspiring Cloud Engineer  

- GitHub: https://github.com/suryaprabha2408-code  
- LinkedIn: https://linkedin.com/in/surya-prabha-p  

---

## ⭐ Project Status
🚧 In Progress – AWS Deployment & Enhancements Ongoing
