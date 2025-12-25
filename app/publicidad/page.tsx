import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Eye, Target, BarChart, Mail } from "lucide-react"
import Link from "next/link"

export default function PublicidadPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              MEDIA KIT 2025
            </Badge>
            <h1 className="text-5xl font-serif font-bold text-foreground mb-6 text-balance">
              Publicidad en La Nota Digital
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Conecta con miles de lectores informados y comprometidos. Descubre cómo tu marca puede formar parte de una
              de las plataformas de noticias digitales de mayor crecimiento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center">
              <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">500K+</div>
              <p className="text-muted-foreground text-sm">Visitas mensuales</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">150K+</div>
              <p className="text-muted-foreground text-sm">Lectores únicos</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">+85%</div>
              <p className="text-muted-foreground text-sm">Crecimiento anual</p>
            </Card>
          </div>

          <Card className="p-8 mb-12">
            <h2 className="text-3xl font-serif font-bold mb-6">Nuestra Audiencia</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">Perfil Demográfico</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">Edad predominante: 25-45 años (68%)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">Nivel educativo: Universitario y postgrado (75%)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">Poder adquisitivo: Medio-alto y alto (62%)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">Distribución geográfica: España y Latinoamérica</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">Intereses Principales</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">Política y actualidad nacional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">Economía y finanzas personales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">Tecnología e innovación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">Cultura y entretenimiento</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <h2 className="text-3xl font-serif font-bold mb-6">Formatos Publicitarios</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Banner Display</h3>
                  <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                    Banners estratégicamente ubicados en home, secciones y artículos. Formatos: leaderboard, medium
                    rectangle, skyscraper.
                  </p>
                  <Badge variant="secondary">Desde €500/mes</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                  <BarChart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Contenido Patrocinado</h3>
                  <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                    Artículos branded content redactados por nuestro equipo editorial, identificados claramente como
                    contenido patrocinado.
                  </p>
                  <Badge variant="secondary">Desde €1,500/artículo</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Newsletter Patrocinada</h3>
                  <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                    Presencia destacada en nuestro boletín diario enviado a más de 50,000 suscriptores activos.
                  </p>
                  <Badge variant="secondary">Desde €800/envío</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Campaña Integrada</h3>
                  <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                    Paquete completo que combina banners, contenido patrocinado, newsletter y redes sociales para máximo
                    impacto.
                  </p>
                  <Badge variant="secondary">Consultar</Badge>
                </div>
              </div>
            </Card>
          </div>

          <Card className="bg-primary text-primary-foreground p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para alcanzar tu audiencia ideal?</h2>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto leading-relaxed">
              Nuestro equipo comercial está preparado para diseñar una propuesta personalizada que se ajuste a tus
              objetivos de marketing y presupuesto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contacto">Solicitar Media Kit completo</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <a href="mailto:publicidad@lanotadigital.com">publicidad@lanotadigital.com</a>
              </Button>
            </div>
          </Card>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>
              Para consultas específicas o propuestas personalizadas, contacta directamente con nuestro departamento
              comercial.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
