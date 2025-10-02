import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    uid?: string; // agora o Request pode ter a propriedade uid
  }
}