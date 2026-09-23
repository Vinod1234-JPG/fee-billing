import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (token) {
      if (path === "/" || path === "/login") {
        if (token.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin/dashboard", req.url))
        } else if (token.role === "ASSISTANT") {
          return NextResponse.redirect(new URL("/assistant/dashboard", req.url))
        }
      }

      if (path.startsWith("/admin") && token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/assistant/dashboard", req.url))
      }

      if (path.startsWith("/assistant") && token.role !== "ASSISTANT") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"]
}
