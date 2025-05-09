import express, {json, urlencoded, Request, Response, NextFunction} from 'express';
import cors from 'cors';
import productsRoutes from './routes/products/index.js';
import helmet from 'helmet'; // Import helmet
import rateLimit from 'express-rate-limit'; // Import express-rate-limit
import hpp from 'hpp'; // Import hpp
import authRoutes from './routes/auth/index.js';
import ordersRoutes from './routes/orders/index.js';


const port = 3000;

const app = express();

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

// Add helmet for security headers
app.use(helmet());

// Protect against HTTP Parameter Pollution attacks
app.use(hpp());

app.use(cors({
    origin: ['http://localhost:8081', 'http://192.168.1.163:8081'],
  }));
  
app.use(urlencoded({ extended:false, limit: '500kb' })); // Example: 500KB limit
app.use(json({ limit: '500kb' })); // Example: 500KB limit

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


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
