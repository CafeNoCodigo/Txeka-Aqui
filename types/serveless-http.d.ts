declare module 'serverless-http' {
  import type { Application } from 'express';
  function serverless(app: Application): any;
  export = serverless;
}
