const { z } = require("zod")

// TEST validator
exports.registerSchema = z
  .object({
    email: z.string().email("Email ไม่ถูกต้อง"),
    username: z.string().min(3, "Firstname ต้องมากกว่า 3 อักขระ"),
    password: z.string().min(6, "Password ต้องมากกว่า 6 อักขระ"),
    confirmPassword: z.string().min(6, "Confirm Password ต้องมากกว่า 6 อักขระ"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm Password ไม่ตรงกัน",
    path: ["confirmPassword"],
  })

exports.loginSchema = z.object({
  email: z.string().email("Email ไม่ถูกต้อง"),
  password: z.string().min(6, "Password ต้องมากกว่า 6 อักขระ"),
})

exports.validateWithZod = (schema) => (req, res, next) => {
  try {
    console.log("Hello middleware")
    schema.parse(req.body)
    next()
  } catch (error) {
    const errMsg = error.errors.map((item) => item.message)
    const errTxt = errMsg.join(",")
    const mergeError = new Error(errTxt)
    next(mergeError)
  }
}