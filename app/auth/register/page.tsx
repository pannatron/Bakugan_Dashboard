'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

enum RegistrationStep {
  EMAIL_VERIFICATION = 0,
  OTP_VERIFICATION = 1,
  ACCOUNT_CREATION = 2
}

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<RegistrationStep>(RegistrationStep.EMAIL_VERIFICATION);
  
  // Email verification step
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(true);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  // Function to check if email is already registered
  const checkEmailAvailability = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    
    setCheckingEmail(true);
    setEmailError('');
    
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      setEmailChecked(true);
      
      if (response.ok) {
        setEmailAvailable(true);
        setEmailError('Email is available for registration');
      } else {
        setEmailAvailable(false);
        setEmailError(data.error || 'Email is already registered');
      }
    } catch (err: any) {
      console.error('Email check error:', err);
      setEmailError(err.message || 'Failed to check email availability');
      setEmailChecked(false);
    } finally {
      setCheckingEmail(false);
    }
  };
  
  // OTP verification step
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  
  // Account creation step
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Handle email verification
  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    
    // If email hasn't been checked yet, check it first
    if (!emailChecked) {
      await checkEmailAvailability();
      
      // If email is not available, don't proceed
      if (!emailAvailable) {
        return;
      }
    }
    
    setEmailLoading(true);
    console.log('Sending OTP to email:', email);

    try {
      const requestBody = JSON.stringify({ email });
      console.log('Request body:', requestBody);
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      console.log('Response status:', response.status);
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        
        let errorMessage = 'Failed to send verification code';
        
        try {
          // Try to parse the error as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError, 'Raw response:', errorText);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('OTP sent successfully:', data);

      // Store the user ID for later use
      setUserId(data.userId);
      console.log('User ID set:', data.userId);
      
      // Move to OTP verification step
      setStep(RegistrationStep.OTP_VERIFICATION);
    } catch (err: any) {
      console.error('Email verification error:', err);
      setEmailError(err.message || 'Failed to send verification code');
    } finally {
      setEmailLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    
    if (!otp) {
      setOtpError('Verification code is required');
      return;
    }
    
    if (otp.length !== 6) {
      setOtpError('Verification code must be 6 digits');
      return;
    }
    
    setOtpLoading(true);
    
    // Log the data being sent
    console.log('Sending OTP verification request:', { userId, otp });

    try {
      const requestBody = JSON.stringify({ userId, otp });
      console.log('Request body:', requestBody);
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      console.log('Response status:', response.status);
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        
        let errorMessage = 'Invalid verification code';
        
        try {
          // Try to parse the error as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError, 'Raw response:', errorText);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Verification successful:', data);
      
      // Move to account creation step
      setStep(RegistrationStep.ACCOUNT_CREATION);
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setOtpError(err.message || 'Failed to verify code');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle account creation
  const handleAccountCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    
    if (password !== confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
    
    setRegisterLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, userId }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Registration failed';
        
        try {
          // Try to parse the error as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError, 'Raw response:', errorText);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Auto sign in after registration
      const signInResult = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });

      if (signInResult?.error) {
        console.error('Sign in after registration failed:', signInResult.error);
        throw new Error('Account created but sign in failed. Please try signing in manually.');
      }

      // Redirect to profile setup
      router.push('/auth/profile-setup');
    } catch (err: any) {
      console.error('Registration error:', err);
      setRegisterError(err.message || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setOtpError('');
    setEmailLoading(true);
    console.log('Resending OTP to email:', email);

    try {
      const requestBody = JSON.stringify({ email });
      console.log('Request body:', requestBody);
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      console.log('Response status:', response.status);
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        
        let errorMessage = 'Failed to resend verification code';
        
        try {
          // Try to parse the error as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError, 'Raw response:', errorText);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('OTP resent successfully:', data);

      // Update the user ID in case it changed
      setUserId(data.userId);
      console.log('User ID updated:', data.userId);
      
      setOtpError('New verification code sent');
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setOtpError(err.message || 'Failed to resend verification code');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x">
            Create an Account
          </h1>
          <p className="mt-2 text-gray-400">
            Join the Bakugan Dashboard community
          </p>
        </div>

        <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-premium card-shimmer">
          {/* Step 1: Email Verification */}
          {step === RegistrationStep.EMAIL_VERIFICATION && (
            <>
              {emailError && (
                <div className={`mb-4 p-3 ${emailChecked && emailAvailable ? 'bg-green-500/20 border border-green-500/50 text-green-300' : 'bg-red-500/20 border border-red-500/50 text-red-300'} rounded-xl text-sm`}>
                  {emailError}
                </div>
              )}

              <form onSubmit={handleEmailVerification} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Reset email check when email changes
                        if (emailChecked) {
                          setEmailChecked(false);
                          setEmailAvailable(true);
                        }
                      }}
                      required
                      className="flex-1 px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder="Enter your email"
                    />
                    <button
                      type="button"
                      onClick={checkEmailAvailability}
                      disabled={checkingEmail || !email}
                      className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {checkingEmail ? 'Checking...' : 'Check Email'}
                    </button>
                  </div>
                  {/* We don't need this message since we already show it in the alert box above */}
                </div>

                <button
                  type="submit"
                  disabled={emailLoading || !emailChecked || !emailAvailable}
                  className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailLoading ? 'Sending verification code...' : 'Send verification code'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === RegistrationStep.OTP_VERIFICATION && (
            <>
              {otpError && (
                <div className={`mb-4 p-3 ${otpError === 'New verification code sent' ? 'bg-green-500/20 border border-green-500/50 text-green-300' : 'bg-red-500/20 border border-red-500/50 text-red-300'} rounded-xl text-sm`}>
                  {otpError}
                </div>
              )}

              <form onSubmit={handleOtpVerification} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => {
                      // Only allow numeric input
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setOtp(value);
                    }}
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white text-center tracking-widest text-xl"
                    placeholder="000000"
                  />
                  <p className="mt-2 text-sm text-gray-400">
                    We've sent a verification code to {email}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? 'Verifying...' : 'Verify code'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={emailLoading}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {emailLoading ? 'Sending...' : 'Resend code'}
                  </button>
                  <span className="mx-2 text-gray-500">|</span>
                  <button
                    type="button"
                    onClick={() => setStep(RegistrationStep.EMAIL_VERIFICATION)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Change email
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Account Creation */}
          {step === RegistrationStep.ACCOUNT_CREATION && (
            <>
              {registerError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                  {registerError}
                </div>
              )}

              <form onSubmit={handleAccountCreation} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Choose a username"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Choose a password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Confirm your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registerLoading ? 'Creating account...' : 'Complete Registration'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
