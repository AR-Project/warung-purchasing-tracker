import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { type JWT } from "next-auth/jwt";
import { z } from "zod";
import { verify } from "@node-rs/argon2";
import { revalidatePath } from "next/cache";

import db from "./infrastructure/database/db";
import { logger } from "./lib/logger";
import ClientError from "./lib/exception/ClientError";

declare module "next-auth/jwt" {
  interface JWT extends UserSession {}
}

declare module "next-auth" {
  interface User extends UserSession {}

  interface Session {
    user: UserSession;
  }
}

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
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
          const { data, error: payloadError } =
            credentialsSchema.safeParse(credentials);
          if (payloadError) throw new ClientError("payload schema error");

          const { username, password } = data;
          const user = await db.query.user.findFirst({
            columns: {
              username: true,
              hashedPassword: true,
              id: true,
              parentId: true,
            },
            where: (user, { eq }) => eq(user.username, username),
          });
          if (!user) throw new ClientError("wrong username");

          const isPasswordValid = await verify(user.hashedPassword, password);
          if (!isPasswordValid)
            throw new ClientError("username OK, password error");

          revalidatePath("/", "layout");
          return {
            username: user.username,
            userId: user.id,
            parentId: user.parentId,
          };
        } catch (error) {
          if (error instanceof Error && error.name !== "ClientError")
            logger.error("INTERNAL_ERROR_AUTH");
          if (error instanceof ClientError) {
            throw error;
          }
          return null;
        }
      },
    }),
  ],
  debug: true,
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.parentId = user.parentId;
        token.userId = user.userId;
        token.username = user.username;
      }

      if (trigger === "update" && session?.user) {
        if (session.user.username) token.username = session.user.username;
      }

      return token;
    },
    session({ session, token }) {
      session.user.parentId = token.parentId;
      session.user.userId = token.userId;
      session.user.username = token.username;
      return session;
    },
  },

  logger: {
    error(error) {},
    warn(error) {},
    debug(error) {},
  },
});
