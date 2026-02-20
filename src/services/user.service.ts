import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorHandler';

export const userService = {
  async findAll() {
    return prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true },
    });
  },

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  async create(data: { email: string; name: string; password: string }) {
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new AppError('Email already in use', 409);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  },

  async update(id: string, data: { name?: string }) {
    await this.findById(id);
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, updatedAt: true },
    });
  },

  async remove(id: string) {
    await this.findById(id);
    await prisma.user.delete({ where: { id } });
  },
};
