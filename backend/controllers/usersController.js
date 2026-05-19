const shareSale = require("../models/shareSale");
const User = require("../models/user");
const bcrypt= require('bcrypt')



const addUser =async(req, res)=>{
    try {
        const {
                fullName,
                mobile,
                email,
                nid,
                dateOfBirth,
                fatherName,
                motherName,
                spouseName,
                occupation,
                monthlyIncome,
                presentAddress,
                permanentAddress,
                nomineeName,
                relation,
                nomineeMobile,
                admissionDate,
                role,
                admissionFee,
                password,
                memberPhoto,
                nidCopy,
                signature,
                remarks
                } = req.body;


                // মেম্বার রেজিস্ট্রেশন ফাংশনের ভেতরে
                const lastUser = await User.findOne().sort({ createdAt: -1 });
                let nextNumber = 1;

                if (lastUser && lastUser.memberCode) {
                    // MEM-000001 থেকে নম্বরটি আলাদা করা
                    const lastNum = parseInt(lastUser.memberCode.split('-')[1]);
                    nextNumber = lastNum + 1;
                }

                // নম্বরটিকে ৪ ডিজিটের ফরম্যাটে রূপান্তর করা
                const formattedCode = `MEM-${nextNumber.toString().padStart(6, '0')}`;


                // Check if the User already exists
                const existsUser = await User.findOne({email})
                if(existsUser){
                    return res.status(400).json({success: false, message: "User already Exists"})
                }

                const hashedPassword = await bcrypt.hash(password, 10)
                // Create a new user
                const newUser = new User({
                    memberCode: formattedCode,
                    fullName,
                    mobile,
                    email,
                    nid,
                    dateOfBirth,
                    fatherName,
                    motherName,
                    spouseName,
                    occupation,
                    monthlyIncome,
                    presentAddress,
                    permanentAddress,
                    nomineeName,
                    relation,
                    nomineeMobile,
                    admissionDate,
                    role,
                    admissionFee,
                    password: hashedPassword,
                    memberPhoto,
                    nidCopy,
                    signature,
                    remarks
                })
                await newUser.save();
                return res.status(201).json({success: true, message: 'User added successfully'})

    } catch (error) {
        console.error('Error adding User', error)
        return res.status(500).json({success: false, message: 'Server Error'})
    }
}


const getUsers = async (req, res)=>{
    try {
        const users = await User.find().lean();


        const totalMember = users.length;
        const activeMember = users.filter(user => user.status === 'active').length;
        const inactiveMember = users.filter(user => user.status === 'inactive').length;
        
        return res.status(200).json({
            success:true,
            totalMember,
            activeMember,
            inactiveMember,
            users
        })
    } catch (error) {
         console.error('Error fatching users', error)
         return res.status(500).json({success: false, message: 'Server Error in getting users'})
    }
}

const getProfile = async(req, res)=>{
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('-password')
        if(!user){
            return res.status(404).json({success: false, message: 'User not found'})
        }
        return res.status(200).json({success: true, user})
    } catch (error) {
         console.error("Get User profile Error:", error);
       return  res.status(500).json({
                success: false,
                message: "Error get User profile",
                });
    }
}

const deleteUser = async(req, res)=>{
    try {
        const {id} = req.params;

        // check if the user exists
        const existingUser = await User.findById(id)
        if(!existingUser){
            return res.status(404).json({
            success: false,
            message: "User not found",
        });
        }

         // চেক করুন এই প্রোজেক্টের কোনো শেয়ার বিক্রি (Sale) হয়েছে কি না
        // আপনার Share Sale ডাটাতে projectId ফিল্ডটি আছে, তাই আমরা এটি ব্যবহার করছি
        const hasSales = await shareSale.findOne({ userId: id });

        if (hasSales) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete! Members have already purchased shares from this project's issuance."
            });
        }



        await User.findByIdAndDelete(id)
        return res.json({
        success: true,
        message: "User deleted successfully",
        });

    } catch (error) {
        console.error("Delete Error:", error);
       return  res.status(500).json({
                success: false,
                message: "Error deleting User",
                });
    }
}

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id; // URL থেকে মেম্বার আইডি নিবে
        const updateData = req.body;

        // যদি পাসওয়ার্ড আপডেট করতে চান, তবে সেটি হ্যাশ করতে হবে
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        // User খুঁজে আপডেট করা
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { returnDocument: 'after', runValidators: true } // new: true দিলে আপডেট হওয়া ডাটা রিটার্ন করবে
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating User:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const statusUpdate = async (req, res)=>{
    try {
        const { id } = req.params;
        const { status } = req.body;

        // ভ্যালিডেশন: শুধুমাত্র active বা inactive এলাউড
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid status value" 
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            { status: status }, 
            {returnDocument: 'after'} // আপডেট হওয়া ডাটাটি রিটার্ন করবে
        );

        if (!updatedUser) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: `User is now ${status}`,
            user: updatedUser
        });

    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
}

const memberSearch = async (req, res) => {
    try {
        const { code } = req.params;
        // ডাটাবেসে memberId বা নির্দিষ্ট কোড দিয়ে সার্চ করা
        const member = await User.findOne({ memberCode: code }); 

        if (member) {
            return res.json({ success: true, member });
        } else {
            return res.status(404).json({ success: false, message: "Member not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = req.user._id; // Middleware থেকে পাওয়া আইডি
        const { oldPassword, newPassword } = req.body;

        // ১. ইউজারকে খুঁজে বের করা (পাসওয়ার্ড চেক করার জন্য পাসওয়ার্ড ফিল্ডসহ)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ২. পুরাতন পাসওয়ার্ড চেক করা
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Old password is incorrect" });
        }

        // ৩. নতুন পাসওয়ার্ড হ্যাশ করা
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // ৪. ডাটাবেসে নতুন পাসওয়ার্ড আপডেট করা
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};



module.exports = {addUser, getUsers, deleteUser, getProfile, updateUser, statusUpdate, memberSearch, changePassword}