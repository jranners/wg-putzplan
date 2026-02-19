
import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: [
        "/",
        "/settings/:path*",
        "/tasks/:path*",
        "/expenses/:path*",
        "/shopping/:path*",
        "/zeitplan/:path*",
        "/statistics/:path*",
        "/admin/:path*",
        "/api/tasks/:path*",
        "/api/expenses/:path*",
        "/api/shopping/:path*",
        "/api/wg/:path*",
    ],
};
