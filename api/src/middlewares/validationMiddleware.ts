import _ from 'lodash';
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Change the schema type to be more generic, z.ZodTypeAny can handle ZodObject, ZodEffects, etc.
export function validateData(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = schema.parse(req.body); // Parse the request body
      req.cleanBody = parsedData; // The successfully parsed data is the "clean" body
      next();
    } catch (error) {
      // Use the new error handling structure
      if (error instanceof ZodError) {
        // The 'return' here is fine as it exits the middleware function
        res.status(400).json({
          success: false,
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return; // Explicitly return to stop further execution in this branch
      } else {
        // For non-Zod errors, send a generic 500 error
        res.status(500).json({ success: false, message: 'Internal server error' });
        return; // Explicitly return to stop further execution in this branch
      }
    }
  };
}