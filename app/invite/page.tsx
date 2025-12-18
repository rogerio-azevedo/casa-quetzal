"use client";

import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";

export default function InvitePage() {
  // Pegar URL base diretamente
  const url = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">
        {/* Conteúdo principal com fundo escuro */}
        <div className="bg-slate-900 text-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header com texto e QR Code lado a lado */}
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            {/* Texto à esquerda */}
            <div className="text-center space-y-2 md:space-y-4 flex-1">
              <p className="text-lg md:text-xl text-blue-200">NYE</p>
              <h1 className="text-4xl md:text-6xl font-bold">2026</h1>
              <h2 className="text-2xl md:text-2xl font-semibold">
                Casa Quetzal
              </h2>

              <p className="text-base md:text-lg text-blue-300">VIP Access</p>
            </div>

            {/* QR Code à direita */}
            <div className="flex-shrink-0">
              <div className="bg-white p-4 rounded-2xl shadow-xl">
                <QRCodeSVG
                  value={url}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
          </div>

          {/* Footer com logo e informações */}
          <div className="bg-slate-700 px-8 md:px-12 py-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <Image
                    src="/quetzal.png"
                    alt="Casa Quetzal Logo"
                    width={300}
                    height={180}
                    className="h-auto w-auto max-w-[300px] dark:invert"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instruções abaixo do card */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            Escaneie o QR Code para acessar o sistema
          </p>
        </div>
      </div>
    </div>
  );
}
