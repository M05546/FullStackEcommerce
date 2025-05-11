import express, {json, urlencoded, Request, Response, NextFunction} from 'express';
import cors from 'cors';
import productsRoutes from './routes/products/index.js';
import helmet from 'helmet'; // Import helmet
import rateLimit from 'express-rate-limit'; // Import express-rate-limit
import hpp from 'hpp'; // Import hpp
import authRoutes from './routes/auth/index.js';
import ordersRoutes from './routes/orders/index.js';
import dotenv from 'dotenv'; // Import dotenv

dotenv.config(); // Load environment variables from .env file

const PORT = process.env.PORT || 3000; // Use Render's port or fallback for local

const app = express();

// Trust the first proxy (Render's load balancer)
// This is important for express-rate-limit to correctly identify client IPs
// and for other features that rely on req.ip reflecting the true client IP.
app.set('trust proxy', 1); 

// Rate limiter for authentication routes (login, register)
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 15, // Limit each IP to 15 login/register attempts per windowMs
	message: 'Too many login/register attempts from this IP, please try again after 15 minutes',
	standardHeaders: true, 
	legacyHeaders: false, 
});

// General API rate limiter for other routes
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `windowMs`
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// --- Middleware Order ---
// 1. Helmet
// Re-enable CSP with a restrictive policy suitable for an API.
// This policy disallows loading any external resources, scripts, styles, frames, etc.,
// which is generally safe and recommended for APIs that only serve data.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'none'"], // Disallow everything by default
            frameAncestors: ["'none'"], // Prevent clickjacking
            objectSrc: ["'none'"], // Disallow plugins like Flash, Java
        }
    }
}));

// 2. CORS
app.use(cors({
    origin: ['http://localhost:8081', 'http://192.168.1.163:8081'],
  }));
  
// 3. Body Parsers (before HPP)
app.use(urlencoded({ extended: false, limit: '500kb' }));
app.use(json({ limit: '500kb' }));

// 4. HPP - HTTP Parameter Pollution protection (after body parsing)
app.use(hpp());
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome Home !!!');
});


app.use('/products', apiLimiter, productsRoutes); // Apply general limiter to products
app.use('/auth', authLimiter, authRoutes);       // Apply stricter limiter to auth
app.use('/orders', apiLimiter, ordersRoutes);    // Apply general limiter to orders


// Global error handler - should be the last middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled error:", err.stack || err); // Log the full error for server-side debugging
    // Avoid sending stack trace to client in production
    const statusCode = (res.statusCode !== 200 && res.statusCode) ? res.statusCode : 500; // Use existing status code if set by previous error
    res.status(statusCode).json({ message: 'An unexpected error occurred on the server.' });
  });


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
