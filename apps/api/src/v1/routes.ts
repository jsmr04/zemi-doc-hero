import { Router } from 'express';
import { coreRoute } from './services/core';
import { fileRoute } from './services/file';
import { convertRoute } from './services/convert';

export type Route = {
  routeName: string;
  route: Router;
};
const routes = [
  { routeName: '/core', route: coreRoute },
  { routeName: '/file', route: fileRoute },
  { routeName: '/convert', route: convertRoute },
];

export default routes;
