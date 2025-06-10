const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['citizen', 'admin'],
        default: 'citizen'
    }, 
    mediaPath: {
    type: Schema.Types.Mixed, // allows object, string, array, etc.
    default: null
    }, 
    mediaType: {
        type: String,
        enum: ['image'],
        required: false
    }
}, {
    timestamps: true,
});
const User = mongoose.model('User', userSchema);
module.exports = User;
