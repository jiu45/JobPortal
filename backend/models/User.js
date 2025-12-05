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
    resume: { type: String },
    //for employers
    companyName: { type: String },
    companyDescription: { type: String },
    companyLogo: { type: String },
   /*  companyWebsite: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }, */
}, { timestamps: true }); 

//Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { return next(); }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


//MediaSourceHandle.exports = mongoose.model('User', userSchema);

module.exports = mongoose.model('User', userSchema);