import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { type JWT } from "next-auth/jwt";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { verify } from "@node-rs/argon2";

import db from "./infrastructure/database/db";
import { user } from "./lib/schema/user";
import { revalidatePath } from "next/cache";

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    username: string;
  }
}

declare module "next-auth" {
  interface User {
    username: string;
    userId: string;
  }

  interface Session {
    user: {
      userId: string;
      username: string;
    };
  }
}

const DEFAULT_ERROR_MSG = "Check again your username and/or password";
const isEnvDev = process.env.NODE_ENV === "development";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: {
          label: "username",
          type: "text",
          placeholder: "Username",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const credentialsSchema = z
          .object({
            username: z.string(),
            password: z.string(),
          })
          .required();

        try {
          const { data } = credentialsSchema.safeParse(credentials);
          if (!data) {
            throw new Error(
              isEnvDev ? "payload schema error" : DEFAULT_ERROR_MSG
            );
          }

          const { username, password } = data;

          const users = await db
            .select({
              username: user.username,
              hashedPassword: user.hashedPassword,
              userId: user.id,
            })
            .from(user)
            .where(eq(user.username, username));

          if (users.length != 1) {
            throw new Error(isEnvDev ? "wrong username" : DEFAULT_ERROR_MSG);
          }

          const [validUser] = users;

          const isPasswordValid = await verify(
            users[0].hashedPassword,
            password
          );

          if (!isPasswordValid) {
            throw new Error(
              isEnvDev ? "username OK, password error" : DEFAULT_ERROR_MSG
            );
          }
          revalidatePath("/", "layout");
          return { username: validUser.username, userId: validUser.userId };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error(isEnvDev ? "autorize catch block" : "Internal Error");
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // User is available during sign-in
        token.userId = user.userId;
        token.username = user.username;
      }
      return token;
    },
    session({ session, token }) {
      session.user.userId = token.userId;
      session.user.username = token.username;
      return session;
    },
  },
  logger: {
    error(code, ...message) {},
    warn(code, ...message) {
      console.log(code);
    },
    debug(code, ...message) {
      console.log(code);
    },
  },
});
