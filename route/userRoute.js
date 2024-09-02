const router = require('express').Router();
const User = require("../model/userModel");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

// register a new user

router.post('/register', async (req, res) => {
    try {
        // check if user already exists

        const userExists = await User.findOne({email: req.body.email});
        if(userExists){
            return res.send({
                success: false,
                message: "User already exists!",
            });
        }

        // Password hashing

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;

        // Save the user

        const newUser = new User(req.body);
        await newUser.save();

        res.send({
            success: true,
            message: "User created succussfully!"
        });

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        });
    }

});

// user login

router.post('/login', async (req, res)=>{
    try {

        // check if user exists or not
        const user = await User.findOne({email: req.body.email});
        if (!user){
            return res.send({
                success: false,
                message: "User does not exists!",
            });
        }

        // compare the password

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if(!validPassword){
            return res.send({
                success: false,
                message: "Inavlid Password!",
            });
        }

        // create and assign a token

        const token = jwt.sign({userId: user._id}, process.env.jwt_skey,{
            expiresIn:'1d',
        });

        res.send({
            success: true,
            message: "Logged in successfully!",
            data: token,
        });
        
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router; 