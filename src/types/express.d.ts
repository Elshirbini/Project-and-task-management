import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    userRole?: string;
    user?: {
      accessToken?: string;
      refreshToken?: string;
      name?: string;
      id?: string;
      role?: string;
    };
    __: (phraseOrOptions: string | any, ...replace: string[]) => string;
    file?: any;
    files?: any;
  }
}
