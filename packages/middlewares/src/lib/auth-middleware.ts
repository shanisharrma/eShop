import { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import { UserModel, mongoConnect } from "@eshop/utils";

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
 try {
   const token = req.cookies.access_token || req.headers.authorization?.split(" ")[1];

   if (!token) {
     return res.status(401).json({message: "Unauthorized! token missing."})
   }

   // Verify token
   const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as {id: string, role: "user" | "seller"};

   if (!decoded) {
     return res.status(401).json({message: "Unauthorized! token invalid."})
   }

   // Ensure DB connection
   // await mongoConnect();

   // find user from db
   const user = await UserModel.findById(decoded.id);

   if (!user) {
     return res.status(401).json({message: "Unauthorized! user not found."})
   }

   (req as any).user = user;
   next();
 } catch (error) {
   console.error(error);
   return res.status(500).json({message: "Internal server error."})
 }

}
