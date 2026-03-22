const express = require("express");
const {
  proxyLogin,
  proxyRegisterCustomer,
  proxyValidate,
} = require("../controllers/authController");

const router = express.Router();

router.post("/login", proxyLogin);
router.post("/register", proxyRegisterCustomer);
router.get("/validate", proxyValidate);

module.exports = router;