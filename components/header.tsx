"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, User, LogOut, Heart, ChevronDown, Menu, X } from "lucide-react"
import { useAuth } from "./auth-provider"
import { logout } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"

export function Header() {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setIsMobileMenuOpen(false)
      }
    }

    if (isDropdownOpen || isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isDropdownOpen, isMobileMenuOpen])

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

  const mainSections = sections.slice(0, 5)
  const moreSections = sections.slice(5)

  return (
    <header className="flex-1" ref={headerRef}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-2 md:py-4">
          <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
            {/* Logo - Visible en móvil cuando el menú NO está abierto */}
            {!isMobileMenuOpen && (
              <Link href="/" className="flex items-center justify-center flex-shrink-0 block md:hidden">
                <Image src="/logo.png" alt="La Nota Digital" width={500} height={100} className="h-16 w-auto" priority />
              </Link>
            )}
            
            {/* Botón Menú Hamburguesa - Mobile */}
            <Button
              size="sm"
              variant="ghost"
              className="lg:hidden h-8 w-8"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            
            {/* Navegación de Secciones - Desktop */}
            <nav className="hidden lg:flex gap-4 ml-4 border-l border-border pl-4 flex-wrap">
              {mainSections.map((section) => {
                const isActive = pathname.includes(section.href.split("/").pop() || "")
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={cn(
                      "text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {section.name}
                  </Link>
                )
              })}
              
              {/* Dropdown de más categorías */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Más
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-md shadow-lg z-50 min-w-max">
                    {moreSections.map((section) => {
                      const isActive = pathname.includes(section.href.split("/").pop() || "")
                      return (
                        <Link
                          key={section.href}
                          href={section.href}
                          className={cn(
                            "block px-4 py-2 text-sm font-medium transition-colors first:rounded-t-md last:rounded-b-md hover:bg-muted",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {section.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
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

        {/* Navegación de Secciones - Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card">
            <nav className="flex flex-col">
              <Link href="/" className="text-sm font-medium text-foreground hover:bg-muted transition-colors py-3 px-4 border-b border-border last:border-b-0">
                Inicio
              </Link>
              {sections.map((section) => {
                const isActive = pathname.includes(section.href.split("/").pop() || "")
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className={cn(
                      "text-sm font-medium transition-colors py-3 px-4 border-b border-border last:border-b-0 hover:bg-muted",
                      isActive ? "text-primary bg-muted" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {section.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}

      </div>
    </header>
  )
}
