// File: backend/index.js

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import swaggerUi from 'swagger-ui-express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- Basic Setup ---
const app = express();
app.use(cors());
app.use(express.json());

// --- In-Memory Database ---
let users = [];
let vehicles = [
    { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', make: 'Maruti Suzuki', model: 'Swift', year: 2023, price_per_day: 1400 },
    { id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', make: 'Hyundai', model: 'i20', year: 2024, price_per_day: 1600 },
];
let bookings = [];
let reviews = [];

// --- SECRET KEY for JWT ---
const JWT_SECRET = 'your-super-secret-key-for-the-assignment';

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401); // if there isn't any token

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // if token is no longer valid
        req.user = user;
        next();
    });
};

// --- Swagger API Documentation (Object Method) ---
// --- Swagger API Documentation (Corrected and Complete) ---
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'GoiCarz API',
        version: '1.0.0',
        description: 'Complete API for Vehicle Rentals (Assignment)',
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    security: [{
        bearerAuth: []
    }],
    paths: {
        // Auth Paths
        '/api/auth/signup': {
            post: {
                summary: 'Register a new user',
                tags: ['Auth'],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { full_name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' }, role: { type: 'string' } } } } } },
                responses: { '201': { description: 'User created' } },
            },
        },
        '/api/auth/login': {
            post: {
                summary: 'Login a user to get a token',
                tags: ['Auth'],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
                responses: { '200': { description: 'Login successful' } },
            },
        },
        // Users Paths
        '/api/users/me': {
            get: { summary: 'Get current user profile (Protected)', tags: ['Users'], responses: { '200': { description: 'User profile data' } } },
            put: { summary: 'Update current user profile (Protected)', tags: ['Users'], responses: { '200': { description: 'Profile updated' } } },
            delete: { summary: 'Delete current user profile (Protected)', tags: ['Users'], responses: { '204': { description: 'User deleted' } } },
        },
        // Vehicle Paths
        '/api/vehicles': {
            get: {
                summary: 'Retrieve a list of all vehicles',
                tags: ['Vehicles'],
                security: [], // This endpoint is public
                responses: { '200': { description: 'A list of vehicles.' } },
            },
            post: {
                summary: 'Create a new vehicle (Protected)',
                tags: ['Vehicles'],
                responses: { '201': { description: 'The created vehicle.' } },
            },
        },
        '/api/vehicles/{id}': {
            //... inside the paths object for '/api/vehicles/{id}'
            get: {
                summary: 'Retrieve a single vehicle by ID',
                tags: ['Vehicles'],
                security: [],
                parameters: [{ name: 'id', in: 'path', required: true }],
                responses: {
                    '200': {
                        description: 'A single vehicle with its associated reviews.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        make: { type: 'string' },
                                        model: { type: 'string' },
                                        year: { type: 'integer' },
                                        price_per_day: { type: 'number' },
                                        reviews: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string' },
                                                    rating: { type: 'integer' },
                                                    comment: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '404': { description: 'Vehicle not found.' }
                }
            },
            put: {
                summary: 'Update an existing vehicle (Protected)',
                tags: ['Vehicles'],
                parameters: [{ name: 'id', in: 'path', required: true, description: 'ID of vehicle' }],
                responses: { '200': { description: 'The updated vehicle.' }, '404': { description: 'Vehicle not found.' } },
            },
            delete: {
                summary: 'Delete a vehicle (Protected)',
                tags: ['Vehicles'],
                parameters: [{ name: 'id', in: 'path', required: true, description: 'ID of vehicle' }],
                responses: { '204': { description: 'Vehicle deleted.' }, '404': { description: 'Vehicle not found.' } },
            },
        },
        // Booking Paths
        '/api/bookings': {
            post: {
                summary: 'Create a new booking (Protected)',
                tags: ['Bookings'],
                responses: { '201': { description: 'Booking created.' } },
            },
        },
        '/api/bookings/my-bookings': {
            get: {
                summary: 'Get all bookings for the logged-in user (Protected)',
                tags: ['Bookings'],
                responses: { '200': { description: 'A list of your bookings.' } },
            },
        },
        '/api/bookings/{id}/cancel': {
            patch: {
                summary: 'Cancel a booking (Protected)',
                tags: ['Bookings'],
                parameters: [{ name: 'id', in: 'path', required: true, description: 'ID of booking to cancel' }],
                responses: { '200': { description: 'Booking cancelled.' } },
            },
        },
        // Review Paths
        '/api/reviews': {
            post: {
                summary: 'Create a new review for a booking (Protected)',
                tags: ['Reviews'],
                responses: { '201': { description: 'Review created.' } },
            },
        },
        '/api/reviews/{id}': {
            put: { summary: 'Update your review (Protected)', tags: ['Reviews'], parameters: [{ name: 'id', in: 'path', required: true }], responses: { '200': { description: 'Review updated' } } },
            delete: { summary: 'Delete your review (Protected)', tags: ['Reviews'], parameters: [{ name: 'id', in: 'path', required: true }], responses: { '204': { description: 'Review deleted' } } }
        }
    },
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- API Endpoints ---

// Auth
app.post('/api/auth/signup', async (req, res) => {
    const { full_name, email, password, role } = req.body;
    if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Email already in use' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: uuidv4(), full_name, email, password: hashedPassword, role };
    users.push(newUser);
    res.status(201).json({ id: newUser.id, full_name, email, role });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// ======== USERS (Protected) ========

// READ (Get current user's profile)
app.get('/api/users/me', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...userProfile } = user; // Exclude password from response
    res.json(userProfile);
});

// UPDATE (Update current user's profile)
app.put('/api/users/me', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Update fields that are provided in the request body
    user.full_name = req.body.full_name || user.full_name;
    const { password, ...userProfile } = user;
    res.json(userProfile);
});

// DELETE (Delete current user's account)
app.delete('/api/users/me', authenticateToken, (req, res) => {
    const index = users.findIndex(u => u.id === req.user.id);
    if (index === -1) return res.status(404).json({ message: 'User not found' });
    users.splice(index, 1);
    res.status(204).send();
});

// Vehicles
app.get('/api/vehicles', (req, res) => res.status(200).json(vehicles));
// READ (One)
app.get('/api/vehicles/:id', (req, res) => {
    const vehicle = vehicles.find((v) => v.id === req.params.id);

    if (vehicle) {
        // Find all reviews associated with this vehicle
        const vehicleReviews = reviews.filter(r => r.vehicle_id === vehicle.id);

        // Combine the vehicle data with its reviews
        const responseData = {
            ...vehicle,
            reviews: vehicleReviews
        };

        res.status(200).json(responseData);
    } else {
        res.status(404).json({ message: 'Vehicle not found' });
    }
});
app.post('/api/vehicles', (req, res) => {
    const { make, model, year, price_per_day } = req.body;
    const newVehicle = { id: uuidv4(), make, model, year, price_per_day };
    vehicles.push(newVehicle);
    res.status(201).json(newVehicle);
});
app.put('/api/vehicles/:id', (req, res) => {
    const index = vehicles.findIndex(v => v.id === req.params.id);
    if (index !== -1) {
        vehicles[index] = { ...vehicles[index], ...req.body };
        res.status(200).json(vehicles[index]);
    } else res.status(404).json({ message: 'Vehicle not found' });
});
app.delete('/api/vehicles/:id', (req, res) => {
    const index = vehicles.findIndex(v => v.id === req.params.id);
    if (index !== -1) {
        vehicles.splice(index, 1);
        res.status(204).send();
    } else res.status(404).json({ message: 'Vehicle not found' });
});

// Bookings (Protected)
app.post('/api/bookings', authenticateToken, (req, res) => {
    const { vehicle_id, start_date, end_date } = req.body;
    const newBooking = { id: uuidv4(), user_id: req.user.id, vehicle_id, start_date, end_date, status: 'confirmed' };
    bookings.push(newBooking);
    res.status(201).json(newBooking);
});
app.get('/api/bookings/my-bookings', authenticateToken, (req, res) => {
    const myBookings = bookings.filter(b => b.user_id === req.user.id);
    res.status(200).json(myBookings);
});
app.patch('/api/bookings/:id/cancel', authenticateToken, (req, res) => {
    const index = bookings.findIndex(b => b.id === req.params.id && b.user_id === req.user.id);
    if (index !== -1) {
        bookings[index].status = 'cancelled';
        res.status(200).json(bookings[index]);
    } else res.status(404).json({ message: 'Booking not found or not owned by user' });
});

// Reviews (Protected)
app.post('/api/reviews', authenticateToken, (req, res) => {
    const { booking_id, rating, comment } = req.body;
    // In a real app, we'd verify the booking belongs to the user and is completed.
    const newReview = { id: uuidv4(), user_id: req.user.id, booking_id, rating, comment };
    reviews.push(newReview);
    res.status(201).json(newReview);
});
// UPDATE a review
app.put('/api/reviews/:id', authenticateToken, (req, res) => {
    const { rating, comment } = req.body;
    const index = reviews.findIndex(r => r.id === req.params.id && r.user_id === req.user.id);
    if (index !== -1) {
        reviews[index].rating = rating || reviews[index].rating;
        reviews[index].comment = comment || reviews[index].comment;
        res.status(200).json(reviews[index]);
    } else {
        res.status(404).json({ message: 'Review not found or you do not have permission to edit it.' });
    }
});
// DELETE a review
app.delete('/api/reviews/:id', authenticateToken, (req, res) => {
    const index = reviews.findIndex(r => r.id === req.params.id && r.user_id === req.user.id);
    if (index !== -1) {
        reviews.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Review not found or you do not have permission to delete it.' });
    }
});
// --- Server Start ---
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
});