# GoiCarz-codeVengers

## Project Description
GoiCarz is a community-driven marketplace that connects travelers with a network of trusted, local vehicle owners. We are not a traditional rental company; instead, we provide a secure and easy-to-use platform where you can discover a wide variety of cars, scooters, and bikes listed by people in Goa. Every owner on our platform is carefully verified to ensure safety and reliability, giving you peace of mind. Our mission is to make travel more personal and affordable by facilitating direct connections, so you can explore Goa with an authentic and reliable ride.

## Team Members
- [Shlok Parsekar](https://github.com/shlokparsekar27)
- [Advit Mandrekar](https://github.com/MandrekarAdvit)  
- [Vollin Fernandes](https://github.com/vollin-git)  
- [Roydon Soares](https://github.com/soares-roydon)  
- [Falgun Kole](https://github.com/FalgunKole)  

## Tech Stack

* **Frontend:**
    * **React + TypeScript** : Main UI framework with type safety for fewer bugs.
    * **Tailwind CSS** : Fast, responsive, utility-first styling.
    * **React Query (TanStack Query)** : Data fetching & caching with real-time updates from Supabase.
    * **Leaflet.js / Mapbox** : Location-based search & map display (Mapbox free tier: 50K map loads/month).
    * **Vite** : Fast development bundler for React + TS.

* **Backend:**
  * **Node.js + Express** : Handles:
    * Razorpay payment integration.
    * WhatsApp Cloud API for booking notifications.
    * Any extra business logic not handled directly in Supabase.
  * **Supabase Edge Functions** : Optional serverless functions for quick, secure logic without leaving Supabase.

* **Database & Backend Services:**
  * **Supabase (PostgreSQL)** :
    * Tables for users, vehicles, bookings, payments, reviews.
    * Role-based access control (Tourist, Host, Admin).
    * Foreign keys for relational integrity.
  * **Supabase Auth** : Secure login (email/password, OTP, Google login).
  * **Supabase Storage** : Vehicle images, driver license docs (50MB free tier).
  * **Supabase Realtime** : Live booking status updates.

* **Payment & Messaging:**
  * **Razorpay API** : Secure online payments (pay-per-transaction, no monthly fee).
  * **WhatsApp Cloud API** : Automated booking & payment notifications (1,000 free business messages/month).
 
## API Documentation

The complete blueprint for our backend is documented in the API Contract. It details every endpoint, its required parameters, and expected responses.

**[View the API Contract](./API_CONTRACT.md)**

Additionally, the running backend server provides interactive Swagger UI documentation.

---
## Getting Started

Follow these instructions to set up and run the backend server on your local machine.

### **Prerequisites**
* [Node.js](https://nodejs.org/) (v18 or later)
* [npm](https://www.npmjs.com/) (comes with Node.js)

### **Backend Setup**

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/shlokparsekar27/GoiCarz-codeVengers.git
    cd GoiCarz-codeVengers
    ```

2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
    
3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Start the server:**
    ```bash
    npm start
    ```

* The server will now be running at `http://localhost:3001`.
* The interactive API documentation will be available at `http://localhost:3001/api-docs`.
