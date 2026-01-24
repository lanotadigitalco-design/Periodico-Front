"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const mainSections = [
  { name: "Política", href: "/categoria/politica" },
  { name: "Economía", href: "/categoria/economia" },
  { name: "Deportes", href: "/categoria/deportes" },
  { name: "Cultura", href: "/categoria/cultura" },
  { name: "Mundo", href: "/categoria/mundo" },
  { name: "Córdoba", href: "/categoria/cordoba" },
  { name: "Montería", href: "/categoria/monteria" },
  { name: "Turismo", href: "/categoria/turismo" },
  { name: "Educación", href: "/categoria/educacion" },
  { name: "Colombia", href: "/categoria/colombia" },
  { name: "Judicial", href: "/categoria/judicial" },
]

const moreSections = [
  { name: "Opinión", href: "/categoria/Opinion" },
  { name: "Turismo", href: "/categoria/Turismo" },
  { name: "Tecnología", href: "/categoria/Tecnologia" },
  { name: "Salud", href: "/categoria/Salud" },
  { name: "Entretenimiento", href: "/categoria/Entretenimiento" },
  { name: "Tendencias", href: "/categoria/Tendencias" },
  { name: "Deportes", href: "/categoria/Deportes" },
  { name: "Mundo", href: "/categoria/Mundo" },
]

export function SectionNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-background border-b border-border sticky top-12 z-30">
      <div className="container mx-auto px-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide py-0">
          {mainSections.map((section) => {
            const isActive = pathname.includes(section.href.split("/").pop() || "")
            return (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  "px-2 py-3 text-xs md:text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                  isActive
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                )}
              >
                {section.name}
              </Link>
            )
          })}

          {/* Dropdown Más */}
          <div className="group">
            <button className="px-0 py-3 text-sm font-medium whitespace-nowrap text-muted-foreground border-b-2 border-transparent hover:text-foreground transition-colors">
              Más ▼
            </button>
            <div className="hidden group-hover:block absolute bg-background border border-border rounded-md shadow-lg py-2 mt-0 max-h-96 overflow-y-auto">
              {moreSections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {section.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

