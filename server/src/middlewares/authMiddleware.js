import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {

  try {

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = {
      adminId: decoded.adminId,
      tenantId: decoded.tenantId,
      role: decoded.role
    };

    next();

  } catch (err) {

    return res.status(401).json({
      message: 'Invalid or expired session'
    });

  }

};