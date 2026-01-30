import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Trophy, 
  Brain, 
  TrendingUp, 
  Shield, 
  Zap,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Machine Learning',
    description: 'Modelos avançados que aprendem com cada rodada para prever pontuações com precisão.',
  },
  {
    icon: TrendingUp,
    title: 'Otimização Inteligente',
    description: 'Algoritmos de otimização que montam o time ideal respeitando seu orçamento e esquema tático.',
  },
  {
    icon: Shield,
    title: 'Análise de Risco',
    description: 'Avaliação de variância e consistência para balancear segurança e potencial de mitagem.',
  },
  {
    icon: Zap,
    title: 'Atualização em Tempo Real',
    description: 'Dados atualizados com preços, status de jogadores e estatísticas de desempenho.',
  },
  {
    icon: BarChart3,
    title: 'Histórico e Métricas',
    description: 'Acompanhe a evolução do modelo e compare previsões com resultados reais.',
  },
  {
    icon: Trophy,
    title: 'Múltiplas Estratégias',
    description: 'Times seguros, equilibrados ou ousados para diferentes perfis de risco.',
  },
];

const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    description: 'Para quem quer experimentar',
    features: [
      '3 times por rodada',
      'Estratégia equilibrada',
      'Previsões básicas',
      'Histórico limitado',
    ],
    cta: 'Começar Grátis',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'R$ 19,90',
    period: '/mês',
    description: 'Para cartoleiros sérios',
    features: [
      'Times ilimitados',
      'Todas as estratégias',
      'Previsões avançadas',
      'Histórico completo',
      'Análise de scouts',
      'Suporte prioritário',
    ],
    cta: 'Assinar Pro',
    href: '/register?plan=pro',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: 'R$ 49,90',
    period: '/mês',
    description: 'Para ligas e competições',
    features: [
      'Tudo do Pro',
      'Múltiplas contas',
      'API de acesso',
      'Relatórios customizados',
      'Treinamento de modelos',
      'Suporte dedicado',
    ],
    cta: 'Contato',
    href: '/contato',
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Trophy className="h-8 w-8 text-cartola-green" />
              <span className="text-xl font-bold">MitaBot</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Funcionalidades
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Preços
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Como Funciona
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/register">
                <Button>Cadastrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Domine o{' '}
              <span className="text-cartola-green">Cartola FC</span>{' '}
              com Inteligência Artificial
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Recomendações inteligentes de times baseadas em Machine Learning. 
              Análise de dados, previsões precisas e otimização do seu esquema tático.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  <Zap className="h-5 w-5" />
                  Começar Agora
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline">
                  Saiba Mais
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-cartola-green">50K+</div>
              <div className="text-sm text-muted-foreground">Usuários Ativos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cartola-green">1M+</div>
              <div className="text-sm text-muted-foreground">Times Gerados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cartola-green">85%</div>
              <div className="text-sm text-muted-foreground">Acurácia Média</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cartola-green">38</div>
              <div className="text-sm text-muted-foreground">Rodadas Analisadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Funcionalidades</h2>
            <p className="mt-4 text-muted-foreground">
              Tudo que você precisa para montar times vencedores
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="card-hover">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Como Funciona</h2>
            <p className="mt-4 text-muted-foreground">
              Três passos simples para montar seu time ideal
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Configure suas Preferências</h3>
              <p className="text-muted-foreground">
                Defina seu orçamento, esquema tático e estratégia de risco.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Gere seu Time</h3>
              <p className="text-muted-foreground">
                Nosso algoritmo analisa milhares de combinações para encontrar o time ótimo.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Acompanhe os Resultados</h3>
              <p className="text-muted-foreground">
                Veja a performance do modelo e como suas previsões se compararam com a realidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Planos e Preços</h2>
            <p className="mt-4 text-muted-foreground">
              Escolha o plano ideal para o seu perfil
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`${plan.highlighted ? 'border-primary ring-1 ring-primary' : ''} card-hover`}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline justify-center">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="mt-6 block">
                    <Button 
                      className="w-full" 
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cartola-green text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Pronto para mitar no Cartola?</h2>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Junte-se a milhares de cartoleiros que usam o MitaBot para montar times vencedores.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                <Trophy className="h-5 w-5" />
                Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-cartola-green" />
              <span className="font-semibold">MitaBot Cartola</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MitaBot. Não afiliado ao Cartola FC ou Globo.
            </p>
            <div className="flex gap-4">
              <Link href="/termos" className="text-sm text-muted-foreground hover:text-foreground">
                Termos
              </Link>
              <Link href="/privacidade" className="text-sm text-muted-foreground hover:text-foreground">
                Privacidade
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
