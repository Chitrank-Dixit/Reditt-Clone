import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret';

// Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists with that email' });
        }
        
        user = await User.findOne({ name });
        if (user) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        user = new User({ name, email, password });
        await user.save();

        // FIX: Add user's name to the JWT payload
        const payload = { user: { id: user.id, name: user.name } };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token });
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Log in a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // FIX: Add user's name to the JWT payload
        const payload = { user: { id: user.id, name: user.name } };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

export default router;
