// src/types/express.d.ts
import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    auth?: {
      phone_number?: string;
      phoneNumber?: string;
      uid?: string;
      // add more claims if you set them in middleware
    };
  }
}
