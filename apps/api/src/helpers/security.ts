import * as jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "@/configs";

const JWT_EXPIRES_IN = 1000 * 60 * 60 * 24; // 24 Hours

type User = {
    username: string
}

export const generateToken = (user: User) => {
    return jwt.sign(user, JWT_SECRET_KEY || "", {
        algorithm: "HS256",
        expiresIn: JWT_EXPIRES_IN,
    });
};

export const validateToken = (token: string): Promise<boolean> =>
    new Promise((resolve, reject) => {
        // Valid token?
        if (!token) return resolve(false); // Unauthorized

        if (!JWT_SECRET_KEY) return resolve(false); // Unauthorized

        jwt.verify(token, JWT_SECRET_KEY || "", (err, decoded) => {
            if (err) return reject(err)
            // Valid username?
            const decodedUser = decoded as User
            const username = decodedUser?.username;

            if (!decodedUser || !username) return resolve(false); // Unauthorized
            // TODO: Validate username in the real user data store

            // User is authorized
            return resolve(true);
        });
    });