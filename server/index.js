const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user.model.js');

const app = express();
const PORT = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.use(express.json()); //used because data is passed as JSON
app.use(cors()); //since we're working on two different ports we need to use cors (in development)

mongoose.connect('mongodb://localhost:27017/mern-tutorial'); //On server run, connecting to MongoDB using mongoose

// Registers user if email is not already taken and returns to client status 'ok' otherwise status 'error'
app.post('/api/register', async (req, res) => {

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    try{
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        return res.json({status: 'ok'});
    }catch(e){
        console.log(e)
        return res.json({status: 'error', error: e})
    }
})

// Searches for a email and password that matches given data and returns status 'ok' if found otherwise status 'error'
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    })
    
    if(!user) return res.json({status: 'error', error: 'Invalid email'});

    const isPasswordValid = bcrypt.compare(req.body.password, user.password);
    
    if (isPasswordValid){
        const token = jwt.sign(
            {
                name: user.name,
                email: user.email
            },
            'secret_token'
        )
        return res.json({status: 'ok', user: token});
    } else {
        return res.json({ status: 'error', user: false });
    }
})

// if user is verified using the request headers token, user's name amd and quote(if set) are returned as JSON
app.get('/api/quote', async (req, res) => {
    
    const token = req.headers['x-access-token'];
    
    try {
        const decoded = jwt.verify(token, 'secret_token');
        const email = decoded.email;
        const user = await User.findOne({email: email})

        return res.json({status: 'ok', username:user.name, quote: user.quote});
    } catch (error) {
        console.log(error + " in quote get");
        res.json({status: 'error', error: 'Invalid token'})
    }
})

// updates user collection by adding / updating a quote, if user is verified using the request headers token
app.post('/api/quote', async (req, res) => {
    const token = req.headers['x-access-token']

    try {
        const decoded = jwt.verify(token, 'secret_token')
        const email = decoded.email;

        await User.updateOne(
            { email: email },
            { $set: { quote: req.body.quote } }
        )

        return res.json({ status: 'ok' })
    } catch (error) {
        console.log(error)
        res.json({ status: 'error', error: 'invalid token' })
    }
})

app.listen(PORT, () => {
    console.log('Server listening on port '+ PORT);
})