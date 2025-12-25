"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, User, LogOut, Heart } from "lucide-react"
import { useAuth } from "./auth-provider"
import { logout } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function Header() {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    setUser(null)
    router.push("/")
  }

  const sections = [
    { name: "Política", href: "/categoria/politica" },
    { name: "Economía", href: "/categoria/economia" },
    { name: "Deportes", href: "/categoria/deportes" },
    { name: "Cultura", href: "/categoria/cultura" },
    { name: "Mundo", href: "/categoria/mundo" },
    { name: "Opinión", href: "/categoria/opinion" },
    { name: "Tecnología", href: "/categoria/tecnologia" },
    { name: "Salud", href: "/categoria/salud" },
    { name: "Entretenimiento", href: "/categoria/entretenimiento" },
    { name: "Tendencias", href: "/categoria/tendencias" },
  ]

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-2 md:py-4">
          <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <Image src="/logo.jpeg" alt="La Nota Digital" width={500} height={100} className="h-12 md:h-16 w-auto" priority />
            </Link>
            
            {/* Navegación de Secciones - Desktop */}
            <nav className="hidden lg:flex gap-4 ml-4 border-l border-border pl-4 flex-wrap">
              {sections.map((section) => {
                const isActive = pathname.includes(section.href.split("/").pop() || "")
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={cn(
                      "text-xs font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {section.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <a href="https://www.youtube.com/live/jfKfPfyJRdk" target="_blank" rel="noopener noreferrer" className="inline-block">
              <Badge variant="destructive" className="animate-pulse text-xs md:text-sm cursor-pointer hover:opacity-80 transition-opacity">
                <Play className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                <span className="hidden md:inline">EN VIVO</span>
              </Badge>
            </a>

            {user ? (
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
                  {user.name} ({user.role === "admin" ? "Admin" : user.role === "writer" ? "Periodista" : "Lector"})
                </span>
                <Button size="sm" variant="ghost" asChild className="h-8 w-8 md:h-10 md:w-10">
                  <Link href="/favoritos">
                    <Heart className="w-4 h-4" />
                  </Link>
                </Button>
                {user.role === "admin" && (
                  <Button size="sm" variant="outline" asChild className="hidden md:flex">
                    <Link href="/admin">Admin</Link>
                  </Button>
                )}
                {user.role === "writer" && (
                  <Button size="sm" variant="outline" asChild className="hidden md:flex">
                    <Link href="/escritor">Mis Artículos</Link>
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={handleLogout} className="h-8 w-8 md:h-10 md:w-10">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" asChild className="text-xs md:text-sm">
                <Link href="/login">
                  <User className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Navegación de Secciones - Mobile/Tablet */}
        <nav className="border-t border-border lg:hidden flex gap-2 overflow-x-auto scrollbar-hide py-0">
          <Link href="/" className="text-xs font-medium text-foreground hover:text-primary transition-colors py-2 px-2">
            Inicio
          </Link>
          {sections.map((section) => {
            const isActive = pathname.includes(section.href.split("/").pop() || "")
            return (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  "text-xs font-medium whitespace-nowrap transition-colors py-2 px-2",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {section.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
