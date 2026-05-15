import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import { AdminRole, OwnerStatus } from '@prisma/client';

export interface AdminToken {
  userId: string;
  email: string;
  role: AdminRole;
  type: 'admin';
}

export interface OwnerToken {
  userId: string;
  email: string;
  type: 'owner';
}

export const adminService = {
  async login(username: string, password: string) {
    const admin = await prisma.admin.findUnique({ where: { username } });
    
    if (!admin) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      {
        userId: admin.id,
        email: admin.email,
        role: admin.role,
        type: 'admin',
      } as AdminToken,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
    );

    return {
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        displayName: admin.displayName,
        role: admin.role,
      },
    };
  },

  async create(data: {
    username: string;
    email: string;
    password: string;
    displayName: string;
    role?: AdminRole;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    
    const admin = await prisma.admin.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        displayName: data.displayName,
        role: data.role || 'content_editor',
      },
    });

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      displayName: admin.displayName,
      role: admin.role,
    };
  },

  async getAll() {
    return prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });
  },
};

export const ownerService = {
  async register(email: string, password: string, name: string, username: string, address?: string, description?: string, cuisine?: string, openingHours?: string) {
    const existingByEmail = await prisma.restaurantOwner.findUnique({ where: { email } });
    if (existingByEmail) {
      throw new Error('Email already registered');
    }

    const existingByUsername = await prisma.restaurantOwner.findUnique({ where: { username } });
    if (existingByUsername) {
      throw new Error('Username already taken');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const owner = await prisma.restaurantOwner.create({
      data: {
        username,
        email,
        passwordHash,
        name,
        status: 'pending',
      },
    });

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        description: description || '',
        address,
        cuisine: cuisine || null,
        openingHours: openingHours || null,
        ownerId: owner.id,
        status: 'approved',
      },
    });

    return {
      id: owner.id,
      username: owner.username,
      email: owner.email,
      name: owner.name,
      restaurantId: restaurant.id,
      status: owner.status,
      createdAt: owner.createdAt.toISOString(),
    };
  },

  async login(identifier: string, password: string) {
    const isEmail = identifier.includes('@');
    const owner = await prisma.restaurantOwner.findUnique({
      where: isEmail ? { email: identifier } : { username: identifier },
      include: { restaurants: { take: 1 } },
    });
    
    if (!owner) {
      throw new Error('Email/tài khoản hoặc mật khẩu không đúng');
    }

    if (owner.status === 'rejected') {
      throw new Error('Tài khoản đã bị từ chối');
    }

    if (owner.status === 'pending') {
      throw new Error('Tài khoản đang chờ phê duyệt');
    }

    const isValid = await bcrypt.compare(password, owner.passwordHash);
    if (!isValid) {
      throw new Error('Email/tài khoản hoặc mật khẩu không đúng');
    }

    const token = jwt.sign(
      {
        userId: owner.id,
        email: owner.email,
        type: 'owner',
      } as OwnerToken,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
    );

    return {
      token,
      user: {
        id: owner.id,
        username: owner.username,
        email: owner.email,
        passwordHash: owner.passwordHash,
        name: owner.name,
        restaurantId: owner.restaurants[0]?.id,
        address: owner.restaurants[0]?.address || null,
        status: owner.status,
        createdAt: owner.createdAt.toISOString(),
      },
    };
  },

  async updateStatus(id: string, status: OwnerStatus) {
    return prisma.restaurantOwner.update({
      where: { id },
      data: { status },
    });
  },

  async getAll() {
    return prisma.restaurantOwner.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
      },
    });
  },

  async getById(id: string) {
    return prisma.restaurantOwner.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        restaurants: true,
      },
    });
  },
};
