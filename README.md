# Property Trust Verification Platform (Auth Service)

This repository contains the **authentication and user management module** of an experimental platform focused on solving **trust issues in online property transactions**.

The goal of this project is to explore how verified human checks and secure access flows can reduce fake listings, misinformation, and fraud in property buying/selling platforms.

> ⚠️ This is a **learning + exploration project**, not a startup announcement.

---

## 🔍 Problem Context

Online property platforms often suffer from:
- Fake or misleading listings  
- Broker misrepresentation  
- Buyers wasting time and money due to lack of trust  

Before solving these problems at scale, a **secure and reliable authentication system** is essential.

This repository focuses **only on that foundation layer**.

---

## 🛠️ Tech Stack

- **Backend Framework:** NestJS  
- **Language:** TypeScript  
- **Authentication:**  
  - JWT-based access & refresh tokens  
  - Role-based access design (buyer / seller / verifier – extensible)  
- **Email Services:**  
  - Nodemailer integration for verification & transactional emails  
- **Security Practices:**  
  - Password hashing  
  - Token validation & expiry handling  
- **Architecture:**  
  - Modular NestJS structure  
  - Separation of auth, user, and utility layers  

---

## 🔐 Authentication Flow Overview

1. User registers with email & password  
2. Email verification is triggered via mailer service  
3. On successful verification:
   - JWT access token is issued  
   - Secure session flow is established  
4. Protected routes are guarded using JWT strategy  
5. Token refresh and expiration handling implemented  

This setup is designed to be **scalable and extensible** for future features like:
- Verified property inspectors  
- Trust-based user roles  
- Activity tracking & audit logs  

---

## 📁 Project Structure (Simplified)

