import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IUser extends Document {
  username: string;
  email?: string;
  passwordHash?: string;
  salt?: string;
  isAdmin: boolean;
  provider?: string;
  providerAccountId?: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  otp?: string;
  otpExpiry?: Date;
  isVerified: boolean;
  subscriptionPlan?: 'free' | 'pro' | 'elite';
  subscriptionExpiry?: Date;
  setPassword: (password: string) => void;
  validatePassword: (password: string) => boolean;
  generateOTP: () => string;
  validateOTP: (otp: string) => boolean;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
    },
    salt: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
    },
    providerAccountId: {
      type: String,
    },
    name: {
      type: String,
    },
    image: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'pro', 'elite'],
      default: 'free',
    },
    subscriptionExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Method to set password
UserSchema.methods.setPassword = function(password: string) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.passwordHash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
};

// Method to validate password
UserSchema.methods.validatePassword = function(password: string): boolean {
  if (!this.salt || !this.passwordHash) return false;
  
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  return this.passwordHash === hash;
};

// Method to generate OTP
UserSchema.methods.generateOTP = function(): string {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  
  // Set OTP expiry to 10 minutes from now
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  
  return otp;
};

// Method to validate OTP
UserSchema.methods.validateOTP = function(otp: string): boolean {
  console.log('Validating OTP:', { 
    providedOtp: otp, 
    storedOtp: this.otp, 
    otpExpiry: this.otpExpiry,
    currentTime: new Date(),
    isExpired: this.otpExpiry ? new Date() > this.otpExpiry : true,
    match: this.otp === otp
  });
  
  if (!this.otp || !this.otpExpiry) {
    console.log('Missing OTP or expiry');
    return false;
  }
  
  // Check if OTP is expired
  if (new Date() > this.otpExpiry) {
    console.log('OTP is expired');
    return false;
  }
  
  // Convert both to strings to ensure proper comparison
  const isMatch = String(this.otp) === String(otp);
  console.log('OTP comparison result:', isMatch);
  
  return isMatch;
};

// Create indexes
// Username index is already created by the schema definition with unique: true
UserSchema.index({ provider: 1, providerAccountId: 1 }, { sparse: true });

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
