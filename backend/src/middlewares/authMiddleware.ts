import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database'; // Pastikan path ini sesuai struktur folder Anda

// Interface custom untuk req.user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Ambil token
      token = req.headers.authorization.split(' ')[1];

      // 2. Dekode token
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      // 3. Cari user (Select field penting saja)
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true }
      });

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // 4. Attach user ke request
      req.user = user as any; 
      return next();
      
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const staffOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Cek apakah user ada DAN role-nya STAFF
  if (req.user && req.user.role === 'STAFF') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a staff' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Cek apakah user ada DAN role-nya ADMIN
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};