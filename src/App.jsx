import { useState, useEffect } from 'react';

export default function App() {
  const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

// Adicione estas linhas para o Carrossel:
  const imagensCasal = [
    "/image_casal_1.jpg",
    "/image_casal_2.jpg",
    "/image_casal_3.jpg"
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === imagensCasal.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? imagensCasal.length - 1 : prev - 1));
  };

  useEffect(() => {
    // Data exata do casamento conforme a imagem: 05 de Setembro de 2026
    const weddingDate = new Date('2026-09-05T14:30:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        dias: Math.floor(distance / (1000 * 60 * 60 * 24)),
        horas: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutos: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        segundos: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    "HOME", "O CASAL", "CERIMÔNIA", "RECEPÇÃO", "LISTA DE PRESENTES", "CONFIRME SUA PRESENÇA"
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* NAVBAR */}
      <nav className="hidden md:flex justify-center items-center py-6 bg-white sticky top-0 z-50 shadow-[0_4px_8px_rgba(0,0,0,0.02)]">
        <ul className="flex space-x-8">
          {navLinks.map((link, index) => (
            <li key={index}>
              <a href={`#${link.toLowerCase().replace(/ /g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, "")}`} 
                 className="text-[13px] text-gray-500 font-['Questrial'] tracking-widest hover:text-[#6E8CB9] transition-colors">
                {link}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* HERO SECTION */}
      <section 
        id="home"
        className="relative flex flex-col items-center justify-center min-h-[85vh] text-center px-4"
        style={{ 
          backgroundImage: "url('/image_ed17e8.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      >
        <div className="z-10 flex flex-col items-center">
          <p className="font-['Questrial'] tracking-[0.3em] text-[#bfbfbf] text-sm md:text-2xl mb-8 uppercase">
            Save the date
          </p>
          
          <h1 className="font-['Corinthia'] text-7xl md:text-[120px] text-[#6E8CB9] mb-12 leading-none flex items-center justify-center gap-4">
            Dimitri <span className="font-['Questrial'] text-5xl md:text-[70px] mt-4">+</span> Gabrielly
          </h1>
          
          <p className="font-['Questrial'] tracking-[0.3em] text-[#787878] text-xl md:text-3xl uppercase">
            05 . 09 . 2026
          </p>
        </div>
      </section>

      {/* CONTAGEM REGRESSIVA SECTION */}
      <section className="bg-[#7995C3] py-24 text-center px-4">
        <h2 className="font-['Corinthia'] text-white text-5xl md:text-[64px] mb-12 tracking-wide font-normal">
          Contagem Regressiva
        </h2>
        
        <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
          {[
            { label: 'DIAS', value: timeLeft.dias },
            { label: 'HORAS', value: timeLeft.horas },
            { label: 'MINUTOS', value: timeLeft.minutos },
            { label: 'SEGUNDOS', value: timeLeft.segundos },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm w-[90px] h-[95px] md:w-[120px] md:h-[125px]">
              <span className="font-['Lato'] text-[#7995C3] text-4xl md:text-[46px] font-medium leading-none mb-1">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="font-['Lato'] text-[#7995C3] text-[11px] md:text-[13px] uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* O CASAL SECTION */}
      <section className="bg-white pt-32 pb-20 px-6 text-center" id="o-casal">
        <div className="max-w-4xl mx-auto">
          <p className="font-['Quicksand'] text-[16px] md:text-[18px] text-[#787371] leading-[1.6] font-medium">
            Criamos esse site para compartilhar com vocês os detalhes da organização do nosso casamento. Estamos muito felizes e
            contamos com a presença de todos no nosso grande dia! Aqui vocês encontrarão também dicas para hospedagem, salão
            de beleza, trajes, estacionamento, etc. Ah, é importante também confirmar sua presença. Para isto contamos com sua
            ajuda clicando no menu “Confirme sua Presença” e preenchendo os dados necessários. Para nos presentear, escolha
            qualquer item da Lista de Casamento, seja um item de algum dos sites, lojas físicas, ou então vocês podem utilizar a opção
            de cotas. Fiquem à vontade! Aguardamos vocês no nosso grande dia!
          </p>
          
          <h2 className="font-['Corinthia'] text-6xl md:text-[80px] text-[#6E8CB9] mt-24 mb-16 font-normal">
            O Casal
          </h2>

          <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24 mb-24">
            <div className="w-[250px] h-[250px] md:w-[320px] md:h-[320px] rounded-full overflow-hidden shadow-md">
              <img src="/image_perfil_eu.jpg" alt="Dimitri" className="w-full h-full object-cover object-top" />
            </div>
            
            <div className="w-[250px] h-[250px] md:w-[320px] md:h-[320px] rounded-full overflow-hidden shadow-md">
              <img src="/image_perfil_mozao.jpg" alt="Gabrielly" className="w-full h-full object-cover object-top" />
            </div>
          </div>

          <p className="font-['Quicksand'] text-[16px] md:text-[18px] text-[#787371] leading-[1.6] font-medium max-w-4xl mx-auto mb-10">
            Histórias de amor existem, e, às vezes, nem nós mesmos acreditamos todo o tempo que já estamos juntos. Porém, o brilho
            intenso e apaixonado dos nossos olhares nos fazem lembrar o porquê de chegarmos até aqui sem sentir tanto o tempo
            passar....Vamos nos casar! Estamos preparando tudo com muito carinho para curtirmos cada momento com nossos
            amigos e familiares queridos!
          </p>

{/* Carrossel de Fotos Funcional */}
          <div className="relative max-w-5xl mx-auto h-[350px] md:h-[600px] overflow-hidden group rounded-sm shadow-sm">
            
            {/* Imagens com transição de opacidade */}
            {imagensCasal.map((img, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <img 
                  src={img} 
                  alt={`Momento do Casal ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Setas de Navegação (Aparecem no hover da imagem) */}
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <button 
                onClick={prevSlide}
                className="text-white text-5xl md:text-7xl font-light hover:scale-110 transition-transform cursor-pointer drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] bg-transparent border-none outline-none"
              >
                ‹
              </button>
              <button 
                onClick={nextSlide}
                className="text-white text-5xl md:text-7xl font-light hover:scale-110 transition-transform cursor-pointer drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] bg-transparent border-none outline-none"
              >
                ›
              </button>
            </div>

            {/* Indicadores (Bolinhas) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {imagensCasal.map((_, index) => (
                <button 
                  key={index} 
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 shadow-sm ${
                    index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Ir para a foto ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CERIMÔNIA SECTION */}
      <section className="bg-white pt-20 pb-20 px-6 text-center" id="cerimonia">
        <h2 className="font-['Corinthia'] text-6xl md:text-[80px] text-[#6E8CB9] mb-12 font-normal">
          Cerimônia
        </h2>

        <div className="max-w-5xl mx-auto mb-12">
          {/* Substitua por uma foto da igreja */}
          <img 
            src="/image_igreja.jpg" 
            alt="Santuário Dom Bosco" 
            className="w-full h-[250px] md:h-[500px] object-cover"
          />
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <p className="font-['Quicksand'] text-[16px] md:text-[18px] text-[#787371] leading-[1.6] font-medium">
            Gostaríamos muito de contar com a presença de todos vocês no momento em que nossa união será abençoada diante de
            Deus! A cerimônia será rápida e tentaremos ser extremamente pontuais. Contamos com vocês! Dia 05 de setembro de
            2026, às 14:30h. Santuário Dom Bosco - W3 Sul, Brasília - DF.
          </p>
        </div>

        {/* Mapa da Igreja */}
        <div className="max-w-5xl mx-auto h-[400px]">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3839.06316839807!2d-47.89731642320351!3d-15.800622884840656!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935a3ae9ce87dbb1%3A0x54a9456f8af81b35!2zU2FudHXDoXJpbyBTw6NvIEpvw6NvIEJvc2Nv!5e0!3m2!1spt-BR!2sbr!4v1780330376716!5m2!1spt-BR!2sbr" 
            className="w-full h-full border-0 rounded-sm shadow-sm" 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa Santuário São João Bosco"
          ></iframe>
        </div>
      </section>

      {/* RECEPÇÃO SECTION */}
      <section className="bg-white pt-20 pb-32 px-6 text-center" id="recepcao">
        <h2 className="font-['Corinthia'] text-6xl md:text-[80px] text-[#6E8CB9] mb-12 font-normal">
          Recepção
        </h2>

        <div className="max-w-5xl mx-auto mb-12">
          {/* Substitua por uma foto do local da festa */}
          <img 
            src="/image_festa.jpg" 
            alt="Recanto dos Buritis" 
            className="w-full h-[250px] md:h-[500px] object-cover"
          />
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <p className="font-['Quicksand'] text-[16px] md:text-[18px] text-[#787371] leading-[1.6] font-medium">
            O casal convida para recepção no mesmo dia após a cerimônia, no recanto dos buritis, no lago sul, Distrito Federal. Será a
            partir de 16h. Não vai perder, né?
          </p>
        </div>

        {/* Mapa da Recepção */}
        <div className="max-w-5xl mx-auto h-[400px]">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3838.2392603595863!2d-47.836881323202846!3d-15.844017384803266!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935a238295daf92b%3A0xef3ab71ad20dee4d!2sRecanto%20dos%20Buritis!5e0!3m2!1spt-BR!2sbr!4v1780330407542!5m2!1spt-BR!2sbr" 
            className="w-full h-full border-0 rounded-sm shadow-sm" 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa Recanto dos Buritis"
          ></iframe>
        </div>
      </section>

      {/* LISTA DE PRESENTES SECTION */}
      <section className="bg-[#fcfcfc] pt-20 pb-24 px-6 text-center border-t border-gray-100" id="lista-de-presentes">
        <h2 className="font-['Corinthia'] text-6xl md:text-[80px] text-[#6E8CB9] mb-6 font-normal">
          Lista de Presentes
        </h2>
        <p className="font-['Quicksand'] text-[16px] md:text-[18px] text-[#787371] max-w-3xl mx-auto mb-16 leading-[1.6]">
          A maior alegria para nós é a sua presença! Mas, se desejar nos presentear e nos ajudar a construir
          nossa nova vida (e nossa lua de mel), separamos algumas opções abaixo.
        </p>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col items-center transition-transform hover:-translate-y-1">
            <div className="w-20 h-20 bg-[#f4f7fa] rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">🥂</span>
            </div>
            <h3 className="font-['Quicksand'] text-xl font-bold text-gray-800 mb-2">Brinde dos Noivos</h3>
            <p className="text-gray-500 text-sm mb-6 flex-grow">Para brindarmos nossa primeira noite de casados.</p>
            <span className="font-['Questrial'] text-2xl text-[#6E8CB9] mb-6 block">R$ 150,00</span>
            {/* O href abaixo é onde você colocará o link da Infinity Pay */}
            <a href="LINK_INFINITY_PAY_AQUI" target="_blank" rel="noreferrer" 
               className="w-full py-3 px-6 bg-[#6E8CB9] text-white font-['Questrial'] tracking-wider text-sm uppercase rounded-sm hover:bg-[#5A7A9E] transition-colors">
              Presentear
            </a>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col items-center transition-transform hover:-translate-y-1">
            <div className="w-20 h-20 bg-[#f4f7fa] rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">✈️</span>
            </div>
            <h3 className="font-['Quicksand'] text-xl font-bold text-gray-800 mb-2">Cota Lua de Mel</h3>
            <p className="text-gray-500 text-sm mb-6 flex-grow">Ajude-nos a aproveitar um passeio incrível na nossa viagem.</p>
            <span className="font-['Questrial'] text-2xl text-[#6E8CB9] mb-6 block">R$ 300,00</span>
            <a href="LINK_INFINITY_PAY_AQUI" target="_blank" rel="noreferrer" 
               className="w-full py-3 px-6 bg-[#6E8CB9] text-white font-['Questrial'] tracking-wider text-sm uppercase rounded-sm hover:bg-[#5A7A9E] transition-colors">
              Presentear
            </a>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col items-center transition-transform hover:-translate-y-1">
            <div className="w-20 h-20 bg-[#f4f7fa] rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">💝</span>
            </div>
            <h3 className="font-['Quicksand'] text-xl font-bold text-gray-800 mb-2">Contribuição Livre</h3>
            <p className="text-gray-500 text-sm mb-6 flex-grow">Escolha o valor que desejar para nos ajudar a montar nossa casa.</p>
            <span className="font-['Questrial'] text-2xl text-[#6E8CB9] mb-6 block">Qualquer Valor</span>
            <a href="LINK_INFINITY_PAY_AQUI" target="_blank" rel="noreferrer" 
               className="w-full py-3 px-6 bg-white border border-[#6E8CB9] text-[#6E8CB9] font-['Questrial'] tracking-wider text-sm uppercase rounded-sm hover:bg-[#f4f7fa] transition-colors">
              Presentear
            </a>
          </div>
        </div>
      </section>

      {/* RSVP / CONFIRMAÇÃO DE PRESENÇA SECTION */}
      <section className="bg-white pt-24 pb-32 px-6 text-center" id="confirme-sua-presenca">
        <h2 className="font-['Corinthia'] text-6xl md:text-[80px] text-[#6E8CB9] mb-4 font-normal">
          Confirme sua Presença
        </h2>
        <p className="font-['Quicksand'] text-[16px] md:text-[18px] text-[#787371] max-w-2xl mx-auto mb-12 leading-[1.6]">
          Por favor, confirme sua presença até o dia 05 de Agosto de 2026.
        </p>

        <form className="max-w-xl mx-auto bg-[#fcfcfc] p-8 md:p-10 rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 text-left">
          <div className="mb-6">
            <label className="block font-['Quicksand'] text-gray-700 font-bold mb-2">Nome Completo *</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#6E8CB9] focus:ring-1 focus:ring-[#6E8CB9] transition-colors font-['Quicksand'] text-gray-600"
              placeholder="Digite seu nome"
            />
          </div>

          <div className="mb-6">
            <label className="block font-['Quicksand'] text-gray-700 font-bold mb-2">WhatsApp / E-mail *</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#6E8CB9] focus:ring-1 focus:ring-[#6E8CB9] transition-colors font-['Quicksand'] text-gray-600"
              placeholder="Seu melhor contato"
            />
          </div>

          <div className="mb-6">
            <label className="block font-['Quicksand'] text-gray-700 font-bold mb-2">Você irá ao evento? *</label>
            <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#6E8CB9] focus:ring-1 focus:ring-[#6E8CB9] transition-colors font-['Quicksand'] text-gray-600">
              <option value="sim">Sim, estarei lá com certeza!</option>
              <option value="nao">Não, infelizmente não poderei comparecer.</option>
            </select>
          </div>

          <div className="mb-10">
            <label className="block font-['Quicksand'] text-gray-700 font-bold mb-2">Quantidade de Acompanhantes *</label>
            <input 
              type="number" 
              min="0"
              defaultValue="0"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#6E8CB9] focus:ring-1 focus:ring-[#6E8CB9] transition-colors font-['Quicksand'] text-gray-600"
            />
            <p className="text-xs text-gray-400 mt-2 font-['Quicksand']">*Não conte a si mesmo, apenas acompanhantes extras.</p>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 px-6 bg-[#6E8CB9] text-white font-['Questrial'] tracking-[0.2em] text-sm uppercase rounded-sm hover:bg-[#5A7A9E] transition-colors shadow-md"
          >
            Enviar Confirmação
          </button>
        </form>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#f4f7fa] py-8 text-center border-t border-gray-100">
        <p className="font-['Quicksand'] text-[#787371] text-sm">
          Feito com muito amor para o nosso grande dia. <br />
          Dimitri & Gabrielly &copy; 2026
        </p>
      </footer>

    </div>
  );
}