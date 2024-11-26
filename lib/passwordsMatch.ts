import { compare } from "bcrypt-ts";

export default async function passwordsMatch(password: string, hashedPassword: string) {
    return await compare(password, hashedPassword);
}