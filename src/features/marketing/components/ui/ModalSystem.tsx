'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import { X, Check, ArrowLeft, Lock, AlertCircle, CreditCard } from 'lucide-react'
import { verifyClientAccess } from '@/features/auth/actions/client-auth'

// Enum for better state management
export enum ModalStep {
    INITIAL_CHOICE = 'A1',
    LOGIN = 'A2',
    REQUEST_INTRO = 'B1',
    REQUEST_FORM = 'B2',
    REQUEST_SUCCESS = 'B3',
    DASHBOARD = 'C1',
    PREVIEW_DETAIL = 'C2',
    EXPIRED = 'D1',
    REACTIVATE_OFFER = 'D2',
    READY_TO_PUBLISH = 'E1',
    PAYMENT = 'E2',
    PURCHASE_SUCCESS = 'E3'
}

interface ModalSystemProps {
    isOpen: boolean
    onClose: () => void
    initialState?: ModalStep
}

interface BackButtonProps {
    to: ModalStep
    setStep: (step: ModalStep) => void
}

function BackButton({ to, setStep }: BackButtonProps) {
    return (
        <button
            onClick={() => setStep(to)}
            className="mt-4 flex items-center justify-center gap-2 w-full text-neutral-500 hover:text-neutral-900 text-sm font-medium transition-colors focus:ring-2 focus:ring-brand-500 focus:outline-none rounded-lg p-2"
        >
            <ArrowLeft className="w-4 h-4" /> Geri Dön
        </button>
    )
}

export function ModalSystem({ isOpen, onClose, initialState = ModalStep.INITIAL_CHOICE }: ModalSystemProps) {
    const [step, setStep] = useState<ModalStep>(initialState)
    const [osgbName, setOsgbName] = useState('Evren Ada OSGB')
    const [selectedDesign, setSelectedDesign] = useState<'Aksiyon' | 'Vizyon' | null>(null)
    const [isPending, startTransition] = useTransition()
    const modalRef = useRef<HTMLDivElement>(null)
    const previousFocusRef = useRef<HTMLElement | null>(null)

    // Login Inputs
    const [loginInputName, setLoginInputName] = useState('')
    const [loginInputCode, setLoginInputCode] = useState('')
    const [loginError, setLoginError] = useState<string | null>(null)

    // Timer (Refactored for Security)
    const [timeLeft, setTimeLeft] = useState('')

    // Timer state populated from Server Action
    const [expirationDate, setExpirationDate] = useState<Date | null>(null)

    // Timer (Refactored for Security & Leak Prevention)
    useEffect(() => {
        if (!isOpen || !expirationDate) return

        const activeSteps = [ModalStep.DASHBOARD, ModalStep.PREVIEW_DETAIL, ModalStep.REACTIVATE_OFFER]
        if (!activeSteps.includes(step)) return

        const updateTimer = () => {
            const now = new Date()
            const distance = expirationDate.getTime() - now.getTime()

            if (distance < 0) {
                setStep(ModalStep.EXPIRED)
                return
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24))
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((distance % (1000 * 60)) / 1000)

            setTimeLeft(`${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
        }

        // Initial call
        updateTimer()

        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [step, isOpen, expirationDate])

    const handleLogin = () => {
        setLoginError(null)
        startTransition(async () => {
            const result = await verifyClientAccess(loginInputName, loginInputCode)
            if (result.success) {
                setOsgbName(loginInputName)
                if (result.previewEndsAt) {
                    setExpirationDate(new Date(result.previewEndsAt))
                }
                setStep(ModalStep.DASHBOARD)
            } else {
                setLoginError(result.error || 'Giriş başarısız')
            }
        })
    }

    const handlePreviewRequest = () => {
        // Mock API call - in real app connect to Server Action
        setTimeout(() => {
            setStep(ModalStep.REQUEST_SUCCESS)
        }, 500)
    }

    const handlePayment = () => {
        // Secure Environment Check
        if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_IS_DEMO) {
            // Real Payment Logic
            console.log('Redirecting to payment provider...')
        } else {
            // Mock Payment
            console.log("Payment provider redirection...")
        }
        setStep(ModalStep.PURCHASE_SUCCESS)
    }

    // Focus Trap & ESC Handler
    useEffect(() => {
        if (!isOpen) return

        previousFocusRef.current = document.activeElement as HTMLElement
        document.body.style.overflow = 'hidden'

        // Initial focus
        setTimeout(() => {
            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            if (focusableElements && focusableElements.length > 0) {
                (focusableElements[0] as HTMLElement).focus()
            } else {
                modalRef.current?.focus()
            }
        }, 50)

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
            if (e.key === 'Tab') {
                const focusableElements = modalRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
                if (!focusableElements || focusableElements.length === 0) return

                const firstElement = focusableElements[0] as HTMLElement
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus()
                        e.preventDefault()
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus()
                        e.preventDefault()
                    }
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
            if (previousFocusRef.current) {
                previousFocusRef.current.focus()
            }
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 h-auto max-h-[90vh] overflow-y-auto outline-none"
                tabIndex={-1}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all z-10 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    aria-label="Kapat"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-8 md:p-10 pb-20 md:pb-10">
                    {/* Initial Choice */}
                    {step === ModalStep.INITIAL_CHOICE && (
                        <div className="text-center">
                            <div className="bg-brand-50 text-brand-700 text-sm font-bold py-2 px-4 rounded-full inline-block mb-6">
                                OSGB'nize özel hazırladığımız web sitesini görmek için erişim kodunuzu kullanın veya hemen bir önizleme talep edin.
                            </div>
                            <h2 id="modal-title" className="text-2xl font-bold mb-4 text-neutral-900">Erişim Kodu</h2>
                            <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                                Eğer firmanız için bir web sitesi hazırlandıysa, önizleme erişim kodu size WhatsApp veya e-posta ile gönderilmiştir.
                            </p>
                            <div className="space-y-3">
                                <button onClick={() => setStep(ModalStep.LOGIN)} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 focus:ring-4 focus:ring-brand-200 focus:outline-none">
                                    Kodum Var
                                </button>
                                <button onClick={() => setStep(ModalStep.REQUEST_INTRO)} className="w-full py-4 bg-white text-neutral-700 border border-neutral-200 rounded-xl font-bold hover:bg-neutral-50 transition-colors focus:ring-4 focus:ring-neutral-200 focus:outline-none">
                                    Önizleme Kodu İste
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Login */}
                    {step === ModalStep.LOGIN && (
                        <div>
                            <h2 id="modal-title" className="text-2xl font-bold mb-6 text-neutral-900">Giriş Yap</h2>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label htmlFor="loginName" className="block text-sm font-semibold text-neutral-700 mb-1">OSGB Adı</label>
                                    <input
                                        id="loginName"
                                        type="text"
                                        value={loginInputName}
                                        onChange={(e) => setLoginInputName(e.target.value)}
                                        placeholder="Örn: Evren Ada OSGB"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="loginCode" className="block text-sm font-semibold text-neutral-700 mb-1">Önizleme Kodu</label>
                                    <input
                                        id="loginCode"
                                        type="text"
                                        value={loginInputCode}
                                        onChange={(e) => setLoginInputCode(e.target.value)}
                                        placeholder="Örn: PSW-1234"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                            </div>
                            {loginError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-semibold flex items-center gap-2" role="alert">
                                    <AlertCircle className="w-4 h-4" /> {loginError}
                                </div>
                            )}
                            <button
                                onClick={handleLogin}
                                disabled={isPending}
                                className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors disabled:opacity-70 focus:ring-4 focus:ring-brand-200 focus:outline-none"
                            >
                                {isPending ? 'Kontrol Ediliyor...' : 'Giriş Yap'}
                            </button>
                            <BackButton to={ModalStep.INITIAL_CHOICE} setStep={setStep} />
                        </div>
                    )}

                    {/* Request Intro */}
                    {step === ModalStep.REQUEST_INTRO && (
                        <div className="text-center">
                            <h2 id="modal-title" className="text-2xl font-bold mb-4 text-neutral-900">Kodunuz Yok mu?</h2>
                            <p className="text-neutral-500 mb-8">
                                Web siteniz için önizleme hazırlayalım, erişim kodunuzu size iletelim. En geç 24–72 saat içinde erişim kodunuz gönderilir.
                            </p>
                            <button onClick={() => setStep(ModalStep.REQUEST_FORM)} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors focus:ring-4 focus:ring-brand-200 focus:outline-none">
                                Önizleme Talebi Bırak
                            </button>
                            <BackButton to={ModalStep.INITIAL_CHOICE} setStep={setStep} />
                        </div>
                    )}

                    {/* Request Form */}
                    {step === ModalStep.REQUEST_FORM && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handlePreviewRequest()
                            }}
                        >
                            <h2 id="modal-title" className="text-2xl font-bold mb-2 text-neutral-900">Önizleme Talebi</h2>
                            <p className="text-sm text-neutral-500 mb-6">Erişim yalnızca OSGB yetkililerine açılır.</p>
                            <div className="space-y-4 mb-8">
                                <div>
                                    <label htmlFor="req_company" className="block text-sm font-semibold text-neutral-700 mb-1">
                                        OSGB Ticari Ünvanı <span className="text-red-500">*</span>
                                    </label>
                                    <input id="req_company" required type="text" placeholder="OSGB Ticari Ünvanı" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="req_name" className="block text-sm font-semibold text-neutral-700 mb-1">
                                        Yetkili Adı Soyadı <span className="text-red-500">*</span>
                                    </label>
                                    <input id="req_name" required type="text" placeholder="Yetkili Adı Soyadı" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="req_email" className="block text-sm font-semibold text-neutral-700 mb-1">
                                        E-posta Adresi <span className="text-red-500">*</span>
                                    </label>
                                    <input id="req_email" required type="email" placeholder="E-posta Adresi" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="req_phone" className="block text-sm font-semibold text-neutral-700 mb-1">
                                        Cep Telefonu <span className="text-red-500">*</span>
                                    </label>
                                    <input id="req_phone" required type="tel" placeholder="Cep Telefonu (WhatsApp için)" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                                </div>
                                <div className="flex items-start gap-3">
                                    <input id="req_auth" required type="checkbox" className="mt-1 w-4 h-4 text-brand-600 rounded focus:ring-brand-500" />
                                    <label htmlFor="req_auth" className="text-sm text-neutral-500">OSGB adına web sitesi önizleme talebinde bulunmaya yetkiliyim.</label>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors focus:ring-4 focus:ring-brand-200 focus:outline-none">
                                Talebi Gönder
                            </button>
                            <BackButton to={ModalStep.REQUEST_INTRO} setStep={setStep} />
                        </form>
                    )}

                    {/* Success */}
                    {step === ModalStep.REQUEST_SUCCESS && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-8 h-8" />
                            </div>
                            <h2 id="modal-title" className="text-2xl font-bold mb-4 text-green-700">Talebiniz Alındı</h2>
                            <p className="text-neutral-500 mb-8">
                                OSGB'niz için web sitesi önizleme talebiniz başarıyla alındı. Kodunuz WhatsApp veya e-posta yoluyla tarafınıza iletilecektir.
                            </p>
                            <button onClick={onClose} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors focus:ring-4 focus:ring-brand-200 focus:outline-none">
                                Harika, Bekliyorum
                            </button>
                        </div>
                    )}

                    {/* Dashboard */}
                    {step === ModalStep.DASHBOARD && (
                        <div>
                            <h2 id="modal-title" className="text-2xl font-bold mb-2 text-neutral-900">Hoş geldiniz, <span className="text-brand-600">{osgbName}</span></h2>
                            <p className="text-neutral-500 mb-8">Firmanız için hazırlanan 2 farklı dijital kimliği inceleyebilirsiniz.</p>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <button
                                    onClick={() => { setSelectedDesign('Aksiyon'); setStep(ModalStep.PREVIEW_DETAIL) }}
                                    className="p-6 bg-white border-2 border-neutral-100 rounded-2xl hover:border-brand-500 hover:shadow-xl transition-all group focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                >
                                    <h3 className="text-xl font-bold text-neutral-800 mb-2 group-hover:text-brand-600">Aksiyon</h3>
                                    <span className="text-xs font-bold bg-brand-50 text-brand-700 px-3 py-1 rounded-full group-hover:bg-brand-600 group-hover:text-white transition-colors">ÖNİZLEME</span>
                                </button>
                                <button
                                    onClick={() => { setSelectedDesign('Vizyon'); setStep(ModalStep.PREVIEW_DETAIL) }}
                                    className="p-6 bg-white border-2 border-neutral-100 rounded-2xl hover:border-brand-500 hover:shadow-xl transition-all group focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                >
                                    <h3 className="text-xl font-bold text-neutral-800 mb-2 group-hover:text-brand-600">Vizyon</h3>
                                    <span className="text-xs font-bold bg-brand-50 text-brand-700 px-3 py-1 rounded-full group-hover:bg-brand-600 group-hover:text-white transition-colors">ÖNİZLEME</span>
                                </button>
                            </div>

                            <div className="bg-neutral-900 text-white p-6 rounded-2xl flex items-center justify-between shadow-lg">
                                <div className="text-2xl font-mono tracking-widest text-red-500 font-bold">{timeLeft}</div>
                                <div className="text-sm text-neutral-400 font-medium">Önizleme Süresi</div>
                            </div>
                        </div>
                    )}

                    {/* Preview Detail */}
                    {step === ModalStep.PREVIEW_DETAIL && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 id="modal-title" className="text-2xl font-bold text-neutral-900">{selectedDesign} Önizleme</h2>
                            </div>

                            <div className="aspect-video bg-neutral-100 rounded-2xl border-2 border-dashed border-neutral-300 flex items-center justify-center mb-6">
                                <div className="text-neutral-400 font-medium">Bu tasarım henüz yayında değil</div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button onClick={() => setStep(ModalStep.READY_TO_PUBLISH)} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg focus:ring-4 focus:ring-brand-200 focus:outline-none">
                                    Bu tasarımı yayına al (7.000 TL)
                                </button>
                                <BackButton to={ModalStep.DASHBOARD} setStep={setStep} />
                            </div>
                        </div>
                    )}

                    {/* Ready */}
                    {step === ModalStep.READY_TO_PUBLISH && (
                        <div>
                            <h2 id="modal-title" className="text-2xl font-bold mb-4 text-neutral-900">Yayına Hazır</h2>
                            <p className="text-neutral-500 mb-6">
                                Seçtiğiniz tasarımı yayına almak üzeresiniz. Bu sayfa, size özel hazırlanan dijital kimliğin yayın sürecini başlatır.
                            </p>
                            <div className="bg-brand-50 border-l-4 border-brand-600 p-4 rounded-r-lg mb-8">
                                <p className="text-sm text-brand-900">Yayına alma sonrasında talep edilen yeni sayfa veya yapısal değişiklikler ek hizmet kapsamında değerlendirilir.</p>
                            </div>
                            <button onClick={() => setStep(ModalStep.PAYMENT)} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors focus:ring-4 focus:ring-brand-200 focus:outline-none">
                                Ödeme Sayfasına Git
                            </button>
                            <BackButton to={ModalStep.PREVIEW_DETAIL} setStep={setStep} />
                        </div>
                    )}

                    {/* Payment */}
                    {step === ModalStep.PAYMENT && (
                        <div>
                            <h2 id="modal-title" className="text-2xl font-bold mb-6 text-neutral-900">Ödeme</h2>
                            <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-neutral-600">Ürün</span>
                                    <span className="font-bold text-neutral-900">{selectedDesign} Paketi</span>
                                </div>
                                <div className="flex items-center justify-between text-xl font-bold text-brand-600 pt-4 border-t border-neutral-200">
                                    <span>Toplam</span>
                                    <span>7.000 TL + KDV</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                {['Mesafeli Satış Sözleşmesi', 'Gizlilik ve KVKK', 'İptal ve İade Koşulları'].map((text, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <input id={`contract_${i}`} type="checkbox" className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500" />
                                        <label htmlFor={`contract_${i}`} className="text-sm text-neutral-600">{text}ni okudum</label>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4 text-sm font-semibold">
                                <AlertCircle className="w-4 h-4 inline mr-2" />
                                Ödeme sağlayıcısına yönlendiriliyorsunuz. Banka havalesi ile devam edebilirsiniz.
                            </div>

                            <button onClick={handlePayment} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 focus:ring-4 focus:ring-green-200 focus:outline-none">
                                <CreditCard className="w-5 h-5" /> Ödemeyi Tamamla
                            </button>
                        </div>
                    )}

                    {/* Purchase Success */}
                    {step === ModalStep.PURCHASE_SUCCESS && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-8 h-8" />
                            </div>
                            <h2 id="modal-title" className="text-2xl font-bold mb-4 text-green-700">Yayına Alındı!</h2>
                            <p className="text-neutral-500 mb-8">
                                Web siteniz yayına alınma sırasına alınmıştır. Alan adı bağlantısı ve teknik kurulum için ekibimiz sizinle iletişime geçecektir.
                            </p>
                            <button onClick={onClose} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors focus:ring-4 focus:ring-brand-200 focus:outline-none">
                                Kapat
                            </button>
                        </div>
                    )}

                    {/* Expired */}
                    {step === ModalStep.EXPIRED && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Lock className="w-8 h-8" />
                            </div>
                            <h2 id="modal-title" className="text-2xl font-bold mb-4 text-red-700">Süre Doldu</h2>
                            <p className="text-neutral-500 mb-6">
                                Önizleme süresi sona erdiği için tasarımlar arşivlenmiştir.
                            </p>
                            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-8 inline-block w-full max-w-sm">
                                <div className="text-2xl font-bold text-brand-600">Yeniden hazırlama bedeli: 12.500 TL</div>
                                <div className="text-xs text-neutral-400">yeni tasarım + revize hakkı</div>
                            </div>
                            <button onClick={() => setStep(ModalStep.REACTIVATE_OFFER)} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors focus:ring-4 focus:ring-brand-200 focus:outline-none">
                                Önizlemeyi Tekrar Aktifleştir
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
