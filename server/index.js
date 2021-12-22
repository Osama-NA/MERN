const express = require('express');
const cors = require('cors'); //since we're working on two different ports we need to use cors (in development)
const mongoose = require('mongoose');
const User = require('./models/user.model.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); //used because data is passed as JSON
app.use(cors());

mongoose.connect('mongodb://localhost:27017/mern-tutorial'); //Connecting to MongoDB using mongoose on server run

// Registers user if email is not already taken and returns to client status 'ok' otherwise status 'error'
app.post('/api/register', async (req, res) => {
    try{
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        res.json({status: 'ok'});
    }catch(e){
        console.log(e)
        res.json({status: 'error', error: e})
    }
})

// Searches for a email and password that matches given data and returns status 'ok' if found otherwise status 'error'
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
        password: req.body.password
    })

    if(user){
        res.json({status: 'ok', user: true});
    } else {
        res.json({ status: 'error', user: false });
    }
})

app.listen(PORT, () => {
    console.log('Server listening on port '+ PORT);
})