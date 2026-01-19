"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from "@/components/ui/alert-dialog"
import { login, register } from "@/lib/auth"
import { useAuth } from "@/components/auth-provider"
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/validation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [rol] = useState("lector")
  const [isUserDisabledDialogOpen, setIsUserDisabledDialogOpen] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { setUser } = useAuth()

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      password: "",
    },
  })

  const onLoginSubmit = async (data: LoginInput) => {
    const user = await login(data.email, data.password)
    console.log("Login response:", user)
    
    if (user && user.id === "DISABLED") {
      console.log("User is disabled, opening dialog")
      setIsUserDisabledDialogOpen(true)
      return
    } else if (user) {
      console.log("Login successful, user role:", user.role)
      setIsLoggingIn(true)
      setUser(user)
      
      setTimeout(() => {
        console.log("Redirecting based on role:", user.role)
        if (user.role === "admin") {
          router.push("/admin")
        } else if (user.role === "writer") {
          router.push("/escritor")
        } else {
          router.push("/")
        }
      }, 300)
    } else {
      loginForm.setError("email", {
        type: "manual",
        message: "Email o contraseña incorrectos",
      })
    }
  }

  const onRegisterSubmit = async (data: RegisterInput) => {
    const user = await register(data.email, data.password, data.nombre, data.apellido, rol)
    if (user) {
      console.log("Register successful, user:", user)
      setIsLoggingIn(true)
      setUser(user)
      setTimeout(() => {
        router.push("/")
      }, 300)
    } else {
      registerForm.setError("email", {
        type: "manual",
        message: "El email ya está registrado",
      })
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

        <form onSubmit={isLogin ? loginForm.handleSubmit(onLoginSubmit) : registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre"
                  required
                  {...registerForm.register("nombre")}
                />
                {registerForm.formState.errors.nombre && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.nombre.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  type="text"
                  placeholder="Tu apellido"
                  required
                  {...registerForm.register("apellido")}
                />
                {registerForm.formState.errors.apellido && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.apellido.message}</p>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              required
              {...(isLogin ? loginForm.register("email") : registerForm.register("email"))}
            />
            {(isLogin ? loginForm.formState.errors.email : registerForm.formState.errors.email) && (
              <p className="text-sm text-destructive">
                {(isLogin ? loginForm.formState.errors.email : registerForm.formState.errors.email)?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                {...(isLogin ? loginForm.register("password") : registerForm.register("password"))}
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
            {(isLogin ? loginForm.formState.errors.password : registerForm.formState.errors.password) && (
              <p className="text-sm text-destructive">
                {(isLogin ? loginForm.formState.errors.password : registerForm.formState.errors.password)?.message}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLogin ? loginForm.formState.isSubmitting : registerForm.formState.isSubmitting}
          >
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
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
