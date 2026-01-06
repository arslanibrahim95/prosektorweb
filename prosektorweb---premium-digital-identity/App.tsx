
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  MessageCircle, 
  Mail, 
  Instagram, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  X, 
  Sparkles,
  Zap,
  Globe,
  ArrowRight
} from 'lucide-react';
import { aiAPI } from './services/api';
import { ModalType } from './types';

// Components
const Navbar = ({ onOpenPrice }: { onOpenPrice: () => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/5">
    <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      <div className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
        psw
      </div>
      <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
        <a href="#neden-biz" className="hover:text-white transition-colors">Neden Biz?</a>
        <a href="#nasil-calisir" className="hover:text-white transition-colors">Nasıl Çalışır?</a>
        <a href="#tasarimlar" className="hover:text-white transition-colors">Tasarımlar</a>
        <a href="#iletisim" className="hover:text-white transition-colors">İletişim</a>
        <button 
          onClick={onOpenPrice}
          className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-2 rounded-full font-bold text-white hover:scale-105 transition active:scale-95 shadow-lg shadow-orange-900/20"
        >
          TEK FİYAT
        </button>
      </div>
    </div>
  </nav>
);

const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title?: string; 
  children: React.ReactNode 
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-lg p-8 relative shadow-2xl animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
        {title && <h3 className="text-2xl font-bold text-white mb-6 pr-8">{title}</h3>}
        {children}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
  const [timeLeft, setTimeLeft] = useState(168 * 3600);
  const [industry, setIndustry] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleAIAnalysis = async () => {
    if (!industry.trim()) return;
    setIsAnalyzing(true);
    try {
      const response = await aiAPI.analyzeIndustry(industry);
      setAnalysis(response.data.analysis || "Analiz yapılamadı, lütfen tekrar deneyin.");
    } catch (error: any) {
      console.error(error);
      setAnalysis(error.response?.data?.error || "AI servisine şu an ulaşılamıyor. Lütfen daha sonra deneyin.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const closeModal = () => setActiveModal(ModalType.NONE);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/30 overflow-x-hidden">
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 bg-grid -z-10 opacity-30" />
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-900/20 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-900/10 blur-[120px] rounded-full -z-10" />

      <Navbar onOpenPrice={() => setActiveModal(ModalType.LEGAL)} />

      {/* HERO SECTION */}
      <section className="relative pt-48 pb-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-start gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-orange-400 text-sm font-semibold animate-pulse">
            <Zap size={16} />
            7 Günlük Özel Teklif Yayında
          </div>
          <h1 className="text-5xl md:text-8xl font-extrabold leading-[1.1] tracking-tight">
            Merhaba,<br />
            <span className="text-gray-500">Senin için web siteni</span><br />
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">tasarladık bile.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            Markanızın dijital geleceği artık bir soru işareti değil. Sektörünüzü taradık, 
            rakiplerinizi analiz ettik ve size özel dijital kimliğinizi hazırladık.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => setActiveModal(ModalType.LOGIN)}
              className="group relative flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full text-xl font-bold transition-all hover:scale-105 active:scale-95"
            >
              <span>Web Sitemi Gör</span>
              <div className="bg-black text-white rounded-full p-1 group-hover:translate-x-1 transition-transform">
                <ChevronRight size={24} />
              </div>
            </button>
            <button 
              onClick={() => setActiveModal(ModalType.AI_CHAT)}
              className="group flex items-center gap-4 glass px-10 py-5 rounded-full text-xl font-bold border-white/20 hover:bg-white/10 transition-all"
            >
              <Sparkles className="text-orange-400" />
              <span>Sektör Analizi Al</span>
            </button>
          </div>
        </div>
      </section>

      {/* STATS / WHY US */}
      <section id="neden-biz" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">Neden Biz?</h2>
            <div className="space-y-6 text-xl text-gray-400 leading-relaxed">
              <p>
                Geleneksel ajans modellerini yıktık. Biz sadece bir tasarım ekibi değil, 
                veri odaklı bir <span className="text-white font-semibold">dijital kimlik fabrikasıyız.</span>
              </p>
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div>
                  <div className="text-4xl font-bold text-orange-500 mb-2">168s</div>
                  <div className="text-sm text-gray-500 uppercase tracking-widest">Karar Süresi</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-red-500 mb-2">7K</div>
                  <div className="text-sm text-gray-500 uppercase tracking-widest">Tek Fiyat Modeli</div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="glass p-8 rounded-3xl border-white/5 hover:border-orange-500/50 transition-colors group">
              <div className="bg-orange-500/20 w-12 h-12 rounded-2xl flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform">
                <Globe size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Küresel Standart</h3>
              <p className="text-gray-400">Dünya standartlarında SEO uyumlu ve hız odaklı mimari yapılar sunuyoruz.</p>
            </div>
            <div className="glass p-8 rounded-3xl border-white/5 hover:border-red-500/50 transition-colors group">
              <div className="bg-red-500/20 w-12 h-12 rounded-2xl flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Yıldırım Hızı</h3>
              <p className="text-gray-400">Tasarım süreci haftalar sürmez; ihtiyacınız olan her şey masada, hazır bekliyor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section id="nasil-calisir" className="py-24 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Nasıl Çalışır?</h2>
            <p className="text-gray-400 text-lg">Karmaşık süreçler yok, net bir yol haritası var.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: '01', title: 'Analiz', text: 'İş modeliniz ve sektörel rakipleriniz yapay zeka ile taranır.' },
              { label: '02', title: 'Ön İzleme', text: 'Markanıza özel 3 canlı demo tasarımı anında sunulur.' },
              { label: '03', title: 'İnceleme', text: 'Size tanınan 168 saatlik değerlendirme süreci başlar.' },
              { label: '04', title: 'Final', text: 'Seçilen kimlik aynı gün içinde küresel yayına alınır.' },
            ].map((step, i) => (
              <div key={i} className="glass p-8 rounded-[40px] relative overflow-hidden group">
                <div className="text-8xl font-black text-white/5 absolute -top-4 -right-4 group-hover:text-white/10 transition-colors">
                  {step.label}
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4 text-orange-500">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESIGNS SHOWCASE */}
      <section id="tasarimlar" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Tasarımlarınızı İnceleyin</h2>
          <p className="text-gray-400">Farklı iş karakterleri için kurgulanmış 3 eşsiz vizyon.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Prestij', 
              sub: 'Kurumsal & Otoriter', 
              desc: 'Geleneksel gücü modern sadelikle birleştiren ağırbaşlı bir duruş.',
              gradient: 'from-blue-600 to-blue-900'
            },
            { 
              title: 'Aksiyon', 
              sub: 'Dinamik & Hızlı', 
              desc: 'Dönüşüm odaklı, kullanıcıyı harekete geçiren enerjik bir deneyim.',
              gradient: 'from-orange-600 to-red-600'
            },
            { 
              title: 'Vizyon', 
              sub: 'Modern & Yenilikçi', 
              desc: 'Geleceği bugünden yaşatan, teknoloji odaklı minimalist bir yaklaşım.',
              gradient: 'from-purple-600 to-indigo-900'
            }
          ].map((card, i) => (
            <div 
              key={i} 
              className="group relative h-[450px] rounded-[48px] overflow-hidden cursor-pointer"
              onClick={() => setActiveModal(ModalType.LOGIN)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90 group-hover:scale-105 transition-transform duration-700`} />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
              <div className="relative h-full p-10 flex flex-col justify-end">
                <h3 className="text-4xl font-black mb-1">{card.title}</h3>
                <p className="text-orange-300 font-bold mb-4 tracking-wider uppercase text-xs">{card.sub}</p>
                <p className="text-white/80 line-clamp-2 mb-6 group-hover:line-clamp-none transition-all duration-300">{card.desc}</p>
                <div className="flex items-center gap-2 font-bold text-sm bg-white/20 backdrop-blur w-fit px-6 py-3 rounded-full hover:bg-white/30 transition-colors">
                  TASARIMI GÖR <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING STICKY / CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#111] to-black rounded-[60px] p-12 md:p-20 text-center border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-600 to-orange-500" />
          
          <div className="flex flex-col items-center gap-6 mb-12">
            <div className="inline-flex items-center gap-3 glass px-6 py-3 rounded-full text-orange-500 border-white/10">
              <Clock size={24} className="animate-spin-slow" />
              <span className="font-mono text-3xl font-bold tracking-tighter">{formatTime(timeLeft)}</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold">7 Gün Geçerli,<br />7 Bin TL Tek Fiyat</h2>
            <p className="text-red-500 font-medium text-lg italic opacity-80">+ KDV (Belirtilen rakam tanıtım amaçlıdır.)</p>
          </div>
          
          <button 
            onClick={() => setActiveModal(ModalType.LEGAL)}
            className="group bg-white text-black px-16 py-6 rounded-full text-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
          >
            SÜRECİ BAŞLAT
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="iletisim" className="bg-[#050505] border-t border-white/5 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 lg:col-span-2 space-y-8">
            <div className="text-4xl font-bold tracking-tighter">psw</div>
            <p className="text-gray-500 text-lg max-w-md">
              Markanızın dijital dünyadaki parmak izini yaratıyoruz. Hızlı, şeffaf ve profesyonel.
            </p>
            <div className="flex gap-4">
              <div className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors"><Instagram /></div>
              <div className="w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors"><Mail /></div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-lg font-bold">İletişim</h4>
            <div className="space-y-4 text-gray-400">
              <div className="flex items-center gap-3">
                <MessageCircle size={20} className="text-green-500" />
                <span>0 555 555 55 55</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-red-500" />
                <span>hello@prosektorweb.com</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold">Yasal</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:text-white cursor-pointer transition">Mesafeli Satış Sözleşmesi</li>
              <li className="hover:text-white cursor-pointer transition">İptal ve İade Koşulları</li>
              <li className="hover:text-white cursor-pointer transition">Gizlilik ve Çerez Politikası</li>
              <li className="hover:text-white cursor-pointer transition">KVKK Aydınlatma Metni</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5 text-xs text-gray-600">
          <p>© 2025 Prosektorweb. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4 opacity-50">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="visa" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="mastercard" />
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <Modal 
        isOpen={activeModal === ModalType.LOGIN} 
        onClose={closeModal} 
        title="Ön İzleme Girişi"
      >
        <p className="text-gray-400 mb-6">Size özel hazırlanan tasarımları görmek için lütfen size iletilen 8 haneli giriş kodunu kullanın.</p>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Giriş Kodu (Örn: PSW-2025)" 
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:border-orange-500 outline-none transition text-center text-xl font-mono tracking-widest"
          />
          <button className="w-full bg-orange-600 py-5 rounded-2xl font-bold hover:bg-orange-500 transition active:scale-[0.98]">
            TASARIMLARI AÇ
          </button>
          <p className="text-center text-xs text-gray-500">Kodunuz yok mu? <span className="text-orange-500 cursor-pointer">Talep edin</span></p>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === ModalType.AI_CHAT}
        onClose={closeModal}
        title="AI Sektör Danışmanı"
      >
        <div className="space-y-6">
          <p className="text-gray-400">Hangi sektörde faaliyet gösterdiğinizi yazın, ChatGPT sizin için dijital strateji önerilerini hazırlasın.</p>
          <div className="flex gap-2">
            <input 
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAIAnalysis()}
              type="text" 
              placeholder="Örn: Butik Kahve Dükkanı" 
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-orange-500 outline-none transition"
            />
            <button 
              onClick={handleAIAnalysis}
              disabled={isAnalyzing}
              className="bg-orange-600 p-4 rounded-2xl hover:bg-orange-500 disabled:opacity-50"
            >
              {isAnalyzing ? <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Sparkles />}
            </button>
          </div>
          {analysis && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-64 overflow-y-auto text-sm leading-relaxed text-gray-300 whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2 duration-300">
              {analysis}
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === ModalType.LEGAL} 
        onClose={closeModal} 
        title="Onay ve Ödeme"
      >
        <div className="space-y-6">
          <div className="h-48 overflow-y-auto bg-black/40 rounded-2xl p-5 text-[10px] text-gray-500 border border-white/5 leading-relaxed">
            <h4 className="font-bold text-gray-300 mb-2 uppercase">Mesafeli Satış Sözleşmesi</h4>
            <p className="mb-4">İşbu sözleşme, Prosektorweb (Hizmet Sağlayıcı) ile Kullanıcı (Alıcı) arasında, dijital web tasarım hizmetinin sunulmasına ilişkin şartları düzenler. Hizmet, ödemenin tamamlanmasını müteakip 24 saat içerisinde aktif edilir...</p>
            <h4 className="font-bold text-gray-300 mb-2 uppercase">KVKK Aydınlatma Metni</h4>
            <p className="mb-4">Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca, sadece hizmetin ifası ve faturalandırma süreçleri için işlenmektedir. Üçüncü taraflarla paylaşım söz konusu değildir...</p>
          </div>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={acceptedLegal}
              onChange={(e) => setAcceptedLegal(e.target.checked)}
              className="w-5 h-5 accent-orange-500 rounded" 
            />
            <span className="text-sm text-gray-400 group-hover:text-white transition">Tüm yasal metinleri okudum ve onaylıyorum.</span>
          </label>
          <button 
            disabled={!acceptedLegal}
            onClick={() => setActiveModal(ModalType.SUCCESS)}
            className="w-full bg-green-600 py-5 rounded-2xl font-bold hover:bg-green-500 transition flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck size={20} />
            <span>Ödemeyi Tamamla (7.000 TL + KDV)</span>
          </button>
        </div>
      </Modal>

      {/* SUCCESS SCREEN */}
      {activeModal === ModalType.SUCCESS && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-4">
          <div className="text-center space-y-8 max-w-md animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center">
              <div className="bg-green-500/10 p-10 rounded-full border border-green-500/30">
                <CheckCircle size={100} className="text-green-500 animate-float" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold">Ödeme Başarılı!</h2>
              <p className="text-xl text-gray-400">
                Teknik ekibimiz kurulum işlemlerine başladı. Markanız artık güvende.
              </p>
              <p className="text-sm text-gray-500">24 saat içerisinde temsilciniz sizinle iletişime geçecektir.</p>
            </div>
            <button 
              onClick={closeModal}
              className="mt-8 text-orange-500 font-bold hover:underline underline-offset-8"
            >
              KONTROL PANELİNE GİT
            </button>
          </div>
        </div>
      )}

      {/* FLOATING ACTION */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
        <div 
          onClick={() => setActiveModal(ModalType.AI_CHAT)}
          className="bg-white text-black p-4 rounded-full shadow-2xl cursor-pointer hover:scale-110 transition active:scale-95 group"
        >
          <Sparkles size={32} className="group-hover:rotate-12 transition-transform" />
        </div>
        <div className="bg-green-500 p-4 rounded-full shadow-2xl cursor-pointer hover:scale-110 transition active:scale-95">
          <MessageCircle size={32} />
        </div>
      </div>
    </div>
  );
};

export default App;
