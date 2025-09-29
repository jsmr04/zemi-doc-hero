import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
  return res.status(200).send({
    uptime: process.uptime(),
    status: 'healthy 🙂 ',
    date: new Date(),
  });
};
