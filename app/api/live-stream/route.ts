import { readFileSync, writeFileSync } from "fs"
import { join } from "path"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const configPath = join(process.cwd(), "config", "live-stream.json")

interface LiveStreamConfig {
  isActive: boolean
  streamUrl: string
  title: string
  description: string
  updatedAt: string
}

function readConfig(): LiveStreamConfig {
  try {
    const data = readFileSync(configPath, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    return {
      isActive: false,
      streamUrl: "",
      title: "Transmisión en Vivo",
      description: "Síguenos en directo",
      updatedAt: new Date().toISOString(),
    }
  }
}

function writeConfig(config: LiveStreamConfig): void {
  writeFileSync(configPath, JSON.stringify(config, null, 2))
}

export function GET() {
  const config = readConfig()
  return NextResponse.json(config)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const updatedConfig: LiveStreamConfig = {
      isActive: body.isActive,
      streamUrl: body.streamUrl,
      title: body.title,
      description: body.description,
      updatedAt: new Date().toISOString(),
    }

    writeConfig(updatedConfig)

    return NextResponse.json(updatedConfig, { status: 200 })
  } catch (error) {
    console.error("Error en API:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}
