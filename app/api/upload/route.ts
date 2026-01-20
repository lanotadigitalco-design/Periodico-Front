import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Crear nombre único para el archivo
    const ext = file.name.split(".").pop() || "jpg"
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    const filename = `${timestamp}-${random}.${ext}`

    // Crear directorio public/uploads/image si no existe
    const uploadDir = path.join(process.cwd(), "public", "uploads", "image")
    await mkdir(uploadDir, { recursive: true })

    // Guardar archivo
    const filepath = path.join(uploadDir, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    // Retornar URL relativa
    const url = `/uploads/image/${filename}`

    return Response.json({
      success: true,
      url,
      filename
    })
  } catch (error) {
    return Response.json(
      { error: "Error uploading file" },
      { status: 500 }
    )
  }
}