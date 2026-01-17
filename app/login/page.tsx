"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from "@/components/ui/alert-dialog"
import { login, register } from "@/lib/auth"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [rol, setRol] = useState("lector")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isUserDisabledDialogOpen, setIsUserDisabledDialogOpen] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const router = useRouter()
  const { setUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (isLogin) {
      const user = await login(email, password)
      console.log("Login response:", user)
      
      if (user && user.id === "DISABLED") {
        console.log("User is disabled, opening dialog")
        setIsUserDisabledDialogOpen(true)
        return
      } else if (user) {
        console.log("Login successful, user role:", user.role)
        setIsLoggingIn(true)
        // Guardar el usuario en el contexto
        setUser(user)
        
        // Redirigir basado en el rol - usar setTimeout para asegurar que el state se actualice
        setTimeout(() => {
          console.log("Redirecting based on role:", user.role)
          if (user.role === "admin") {
            router.push("/admin")
          } else if (user.role === "writer") {
            router.push("/periodista")
          } else {
            router.push("/")
          }
        }, 300)
      } else {
        setError("Email o contraseña incorrectos")
      }
    } else {
      if (!nombre || !apellido) {
        setError("Por favor ingresa tu nombre y apellido")
        return
      }
      const user = await register(email, password, nombre, apellido, rol)
      if (user) {
        console.log("Register successful, user:", user)
        setIsLoggingIn(true)
        setUser(user)
        setTimeout(() => {
          router.push("/")
        }, 300)
      } else {
        setError("El email ya está registrado")
      }
    }
  }

  return (
    <div className={`min-h-screen bg-background flex items-center justify-center p-4 transition-all duration-300 ${isLoggingIn ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <Link href="/">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">La Nota Digital</h1>
          </Link>
          <p className="text-muted-foreground">{isLogin ? "Inicia sesión" : "Crea tu cuenta"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Tu apellido"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Select value={rol} onValueChange={setRol}>
                  <SelectTrigger id="rol">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lector">Lector</SelectItem>
                    <SelectItem value="periodista">Periodista</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full">
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError("")
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
      </Card>

      {/* Alert Dialog para usuario desactivado */}
      <AlertDialog open={isUserDisabledDialogOpen} onOpenChange={setIsUserDisabledDialogOpen}>
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">Cuenta desactivada</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-foreground/70">
              Tu usuario ha sido eliminado o desactivado. Si crees que es un error, por favor contacta con el administrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogAction 
              onClick={() => {
                setIsUserDisabledDialogOpen(false)
                setEmail("")
                setPassword("")
              }}
              className="bg-blue-600 text-white hover:bg-blue-700 text-sm"
            >
              Entendido
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
