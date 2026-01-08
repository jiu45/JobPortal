const fs = require('fs');
const path = require('path');
const User = require('../models/User');

exports.updateProfile = async (req, res) => {
    try {
        const { name, avatar, email, companyName, companyDescription, companyLogo, resume, bio, skills, experience, education } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.name = name || user.name;
        user.email = email || user.email;
        user.avatar = avatar || user.avatar;
        user.resume = resume || user.resume;

        // AI-parsed fields for jobseekers
        if (user.role === 'jobseeker') {
            if (bio !== undefined) user.bio = bio;
            if (skills !== undefined) user.skills = skills;
            if (experience !== undefined) user.experience = experience;
            if (education !== undefined) user.education = education;
        }

        if (user.role === 'employer') {
            user.companyName = companyName || user.companyName;
            user.companyDescription = companyDescription || user.companyDescription;
            user.companyLogo = companyLogo || user.companyLogo;
        }
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            avatar: user.avatar || ' ',
            email: user.email,
            role: user.role,
            bio: user.bio || '',
            skills: user.skills || [],
            experience: user.experience || [],
            education: user.education || [],
            companyName: user.companyName,
            companyDescription: user.companyDescription,
            companyLogo: user.companyLogo,
            resume: user.resume || ' ',
        });
    }

    catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: 'Server Error' });
    }
}

exports.deleteResume = async (req, res) => {
    try {
        const { resumeUrl } = req.body;

        //Extract file name from URL
        const filename = resumeUrl?.split('/')?.pop();
        //const filePath = path.join(__dirname, '..', 'uploads', filename);
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role != 'jobseeker') {
            return res.status(403).json({ message: 'Only jobseekers can delete resumes' });
        }

        //Construct file path
        const filePath = path.join(__dirname, '../uploads', filename);

        //Check if file exists and delete
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        //Set the user's resume field to null
        user.resume = null;
        await user.save();
        res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

exports.getPublicProfile = async (req, res) => {
    try {
        //const userId = req.params.id;
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'jobseeker') {
            return res.status(403).json({ message: 'Only jobseekers can upload resumes' });
        }

        // Delete old resume file if exists
        if (user.resume) {
            const oldFilename = user.resume.split('/').pop();
            const oldFilePath = path.join(__dirname, '../uploads', oldFilename);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        // Save new resume path
        const resumeUrl = `/uploads/${req.file.filename}`;
        user.resume = resumeUrl;
        await user.save();

        res.status(200).json({
            message: 'Resume uploaded successfully',
            resumeUrl
        });
    } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ message: 'Server Error' });
    }
}