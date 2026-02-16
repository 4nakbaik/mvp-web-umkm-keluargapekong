import { useEffect, useState } from 'react';
import { api } from '../service/api';

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
  totalAmount: number;
  paymentType: string;
  footerMessage: string;
}

interface ReceiptModalProps {
  orderId: string;
  onClose: () => void;
}

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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

          {/* Receipt Preview (UI View) */}
          <div className="p-6 bg-white">
            <div className="text-center mb-4">
              <h1 className="font-bold text-xl mb-1">{receipt.shopName}</h1>
              <p className="text-xs text-gray-500">{receipt.address}</p>
            </div>

            <div className="border-b border-dashed border-gray-300 my-4"></div>

            <div className="text-xs space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Tanggal:</span>
                <span>{receipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">No. Order:</span>
                <span>{receipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kasir:</span>
                <span>{receipt.cashier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pelanggan:</span>
                <span>{receipt.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pembayaran:</span>
                <span className="font-semibold">{receipt.paymentType}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-gray-300 my-4"></div>

            <div className="space-y-2 mb-4">
              {receipt.items.map((item, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium">{item.name}</div>
                  <div className="flex justify-between text-gray-600 text-xs">
                    <span>
                      {item.qty} x {formatPrice(item.price)}
                    </span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-gray-300 my-4"></div>

            <div className="flex justify-between items-center font-bold text-lg mb-6">
              <span>Total</span>
              <span>{formatPrice(receipt.totalAmount)}</span>
            </div>

            <div className="text-center text-xs text-gray-500 mb-6">{receipt.footerMessage}</div>

            <button
              onClick={handlePrint}
              className="w-full py-3 bg-[#5c4033] text-white font-semibold rounded hover:bg-[#4a3329] transition-colors flex items-center justify-center gap-2"
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

      {/* Actual Print Layout (Controlled by @media print) */}
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
        <div className="print-content-wrapper text-[10px] leading-tight">
          <div className="text-center mb-2">
            <h1 className="font-bold text-sm uppercase">{receipt.shopName}</h1>
            <p className="text-[9px]">{receipt.address}</p>
          </div>

          <div className="text-center mb-2">--------------------------------</div>

          <div className="mb-2 space-y-0.5">
            <div className="flex justify-between">
              <span>Tgl:</span>
              <span>{receipt.date}</span>
            </div>
            <div className="flex justify-between">
              <span>No:</span>
              <span>{receipt.receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{receipt.cashier}</span>
            </div>
            <div className="flex justify-between">
              <span>Cust:</span>
              <span>{receipt.customer}</span>
            </div>
            <div className="flex justify-between">
              <span>Bayar:</span>
              <span>{receipt.paymentType}</span>
            </div>
          </div>

          <div className="text-center mb-2">--------------------------------</div>

          <div className="mb-2 space-y-1">
            {receipt.items.map((item, index) => (
              <div key={index}>
                <div className="font-bold truncate">{item.name}</div>
                <div className="flex justify-between">
                  <span>
                    {item.qty} x {Number(item.price).toLocaleString('id-ID')}
                  </span>
                  <span>{Number(item.subtotal).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mb-2">--------------------------------</div>

          <div className="flex justify-between font-bold text-sm mb-4">
            <span>TOTAL</span>
            <span>{Number(receipt.totalAmount).toLocaleString('id-ID')}</span>
          </div>

          <div className="text-center text-[9px]">{receipt.footerMessage}</div>
          <div className="text-center mt-4">.</div>
        </div>
      </div>
    </>
  );
}
