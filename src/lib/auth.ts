import { getServerSession} from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { authOptions } from "./authOptions";

export async function auth() {
  return await getServerSession(authOptions);
}

export { signIn, signOut };