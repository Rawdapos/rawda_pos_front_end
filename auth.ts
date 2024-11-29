import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "./auth.config";


export const { auth,signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const data = await authenticateUser({username:email,password:password});
          console.log("data api response",data);
          const all_data = {"token":data.token,...data.user,};
          
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
});

export const authenticateUser = async ({ username, password }: { username:string,password:string }) => {

  try {
    const LOGIN_URL = `${process.env.NEXT_PUBLIC_API_URL}`;
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
    throw(error);
  }
};
