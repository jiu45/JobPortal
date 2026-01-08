const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String, required: true
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['jobseeker', 'employer'], required: true },
    avatar: { type: String },
    resume: { type: String }, // Path to uploaded resume PDF

    // AI-parsed resume data (for job seekers)
    bio: { type: String }, // Professional summary
    skills: [{ type: String }], // Array of skills
    experience: [{
        title: String,
        company: String,
        duration: String,
        description: String
    }],
    education: [{
        degree: String,
        institution: String,
        year: String,
        field: String
    }],

    //for employers
    companyName: { type: String },
    companyDescription: { type: String },
    companyLogo: { type: String },
    /*  companyWebsite: { type: String },
     createdAt: { type: Date, default: Date.now },
     updatedAt: { type: Date, default: Date.now }, */
}, { timestamps: true });

//Encrypt password before saving
// middleware to hash password before saving
userSchema.pre("save", async function () { // 1. Remove 'next' here
    if (!this.isModified("password")) return; // 2. Remove 'next()' here, just return

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


//MediaSourceHandle.exports = mongoose.model('User', userSchema);

module.exports = mongoose.model('User', userSchema);