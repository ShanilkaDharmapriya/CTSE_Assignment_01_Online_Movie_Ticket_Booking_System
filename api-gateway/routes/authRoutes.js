const express = require("express");
const router = express.Router();
const axios = require("axios");
const { AUTH_SERVICE_URL, isAuthUnreachable } = require("../config/authService");

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/register`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    if (isAuthUnreachable(error)) {
      return res.status(503).json({
        success: false,
        error: { message: "Auth service unavailable", details: error.message },
      });
    }
    res.status(error.response?.status || 500).json({
      success: false,
      error: { message: "Registration failed", details: error.message },
    });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/login`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    if (isAuthUnreachable(error)) {
      return res.status(503).json({
        success: false,
        error: { message: "Auth service unavailable", details: error.message },
      });
    }
    res.status(error.response?.status || 500).json({
      success: false,
      error: { message: "Login failed", details: error.message },
    });
  }
});

// GET /auth/validate
router.get("/validate", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const response = await axios.get(`${AUTH_SERVICE_URL}/auth/validate`, {
      headers: authHeader ? { Authorization: authHeader } : {},
    });
    res.status(200).json(response.data);
  } catch (error) {
    if (isAuthUnreachable(error)) {
      return res.status(503).json({
        success: false,
        error: { message: "Auth service unavailable", details: error.message },
      });
    }
    res.status(error.response?.status || 500).json({
      success: false,
      error: { message: "Validation failed", details: error.message },
    });
  }
});

module.exports = router;
