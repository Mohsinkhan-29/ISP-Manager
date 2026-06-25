import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

const isProd = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd, // false on localhost, true on Render
  sameSite: isProd ? 'none' : 'lax', // 'none' for Vercel->Render, 'lax' for Localhost
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const registerTenant = async (req, res) => {

  try {

    const {
      tenantName,
      adminName,
      email,
      password
    } = req.validatedData;

    const existingAdmin = await prisma.admins.findFirst({
      where: {
        email
      }
    });

    if (existingAdmin) {
      return res.status(409).json({
        message: 'Admin already exists'
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const result =
      await prisma.$transaction(async (tx) => {

        const tenant =
          await tx.tenants.create({
            data: {
              name: tenantName
            }
          });

        const admin =
          await tx.admins.create({

            data: {
              tenant_id: tenant.id,
              name: adminName,
              email,
              password_hash: hashedPassword,
              role: 'OWNER'
            }

          });

        return {
          tenant,
          admin
        };

      });

    const token = jwt.sign(

      {
        adminId: result.admin.id,
        tenantId: result.tenant.id,
        role: result.admin.role
      },

      process.env.JWT_SECRET,

      {
        expiresIn: '7d'
      }

    );

    res
      .cookie(
        'token',
        token,
        COOKIE_OPTIONS
      )
      .status(201)
      .json({
        message: 'Tenant created successfully'
      });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const login = async (req, res) => {

  try {

    const {
      email,
      password
    } = req.validatedData;

    const admin =
      await prisma.admins.findFirst({

        where: {
          email
        }

      });

    if (!admin) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        admin.password_hash
      );

    if (!validPassword) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(

      {
        adminId: admin.id,
        tenantId: admin.tenant_id,
        role: admin.role
      },

      process.env.JWT_SECRET,

      {
        expiresIn: '7d'
      }

    );

    res
      .cookie(
        'token',
        token,
        COOKIE_OPTIONS
      )
      .json({
        message: 'Login successful'
      });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const getMe = async (req, res) => {

  try {

    const admin =
      await prisma.admins.findUnique({

        where: {
          id: req.user.adminId
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          tenant_id: true,
          created_at: true
        }

      });

    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found'
      });
    }

    res.json(admin);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const logout = (req, res) => {

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.json({
    message: 'Logged out successfully'
  });

};