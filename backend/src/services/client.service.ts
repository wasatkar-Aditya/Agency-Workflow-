import { prisma } from '../config/database';
import { NotFoundError } from '../errors/AppError';
import { z } from 'zod';
import { createClientSchema, updateClientSchema } from '../validators/schemas';

type CreateClientInput = z.infer<typeof createClientSchema>;
type UpdateClientInput = z.infer<typeof updateClientSchema>;

export class ClientService {
  async findAll() {
    return prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { projects: true } } },
    });
  }

  async findById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { projects: { select: { id: true, name: true, status: true } } },
    });
    if (!client) throw new NotFoundError('Client');
    return client;
  }

  async create(data: CreateClientInput) {
    return prisma.client.create({ data });
  }

  async update(id: string, data: UpdateClientInput) {
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundError('Client');
    return prisma.client.update({ where: { id }, data });
  }

  async delete(id: string) {
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundError('Client');
    await prisma.client.delete({ where: { id } });
  }
}

export const clientService = new ClientService();
