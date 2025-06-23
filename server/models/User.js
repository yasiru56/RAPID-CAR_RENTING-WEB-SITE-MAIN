const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const UserSchema = new mongoose.Schema({
 firstName:{
      type: String,
      required: [true, 'Please enter your first name'],


 },
 lastName:{
      type: String,
      required: [true, 'Please enter your last name'],

 },
  email:{
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            'Please enter a valid email',
        ]
  },
  password:{
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Password must be at least 6 characters'],
  },
  firstAddress:{
        type: String,
        required: [true, 'Please enter your first address'],
  },
  secondAddress:{
        type: String,
        required: [true, 'Please enter your second address'],
  },
  city:{
        type: String,
        required: [true, 'Please enter your city'],
  },
  country:{
        type: String,
        required: [true, 'Please enter your country'],
  },
  postalCode:{
        type: String,
        required: [true, 'Please enter your postal code'],
  },
  createdAt:{
        type: Date,
        default: Date.now,
  },
  role:{
        type: String,
        default: 'user',
        enum: ['user', 'admin','owner'],
  },
  profilePhoto: {
    type: String,
    default: null
  }
},{
  timestamps: true,
}

);


UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);