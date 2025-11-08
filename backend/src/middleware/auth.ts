import type { NextFunction } from 'express';
import * as express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret';

interface JwtPayload {
  user: {
    id: string;
  };
}

// FIX: Change type annotations to use the express namespace to fix type resolution issues.
export default function(req: express.Request, res: express.Response, next: NextFunction) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token format is invalid, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}
