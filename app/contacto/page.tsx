import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, MapPin, Phone, Send } from "lucide-react"

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-serif font-bold text-foreground mb-6 text-balance">Contacto</h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            ¿Tienes alguna consulta, sugerencia o quieres colaborar con nosotros? Estamos aquí para escucharte.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Email</h3>
                  <p className="text-muted-foreground text-sm mb-2">Escríbenos directamente a:</p>
                  <a href="mailto:contacto@lanotadigital.com" className="text-primary hover:underline font-medium">
                    contacto@lanotadigital.com
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Teléfono</h3>
                  <p className="text-muted-foreground text-sm mb-2">Llámanos de lunes a viernes:</p>
                  <a href="tel:+34900123456" className="text-primary hover:underline font-medium">
                    +34 900 123 456
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Oficina</h3>
                  <p className="text-muted-foreground text-sm">
                    Av. Principal 123
                    <br />
                    28001 Madrid, España
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Envíanos un mensaje</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Asunto</Label>
                <Input id="subject" placeholder="¿En qué podemos ayudarte?" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea id="message" placeholder="Escribe tu mensaje aquí..." rows={6} />
              </div>

              <Button type="submit" size="lg" className="w-full md:w-auto">
                <Send className="w-4 h-4 mr-2" />
                Enviar mensaje
              </Button>
            </form>
          </Card>

          <div className="mt-12 bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Áreas de contacto específicas</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Redacción</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  Para propuestas editoriales y colaboraciones periodísticas:
                </p>
                <a href="mailto:redaccion@lanotadigital.com" className="text-primary hover:underline text-sm">
                  redaccion@lanotadigital.com
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Recursos Humanos</h3>
                <p className="text-sm text-muted-foreground mb-1">Para oportunidades laborales y prácticas:</p>
                <a href="mailto:rrhh@lanotadigital.com" className="text-primary hover:underline text-sm">
                  rrhh@lanotadigital.com
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Soporte Técnico</h3>
                <p className="text-sm text-muted-foreground mb-1">Para problemas técnicos con la plataforma:</p>
                <a href="mailto:soporte@lanotadigital.com" className="text-primary hover:underline text-sm">
                  soporte@lanotadigital.com
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Legal</h3>
                <p className="text-sm text-muted-foreground mb-1">Para asuntos legales y derechos de autor:</p>
                <a href="mailto:legal@lanotadigital.com" className="text-primary hover:underline text-sm">
                  legal@lanotadigital.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
