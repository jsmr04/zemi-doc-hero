import express from 'express';
import request from 'supertest';
import { createTestApp } from '../setup/app';

describe('Health check integration - TestSuite', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        uptime: expect.any(Number),
        status: expect.any(String),
        date: expect.any(String),
      });
    });
  });
});
