'use client'

import React, { useState, useEffect } from 'react'
import { X, Check, Timer, ArrowLeft, Lock, AlertCircle, CreditCard, Clock } from 'lucide-react'

export type ModalState =
    | 'A1' | 'A2' // Initial / Login
    | 'B1' | 'B2' | 'B3' // Request Flow
    | 'C1' | 'C2' // Dashboard / Preview
    | 'D1' | 'D2' // Expired / Reactivate
    | 'E1' | 'E2' | 'E3' // Purchase Flow

interface ModalSystemProps {
    isOpen: boolean
    onClose: () => void
    initialState?: ModalState
}

export function ModalSystem({ isOpen, onClose, initialState = 'A1' }: ModalSystemProps) {
    const [step, setStep] = useState<ModalState>(initialState)
    const [osgbName, setOsgbName] = useState('Evren Ada OSGB')
    const [selectedDesign, setSelectedDesign] = useState<'Aksiyon' | 'Vizyon' | null>(null)

    // Login Inputs
    const [loginInputName, setLoginInputName] = useState('')
    const [loginInputCode, setLoginInputCode] = useState('')
    const [loginError, setLoginError] = useState(false)

    // Timer
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        if (isOpen) {
            setStep(initialState)
        }
    }, [isOpen, initialState])

    // Timer Logic
    useEffect(() => {
        if (step === 'C1' || step === 'C2' || step === 'D2') {
            const interval = setInterval(() => {
                // Mock countdown
                const now = new Date()
                // Just a static-ish countdown for demo
                setTimeLeft("06:23:59:54")
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [step])

    const handleLogin = () => {
        if (loginInputName === "Evren Ada OSGB" && loginInputCode === "PSW-1234") {
            setOsgbName(loginInputName)
            setLoginError(false)
            setStep('C1')
        } else {
            setLoginError(true)
        }
    }

    const handlePreviewRequest = () => {
        // Mock API call
        setTimeout(() => {
            setStep('B3')
        }, 500)
    }

    const handlePayment = () => {
        setStep('E3')
    }

    if (!isOpen) return null

    // --- RENDER HELPERS ---
    const BackButton = ({ to }: { to: ModalState }) => (
        <button
            onClick={() => setStep(to)}
            className="mt-4 flex items-center justify-center gap-2 w-full text-neutral-500 hover:text-neutral-900 text-sm font-medium transition-colors"
        >
            <ArrowLeft className="w-4 h-4" /> Geri Dön
        </button>
    )

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-8 md:p-10">

                    {/* A1: Initial Choice */}
                    {step === 'A1' && (
                        <div className="text-center">
                            <div className="bg-brand-50 text-brand-700 text-sm font-bold py-2 px-4 rounded-full inline-block mb-6">
                                Önizleme alanı yalnızca adına özel çalışma yapılan OSGB’lere açılır.
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-neutral-900">Erişim Kodu</h2>
                            <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                                Eğer firmanız için bir web sitesi hazırlandıysa, önizleme erişim kodu size WhatsApp veya e-posta ile gönderilmiştir.
                            </p>
                            <div className="space-y-3">
                                <button onClick={() => setStep('A2')} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200">
                                    Kodum Var
                                </button>
                                <button onClick={() => setStep('B1')} className="w-full py-4 bg-white text-neutral-700 border border-neutral-200 rounded-xl font-bold hover:bg-neutral-50 transition-colors">
                                    Kodum Yok
                                </button>
                            </div>
                        </div>
                    )}

                    {/* A2: Login */}
                    {step === 'A2' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-neutral-900">Giriş Yap</h2>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-1">OSGB Adı</label>
                                    <input
                                        type="text"
                                        value={loginInputName}
                                        onChange={(e) => setLoginInputName(e.target.value)}
                                        placeholder="Örn: Evren Ada OSGB"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-1">Önizleme Kodu</label>
                                    <input
                                        type="text"
                                        value={loginInputCode}
                                        onChange={(e) => setLoginInputCode(e.target.value)}
                                        placeholder="Örn: PSW-1234"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                            </div>
                            {loginError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-semibold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Hatalı OSGB adı veya kod!
                                </div>
                            )}
                            <button onClick={handleLogin} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors">
                                Giriş Yap
                            </button>
                            <BackButton to="A1" />
                        </div>
                    )}

                    {/* B1: No Code Intro */}
                    {step === 'B1' && (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4 text-neutral-900">Kodunuz Yok mu?</h2>
                            <p className="text-neutral-500 mb-8">
                                Web siteniz için önizleme hazırlayalım, erişim kodunuzu size iletelim. En geç 24–72 saat içinde erişim kodunuz gönderilir.
                            </p>
                            <button onClick={() => setStep('B2')} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors">
                                Önizleme Talebi Bırak
                            </button>
                            <BackButton to="A1" />
                        </div>
                    )}

                    {/* B2: Request Form */}
                    {step === 'B2' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-2 text-neutral-900">Önizleme Talebi</h2>
                            <p className="text-sm text-neutral-500 mb-6">Erişim yalnızca OSGB yetkililerine açılır.</p>
                            <div className="space-y-4 mb-8">
                                <input type="text" placeholder="OSGB Ticari Ünvanı" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg" />
                                <input type="text" placeholder="Yetkili Adı Soyadı" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg" />
                                <input type="email" placeholder="E-posta Adresi" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg" />
                                <input type="tel" placeholder="Cep Telefonu (WhatsApp için)" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg" />
                                <div className="flex items-start gap-3">
                                    <input type="checkbox" className="mt-1 w-4 h-4 text-brand-600 rounded" />
                                    <label className="text-sm text-neutral-500">OSGB adına web sitesi önizleme talebinde bulunmaya yetkiliyim.</label>
                                </div>
                            </div>
                            <button onClick={handlePreviewRequest} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors">
                                Talebi Gönder
                            </button>
                            <BackButton to="B1" />
                        </div>
                    )}

                    {/* B3: Success */}
                    {step === 'B3' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-green-700">Talebiniz Alındı</h2>
                            <p className="text-neutral-500 mb-8">
                                OSGB’niz için web sitesi önizleme talebiniz başarıyla alındı. Kodunuz WhatsApp veya e-posta yoluyla tarafınıza iletilecektir.
                            </p>
                            <button onClick={onClose} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors">
                                Anlaşıldı
                            </button>
                        </div>
                    )}

                    {/* C1: Dashboard */}
                    {step === 'C1' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-2 text-neutral-900">Hoş geldiniz, <span className="text-brand-600">{osgbName}</span></h2>
                            <p className="text-neutral-500 mb-8">Firmanız için hazırlanan 2 farklı dijital kimliği inceleyebilirsiniz.</p>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <button
                                    onClick={() => { setSelectedDesign('Aksiyon'); setStep('C2') }}
                                    className="p-6 bg-white border-2 border-neutral-100 rounded-2xl hover:border-brand-500 hover:shadow-xl transition-all group"
                                >
                                    <h3 className="text-xl font-bold text-neutral-800 mb-2 group-hover:text-brand-600">Aksiyon</h3>
                                    <span className="text-xs font-bold bg-brand-50 text-brand-700 px-3 py-1 rounded-full group-hover:bg-brand-600 group-hover:text-white transition-colors">ÖNİZLEME</span>
                                </button>
                                <button
                                    onClick={() => { setSelectedDesign('Vizyon'); setStep('C2') }}
                                    className="p-6 bg-white border-2 border-neutral-100 rounded-2xl hover:border-brand-500 hover:shadow-xl transition-all group"
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

                    {/* C2: Preview Detail */}
                    {step === 'C2' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-neutral-900">{selectedDesign} Önizleme</h2>
                            </div>

                            <div className="aspect-video bg-neutral-100 rounded-2xl border-2 border-dashed border-neutral-300 flex items-center justify-center mb-6">
                                <div className="text-neutral-400 font-medium">Bu tasarım henüz yayında değil</div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button onClick={() => setStep('E1')} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg">
                                    Bu tasarımı yayına al (7.000 TL)
                                </button>
                                <BackButton to="C1" />
                            </div>
                        </div>
                    )}

                    {/* E1: Ready */}
                    {step === 'E1' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-neutral-900">Yayına Hazır</h2>
                            <p className="text-neutral-500 mb-6">
                                Seçtiğiniz tasarımı yayına almak üzeresiniz. Bu sayfa, size özel hazırlanan dijital kimliğin yayın sürecini başlatır.
                            </p>
                            <div className="bg-brand-50 border-l-4 border-brand-600 p-4 rounded-r-lg mb-8">
                                <p className="text-sm text-brand-900">Yayına alma sonrasında talep edilen yeni sayfa veya yapısal değişiklikler ek hizmet kapsamında değerlendirilir.</p>
                            </div>
                            <button onClick={() => setStep('E2')} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors">
                                Ödeme Sayfasına Git
                            </button>
                            <BackButton to="C2" />
                        </div>
                    )}

                    {/* E2: Payment */}
                    {step === 'E2' && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-neutral-900">Ödeme</h2>
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
                                        <input type="checkbox" className="w-4 h-4 text-brand-600 rounded" />
                                        <label className="text-sm text-neutral-600">{text}ni okudum</label>
                                    </div>
                                ))}
                            </div>

                            <button onClick={handlePayment} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                                <CreditCard className="w-5 h-5" /> Ödemeyi Tamamla
                            </button>
                        </div>
                    )}

                    {/* E3: Purchase Success */}
                    {step === 'E3' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-green-700">Yayına Alındı!</h2>
                            <p className="text-neutral-500 mb-8">
                                Web siteniz yayına alınma sırasına alınmıştır. Alan adı bağlantısı ve teknik kurulum için ekibimiz sizinle iletişime geçecektir.
                            </p>
                            <button onClick={onClose} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors">
                                Kapat
                            </button>
                        </div>
                    )}

                    {/* D1: Expired */}
                    {step === 'D1' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Lock className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4 text-red-700">Süre Doldu</h2>
                            <p className="text-neutral-500 mb-6">
                                Önizleme süresi sona erdiği için tasarımlar arşivlenmiştir.
                            </p>
                            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-8 inline-block w-full max-w-sm">
                                <div className="text-sm text-neutral-500 line-through">Eski Fiyat: 7.000 TL</div>
                                <div className="text-2xl font-bold text-brand-600">Yeni Fiyat: 12.500 TL</div>
                                <div className="text-xs text-neutral-400">Yeniden Aktifleştirme Bedeli</div>
                            </div>
                            <button onClick={() => setStep('D2')} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors">
                                Önizlemeyi Tekrar Aktifleştir
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
