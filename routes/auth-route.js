const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth-controller");

const {validateWithZod,registerSchema,loginSchema,} = require("../middlewares/validators");

router.post("/register",validateWithZod(registerSchema), authControllers.register);
router.post("/login", validateWithZod(loginSchema), authControllers.login);
// authRoute.get('/me', authenticate, authController.getMe)


module.exports = router;