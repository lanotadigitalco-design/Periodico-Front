"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, User, LogOut, Heart } from "lucide-react"
import { useAuth } from "./auth-provider"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function Header() {
  const { user, setUser } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    setUser(null)
    router.push("/")
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="La Nota Digital" width={576} height={171} className="h-36 w-auto" priority />
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Inicio
              </Link>
              <Link
                href="/categoria/politica"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Política
              </Link>
              <Link
                href="/categoria/economia"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Economía
              </Link>
              <Link
                href="/categoria/deportes"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Deportes
              </Link>
              <Link
                href="/categoria/cultura"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cultura
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="destructive" className="animate-pulse">
              <Play className="w-3 h-3 mr-1" />
              EN VIVO
            </Badge>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.name} ({user.role === "admin" ? "Admin" : user.role === "writer" ? "Escritor" : "Lector"})
                </span>
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/favoritos">
                    <Heart className="w-4 h-4" />
                  </Link>
                </Button>
                {user.role === "admin" && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/admin">Admin</Link>
                  </Button>
                )}
                {user.role === "writer" && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/escritor">Mis Artículos</Link>
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" asChild>
                <Link href="/login">
                  <User className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
