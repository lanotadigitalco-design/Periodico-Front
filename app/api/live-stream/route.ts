import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const configPath = join(process.cwd(), "config", "live-stream.json");

interface LiveStreamConfig {
  url: string;
  titulo: string;
  descripcion: string;
  activo: boolean;
  actualizadoEn?: string;
}

function readConfig(): LiveStreamConfig {
  try {
    const data = readFileSync(configPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {
      url: "",
      titulo: "Transmisión en Vivo",
      descripcion: "Síguenos en directo",
      activo: false,
      actualizadoEn: new Date().toISOString(),
    };
  }
}

function writeConfig(config: LiveStreamConfig): void {
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function GET() {
  const config = readConfig();
  return NextResponse.json(config);
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const updatedConfig: LiveStreamConfig = {
      url: body.url || "",
      titulo: body.titulo || "Transmisión en Vivo",
      descripcion: body.descripcion || "",
      activo: body.activo ?? false,
      actualizadoEn: new Date().toISOString(),
    };

    if (updatedConfig.url) {
      try {
        new URL(updatedConfig.url);
      } catch {
        return NextResponse.json({ error: "URL inválida" }, { status: 400 });
      }
    }

    writeConfig(updatedConfig);

    return NextResponse.json(
      {
        success: true,
        message: "Configuración guardada correctamente",
        data: updatedConfig,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error en POST /live-stream:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 },
    );
  }
}
