import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.API_URL || "http://localhost:8000/api"

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params
  return proxyRequest(request, params.path, "GET")
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params
  return proxyRequest(request, params.path, "POST")
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params
  return proxyRequest(request, params.path, "PUT")
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params
  return proxyRequest(request, params.path, "DELETE")
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params
  return proxyRequest(request, params.path, "PATCH")
}

async function proxyRequest(request: NextRequest, path: string[], method: string) {
  try {
    const endpoint = path.join("/")
    const searchParams = request.nextUrl.searchParams.toString()
    const url = `${API_BASE_URL}/${endpoint}${searchParams ? `?${searchParams}` : ""}`

    console.log(`[v0] Proxying ${method} request to: ${url}`)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    }

    // Forward auth token
    const authHeader = request.headers.get("Authorization")
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    // Forward user ID
    const userIdHeader = request.headers.get("X-User-ID")
    if (userIdHeader) {
      headers["X-User-ID"] = userIdHeader
    }

    const options: RequestInit = {
      method,
      headers,
    }

    // Add body for POST, PUT, PATCH requests
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const body = await request.text()
      if (body) {
        options.body = body
      }
    }

    const response = await fetch(url, options)
    const contentType = response.headers.get("content-type")
    
    console.log(`[v0] Response status: ${response.status}, Content-Type: ${contentType}`)

    if (contentType?.includes("application/json")) {
      const data = await response.text()
      return new NextResponse(data, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      })
    } else {
      const errorText = await response.text()
      console.error(`[v0] Backend returned HTML/PHP error page (first 300 chars):`, errorText.substring(0, 300))
      
      return NextResponse.json(
        { 
          success: false, 
          error: "Backend API not responding correctly", 
          message: `The backend returned ${contentType} instead of JSON. This usually means:\n\n1. Your Laravel backend is not running (run: php artisan serve)\n2. The backend URL is incorrect (currently: ${API_BASE_URL})\n3. There's a PHP error in your Laravel application`,
          status: response.status,
          backendUrl: API_BASE_URL,
          requestedEndpoint: endpoint
        },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error("[v0] Failed to connect to backend:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Cannot connect to backend API", 
        message: `Failed to connect to ${API_BASE_URL}.\n\nPlease ensure your Laravel backend is running:\n\ncd backend\nphp artisan serve\n\nThen refresh this page.`,
        hint: "The backend should be accessible at localhost:8000",
        backendUrl: API_BASE_URL
      },
      { status: 503 }
    )
  }
}
