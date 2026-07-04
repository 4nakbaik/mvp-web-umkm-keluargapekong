export default function Footer() {
  return (
    <footer className="w-full px-5 md:px-16 bg-white border-t border-[#c4c7c7]/20 py-12">
      <div className="max-w-[1440px] mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <p className="font-['JetBrains_Mono'] text-[10px] tracking-[0.1em] font-medium text-[#5d5f5d]">
            Designed with ♥ for educational purposes.
          </p>
        </div>
        <div className="font-['JetBrains_Mono'] text-xs tracking-[0.1em] font-medium text-[#5d5f5d] text-center md:text-right">
          © 2025 Keluarga Pekong. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
