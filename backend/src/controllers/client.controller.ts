import { Request, Response, NextFunction } from 'express';
import { clientService } from '../services/client.service';
import { createClientSchema, updateClientSchema } from '../validators/schemas';
import { successResponse } from '../utils/tokens';

export class ClientController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(successResponse(await clientService.findAll()));
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(successResponse(await clientService.findById(req.params['id']!)));
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createClientSchema.parse(req.body);
      res.status(201).json(successResponse(await clientService.create(body), 'Client created'));
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = updateClientSchema.parse(req.body);
      res.json(successResponse(await clientService.update(req.params['id']!, body), 'Client updated'));
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await clientService.delete(req.params['id']!);
      res.json(successResponse(null, 'Client deleted'));
    } catch (err) { next(err); }
  }
}

export const clientController = new ClientController();
