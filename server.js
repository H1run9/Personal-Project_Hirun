const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const handleErrors = require("./middlewares/error")
const app = express()
const authRouter = require("./routes/auth-route")
const userRouter = require("./routes/user-route")
// Middlewares
app.use(cors()) // Allows cross domain
app.use(morgan("dev")) // Show log terminal
app.use(express.json()) // For read json ใส่ลีมิตไฟล์ได้

// Routing
app.use("/", authRouter)

//Uploads
app.use("/user", userRouter)

// Handle errors
app.use(handleErrors)

// open server
const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log('Server is running on port', PORT))