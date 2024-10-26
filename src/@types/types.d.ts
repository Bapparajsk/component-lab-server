// Purpose: Define the types for the Request object.
import { IUser } from "../types/user";

declare module 'express-serve-static-core' {
    interface Request {
        User?: IUser;
    }
}
