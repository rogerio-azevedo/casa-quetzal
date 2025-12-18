"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export default function QRCodeModal({ isOpen, onClose, url }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleDownload = () => {
    const svg = document.querySelector(".qrcode svg") as SVGElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Aumentar resolução para melhor qualidade
      const scale = 4;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = "casa-quetzal-qrcode.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
          }
        }, "image/png");
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShareWhatsApp = () => {
    const message = `Acesse o sistema de controle de veículos:\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">QR Code de Acesso</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Escaneie este QR Code para acessar o sistema de login
          </p>
          <div className="flex justify-center bg-white p-4 rounded-lg border-2 border-gray-200">
            <div className="qrcode">
              <QRCodeSVG
                value={url}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 break-all">{url}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDownload}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>📥</span>
            <span>Baixar QR Code</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>💬</span>
            <span>Compartilhar no WhatsApp</span>
          </button>

          <button
            onClick={handleCopyUrl}
            className="w-full py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <span>{copied ? "✓" : "📋"}</span>
            <span>{copied ? "URL Copiada!" : "Copiar URL"}</span>
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Compartilhe este QR Code com os vigias para acesso rápido ao sistema
          </p>
        </div>
      </div>
    </div>
  );
}

