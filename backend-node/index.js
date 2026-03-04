import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import vendorRoutes from './routes/vendor.js';
import dashboardRoutes from './routes/dashboard.js';
import orderRoutes from './routes/orders.js';
import staffRoutes from './routes/staff.js';
import paymentRoutes from './routes/payments.js';
import subscriptionRoutes from './routes/subscriptions.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vendor', vendorRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Node.js Server running on port ${PORT}`);
});

export default app;
