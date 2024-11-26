import { hash, genSalt } from "bcrypt-ts";

export default async function hashPassword(password: string) {
    const salt = await genSalt();
    return await hash(password, salt);
}