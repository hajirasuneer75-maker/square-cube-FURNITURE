// Augment @fastify/jwt so request.user has a known shape throughout the app
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; role: "admin" };
    user:    { sub: string; role: "admin" };
  }
}

export {};
