import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, Heart, Gamepad2, Plane, Gift } from 'lucide-react';
import { giftsData } from './giftsData'; 
import { guestsList } from './guestsList';

// Componente para a animação suave de aparecer rolando a tela
function FadeInSection({ children, className = "" }) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(domRef.current);
        }
      });
    }, { threshold: 0.15 });
    
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function App() {
  // Estados dos Modais
  const [isGiftsModalOpen, setIsGiftsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('meme'); 
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);

  // Estado do menu
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados do Modal de Pagamento
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('choice'); 
  const [pixCopied, setPixCopied] = useState(false);

  // Estados do RSVP (Lista Fechada)
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [companions, setCompanions] = useState([]); 
  const [selectedCompanions, setSelectedCompanions] = useState([]); 
  const [contactInfo, setContactInfo] = useState('');
  const [formStatus, setFormStatus] = useState('idle');

  // Banco de Dados Local do RSVP
  const [localDB, setLocalDB] = useState(() => {
    const saved = localStorage.getItem('wedding_rsvp_db');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wedding_rsvp_db', JSON.stringify(localDB));
  }, [localDB]);

  // Detecta scroll para mudar estilo do menu
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trava o scroll do site quando qualquer modal estiver aberto
  useEffect(() => {
    if (isGiftsModalOpen || isPaymentModalOpen || isRsvpModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isGiftsModalOpen, isPaymentModalOpen, isRsvpModalOpen]);

  // --- LÓGICA DE PAGAMENTO ---
  const handleGiftClick = (gift) => {
    setSelectedGift(gift);
    setPaymentMethod('choice');
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setTimeout(() => { setSelectedGift(null); setPixCopied(false); }, 300);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText('dimitrimonteiro05@gmail.com');
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  // --- LÓGICA DO RSVP FECHADO ---
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 2) {
      const filtered = guestsList.filter(g => g.name.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectGuest = (guest) => {
    setSelectedGuest(guest);
    setSearchTerm('');
    setSuggestions([]);
    const familyMembers = guestsList.filter(g => g.groupId === guest.groupId && g.id !== guest.id);
    setCompanions(familyMembers);
    setSelectedCompanions([]); 
  };

  const handleCompanionToggle = (companionId) => {
    setSelectedCompanions(prev => 
      prev.includes(companionId) ? prev.filter(id => id !== companionId) : [...prev, companionId]
    );
  };

  const handleCancelConfirmation = () => {
    const newDb = localDB.filter(entry => entry.confirmedBy !== selectedGuest.id);
    setLocalDB(newDb);
    setSelectedGuest(null);
    alert("Sua confirmação foi cancelada com sucesso.");
  };

  const handleRSVPSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('loading');

    const confirmedIds = [selectedGuest.id, ...selectedCompanions];
    const confirmedGuests = [
      selectedGuest,
      ...companions.filter(c => selectedCompanions.includes(c.id))
    ];
    const dataHora = new Date().toLocaleString('pt-BR');

    const rows = confirmedGuests.map(guest => ({
      'Nome': guest.name,
      'Confirmado por': selectedGuest.name,
      'Contato': guest.id === selectedGuest.id ? contactInfo : `(via ${selectedGuest.name})`,
      'Presenca': 'Confirmado',
      'Data': dataHora
    }));

    try {
      const SHEETDB_URL = 'https://sheetdb.io/api/v1/2kqyeqrdi7rxv'; 
      const response = await fetch(SHEETDB_URL, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: rows })
      });

      if (response.ok) {
        const newEntries = confirmedIds.map(id => ({ guestId: id, confirmedBy: selectedGuest.id }));
        setLocalDB(prev => [...prev, ...newEntries]);
        setFormStatus('success');
      } else {
        throw new Error('Falha ao enviar');
      }
    } catch (error) {
      console.error(error);
      alert("Houve um erro ao enviar. Tente novamente.");
      setFormStatus('idle');
    }
  };

  const dbRecord = selectedGuest ? localDB.find(entry => entry.guestId === selectedGuest.id) : null;
  const isConfirmedByMe = dbRecord && dbRecord.confirmedBy === selectedGuest.id;
  const isConfirmedByOther = dbRecord && dbRecord.confirmedBy !== selectedGuest.id;
  let confirmerName = "";
  if (isConfirmedByOther) {
    const confirmer = guestsList.find(g => g.id === dbRecord.confirmedBy);
    confirmerName = confirmer ? confirmer.name : "Alguém do seu grupo";
  }

  const currentGifts = giftsData ? giftsData.filter(gift => gift.category === activeTab) : [];

  // Link suave para âncoras
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans scroll-smooth">

      {/* ========================================= */}
      {/* MENU DE NAVEGAÇÃO FIXO                    */}
      {/* ========================================= */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b border-white/40 shadow-[0_1px_12px_rgba(0,0,0,0.04)]">
        {/* Barra principal */}
        <div className="h-14 flex items-center justify-center relative px-6">

          {/* Links — desktop: centralizados, mobile: escondidos */}
          <ul className="hidden md:flex items-center gap-10">
            {[
              { label: 'Início', id: 'home' },
              { label: 'Cerimônia', id: 'eventos' },
              { label: 'Presença', id: 'rsvp-cta' },
              { label: 'Presentes', id: 'presentes' },
            ].map(({ label, id }) => (
              <li key={id}>
                <button
                  onClick={() => scrollTo(id)}
                  className="font-['Questrial'] tracking-[0.2em] text-[11px] uppercase text-gray-500 hover:text-[#6E8CB9] transition-colors duration-300"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* Hambúrguer — só no mobile, posicionado à direita */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden absolute right-6 flex flex-col gap-[5px] p-1 text-gray-500"
            aria-label="Menu"
          >
            <span className={`block w-6 h-[1.5px] bg-current transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
            <span className={`block w-6 h-[1.5px] bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-[1.5px] bg-current transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
          </button>
        </div>

        {/* Drawer mobile */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
          <ul className="bg-white/90 backdrop-blur-md border-t border-gray-100 flex flex-col items-center py-4 gap-1">
            {[
              { label: 'Início', id: 'home' },
              { label: 'Cerimônia', id: 'eventos' },
              { label: 'Presença', id: 'rsvp-cta' },
              { label: 'Presentes', id: 'presentes' },
            ].map(({ label, id }) => (
              <li key={id} className="w-full text-center">
                <button
                  onClick={() => { scrollTo(id); setMobileMenuOpen(false); }}
                  className="w-full py-3 font-['Questrial'] tracking-[0.2em] text-[12px] uppercase text-gray-500 hover:text-[#6E8CB9] transition-colors"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 1. HERO SECTION (COLUNA DUPLA) */}
      <section id="home" className="flex flex-col md:flex-row min-h-screen bg-white">
        {/* Lado Esquerdo - Foto */}
        <div className="w-full md:w-1/2 h-[60vh] md:h-screen bg-gray-100">
          <img src="/image_casal_2.jpg" alt="Dimitri e Gabrielly" className="w-full h-full object-cover object-center" />
        </div>
        
        {/* Lado Direito - Textos */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center p-12 md:p-24 bg-[#fcfcfc]">
          <FadeInSection>
            <p className="font-['Questrial'] tracking-[0.4em] text-gray-400 text-sm md:text-lg mb-8 uppercase">
              Save the date
            </p>
            <h1 className="font-['Corinthia'] text-7xl md:text-[100px] text-[#6E8CB9] mb-8 leading-none">
              Dimitri <span className="font-['Corinthia'] text-5xl md:text-6xl mx-2">e</span> Gabrielly
            </h1>
            <p className="font-['Questrial'] tracking-[0.3em] text-[#787371] text-xl md:text-2xl uppercase mb-12">
              05 . 09 . 2026
            </p>
            <div className="w-16 h-[1px] bg-[#6E8CB9]/30 mx-auto mb-10"></div>
            <p className="font-['Quicksand'] text-gray-500 italic text-lg leading-relaxed max-w-md">
              "Histórias de amor existem, e, às vezes, nem nós mesmos acreditamos todo o tempo que já estamos juntos. Vamos nos casar!"
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* 2. CERIMÔNIA E RECEPÇÃO */}
      <section id="eventos" className="w-full overflow-hidden">
        
        {/* Bloco 1: Cerimônia */}
        <div className="bg-white py-16 md:py-24 px-6 relative">
          <FadeInSection className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
              
              {/* Imagem Cerimônia */}
              <div className="w-full md:w-1/2 relative px-4">
                <div className="aspect-[4/3] md:aspect-[16/11] overflow-hidden rounded-t-[200px] md:rounded-t-[300px] rounded-b-lg border border-gray-100 shadow-md relative z-10">
                  <img src="/image_igreja.webp" alt="Santuário Dom Bosco" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
                </div>
              </div>

              {/* Textos Cerimônia */}
              <div className="w-full md:w-1/2 flex flex-col items-center text-center relative">
                {/* Marca d'água */}
                <div className="absolute top-0 opacity-[0.03] pointer-events-none select-none font-['Corinthia'] text-[200px] md:text-[250px] text-[#6E8CB9] leading-none -mt-10 md:-mt-16">
                  DG
                </div>
                
                <h2 className="font-['Corinthia'] text-7xl md:text-[90px] text-[#6E8CB9] mb-2 relative z-10">
                  Cerimônia
                </h2>
                
                <div className="flex items-center justify-center gap-4 mb-10 w-full text-[#6E8CB9]/40">
                   <div className="h-[1px] w-8 bg-[#6E8CB9]/30"></div>
                   <Heart className="w-4 h-4" />
                   <div className="h-[1px] w-8 bg-[#6E8CB9]/30"></div>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 w-full mb-10 font-['Quicksand'] relative z-10">
                  <div className="flex flex-col items-center">
                    <Calendar className="w-7 h-7 text-[#6E8CB9] mb-3 stroke-[1.5]" />
                    <p className="font-bold text-gray-700 text-sm md:text-base">05 de Setembro</p>
                    <p className="text-gray-500 text-sm">de 2026</p>
                  </div>
                  
                  <div className="hidden md:block w-[1px] h-12 bg-gray-300"></div>
                  
                  <div className="flex flex-col items-center">
                    <Clock className="w-7 h-7 text-[#6E8CB9] mb-3 stroke-[1.5]" />
                    <p className="font-bold text-gray-700 text-sm md:text-base">14h30</p>
                  </div>
                  
                  <div className="hidden md:block w-[1px] h-12 bg-gray-300"></div>
                  
                  <div className="flex flex-col items-center">
                    <MapPin className="w-7 h-7 text-[#6E8CB9] mb-3 stroke-[1.5]" />
                    <p className="font-bold text-gray-700 text-sm md:text-base">Santuário Dom Bosco</p>
                    <p className="text-gray-500 text-sm">Brasília - DF</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 mb-6 w-full text-[#6E8CB9]/40">
                   <div className="h-[1px] w-8 bg-[#6E8CB9]/30"></div>
                   <span className="text-lg">🌿</span>
                   <div className="h-[1px] w-8 bg-[#6E8CB9]/30"></div>
                </div>

                <p className="font-['Quicksand'] text-gray-500 italic text-lg md:text-xl leading-relaxed mb-10 max-w-md relative z-10">
                  "Foi diante de Deus que escolhemos começar nossa família."
                </p>

                <a href="https://maps.google.com/?q=Santu%C3%A1rio+Dom+Bosco+Bras%C3%ADlia" target="_blank" rel="noreferrer" 
                   className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-[#6E8CB9] text-[#6E8CB9] font-['Questrial'] uppercase tracking-widest text-xs hover:bg-[#6E8CB9] hover:text-white transition-colors relative z-10">
                  <MapPin className="w-4 h-4" />
                  Como Chegar
                </a>
              </div>
            </div>
          </FadeInSection>
        </div>

        {/* Bloco 2: Recepção */}
        <div className="bg-[#f2f6fa] py-16 md:py-24 px-6 relative border-t border-white/50">
          <FadeInSection className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
              
              {/* Imagem Recepção */}
              <div className="w-full md:w-1/2 relative px-4">
                <div className="aspect-[4/3] md:aspect-[16/11] overflow-hidden rounded-t-[200px] md:rounded-t-[300px] rounded-b-lg border border-gray-100 shadow-md relative z-10">
                  <img src="/recanto_image.png" alt="Recanto dos Buritis" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
                </div>
              </div>

              {/* Textos Recepção */}
              <div className="w-full md:w-1/2 flex flex-col items-center text-center relative">
                 {/* Marca d'água */}
                 <div className="absolute top-0 opacity-[0.03] pointer-events-none select-none font-['Corinthia'] text-[200px] md:text-[250px] text-[#6E8CB9] leading-none -mt-10 md:-mt-16">
                  DG
                </div>
                
                <h2 className="font-['Corinthia'] text-7xl md:text-[90px] text-[#6E8CB9] mb-2 relative z-10">
                  Recepção
                </h2>
                
                <div className="flex items-center justify-center gap-4 mb-10 w-full text-[#6E8CB9]/40">
                   <div className="h-[1px] w-8 bg-[#6E8CB9]/30"></div>
                   <Heart className="w-4 h-4" />
                   <div className="h-[1px] w-8 bg-[#6E8CB9]/30"></div>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 w-full mb-10 font-['Quicksand'] relative z-10">
                  <div className="flex flex-col items-center">
                    <Calendar className="w-7 h-7 text-[#6E8CB9] mb-3 stroke-[1.5]" />
                    <p className="font-bold text-gray-700 text-sm md:text-base">05 de Setembro</p>
                    <p className="text-gray-500 text-sm">de 2026</p>
                  </div>
                  
                  <div className="hidden md:block w-[1px] h-12 bg-gray-300"></div>
                  
                  <div className="flex flex-col items-center">
                    <Clock className="w-7 h-7 text-[#6E8CB9] mb-3 stroke-[1.5]" />
                    <p className="font-bold text-gray-700 text-sm md:text-base">16h00</p>
                    <p className="text-gray-500 text-sm">a partir das</p>
                  </div>
                  
                  <div className="hidden md:block w-[1px] h-12 bg-gray-300"></div>
                  
                  <div className="flex flex-col items-center">
                    <MapPin className="w-7 h-7 text-[#6E8CB9] mb-3 stroke-[1.5]" />
                    <p className="font-bold text-gray-700 text-sm md:text-base">Recanto dos Buritis</p>
                    <p className="text-gray-500 text-sm">Lago Sul, Brasília - DF</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 mb-6 w-full text-[#6E8CB9]/40">
                   <div className="h-[1px] w-8 bg-[#6E8CB9]/30"></div>
                   <span className="text-lg">🌿</span>
                   <div className="h-[1px] w-8 bg-[#6E8CB9]/30"></div>
                </div>

                <p className="font-['Quicksand'] text-gray-500 italic text-lg md:text-xl leading-relaxed mb-10 max-w-md relative z-10">
                  Depois da cerimônia, esperamos vocês para celebrar conosco.
                </p>

                <a href="https://maps.google.com/?q=Recanto+dos+Buritis+Lago+Sul+Bras%C3%ADlia" target="_blank" rel="noreferrer" 
                   className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-[#6E8CB9] text-[#6E8CB9] font-['Questrial'] uppercase tracking-widest text-xs hover:bg-[#6E8CB9] hover:text-white transition-colors relative z-10">
                  <MapPin className="w-4 h-4" />
                  Como Chegar
                </a>
              </div>
            </div>
          </FadeInSection>
        </div>

      </section>

      {/* 3. SEÇÃO RSVP (CHAMADA) */}
      <section id="rsvp-cta" className="relative bg-gradient-to-b from-[#eaf0f6] to-[#dbe5ef] pt-32 pb-40 px-6 text-center overflow-hidden">
        {/* Marca d'água */}
        <div className="absolute right-0 md:right-32 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none select-none font-['Corinthia'] text-[250px] md:text-[400px] text-[#6E8CB9] leading-none z-0">
          DG
        </div>
        
        <FadeInSection className="relative z-10">
          <div className="flex items-center justify-center mb-6 text-[#6E8CB9]/60">
             <Heart className="w-5 h-5 fill-current" />
          </div>
          
          <h2 className="font-['Corinthia'] text-6xl md:text-[80px] text-[#6E8CB9] mb-6 font-normal">Confirme sua Presença</h2>
          <p className="font-['Quicksand'] text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Sua confirmação é muito importante para que possamos organizar cada detalhe com carinho. Por favor, confirme até o dia <span className="font-bold text-[#6E8CB9]">05 de Agosto de 2026</span>.
          </p>
          <button 
            onClick={() => setIsRsvpModalOpen(true)} 
            className="inline-flex items-center gap-3 bg-[#7a96c2] text-white font-['Questrial'] tracking-[0.15em] text-sm uppercase px-10 py-4 rounded-md hover:bg-[#6E8CB9] transition-all shadow-md"
          >
            <Heart className="w-5 h-5" />
            Confirmar Presença
          </button>
        </FadeInSection>

        {/* Divisória Ondulada no rodapé da seção */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none transform rotate-180">
            <svg className="relative block w-full h-[60px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
            </svg>
        </div>
      </section>

      {/* 4. LISTA DE PRESENTES */}
      <section id="presentes" className="bg-white pt-12 pb-32 px-6 text-center relative">
        <FadeInSection>
          <h2 className="font-['Corinthia'] text-6xl md:text-[80px] text-[#6E8CB9] mb-4">Lista de Presentes</h2>
          
          <div className="flex items-center justify-center gap-4 mb-8 w-full text-[#6E8CB9]/40">
             <div className="h-[1px] w-12 bg-[#6E8CB9]/30"></div>
             <Heart className="w-4 h-4" />
             <div className="h-[1px] w-12 bg-[#6E8CB9]/30"></div>
          </div>

          <p className="font-['Quicksand'] text-lg md:text-xl text-gray-500 max-w-3xl mx-auto mb-16 leading-relaxed italic">
            "O maior presente para nós é celebrar este momento ao lado de pessoas tão especiais. Mas, para aqueles que desejarem nos presentear, preparamos uma lista com muito carinho."
          </p>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Destaque 1 */}
            <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#eaf0f6] flex flex-col items-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <Gamepad2 className="w-12 h-12 text-[#6E8CB9] mb-6 stroke-[1.2]" />
              <h3 className="font-['Questrial'] text-xl text-[#6E8CB9] mb-4">Taxa de Videogame</h3>
              <p className="text-gray-500 font-['Quicksand'] text-sm mb-8 flex-grow">Para o noivo jogar sem receber olhar de reprovação.</p>
              <span className="font-['Questrial'] text-2xl text-[#6E8CB9] mb-8 block">R$ 100,00</span>
              <button onClick={() => handleGiftClick({ title: "Taxa de Videogame", price: 100, icon: "🎮" })} className="w-full flex justify-center items-center gap-2 py-3.5 bg-white border border-[#6E8CB9] text-[#6E8CB9] font-['Questrial'] tracking-widest text-xs uppercase rounded-full hover:bg-[#6E8CB9] hover:text-white transition-all">
                <Gift className="w-4 h-4" /> Presentear
              </button>
            </div>

            {/* Destaque 2 */}
            <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#eaf0f6] flex flex-col items-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <Plane className="w-12 h-12 text-[#6E8CB9] mb-6 stroke-[1.2]" />
              <h3 className="font-['Questrial'] text-xl text-[#6E8CB9] mb-4">Cota Lua de Mel</h3>
              <p className="text-gray-500 font-['Quicksand'] text-sm mb-8 flex-grow">Ajude-nos a aproveitar um passeio incrível na nossa viagem.</p>
              <span className="font-['Questrial'] text-2xl text-[#6E8CB9] mb-8 block">R$ 300,00</span>
              <button onClick={() => handleGiftClick({ title: "Cota Lua de Mel", price: 300, icon: "✈️" })} className="w-full flex justify-center items-center gap-2 py-3.5 bg-white border border-[#6E8CB9] text-[#6E8CB9] font-['Questrial'] tracking-widest text-xs uppercase rounded-full hover:bg-[#6E8CB9] hover:text-white transition-all">
                <Gift className="w-4 h-4" /> Presentear
              </button>
            </div>

            {/* Destaque 3 */}
            <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#eaf0f6] flex flex-col items-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <Heart className="w-12 h-12 text-[#6E8CB9] mb-6 stroke-[1.2]" />
              <h3 className="font-['Questrial'] text-xl text-[#6E8CB9] mb-4">Contribuição Livre</h3>
              <p className="text-gray-500 font-['Quicksand'] text-sm mb-8 flex-grow">Escolha o valor que desejar para nos ajudar a montar nossa casa.</p>
              <span className="font-['Questrial'] text-2xl text-[#6E8CB9] mb-8 block">Qualquer Valor</span>
              <button onClick={() => handleGiftClick({ title: "Contribuição Livre", price: "Qualquer Valor", icon: "💝" })} className="w-full flex justify-center items-center gap-2 py-3.5 bg-white border border-[#6E8CB9] text-[#6E8CB9] font-['Questrial'] tracking-widest text-xs uppercase rounded-full hover:bg-[#6E8CB9] hover:text-white transition-all">
                <Gift className="w-4 h-4" /> Presentear
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <button onClick={() => setIsGiftsModalOpen(true)} className="text-[#6E8CB9] font-['Questrial'] uppercase tracking-[0.15em] text-sm hover:text-gray-900 transition-colors">
              VER TODAS AS OPÇÕES NA LISTA COMPLETA
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-[#6E8CB9]/30">
               <div className="h-[1px] w-16 bg-[#6E8CB9]/30"></div>
               <Heart className="w-3 h-3" />
               <div className="h-[1px] w-16 bg-[#6E8CB9]/30"></div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-12 text-center border-t border-gray-100">
        <img src="/brasao.png" alt="Brasão D & G" className="w-16 h-16 object-contain mx-auto mb-4 opacity-80" />
        <p className="font-['Quicksand'] text-gray-400 text-sm">Feito com muito amor para o nosso grande dia. <br />© 2026</p>
      </footer>

      {/* ========================================= */}
      {/* MODAL DO RSVP                             */}
      {/* ========================================= */}
      {isRsvpModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6 transition-opacity">
          <div className="bg-[#fcfcfc] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300">
            
            <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center z-10 shadow-sm shrink-0">
              <h3 className="font-['Corinthia'] text-4xl text-[#6E8CB9] font-normal leading-none">
                Confirme sua Presença
              </h3>
              <button onClick={() => {setIsRsvpModalOpen(false); setFormStatus('idle');}} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 text-lg">×</button>
            </div>

            <div className="p-6 md:p-10 overflow-y-auto flex-1">
              {formStatus === 'success' ? (
                <div className="bg-[#f4f7fa] p-10 rounded-lg border border-[#6E8CB9] text-center">
                  <span className="text-5xl mb-4 block">🎉</span>
                  <h3 className="font-['Quicksand'] text-2xl font-bold text-[#6E8CB9] mb-2">Presença Confirmada!</h3>
                  <p className="text-gray-600 font-['Quicksand']">Muito obrigado. Te esperamos lá!</p>
                  <button onClick={() => { setFormStatus('idle'); setSelectedGuest(null); }} className="mt-8 text-sm text-[#6E8CB9] underline font-['Quicksand']">
                    Voltar
                  </button>
                </div>
              ) : !selectedGuest ? (
                <div className="relative text-left">
                  <p className="font-['Quicksand'] text-gray-600 mb-6">Digite seu nome abaixo para buscar seu convite na nossa lista de convidados.</p>
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-full focus:outline-none focus:border-[#6E8CB9] focus:ring-1 focus:ring-[#6E8CB9] transition-colors font-['Quicksand'] text-gray-700 text-lg shadow-sm"
                    placeholder="Ex: Gabriela..."
                  />
                  {suggestions.length > 0 && (
                    <ul className="mt-4 bg-white border border-gray-100 rounded-lg shadow-sm max-h-60 overflow-y-auto">
                      {suggestions.map(guest => (
                        <li key={guest.id} onClick={() => handleSelectGuest(guest)} className="px-6 py-3 cursor-pointer hover:bg-[#f4f7fa] border-b border-gray-50 last:border-0 font-['Quicksand'] text-gray-700 transition-colors">
                          {guest.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  {searchTerm.length > 2 && suggestions.length === 0 && (
                    <div className="mt-4 bg-white border border-gray-100 rounded-lg shadow-sm p-6 text-center">
                      <p className="font-['Quicksand'] text-gray-500">Nome não encontrado. Tente digitar apenas o primeiro nome.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-left">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h3 className="font-['Quicksand'] text-2xl font-bold text-gray-800">Olá, {selectedGuest.name}!</h3>
                    <button onClick={() => setSelectedGuest(null)} className="text-sm text-gray-400 hover:text-[#6E8CB9] underline">Trocar nome</button>
                  </div>

                  {isConfirmedByOther ? (
                    <div className="bg-blue-50 p-6 rounded-lg text-center border border-blue-100">
                      <span className="text-3xl mb-2 block">💙</span>
                      <p className="font-['Quicksand'] text-blue-800">Sua presença já foi confirmada por <strong>{confirmerName}</strong>.</p>
                      <p className="font-['Quicksand'] text-blue-600 text-sm mt-2">Nós nos vemos no grande dia!</p>
                    </div>
                  ) : isConfirmedByMe ? (
                    <div className="bg-green-50 p-6 rounded-lg text-center border border-green-100">
                      <span className="text-3xl mb-2 block">✅</span>
                      <p className="font-['Quicksand'] text-green-800 mb-4">Você já confirmou sua presença!</p>
                      <button onClick={handleCancelConfirmation} className="px-6 py-2 border border-red-300 text-red-500 rounded-sm font-['Quicksand'] hover:bg-red-50 transition-colors text-sm">
                        Cancelar Presença
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRSVPSubmit}>
                      <div className="mb-6">
                        <label className="block font-['Quicksand'] text-gray-700 font-bold mb-2">Seu WhatsApp ou E-mail *</label>
                        <input type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#6E8CB9] font-['Quicksand']" placeholder="Para enviarmos lembretes" />
                      </div>

                      {companions.length > 0 && (
                        <div className="mb-8 p-6 bg-white border border-gray-100 rounded-sm shadow-sm">
                          <label className="block font-['Quicksand'] text-[#6E8CB9] font-bold mb-4">Quem mais do seu convite irá com você?</label>
                          <div className="space-y-3">
                            {companions.map(companion => (
                              <label key={companion.id} className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" checked={selectedCompanions.includes(companion.id)} onChange={() => handleCompanionToggle(companion.id)} className="w-5 h-5 text-[#6E8CB9] rounded focus:ring-[#6E8CB9] border-gray-300 cursor-pointer" />
                                <span className="font-['Quicksand'] text-gray-600 group-hover:text-gray-900 transition-colors">{companion.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <button type="submit" disabled={formStatus === 'loading'} className="w-full py-4 px-6 bg-[#6E8CB9] text-white font-['Questrial'] tracking-[0.2em] text-sm uppercase rounded-sm hover:bg-[#5A7A9E] transition-colors shadow-md disabled:bg-gray-400">
                        {formStatus === 'loading' ? 'Enviando...' : 'Confirmar Presença'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL DA LISTA GIGANTE DE PRESENTES        */}
      {/* ========================================= */}
      {isGiftsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6 transition-opacity">
          <div className="bg-[#fcfcfc] rounded-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="bg-white p-6 md:px-10 border-b border-gray-100 flex justify-between items-center z-10 shadow-sm shrink-0">
              <h3 className="font-['Corinthia'] text-5xl md:text-6xl text-[#6E8CB9] font-normal leading-none">Nossos Presentes</h3>
              <button onClick={() => setIsGiftsModalOpen(false)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 text-xl" title="Fechar">×</button>
            </div>
            <div className="bg-white px-6 md:px-10 border-b border-gray-100 flex gap-6 shrink-0">
              <button onClick={() => setActiveTab('meme')} className={`py-4 font-['Quicksand'] font-bold text-sm md:text-base border-b-2 transition-colors ${activeTab === 'meme' ? 'border-[#6E8CB9] text-[#6E8CB9]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Presentes Divertidos 🎉</button>
              <button onClick={() => setActiveTab('tradicional')} className={`py-4 font-['Quicksand'] font-bold text-sm md:text-base border-b-2 transition-colors ${activeTab === 'tradicional' ? 'border-[#6E8CB9] text-[#6E8CB9]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Para nossa Casa 🏠</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8f9fa]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentGifts.map((gift) => (
                  <div key={gift.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#f4f7fa] rounded-full flex items-center justify-center text-2xl shrink-0">{gift.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-['Quicksand'] font-bold text-gray-800 text-[15px] leading-tight mb-1">{gift.title}</h4>
                        <span className="font-['Questrial'] text-lg text-[#6E8CB9] block">R$ {gift.price},00</span>
                      </div>
                    </div>
                    <button onClick={() => handleGiftClick(gift)} className="mt-auto w-full py-2.5 bg-white border border-[#6E8CB9] text-[#6E8CB9] text-center font-['Questrial'] tracking-widest text-xs uppercase rounded-sm hover:bg-[#6E8CB9] hover:text-white transition-colors">Presentear</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL DE PAGAMENTO (PIX OU CARTÃO)         */}
      {/* ========================================= */}
      {isPaymentModalOpen && selectedGift && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-xl w-full max-w-md p-6 md:p-8 shadow-2xl relative text-center">
            <button onClick={closePaymentModal} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 text-lg">×</button>
            <div className="text-4xl mb-4">{selectedGift.icon}</div>
            <h3 className="font-['Quicksand'] font-bold text-xl text-gray-800 mb-1">{selectedGift.title}</h3>
            <p className="font-['Questrial'] text-[#6E8CB9] text-lg mb-8">{typeof selectedGift.price === 'number' ? `R$ ${selectedGift.price},00` : selectedGift.price}</p>

            {paymentMethod === 'choice' && (
              <div className="flex flex-col gap-4">
                <p className="font-['Quicksand'] text-gray-600 mb-2">Como você prefere presentear?</p>
                <button onClick={() => setPaymentMethod('pix')} className="w-full py-3 bg-[#00B4D8] text-white rounded-sm font-['Quicksand'] font-bold hover:bg-[#0096B4] transition-colors flex items-center justify-center gap-2">❖ Pagar com PIX</button>
                <button onClick={() => { window.open('SEU_LINK_INFINITY_AQUI', '_blank'); closePaymentModal(); }} className="w-full py-3 bg-gray-800 text-white rounded-sm font-['Quicksand'] font-bold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">💳 Pagar com Cartão</button>
              </div>
            )}

            {paymentMethod === 'pix' && (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="w-40 h-40 bg-white p-2 rounded-lg mb-4 flex items-center justify-center border border-gray-200 shadow-sm">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=dimitrimonteiro05@gmail.com`} alt="QR Code PIX" className="w-full h-full" />
                </div>
                <p className="font-['Quicksand'] text-sm text-gray-500 mb-2">Escaneie o QR Code ou copie a chave abaixo:</p>
                <div className="w-full bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center mb-6">
                  <span className="font-['Quicksand'] font-bold text-gray-700 select-all truncate mr-2">dimitrimonteiro05@gmail.com</span>
                  <button onClick={handleCopyPix} className="text-[#6E8CB9] text-sm font-bold hover:underline whitespace-nowrap">{pixCopied ? 'COPIADO! ✅' : 'COPIAR'}</button>
                </div>
                <button onClick={() => setPaymentMethod('choice')} className="text-sm text-gray-400 hover:text-gray-600 underline font-['Quicksand']">Voltar para opções</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}