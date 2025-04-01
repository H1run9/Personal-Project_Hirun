const prisma = require("../configs/prisma")
const createError = require("../utils/createError")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

exports.register = async (req, res, next) => {
    try {
        const { email, username, password, confirmPassword } = req.body

        if (!email || !username || !password || !confirmPassword) {
            return createError(400, "All fields are required")
        }

        const checkEmail = await prisma.user.findFirst({
            where: {
                email,
            },
        })

        if (checkEmail) {
            return createError(400, "Email is already exists")
        }

        if (password !== confirmPassword) {
            return createError(400, "Passwords do not match")
        }

        const hashedPassword = bcrypt.hashSync(password, 10)
        console.log(hashedPassword)

        const user = await prisma.user.create({
            data: {
                email: email,
                username: username,
                password: hashedPassword,
            },
        })

        res.json({ message: "Register Success" });
    } catch (error) {
        console.log("Error in Register:", error)
        next(error)
    }
};

exports.login = async (req, res, next) => {
    try {

        const { email, password } = req.body

        const user = await prisma.user.findFirst({
            where: {
                email: email,
            },
        })
        if (!user) {
            return createError(400, "Email, Password is invalid!!")
        }

        const isMatch = bcrypt.compareSync(password, user.password)
        if (!isMatch) {
            return createError(400, "Email, Password is invalid")
        }

        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "30d",
        })

        console.log(token)

        res.json({
            message: "Login successful",
            payload: payload,
            token: token,
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getMe = (req, res) => {
    res.json({ user: req.user })
}