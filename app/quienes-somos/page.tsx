import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Target, Award, BookOpen } from "lucide-react"
import Link from "next/link"

export default function QuienesSomosPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-serif font-bold text-foreground mb-6 text-balance text-center">Quiénes Somos</h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Somos tu espacio digital de confianza, donde cada noticia está pensada para mantenerte informado y conectado con la realidad
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Nuestra Misión</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Contribuir a la construcción de opinión pública, con un ejercicio periodístico serio, responsable y equilibrado que oriente a la sociedad a adoptar decisiones informadas y adecuadas.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Nuestra Vision</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                   La Nota Digital se propone ser el referente del periodismo regional, haciendo periodismo con rigor y con respeto a la audiencia.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Nuestro Equipo</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Somos profesionales de la
Comunicación Social y Periodismo, visionarios y constructores de una nueva generación de la información enfocada en la búsqueda constante de la verdad, usando los medios tecnológicos y legales a nuestro alcance.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Nuestros Valores</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                   La Nota Digital basa su filosofía en la defensa de la verdad, el equilibrio informativo, el contraste de la noticia y el compromiso absoluto con las comunidades que necesitan ser escuchadas.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Nuestra Historia</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Fundada en 2026, La Nota Digital nació con el objetivo de revolucionar el periodismo digital en español.
                Desde nuestros inicios, hemos apostado por la innovación tecnológica sin perder de vista lo esencial: el
                compromiso con la verdad.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                En un mundo saturado de información, nos diferenciamos por nuestra rigurosidad, verificación de fuentes
                y análisis profundo de cada acontecimiento. No nos conformamos con transmitir la noticia: buscamos
                contextualizarla y explicar su relevancia.
              </p>
              
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">¿Quieres formar parte de nuestro equipo?</h2>
            <p className="text-muted-foreground mb-6">
              Estamos siempre en búsqueda de talento periodístico comprometido con la excelencia.
            </p>
            <Button asChild size="lg">
              <Link href="/contacto">Contáctanos</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
