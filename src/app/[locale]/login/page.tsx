'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { AlertCircle, Loader2, User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/routing'
import Particles from '@/components/ui/Particles'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export default function LoginPage() {
    const t = useTranslations('Login')
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setIsPending(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        // Validate
        if (!email || !email.includes('@')) {
            setError(t('error_email'))
            setIsPending(false)
            return
        }

        if (!password || password.length < 6) {
            setError(t('error_password_length'))
            setIsPending(false)
            return
        }

        // Use NextAuth's native redirect: false to handle errors locally
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            if (result.error.includes('INACTIVE_ACCOUNT')) {
                setError(t('error_inactive'))
            } else if (result.error === 'CredentialsSignin') {
                setError(t('error_invalid'))
            } else {
                setError(t('error_system'))
            }
            setIsPending(false)
        } else {
            // Success
            window.location.href = '/' // Redirect manually on success
        }
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4 overflow-hidden">
            {/* Aurora Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Particles */}
            <div className="absolute inset-0">
                <Particles
                    particleColors={['#dc2626', '#ef4444', '#ffffff']}
                    particleCount={150}
                    particleSpread={10}
                    speed={0.08}
                    particleBaseSize={80}
                    moveParticlesOnHover={true}
                    alphaParticles={false}
                    disableRotation={false}
                />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/30">
                            <span className="text-white font-bold text-sm">psw</span>
                        </div>
                        <span className="text-xl font-bold text-white font-serif">ProSektorWeb</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="relative p-8 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-700" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        <div className="relative">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white font-serif mb-2">{t('title')}</h1>
                            <p className="text-brand-100 text-sm flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                {t('description')}
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-8 bg-white">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('email_label')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="ornek@firma.com"
                                    required
                                    leadingIcon={<Mail className="w-5 h-5" />}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">{t('password_label')}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    leadingIcon={<Lock className="w-5 h-5" />}
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full py-7"
                                variant="gradient"
                                loading={isPending}
                            >
                                {t('submit')}
                                {!isPending && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-neutral-100 text-center space-y-3">
                            <p className="text-sm text-neutral-500">
                                {t('no_account')}{' '}
                                <Link href="/#iletisim" className="text-brand-600 font-semibold hover:underline">
                                    {t('contact_us')}
                                </Link>
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                            >
                                ← {t('back_home')}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 flex items-center justify-center gap-6 text-neutral-500">
                    <div className="flex items-center gap-2 text-xs">
                        <Lock className="w-3.5 h-3.5" />
                        <span>{t('ssl')}</span>
                    </div>
                    <div className="w-px h-4 bg-neutral-700" />
                    <div className="flex items-center gap-2 text-xs">
                        <span>{t('kvkk')}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
