import { NextRequest, NextResponse } from 'next/server'

function isPrivateIP(ip: string): boolean {
  // Expresión regular para detectar IPs privadas (RFC 1918)
  // 10.0.0.0 – 10.255.255.255
  // 172.16.0.0 – 172.31.255.255
  // 192.168.0.0 – 192.168.255.255
  // También incluye localhost y 127.0.0.1
  const privateIPRegex = /^(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168|127|169\.254)\./
  return privateIPRegex.test(ip) || ip === 'localhost' || ip === '127.0.0.1'
}

function getBackendUrl(request: NextRequest): string {
  // Detectar el hostname desde el header Host
  const host = request.headers.get('host') || 'localhost:3000'
  const hostname = host.split(':')[0]
  
  // Si es una IP privada o localhost, usar el backend local
  if (isPrivateIP(hostname)) {
    // Si es localhost o 127.0.0.1, usar localhost:5001
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5001/api'
    }
    // Para cualquier otra IP privada, usar esa IP
    return `http://${hostname}:5001/api`
  }
  
  // Para cualquier otro caso, usar ngrok (acceso desde afuera de la red local)
  return process.env.NEXT_PUBLIC_API_URL || 'https://postilioned-symmetrically-margarita.ngrok-free.dev/api'
}

async function proxyRequest(
  method: string,
  endpoint: string,
  backendUrl: string,
  data?: any,
  headers?: Record<string, string>,
  searchParams?: URLSearchParams
) {
  let url = `${backendUrl}${endpoint}`
  if (searchParams && searchParams.toString()) {
    url += `?${searchParams.toString()}`
  }
  
  console.log(`[Proxy] ${method} ${url}`)
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    const responseData = await response.json()
    return { status: response.status, data: responseData }
  } catch (error) {
    console.error(`[Proxy] Error:`, error)
    throw error
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const endpoint = '/' + (slug?.join('/') || '')
  const searchParams = request.nextUrl.searchParams
  const token = request.headers.get('authorization')
  const backendUrl = getBackendUrl(request)

  try {
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = token
    }

    const { status, data } = await proxyRequest('GET', endpoint, backendUrl, undefined, headers, searchParams)
    return NextResponse.json(data, { status })
  } catch (error) {
    console.error('GET proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

export async function POST(
  requestObj: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const endpoint = '/' + (slug?.join('/') || '')
  const searchParams = requestObj.nextUrl.searchParams
  const token = requestObj.headers.get('authorization')
  const backendUrl = getBackendUrl(requestObj)
  const body = await requestObj.json()

  try {
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = token
    }

    const { status, data } = await proxyRequest('POST', endpoint, backendUrl, body, headers, searchParams)
    return NextResponse.json(data, { status })
  } catch (error) {
    console.error('POST proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to post data' },
      { status: 500 }
    )
  }
}

export async function PUT(
  requestObj: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const endpoint = '/' + (slug?.join('/') || '')
  const searchParams = requestObj.nextUrl.searchParams
  const token = requestObj.headers.get('authorization')
  const backendUrl = getBackendUrl(requestObj)
  const body = await requestObj.json()

  try {
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = token
    }

    const { status, data } = await proxyRequest('PUT', endpoint, backendUrl, body, headers, searchParams)
    return NextResponse.json(data, { status })
  } catch (error) {
    console.error('PUT proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to update data' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  requestObj: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const endpoint = '/' + (slug?.join('/') || '')
  const searchParams = requestObj.nextUrl.searchParams
  const token = requestObj.headers.get('authorization')
  const backendUrl = getBackendUrl(requestObj)
  const body = await requestObj.json()

  try {
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = token
    }

    const { status, data } = await proxyRequest('PATCH', endpoint, backendUrl, body, headers, searchParams)
    return NextResponse.json(data, { status })
  } catch (error) {
    console.error('PATCH proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to patch data' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  requestObj: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const endpoint = '/' + (slug?.join('/') || '')
  const searchParams = requestObj.nextUrl.searchParams
  const token = requestObj.headers.get('authorization')
  const backendUrl = getBackendUrl(requestObj)

  try {
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = token
    }

    const { status, data } = await proxyRequest('DELETE', endpoint, backendUrl, undefined, headers, searchParams)
    return NextResponse.json(data, { status })
  } catch (error) {
    console.error('DELETE proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    )
  }
}
