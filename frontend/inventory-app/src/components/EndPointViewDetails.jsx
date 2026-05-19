import React, { useRef } from 'react'
import { X, Printer, ArrowUpCircle, ArrowDownCircle, ShieldCheck, CreditCard } from 'lucide-react';
import { useReactToPrint } from 'react-to-print'

const EndPointViewDetails = ({isOpen, onClose, endPoint}) => {
    const componentRef = useRef()
    
    // টাইপ চেক করা (Income নাকি Expense)
    const isIncome = endPoint?.type?.toLowerCase() === 'income';
    const themeColor = isIncome ? 'blue' : 'red'; // Income হলে Blue, Expense হলে Red

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `${isIncome ? 'Income' : 'Expense'}_Receipt_${endPoint?.endNumber}`,
    })

    if(!isOpen || !endPoint) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                
                {/* Modal Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 print:hidden">
                    <h2 className={`text-sm font-black uppercase tracking-widest ${isIncome ? 'text-blue-600' : 'text-red-600'}`}>
                        {isIncome ? 'Income Details' : 'Expense Details'}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => handlePrint()} className={`flex items-center gap-2 ${isIncome ? 'bg-blue-600' : 'bg-red-600'} text-white px-5 py-2 rounded-full hover:opacity-90 transition font-bold text-xs shadow-lg`}>
                            <Printer size={14} /> Print Receipt
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="overflow-y-auto p-12 bg-white" ref={componentRef}>
                    <style dangerouslySetInnerHTML={{ __html: `
                        @media print {
                            @page { size: A4; margin: 0; }
                            body { -webkit-print-color-adjust: exact; padding: 20mm; }
                        }
                    `}} />

                    {/* Receipt Header */}
                    <div className={`flex justify-between items-start border-b-4 ${isIncome ? 'border-blue-600' : 'border-red-600'} pb-8 mb-8`}>
                        <div>
                            <div className={`${isIncome ? 'text-blue-600' : 'text-red-600'} font-black text-3xl tracking-tighter mb-1 uppercase`}>
                                {isIncome ? 'Income Receipt' : 'Expense Voucher'}
                            </div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Official Transaction Document</p>
                        </div>
                        <div className="text-right">
                            <div className={`${isIncome ? 'bg-blue-600' : 'bg-red-600'} text-white px-3 py-1 text-xs font-black rounded mb-2 inline-block`}>
                                #{endPoint.endNumber?.toUpperCase()}
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Date</p>
                            <p className="text-sm font-black text-gray-800">{new Date(endPoint.date).toLocaleDateString('en-GB')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-8">
                        {/* Details Column */}
                        <div className="col-span-7 space-y-6">
                            <section>
                                <h3 className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Description</h3>
                                <div className="space-y-4">
                                    <DataRow label="Project Name" value={endPoint.projectId?.projectName} />
                                    <DataRow label="Reference Name" value={endPoint.endpointName} />
                                    <div className="flex flex-col border-b border-gray-50 pb-2">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">Category</span>
                                        <div className={`flex items-center gap-1.5 text-sm font-bold ${isIncome ? 'text-blue-700' : 'text-red-700'}`}>
                                            {isIncome ? <ArrowUpCircle size={14}/> : <ArrowDownCircle size={14}/>}
                                            {endPoint.type?.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Amount/Status Column */}
                        <div className="col-span-5">
                            <div className={`${isIncome ? 'bg-blue-50/50 border-blue-100' : 'bg-red-50/50 border-red-100'} p-6 rounded-2xl border`}>
                                <h3 className={`${isIncome ? 'text-blue-600' : 'text-red-600'} font-black text-[10px] uppercase tracking-[0.2em] mb-4`}>Financial Summary</h3>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">Payment via</span>
                                        <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                            <CreditCard size={14} className="text-gray-400" /> {endPoint.paymentMethod || 'N/A'}
                                        </p>
                                    </div>
                                    <div className={`pt-4 border-t ${isIncome ? 'border-blue-100' : 'border-red-100'}`}>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">Net Amount</span>
                                        <p className={`text-3xl font-black ${isIncome ? 'text-blue-600' : 'text-red-600'}`}>
                                            {isIncome ? '+' : '-'}৳{endPoint.amount}
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isIncome ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {isIncome ? '✓ Amount Received' : '✓ Payment Completed'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Signature Area */}
                    <div className="mt-32 grid grid-cols-2 gap-20">
                        <div className="border-t-2 border-gray-100 pt-4 text-center">
                            <p className="text-[10px] font-black uppercase text-gray-400">{isIncome ? 'Payer Signature' : 'Authorized By'}</p>
                        </div>
                        <div className="border-t-2 border-gray-100 pt-4 text-center">
                            <p className="text-[10px] font-black uppercase text-gray-400">{isIncome ? 'Receiver Signature' : 'Recipient Signature'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const DataRow = ({ label, value }) => (
    <div className="flex flex-col border-b border-gray-50 pb-2">
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">{label}</span>
        <span className="text-sm font-bold text-gray-800 leading-tight">{value || '---'}</span>
    </div>
);

export default EndPointViewDetails;
