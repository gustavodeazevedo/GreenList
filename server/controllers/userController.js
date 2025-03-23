import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sgMail from '@sendgrid/mail';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Enhanced rate limiting check
        // Check if user has made a request in the last 5 minutes
        const lastRequest = await User.findOne({
            email,
            resetTokenExpiry: { $gt: Date.now() - 300000 } // 5 minutes
        });

        if (lastRequest) {
            // Calculate remaining time in minutes and seconds
            const remainingTime = Math.ceil((lastRequest.resetTokenExpiry - (Date.now() - 300000)) / 1000);
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;

            const timeMessage = minutes > 0
                ? `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`
                : `${seconds} second${seconds !== 1 ? 's' : ''}`;

            return res.status(429).json({
                message: `Too many password reset requests. Please wait ${timeMessage} before trying again.`
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // For security reasons, don't reveal if user exists or not
            return res.status(200).json({
                message: 'If a user with that email exists, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        // Save reset token to user
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Configure SendGrid
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        // Email template
        const msg = {
            to: user.email,
            from: process.env.EMAIL_FROM, // Use verified sender email from environment variable
            subject: 'GreenList - Password Reset',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">GreenList</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e9e9e9; border-top: none;">
                <h2>Password Reset Request</h2>
                <p>You requested a password reset for your GreenList account.</p>
                <p>Please click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
                </div>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Thank you,<br>The GreenList Team</p>
            </div>
        </div>
            `
        };

        // Implement retry mechanism with exponential backoff for SendGrid
        const maxRetries = 3;
        let retryCount = 0;
        let lastError = null;

        const sendEmailWithRetry = async () => {
            try {
                // Log the email being sent (without sensitive info)
                console.log(`Attempting to send email to ${msg.to} from ${msg.from}`);

                await sgMail.send(msg);
                console.log('Password reset email sent successfully');
                return true;
            } catch (emailError) {
                lastError = emailError;
                console.error(`SendGrid error (attempt ${retryCount + 1}/${maxRetries}):`, emailError);

                if (emailError.response) {
                    console.error('SendGrid error details:', emailError.response.body);

                    // Check for sender verification issues
                    if (emailError.response.body &&
                        (emailError.response.body.errors?.some(err =>
                            err.message?.includes('sender identity') ||
                            err.message?.includes('verified')
                        ))) {
                        console.error('CRITICAL: Sender email verification issue. Please verify that your sender email is verified in SendGrid.');
                        return true; // Don't retry for sender verification issues
                    }

                    // Check if it's a rate limit error (429)
                    if (emailError.code === 429 ||
                        (emailError.response && emailError.response.statusCode === 429)) {
                        // Calculate backoff time: 2^retry * 1000ms + random jitter
                        const backoffTime = Math.min(
                            (Math.pow(2, retryCount) * 1000) + (Math.random() * 1000),
                            10000 // Max 10 seconds
                        );

                        console.log(`Rate limit exceeded. Retrying in ${backoffTime}ms...`);
                        await new Promise(resolve => setTimeout(resolve, backoffTime));
                        return false; // Retry needed
                    }
                }

                // For other errors, don't retry
                return true; // Don't retry for non-rate-limit errors
            }
        };

        // Execute the retry logic
        while (retryCount < maxRetries) {
            const success = await sendEmailWithRetry();
            if (success) break;
            retryCount++;
        }

        // If all retries failed
        if (retryCount >= maxRetries && lastError) {
            console.error('All SendGrid retry attempts failed');
            return res.status(500).json({
                message: 'Failed to send password reset email after multiple attempts. Please try again later.'
            });
        }

        // For security reasons, always return the same response whether user exists or not
        res.status(200).json({
            message: 'If a user with that email exists, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset password
// @route   POST /api/users/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({
            _id: decoded.id,
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear reset token fields
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};