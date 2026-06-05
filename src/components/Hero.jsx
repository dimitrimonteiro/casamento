import { useState, useEffect } from 'react';

export default function Hero() {
  const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

  useEffect(() => {
    // Data do casamento: 12 de Dezembro de 2026
    const weddingDate = new Date('2026-09-05T16:00:00').getTime();

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

  return (
    <section className="relative h-[80vh] flex flex-col items-center justify-center text-center px-4">
      {/* Container de Títulos */}
      <div className="z-10 flex flex-col items-center mb-12">
        <h1 className="text-5xl md:text-7xl font-serif text-gray-900 mb-4 tracking-tight">
          Dimitri <span className="text-blue-400">&</span> Gabrielly
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 uppercase tracking-widest font-light">
          12 de Dezembro de 2026
        </p>
      </div>

      {/* Contagem Regressiva */}
      <div className="grid grid-cols-4 gap-4 md:gap-8 z-10">
        {[
          { label: 'Dias', value: timeLeft.dias },
          { label: 'Horas', value: timeLeft.horas },
          { label: 'Minutos', value: timeLeft.minutos },
          { label: 'Segundos', value: timeLeft.segundos },
        ].map((item, index) => (
          <div key={index} className="flex flex-col items-center p-3 bg-white/50 backdrop-blur-sm border border-blue-100 rounded-xl shadow-sm min-w-[70px] md:min-w-[100px]">
            <span className="text-2xl md:text-4xl font-light text-blue-500">
              {String(item.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] md:text-xs uppercase tracking-wider text-gray-500 mt-1">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}