import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (request: Request, context: any) => Promise<NextResponse>;

export function apiHandler(fn: Handler): Handler {
  return async (request, context) => {
    try {
      return await fn(request, context);
    } catch (error) {
      console.error("[API Error]", request.method, request.url, error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
