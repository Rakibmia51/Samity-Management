import React, { useRef } from 'react'; // useRef যোগ করা হয়েছে
import { Printer, ArrowLeft, CheckCircle2, Download } from 'lucide-react';

import html2pdf from 'html2pdf.js'; // লাইব্রেরি ইমপোর্ট করুন

const InvoicePage = ({ sale, onBack }) => {

  const invoiceRef = useRef(); // ইনভয়েস এরিয়া ধরার জন্য রেফারেন্স

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  // ডাউনলোড ফাংশন
  const handleDownload = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 0,
      filename: `Invoice_${sale.saleNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };


  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 no-print-bg">
      {/* Action Buttons */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-all"
        >
          <ArrowLeft size={18} /> Back to Sales
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-black transition-all"
        >
          <Printer size={18} /> Print Invoice
        </button>
      </div>

      {/* Main A4 Invoice Card */}
      <div ref={invoiceRef} className="invoice-container max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden print:shadow-none print:rounded-none print:m-0">
        
        {/* Header Section */}
        <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <CheckCircle2 size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-black tracking-widest uppercase">Investment Receipt</h1>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">Voucher Number</p>
            <h2 className="text-lg font-bold text-emerald-400 leading-none">{sale.saleNumber}</h2>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-black uppercase">Your Company Ltd.</h3>
            <p className="text-slate-400 text-[11px] leading-tight">
              Level 4, Corporate Tower, Motijheel<br />
              Dhaka-1000, Bangladesh<br />
              Contact: +880 1XXX-XXXXXX
            </p>
          </div>
        </div>

        <div className="p-12">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-10 mb-12 border-b border-slate-100 pb-10">
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Investor Details</p>
              <h4 className="text-lg font-black text-slate-800 uppercase">{sale.userId?.fullName}</h4>
              <p className="text-slate-500 text-sm font-bold">Member ID: {sale.userId?.memberCode}</p>
              <p className="text-slate-500 text-sm font-medium">Date: {new Date(sale.saleDate).toLocaleDateString('en-GB')}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Payment Info</p>
              <p className="text-slate-800 font-bold text-sm uppercase">Method: {sale.paymentMethod}</p>
              <p className="text-slate-800 font-bold text-sm uppercase">Project: {sale.projectId?.projectName}</p>
              <div className="inline-block mt-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded text-[10px] font-black">
                PAYMENT RECEIVED
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full mb-10">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="py-4 text-left text-[11px] font-black text-slate-900 uppercase">Description</th>
                <th className="py-4 text-center text-[11px] font-black text-slate-900 uppercase">Shares Qty</th>
                <th className="py-4 text-right text-[11px] font-black text-slate-900 uppercase">Shares Price</th>
                <th className="py-4 text-right text-[11px] font-black text-slate-900 uppercase">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-6">
                  <p className="font-black text-slate-800 text-sm">Project Share Purchase</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{sale.projectId?.projectName}</p>
                </td>
                <td className="py-6 text-center text-slate-700 font-bold">{sale.quantity}</td>
                <td className="py-6 text-right text-slate-700 font-bold">৳{(sale.totalAmount / sale.quantity).toLocaleString()}</td>
                <td className="py-6 text-right font-black text-slate-900 text-base">৳{sale.totalAmount?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals & Signature */}
          <div className="mt-20">
            <div className="flex justify-between items-start">
              <div className="w-1/2">
                <div className="mb-10">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-10">Authorized Signature</p>
                   <div className="w-40 border-t border-slate-900"></div>
                </div>
                <p className="text-[9px] text-slate-400 italic leading-tight">
                  * This is an official receipt for the investment made in the specified project. 
                  Please keep this document for future reference.
                </p>
              </div>
              <div className="w-1/3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Subtotal</span>
                  <span className="text-sm font-bold text-slate-800">৳{sale.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-4">
                  <span className="text-[13px] font-black text-slate-900 uppercase">Grand Total</span>
                  <span className="font-black text-emerald-600 text-xl tracking-tighter">৳{sale.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="absolute bottom-10 left-0 right-0 px-12 text-center border-t pt-4 border-slate-50">
           <p className="text-[10px] text-slate-400 font-bold">://yourcompany.com | info@yourcompany.com</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 0 ;
          }
          body { margin: 0; padding: 0; background: white; }
          .no-print { display: none !important; }
          .invoice-container {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            border: none;
            box-shadow: none !important;
            position: relative;
          }
          .no-print-bg { background: white !important; padding: 0 !important; }
        }
      `}} />
    </div>
  );
};

export default InvoicePage;