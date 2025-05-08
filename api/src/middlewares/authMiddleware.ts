import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load .env file for local development

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-local-dev-only'; // Use a fallback for local dev if .env is missing

export function verifyToken(req: Request, res: Response, next: NextFunction){
    const token = req.header('Authorization');

    if(!token){
        res.status(401).json({error: 'Access denied' });
        return;
    }

    try{
        // decode jwt token data
        // Remove "Bearer " prefix if present
        const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        const decoded = jwt.verify(actualToken, JWT_SECRET);

        if (typeof decoded != 'object' || !decoded?.userId){
            res.status(401).json({error: 'Access denied'});
            return;
        }
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
            return; // Explicitly return void
        }
        res.status(401).json({error: 'Access denied'});
        return; // Explicitly return void
    }
} 



export function verifySeller(req: Request, res: Response, next: NextFunction){
    const role = req.role;

    if(role != 'seller'){
        res.status(401).json({error: 'Access denied' });
        return;
    }
    next();
} 