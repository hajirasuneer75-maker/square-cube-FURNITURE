declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: {
            sub: string;
            role: "admin";
        };
        user: {
            sub: string;
            role: "admin";
        };
    }
}
export {};
//# sourceMappingURL=types.d.ts.map