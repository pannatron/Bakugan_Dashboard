import NextAuth, { AuthOptions, Session, User as NextAuthUser } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import clientPromise from "../../../lib/mongodb-adapter";
import User from "@/app/lib/models/User";
import connectDB from "@/app/lib/mongodb";

// Extend the User type to include isAdmin
interface ExtendedUser extends NextAuthUser {
  isAdmin?: boolean;
}

// Extend the Session type
interface ExtendedSession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isAdmin?: boolean;
  };
}

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        await connectDB();
        
        // Find user
        const user = await User.findOne({ 
          username: credentials.username,
          isVerified: true // Only allow verified users to login
        });
        
        if (!user) {
          return null;
        }

        // Validate password
        if (!user.validatePassword(credentials.password)) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
        };
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: ExtendedUser }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }: { session: ExtendedSession; token: JWT }) {
      if (session.user) {
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    newUser: '/auth/profile-setup',
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
