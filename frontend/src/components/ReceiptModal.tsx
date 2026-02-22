import { useEffect, useState } from 'react';
import { api } from '../service/api';
import logoImg from '../assets/Logo.png';

interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  subtotal: number;
}

interface ReceiptData {
  shopName: string;
  address: string;
  date: string;
  receiptNo: string;
  cashier: string;
  customer: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  voucherCode: string;
  tax: number;
  totalAmount: number;
  paymentType: string;
  qrCode?: string;
  footerMessage: string;
}

interface ReceiptModalProps {
  orderId: string;
  onClose: () => void;
}

const fmtNum = (n: number) => Number(n).toLocaleString('id-ID');

export default function ReceiptModal({ orderId, onClose }: ReceiptModalProps) {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await api.getOrderReceipt(orderId);
        setReceipt(res.data);
      } catch (error) {
        console.error('Error fetching receipt:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchReceipt();
    }
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat struk...</p>
        </div>
      </div>
    );
  }

  if (!receipt) return null;

  // Shared receipt content
  const ReceiptContent = ({ isPrint = false }: { isPrint?: boolean }) => {
    const sep = isPrint ? '--------------------------------' : '————————————————————————';
    const textBase = isPrint ? 'text-[10px]' : 'text-xs';
    const textSm = isPrint ? 'text-[9px]' : 'text-[11px]';
    const logoSize = isPrint ? 'w-12 h-12' : 'w-14 h-14';
    const qrSize = isPrint ? 'w-16 h-16' : 'w-20 h-20';

    return (
      <div className={`font-mono leading-tight ${textBase}`}>
        {/* Header — Left: Shop name + address, Right: Logo */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h1 className={`font-bold ${isPrint ? 'text-sm' : 'text-base'} uppercase`}>
              {receipt.shopName}
            </h1>
            <p className={textSm}>{receipt.address}</p>
          </div>
          <img src={logoImg} alt="Logo" className={`${logoSize} object-contain ml-2`} />
        </div>

        <div className="text-center mb-1">{sep}</div>

        {/* Order Info */}
        <div className="mb-1 space-y-0.5">
          <div>{receipt.date}</div>
          <div>NO. ORDER : {receipt.receiptNo}</div>
          <div>KASIR : {receipt.cashier}</div>
          <div>PELANGGAN : {receipt.customer}</div>
        </div>

        <div className="text-center mb-1">{sep}</div>

        {/* Items */}
        <div className="mb-1 space-y-1">
          {receipt.items.map((item, index) => (
            <div key={index}>
              <div className="font-bold truncate uppercase">{item.name}</div>
              <div className="flex justify-between pl-4">
                <span>
                  {item.qty} x {fmtNum(item.price)}
                </span>
                <span>{fmtNum(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mb-1">{sep}</div>

        {/* Harga Jual */}
        <div className="mb-1">
          <div className="flex justify-between">
            <span>HARGA JUAL :</span>
            <span>{fmtNum(receipt.subtotal)}</span>
          </div>
          {receipt.discount > 0 && (
            <div className="flex justify-between">
              <span>DISKON ({receipt.voucherCode}) :</span>
              <span>-{fmtNum(receipt.discount)}</span>
            </div>
          )}
        </div>

        <div className="text-center mb-1">{sep}</div>

        {/* Total & Payment */}
        <div className="mb-1">
          <div className="flex justify-between font-bold">
            <span>TOTAL :</span>
            <span>{fmtNum(receipt.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>
              {receipt.paymentType
                ? receipt.paymentType
                    .replace(/ - TAKE_OUT( \([^)]+\))?/, '')
                    .replace(' - DINE_IN', '') +
                  (receipt.paymentType.includes('TAKE_OUT')
                    ? ` (Take Out${
                        receipt.paymentType.match(/\(([^)]+)\)/)
                          ? ' - ' + receipt.paymentType.match(/\(([^)]+)\)/)?.[1]
                          : ''
                      })`
                    : receipt.paymentType.includes('DINE_IN')
                      ? ' (Dine In)'
                      : '')
                : 'CASH'}{' '}
              :
            </span>
            <span>{fmtNum(receipt.totalAmount)}</span>
          </div>
        </div>

        {/* Tax Info */}
        <div className={`${textSm} mt-1 mb-2`}>
          PJK RST.: DPP= {fmtNum(receipt.subtotal - receipt.discount)} PJK= {fmtNum(receipt.tax)}
        </div>

        <div className="text-center mb-1">{sep}</div>

        {/* Footer — Left: Address, Right: QR Code */}
        <div className="flex items-start justify-between mt-2 mb-2">
          <div className={`flex-1 ${textSm}`}>
            <p>{receipt.shopName}</p>
            <p>{receipt.address}</p>
            <p className="mt-1 opacity-60">{receipt.receiptNo}</p>
          </div>
          {receipt.qrCode && <img src={receipt.qrCode} alt="QR" className={`${qrSize} ml-2`} />}
        </div>

        {/* Thank you — centered below */}
        <div className={`text-center ${textSm} mt-1`}>{receipt.footerMessage}</div>
      </div>
    );
  };

  return (
    <>
      {/* Modal Container - Hidden when printing */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center print:hidden">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
            <h2 className="text-lg font-bold">Cetak Struk</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Receipt Preview */}
          <div className="p-6 bg-white">
            <ReceiptContent isPrint={false} />

            <button
              onClick={handlePrint}
              className="w-full mt-6 py-3 bg-[#5c4033] text-white font-semibold rounded hover:bg-[#4a3329] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Cetak Struk
            </button>
          </div>
        </div>
      </div>

      {/* Print Layout */}
      <div className="hidden print:block print:w-[58mm] print:mx-auto print:text-black">
        <style>{`
          @media print {
            @page {
              size: 58mm auto;
              margin: 0;
            }
            body {
              visibility: hidden;
              background-color: white;
            }
            .print-content-wrapper {
              visibility: visible;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 5px;
              font-family: 'Courier New', Courier, monospace;
              background-color: white;
            }
            .print-content-wrapper * {
              visibility: visible;
            }
          }
        `}</style>
        <div className="print-content-wrapper">
          <ReceiptContent isPrint={true} />
          <div className="text-center mt-4">.</div>
        </div>
      </div>
    </>
  );
}
