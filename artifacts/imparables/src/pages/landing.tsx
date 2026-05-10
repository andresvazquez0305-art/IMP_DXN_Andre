import React from "react";
import { Link } from "wouter";
import { ArrowRight, Leaf, ShieldCheck, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="h-20 border-b border-border flex items-center justify-between px-6 md:px-12 bg-background/95 backdrop-blur z-50 sticky top-0">
        <img src="/logo.png" alt="Imparables SA" className="h-12 w-auto" />
        <nav className="hidden md:flex items-center gap-8">
          <a href="#nosotros" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Nosotros</a>
          <a href="#productos" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Productos</a>
          <a href="#cultura" onClick={(e) => { e.preventDefault(); scrollTo("cultura"); }} className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">Cultura</a>
        </nav>
        <Link href="/sign-in">
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold rounded-full px-6">
            Ingresar al Sistema
          </Button>
        </Link>
      </header>

      <main className="flex-1">
        <section className="relative pt-24 pb-32 md:pt-36 md:pb-48 px-6 md:px-12 overflow-hidden flex items-center min-h-[80vh]">
          <div className="absolute inset-0 z-0">
            <img src="/images/hero.png" alt="Natural products hero" className="w-full h-full object-cover object-center opacity-40 md:opacity-20 dark:opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <Leaf className="w-4 h-4" />
              <span>Naturaleza en su máxima expresión</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-[1.1] mb-6">
              Energía natural, crecimiento <span className="text-primary italic">Imparable.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              Distribuimos los mejores productos y suplementos naturistas. Potenciamos tu bienestar con la fuerza de la naturaleza y una calidad inquebrantable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/sign-in">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-lg rounded-full w-full sm:w-auto gap-2">
                  Portal de Gestión <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={() => scrollTo("nosotros")} className="h-14 px-8 text-lg rounded-full w-full sm:w-auto border-border text-foreground hover:bg-accent/10">
                Conocer Más
              </Button>
            </div>
          </div>
        </section>

        <section id="nosotros" className="py-24 px-6 md:px-12 bg-card">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-foreground">¿Por qué Imparables?</h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Nacimos con una convicción clara: la naturaleza provee todo lo necesario para un bienestar integral. Nos hemos convertido en una red imparable de distribución que conecta la pureza natural con quienes la necesitan.
                </p>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Calidad Certificada</h3>
                      <p className="text-muted-foreground">Cada producto en nuestro catálogo pasa por rigurosos controles de calidad natural.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Red Dinámica</h3>
                      <p className="text-muted-foreground">Nuestros vendedores y clientes forman una comunidad activa y en constante crecimiento.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative z-10">
                  <img src="/images/culture.png" alt="Nuestra cultura" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -inset-4 bg-secondary/20 rounded-2xl -z-0 transform translate-x-4 translate-y-4"></div>
              </div>
            </div>
          </div>
        </section>

        <section id="productos" className="py-24 px-6 md:px-12 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-foreground">Nuestra Esencia</h2>
              <p className="text-muted-foreground text-lg">
                Seleccionamos cuidadosamente extractos, hierbas y suplementos que mantienen intactas las propiedades de su origen.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="group relative rounded-2xl overflow-hidden shadow-lg aspect-square">
                <img src="https://res.cloudinary.com/djapqg8qv/image/upload/v1778194968/spirulina_n5aza0.jpg" alt="Suplementos Orgánicos" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-white text-2xl font-bold mb-2">Suplementos Orgánicos</h3>
                  <p className="text-white/80">Fórmulas concentradas para vitalidad diaria.</p>
                </div>
              </div>
              <div className="group relative rounded-2xl overflow-hidden shadow-lg aspect-square">
                <img src="https://res.cloudinary.com/djapqg8qv/image/upload/v1778194964/Cafe_athtgy.jpg" alt="Alimentos Orgánicos" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-white text-2xl font-bold mb-2">Alimentos Orgánicos</h3>
                  <p className="text-white/80">Gotas de la naturaleza extraídas con precisión.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="cultura" className="py-24 px-6 md:px-12 bg-card">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent font-medium text-sm mb-6">
              <Heart className="w-4 h-4" />
              <span>Nuestros valores</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-foreground">Cultura Imparable</h2>
            <p className="text-muted-foreground text-lg mb-16 max-w-2xl mx-auto leading-relaxed">
              Somos una comunidad unida por la convicción de que el bienestar natural transforma vidas. Nuestros valores guían cada decisión, cada producto y cada relación.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background rounded-2xl p-8 shadow-sm border border-border">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Leaf className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Pureza Natural</h3>
                <p className="text-muted-foreground leading-relaxed">Nos comprometemos con productos libres de aditivos artificiales, respetando el origen de cada ingrediente.</p>
              </div>
              <div className="bg-background rounded-2xl p-8 shadow-sm border border-border">
                <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-5">
                  <Zap className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Crecimiento Constante</h3>
                <p className="text-muted-foreground leading-relaxed">Impulsamos a cada vendedor y cliente a superar sus metas. Imparables significa nunca detenerse.</p>
              </div>
              <div className="bg-background rounded-2xl p-8 shadow-sm border border-border">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <ShieldCheck className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Confianza Total</h3>
                <p className="text-muted-foreground leading-relaxed">Cada producto que distribuimos ha sido verificado para garantizar la máxima calidad y seguridad para nuestros clientes.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="font-serif text-2xl font-bold tracking-tight mb-4">
              Imparables<span className="text-secondary">SA</span>
            </div>
            <p className="text-background/70 max-w-sm">
              Sistema interno de gestión para vendedores, clientes y productos naturistas.
            </p>
          </div>
          <div className="md:text-right">
            <Link href="/dashboard">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Acceder al Portal
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
