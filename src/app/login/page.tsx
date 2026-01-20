'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { AlertCircle, Loader2, User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Particles from '@/components/ui/Particles'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()
    const { status } = useSession()

    // Redirect if already authenticated
    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/portal')
        }
    }, [status, router])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setIsPending(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        // Validate
        if (!email || !email.includes('@')) {
            setError('Lütfen geçerli bir e-posta adresi girin.')
            setIsPending(false)
            return
        }

        if (!password || password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.')
            setIsPending(false)
            return
        }

        try {
            console.log('[LOGIN] Attempting signIn for:', email)

            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            console.log('[LOGIN] SignIn result:', result)

            if (result?.error) {
                console.log('[LOGIN] Error:', result.error)
                setError('E-posta veya şifre hatalı.')
                setIsPending(false)
                return
            }

            if (result?.ok) {
                console.log('[LOGIN] Success, redirecting to /portal')
                router.push('/portal')
                router.refresh()
            }

        } catch (err) {
            console.error('[LOGIN] Exception:', err)
            setError('Beklenmeyen bir hata oluştu.')
            setIsPending(false)
        }
    }

    // Show loading while checking session
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
        )
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
                            <h1 className="text-2xl font-bold text-white font-serif mb-2">Müşteri Paneli</h1>
                            <p className="text-brand-100 text-sm flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Projelerinizi takip edin
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-8 bg-white">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-neutral-700">E-posta Adresi</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                    <input
                                        className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-neutral-900 placeholder-neutral-400"
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="ornek@firma.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-neutral-700">Şifre</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                    <input
                                        className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-neutral-900"
                                        id="password"
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 border border-red-100">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="group w-full py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Giriş Yapılıyor...
                                    </>
                                ) : (
                                    <>
                                        Panele Giriş Yap
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-neutral-100 text-center space-y-3">
                            <p className="text-sm text-neutral-500">
                                Henüz hesabınız yok mu?{' '}
                                <Link href="/#iletisim" className="text-brand-600 font-semibold hover:underline">
                                    İletişime geçin
                                </Link>
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                            >
                                ← Ana sayfaya dön
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 flex items-center justify-center gap-6 text-neutral-500">
                    <div className="flex items-center gap-2 text-xs">
                        <Lock className="w-3.5 h-3.5" />
                        <span>256-bit SSL</span>
                    </div>
                    <div className="w-px h-4 bg-neutral-700" />
                    <div className="flex items-center gap-2 text-xs">
                        <span>KVKK Uyumlu</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
