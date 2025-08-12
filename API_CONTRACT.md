# API Contract for RentalDrives

This document outlines the API endpoints for the RentalDrives backend service assignment. It is an exact representation of the implemented code.

---
## Auth Endpoints

### **1. User Signup**

* **Feature:** Registers a new user account.
* **HTTP Method:** `POST`
* **Endpoint Path:** `/api/auth/signup`
* **Description:** Creates a new user in the system.
* **Request Body:**
    ```json
    {
      "full_name": "Test User",
      "email": "test@example.com",
      "password": "strongpassword123",
      "role": "tourist"
    }
    ```
* **Success Response (201 Created):**
    ```json
    {
      "id": "generated-uuid-1",
      "full_name": "Test User",
      "email": "test@example.com",
      "role": "tourist"
    }
    ```
* **Error Response(s):**
    * `400 Bad Request`: If email is already in use.

---

### **2. User Login**

* **Feature:** Authenticates a user and returns an access token.
* **HTTP Method:** `POST`
* **Endpoint Path:** `/api/auth/login`
* **Description:** Verifies user credentials and provides a JWT for accessing protected routes.
* **Request Body:**
    ```json
    {
      "email": "test@example.com",
      "password": "strongpassword123"
    }
    ```
* **Success Response (200 OK):**
    ```json
    {
      "token": "ey..."
    }
    ```
* **Error Response(s):**
    * `401 Unauthorized`: If email or password is incorrect.

---
## User Endpoints

### **3. Get My Profile**

* **Feature:** Retrieves the profile of the currently logged-in user.
* **HTTP Method:** `GET`
* **Endpoint Path:** `/api/users/me`
* **Description:** Returns the user object for the authenticated user (password excluded). Requires authentication.
* **Request Body:** None.
* **Success Response (200 OK):**
    ```json
    {
      "id": "generated-uuid-1",
      "full_name": "Test User",
      "email": "test@example.com",
      "role": "tourist"
    }
    ```
* **Error Response(s):**
    * `401 Unauthorized`: If no token is provided.
    * `404 Not Found`: If the user associated with the token cannot be found.

### **4. Update My Profile**

* **Feature:** Updates the profile of the currently logged-in user.
* **HTTP Method:** `PUT`
* **Endpoint Path:** `/api/users/me`
* **Description:** Updates the `full_name` of the authenticated user. Requires authentication.
* **Request Body:**
    ```json
    {
      "full_name": "Updated Test User"
    }
    ```
* **Success Response (200 OK):**
    ```json
    {
      "id": "generated-uuid-1",
      "full_name": "Updated Test User",
      "email": "test@example.com",
      "role": "tourist"
    }
    ```
* **Error Response(s):**
    * `401 Unauthorized`: If no token is provided.
    * `404 Not Found`: If the user associated with the token cannot be found.

### **5. Delete My Profile**

* **Feature:** Deletes the account of the currently logged-in user.
* **HTTP Method:** `DELETE`
* **Endpoint Path:** `/api/users/me`
* **Description:** Deletes the authenticated user's account. Requires authentication.
* **Request Body:** None.
* **Success Response (204 No Content):** An empty response.
* **Error Response(s):**
    * `401 Unauthorized`: If no token is provided.
    * `404 Not Found`: If the user associated with the token cannot be found.

---
## Vehicle Endpoints

### **6. Get All Vehicles**

* **Feature:** Retrieves a list of all vehicles.
* **HTTP Method:** `GET`
* **Endpoint Path:** `/api/vehicles`
* **Description:** Returns an array of vehicle objects. This is a public endpoint.
* **Request Body:** None.
* **Success Response (200 OK):**
    ```json
    [
      {
        "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "make": "Maruti Suzuki",
        "model": "Swift",
        "year": 2023,
        "price_per_day": 1400
      }
    ]
    ```

### **7. Get Vehicle by ID (with Reviews)**

* **Feature:** Retrieves a single vehicle and its reviews.
* **HTTP Method:** `GET`
* **Endpoint Path:** `/api/vehicles/:id`
* **Description:** Returns a single vehicle object, including an array of its reviews. This is a public endpoint.
* **Request Body:** None.
* **Success Response (200 OK):**
    ```json
    {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "make": "Maruti Suzuki",
      "model": "Swift",
      "year": 2023,
      "price_per_day": 1400,
      "reviews": [
        {
          "id": "review-uuid-1",
          "user_id": "user-uuid-1",
          "booking_id": "booking-uuid-1",
          "rating": 5,
          "comment": "Great car!"
        }
      ]
    }
    ```
* **Error Response(s):**
    * `404 Not Found`: If no vehicle with the specified ID exists.

### **8. Create, Update, and Delete Vehicles**
*(Note: These endpoints are implemented but would normally be protected in a real application)*

* **Create (`POST /api/vehicles`):** Adds a new vehicle.
* **Update (`PUT /api/vehicles/:id`):** Modifies an existing vehicle.
* **Delete (`DELETE /api/vehicles/:id`):** Removes a vehicle.

---
## Booking Endpoints

### **9. Create a New Booking**

* **Feature:** Allows an authenticated user to book a vehicle.
* **HTTP Method:** `POST`
* **Endpoint Path:** `/api/bookings`
* **Description:** Creates a new booking record. Requires authentication.
* **Request Body:**
    ```json
    {
      "vehicle_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "start_date": "2025-09-10T10:00:00Z",
      "end_date": "2025-09-12T18:00:00Z"
    }
    ```
* **Success Response (201 Created):**
    ```json
    {
      "id": "booking-uuid-1",
      "user_id": "user-uuid-1",
      "vehicle_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "start_date": "2025-09-10T10:00:00Z",
      "end_date": "2025-09-12T18:00:00Z",
      "status": "confirmed"
    }
    ```
* **Error Response(s):**
    * `401 Unauthorized`: If the user is not logged in.

### **10. Get My Bookings**

* **Feature:** Retrieves a list of bookings made by the logged-in user.
* **HTTP Method:** `GET`
* **Endpoint Path:** `/api/bookings/my-bookings`
* **Description:** Returns an array of the user's bookings. Requires authentication.
* **Request Body:** None.
* **Success Response (200 OK):** An array of booking objects.
* **Error Response(s):**
    * `401 Unauthorized`: If the user is not logged in.

### **11. Cancel a Booking**

* **Feature:** Cancels a booking made by the logged-in user.
* **HTTP Method:** `PATCH`
* **Endpoint Path:** `/api/bookings/:id/cancel`
* **Description:** Changes the status of a booking to "cancelled". Requires authentication.
* **Request Body:** None.
* **Success Response (200 OK):** The updated booking object with the new status.
* **Error Response(s):**
    * `401 Unauthorized`: If the user is not logged in.
    * `404 Not Found`: If the booking is not found or does not belong to the user.

---
## Review Endpoints

### **12. Create a New Review**

* **Feature:** Allows an authenticated user to post a review.
* **HTTP Method:** `POST`
* **Endpoint Path:** `/api/reviews`
* **Description:** Creates a new review. Requires authentication.
* **Request Body:**
    ```json
    {
      "booking_id": "booking-uuid-1",
      "rating": 5,
      "comment": "The car was excellent!"
    }
    ```
* **Success Response (201 Created):** The new review object.
* **Error Response(s):**
    * `401 Unauthorized`: If the user is not logged in.

### **13. Update My Review**

* **Feature:** Allows a user to update their own review.
* **HTTP Method:** `PUT`
* **Endpoint Path:** `/api/reviews/:id`
* **Description:** Updates the rating and/or comment of a review. Requires authentication.
* **Request Body:**
    ```json
    {
      "rating": 4,
      "comment": "The car was good, a bit old."
    }
    ```
* **Success Response (200 OK):** The updated review object.
* **Error Response(s):**
    * `401 Unauthorized`: If the user is not logged in.
    * `404 Not Found`: If the review is not found or does not belong to the user.

### **14. Delete My Review**

* **Feature:** Allows a user to delete their own review.
* **HTTP Method:** `DELETE`
* **Endpoint Path:** `/api/reviews/:id`
* **Description:** Deletes a review. Requires authentication.
* **Request Body:** None.
* **Success Response (204 No Content):** An empty response.
* **Error Response(s):**
    * `401 Unauthorized`: If the user is not logged in.
    * `404 Not Found`: If the review is not found or does not belong to the user.