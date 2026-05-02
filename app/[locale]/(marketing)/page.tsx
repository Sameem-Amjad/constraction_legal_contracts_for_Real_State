import Link from 'next/link'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Globe,
  Scale,
  ShieldCheck,
  Sparkles,
  Clock,
  Building2,
  Mail,
  Download,
  Pencil,
  CreditCard,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HeroVideo } from '@/components/marketing/HeroVideo'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import type { Locale } from '@/i18n'

interface HomePageProps {
  params: Promise<{ locale: Locale }>
}

const HERO_VIDEO_SRC =
  'https://content.apisystem.tech/hls/medias/FHKnBCGO9jAnqN22f3Kz/media/transcoded_videos/cts-5807bfda6acd7432_,360,480,720,p.mp4.urlset/master.m3u8'
const HERO_POSTER =
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=70'
const SECTION_IMAGE =
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1400&q=70'

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('marketing')
  const tc = await getTranslations('common')
  const tHome = await getTranslations('home')
  const isFr = locale === 'fr'

  const steps = [
    {
      icon: Pencil,
      title: tHome('step1Title'),
      body: tHome('step1Body'),
    },
    {
      icon: ShieldCheck,
      title: tHome('step2Title'),
      body: tHome('step2Body'),
    },
    {
      icon: CreditCard,
      title: tHome('step3Title'),
      body: tHome('step3Body'),
    },
    {
      icon: Download,
      title: tHome('step4Title'),
      body: tHome('step4Body'),
    },
  ]

  const features = [
    {
      icon: Globe,
      title: tHome('feat1Title'),
      body: tHome('feat1Body'),
    },
    {
      icon: Scale,
      title: tHome('feat2Title'),
      body: tHome('feat2Body'),
    },
    {
      icon: Building2,
      title: tHome('feat3Title'),
      body: tHome('feat3Body'),
    },
    {
      icon: Clock,
      title: tHome('feat4Title'),
      body: tHome('feat4Body'),
    },
    {
      icon: Mail,
      title: tHome('feat5Title'),
      body: tHome('feat5Body'),
    },
    {
      icon: ShieldCheck,
      title: tHome('feat6Title'),
      body: tHome('feat6Body'),
    },
  ]

  const faqs = [
    { q: tHome('faq1Q'), a: tHome('faq1A') },
    { q: tHome('faq2Q'), a: tHome('faq2A') },
    { q: tHome('faq3Q'), a: tHome('faq3A') },
    { q: tHome('faq4Q'), a: tHome('faq4A') },
  ]

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-brand-hero">
        {/* Subtle stripe pattern overlay */}
        <div className="absolute inset-0 -z-10 bg-brand-stripe opacity-60" />
        <div className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 bg-brand-cobalt/10 text-brand-cobalt border border-brand-cobalt/20 hover:bg-brand-cobalt/15"
              >
                <Sparkles className="mr-1.5 h-3 w-3" />
                {tHome('heroBadge')}
              </Badge>
              <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                <span className="text-gradient-brand">
                  {t('hero.headline')}
                </span>
              </h1>
              <p
                className="text-lg text-muted-foreground max-w-xl leading-relaxed animate-fade-in-up"
                style={{ animationDelay: '120ms' }}
              >
                {t('hero.subheadline')}
              </p>
              <div
                className="flex flex-col sm:flex-row gap-3 pt-2 animate-fade-in-up"
                style={{ animationDelay: '240ms' }}
              >
                <Button
                  asChild
                  size="lg"
                  className="text-base h-12 px-6 btn-shimmer shadow-glow bg-brand-cobalt hover:bg-brand-cobalt/90"
                >
                  <Link href={`/${locale}/contracts/new`}>
                    {t('hero.ctaPrimary')}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-base h-12 px-6 border-brand-cobalt/30 text-brand-cobalt hover:bg-brand-cobalt/5"
                >
                  <Link href={`/${locale}/pricing`}>
                    {t('hero.ctaSecondary')}
                  </Link>
                </Button>
              </div>
              <div
                className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground animate-fade-in-up"
                style={{ animationDelay: '360ms' }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-brand-green" />
                  {tHome('trustBilingual')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-brand-green" />
                  {tHome('trustRBQ')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-brand-green" />
                  {tHome('trustCCQ')}
                </span>
              </div>
            </div>

            <div
              className="relative animate-scale-in"
              style={{ animationDelay: '180ms' }}
            >
              <HeroVideo
                src={HERO_VIDEO_SRC}
                poster={HERO_POSTER}
                title={
                  isFr ? 'Voir la vidéo de présentation' : 'Watch the intro video'
                }
              />
              {/* Floating stat card with subtle float animation */}
              <div className="hidden md:flex absolute -bottom-6 -left-6 items-center gap-3 rounded-xl bg-white shadow-xl ring-1 ring-black/5 px-5 py-3 animate-float">
                <div className="rounded-full bg-brand-green/10 p-2">
                  <FileText className="h-5 w-5 text-brand-green" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold font-heading">
                    {tHome('floatingStatTitle')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tHome('floatingStatBody')}
                  </p>
                </div>
              </div>
              <div
                className="hidden md:flex absolute -top-4 -right-4 items-center gap-2 rounded-full bg-white shadow-lg ring-1 ring-black/5 px-4 py-2 text-sm font-medium animate-float"
                style={{ animationDelay: '500ms' }}
              >
                <Globe className="h-4 w-4 text-brand-cobalt" />
                EN · FR
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — step-by-step */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #155eef 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="container">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
            <Badge
              variant="outline"
              className="rounded-full border-brand-cobalt/30 text-brand-cobalt"
            >
              {isFr ? 'Comment ça marche' : 'How it works'}
            </Badge>
            <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold tracking-tight">
              {tHome('howItWorksTitle')}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {tHome('howItWorksSubtitle')}
            </p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <ScrollReveal key={i} delay={i * 100}>
                  <Card className="card-lift relative border-2 hover:border-brand-cobalt/40 h-full bg-gradient-to-br from-white to-blue-50/30">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="rounded-lg bg-brand-cobalt/10 p-2.5 text-brand-cobalt transition-transform duration-300 group-hover:scale-110">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-heading text-3xl font-extrabold text-brand-cobalt/15 leading-none">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="font-heading font-semibold text-lg leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.body}
                      </p>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-gradient-to-b from-brand-smoke/40 to-white py-16 md:py-24 border-y">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 items-start">
            <ScrollReveal className="space-y-4 lg:sticky lg:top-24">
              <Badge
                variant="outline"
                className="rounded-full border-brand-orange/30 text-brand-orange"
              >
                {isFr ? 'Fonctionnalités' : 'Features'}
              </Badge>
              <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">
                {tHome('whyTitle')}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {tHome('whyBody')}
              </p>
              <div className="relative aspect-video rounded-xl overflow-hidden mt-6 ring-1 ring-black/5 shadow-lg group">
                <Image
                  src={SECTION_IMAGE}
                  alt={
                    isFr
                      ? 'Contremaître consultant un plan'
                      : 'Foreman reviewing a construction plan'
                  }
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/30 via-transparent to-transparent" />
              </div>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feat, i) => {
                const Icon = feat.icon
                // Alternate accent colors for visual rhythm
                const accent =
                  i % 3 === 0
                    ? 'text-brand-cobalt bg-brand-cobalt/10'
                    : i % 3 === 1
                      ? 'text-brand-orange bg-brand-orange/10'
                      : 'text-brand-green bg-brand-green/10'
                return (
                  <ScrollReveal key={i} delay={i * 80}>
                    <Card className="card-lift h-full">
                      <CardContent className="p-6 space-y-2">
                        <div
                          className={`rounded-md p-2 w-fit transition-transform duration-300 hover:scale-110 ${accent}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-heading font-semibold">
                          {feat.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feat.body}
                        </p>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Plan teaser */}
      <section className="py-16 md:py-24">
        <div className="container">
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-10">
            <Badge
              variant="outline"
              className="rounded-full border-brand-green/30 text-brand-green"
            >
              {isFr ? 'Tarification' : 'Pricing'}
            </Badge>
            <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold tracking-tight">
              {t('plans.title')}
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <ScrollReveal>
              <Card className="card-lift h-full">
                <CardContent className="p-7 space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('plans.payPerContract')}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-4xl font-extrabold text-brand-cobalt">
                      $99
                    </span>
                    <span className="text-muted-foreground">
                      {' '}
                      {t('plans.perContract')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('plans.plusTaxes')}
                  </p>
                  <ul className="space-y-1.5 text-sm pt-2">
                    <FeatureCheck>{tHome('plan1Feat1')}</FeatureCheck>
                    <FeatureCheck>{tHome('plan1Feat2')}</FeatureCheck>
                    <FeatureCheck>{tHome('plan1Feat3')}</FeatureCheck>
                  </ul>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-brand-cobalt/30 text-brand-cobalt hover:bg-brand-cobalt/5"
                  >
                    <Link href={`/${locale}/pricing`}>
                      {t('plans.getStarted')}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <Card className="card-lift border-2 border-brand-orange/40 relative h-full bg-gradient-to-br from-white via-orange-50/30 to-white">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="pro" className="rounded-full px-3 animate-fade-in">
                    {tHome('mostPopular')}
                  </Badge>
                </div>
                <CardContent className="p-7 space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('plans.pro')}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-4xl font-extrabold text-brand-orange">
                      $349
                    </span>
                    <span className="text-muted-foreground">
                      {' '}
                      {t('plans.perMonth')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('plans.plusTaxes')}
                  </p>
                  <ul className="space-y-1.5 text-sm pt-2">
                    <FeatureCheck>{tHome('plan2Feat1')}</FeatureCheck>
                    <FeatureCheck>{tHome('plan2Feat2')}</FeatureCheck>
                    <FeatureCheck>{tHome('plan2Feat3')}</FeatureCheck>
                    <FeatureCheck>{tHome('plan2Feat4')}</FeatureCheck>
                  </ul>
                  <Button
                    asChild
                    className="w-full btn-shimmer bg-brand-orange hover:bg-brand-orange/90 shadow-glow-orange"
                  >
                    <Link href={`/${locale}/pricing`}>
                      {t('plans.upgrade')}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gradient-to-b from-white to-brand-smoke/40 py-16 md:py-24 border-y">
        <div className="container max-w-3xl">
          <ScrollReveal className="text-center mb-10">
            <Badge
              variant="outline"
              className="rounded-full border-brand-cobalt/30 text-brand-cobalt"
            >
              FAQ
            </Badge>
            <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold tracking-tight">
              {tHome('faqTitle')}
            </h2>
          </ScrollReveal>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <details className="group rounded-lg border bg-background p-5 ring-glow [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between cursor-pointer font-medium font-heading">
                    {faq.q}
                    <span className="ml-4 shrink-0 rounded-full bg-brand-cobalt/10 text-brand-cobalt p-1.5 text-xs transition-transform duration-300 group-open:rotate-180">
                      <ArrowRight className="h-3 w-3 rotate-90" />
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="container">
          <ScrollReveal className="rounded-2xl bg-brand-cta px-8 py-14 md:px-16 md:py-20 text-center text-white shadow-xl relative overflow-hidden">
            {/* Animated radial overlay */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 30% 20%, rgba(249,115,22,0.4), transparent 50%), radial-gradient(circle at 70% 80%, rgba(55,202,55,0.25), transparent 50%)',
                animation: 'gradient-shift 12s ease-in-out infinite',
                backgroundSize: '200% 200%',
              }}
            />
            <div className="relative">
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">
              {tHome('finalCtaTitle')}
            </h2>
            <p className="mt-4 text-white/80 max-w-xl mx-auto">
              {tHome('finalCtaBody')}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="text-base h-12 px-6 btn-shimmer bg-white text-brand-cobalt hover:bg-white/95"
              >
                <Link href={`/${locale}/contracts/new`}>
                  {t('hero.ctaPrimary')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base h-12 px-6 bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href={`/${locale}/signup`}>{tc('signup')}</Link>
              </Button>
            </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}

function FeatureCheck({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="h-4 w-4 mt-0.5 text-brand-green shrink-0" />
      <span>{children}</span>
    </li>
  )
}
