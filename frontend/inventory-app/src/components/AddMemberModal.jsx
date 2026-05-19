import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Save, Edit3 } from 'lucide-react';
import Swal from 'sweetalert2';

const AddMemberModal = ({ isOpen, onClose, refreshData, editData }) => {
    
    const initialState = {
        fullName: '', mobile: '', email: '', nid: '', dateOfBirth: '',
        fatherName: '', motherName: '', spouseName: '', occupation: '',
        monthlyIncome: '', presentAddress: '', permanentAddress: '',
        nomineeName: '', relation: '', nomineeMobile: '',
        admissionFee: 500, password: '', role: 'member', remarks: ''
    };

    const [formData, setFormData] = useState(initialState);

    // যখন editData আসবে তখন ফর্ম ফিলআপ হবে
    useEffect(() => {
        if (editData) {
            // তারিখটিকে ইনপুট টাইপ 'date' এর উপযোগী (YYYY-MM-DD) করে নেওয়া
            const formattedDOB = editData.dateOfBirth ? new Date(editData.dateOfBirth).toISOString().split('T')[0] : '';
            setFormData({ 
                ...editData, 
                dateOfBirth: formattedDOB,
                password: '' // এডিটের সময় পাসওয়ার্ড খালি রাখা নিরাপদ
            });
        } else {
            setFormData(initialState);
        }
    }, [editData, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` }
            };

            let res;
            if (editData) {
                // আপডেট করার সময় আপনার ব্যাকএন্ড ফাংশন অনুযায়ী PUT/PATCH রিকোয়েস্ট
                const dataToSubmit = { ...formData };
                if (!dataToSubmit.password) delete dataToSubmit.password; // পাসওয়ার্ড না দিলে আগেরটাই থাকবে

                res = await axios.put(`http://localhost:3000/api/users/update/${editData._id}`, dataToSubmit, config);
            } else {
                // নতুন অ্যাড করার সময় POST রিকোয়েস্ট
                res = await axios.post('http://localhost:3000/api/users/add', formData, config);
            }

            if (res.data.success) {
                Swal.fire('Success', editData ? 'Updated Successfully!' : 'Added Successfully!', 'success');
                onClose();
                refreshData();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Action failed', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Modal Header (Edit মোডে থাকলে কালার চেঞ্জ হবে) */}
                <div className={`p-6 border-b flex justify-between items-center text-white rounded-t-2xl ${editData ? 'bg-amber-500' : 'bg-blue-600'}`}>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {editData ? <><Edit3 size={24}/> Update Member</> : <><Save size={24}/> Register New Member</>}
                    </h2>
                    <button onClick={onClose} className="hover:bg-black/10 p-1 rounded-full"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="md:col-span-2 border-b pb-2 font-bold text-blue-600 uppercase text-xs">Personal Information</div>
                    <input type="text" name="fullName" value={formData.fullName} placeholder="Full Name *" required onChange={handleChange} className="input-style" />
                    <input type="text" name="mobile" value={formData.mobile} placeholder="Mobile (017...) *" required onChange={handleChange} className="input-style" />
                    <input type="email" name="email" value={formData.email} placeholder="Email Address *" required onChange={handleChange} className="input-style" />
                    <input type="text" name="nid" value={formData.nid} placeholder="NID Number *" onChange={handleChange} required className="input-style" />
                    
                    <div className="flex flex-col">
                        <label className="text-[10px] text-gray-500 ml-1 uppercase font-bold">Date of Birth *</label>
                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} required onChange={handleChange} className="input-style" />
                    </div>

                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password}
                        placeholder={editData ? "Leave blank to keep old password" : "Password (Min 6 characters) *"} 
                        required={!editData} 
                        onChange={handleChange} 
                        className="input-style" 
                    />

                    <div className="md:col-span-2 border-b pb-2 font-bold text-blue-600 mt-4 uppercase text-xs">Family & Profession</div>
                    <input type="text" name="fatherName" value={formData.fatherName} placeholder="Father's Name" onChange={handleChange} className="input-style" />
                    <input type="text" name="motherName" value={formData.motherName} placeholder="Mother's Name" onChange={handleChange} className="input-style" />
                    <input type="text" name="spouseName" value={formData.spouseName} placeholder="Spouse Name" onChange={handleChange} className="input-style" />
                    <input type="text" name="occupation" value={formData.occupation} placeholder="Occupation" onChange={handleChange} className="input-style" />
                    <input type="number" name="monthlyIncome" value={formData.monthlyIncome} placeholder="Monthly Income" onChange={handleChange} className="input-style" />
                    <input type="number" name="admissionFee" value={formData.admissionFee} placeholder="Admission Fee" onChange={handleChange} className="input-style" />

                    <div className="md:col-span-2 border-b pb-2 font-bold text-blue-600 mt-4 uppercase text-xs">Address</div>
                    <textarea name="presentAddress" value={formData.presentAddress} placeholder="Present Address *" required onChange={handleChange} className="input-style h-20 md:col-span-1"></textarea>
                    <textarea name="permanentAddress" value={formData.permanentAddress} placeholder="Permanent Address *" required onChange={handleChange} className="input-style h-20 md:col-span-1"></textarea>

                    <div className="md:col-span-2 border-b pb-2 font-bold text-blue-600 mt-4 uppercase text-xs">Nominee Details</div>
                    <input type="text" name="nomineeName" value={formData.nomineeName} placeholder="Nominee Name *" required onChange={handleChange} className="input-style" />
                    <input type="text" name="relation" value={formData.relation} placeholder="Relation *" required onChange={handleChange} className="input-style" />
                    <input type="text" name="nomineeMobile" value={formData.nomineeMobile} placeholder="Nominee Mobile" onChange={handleChange} className="input-style" />
                    
                    <div className="md:col-span-2 border-b pb-2 font-bold text-blue-600 mt-4 uppercase text-xs">User Role</div>
                    <select name="role" required value={formData.role} onChange={handleChange} className="input-style cursor-pointer">
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="boardMember">Board Member</option>
                    </select>

                    <div className="md:col-span-2">
                        <textarea name="remarks" value={formData.remarks} placeholder="Remarks (Optional)" onChange={handleChange} className="input-style h-16 w-full"></textarea>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                        <button type="submit" className={`px-8 py-2.5 rounded-xl text-white font-bold transition flex items-center shadow-lg ${editData ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}>
                            {editData ? <><Edit3 size={18} className="mr-2" /> Update Member</> : <><Save size={18} className="mr-2" /> Save Member</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMemberModal;
