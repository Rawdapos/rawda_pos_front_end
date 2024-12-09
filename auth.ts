

import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "./auth.config";
import NextAuth, { type DefaultSession } from "next-auth"


declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: number;
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      phone: string;
      addresse: string;
      role: string;
    } & DefaultSession["user"]
  }

  interface User {
    id?: string;
    firstName: string;
    lastName: string;
    username: string;
    phone: string;
    email?: string | null;
    addresse: string;
    token: string;
    role: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const data = await authenticateUser({ username: email, password: password });
          const all_data = { "token": data.token, ...data.user, };
          if (!data) return null;
          return all_data;
        }
        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) { // User is available during sign-in
        token.id = user
      }
      return token
    },
    session({ session, token }) {
      return {
        ...session,
        id: token.id,
        user: {
          ...session.user,
          ...token
        },
      }
    },
  },
});

export const authenticateUser = async ({ username, password }: { username: string, password: string }) => {

  try {
    const LOGIN_URL = `${process.env.NEXT_PUBLIC_API_URL}/user/login`;
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "username": username,
        "password": password
      })
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Erreur de connexion 2');
      return null;
    }
  } catch (error) {
    console.error('Erreur de connexion 3:', error);
    throw (error);
  }
};

