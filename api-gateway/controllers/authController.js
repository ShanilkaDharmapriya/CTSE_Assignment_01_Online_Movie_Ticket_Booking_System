const axios = require("axios");
const { AUTH_SERVICE_URL } = require("../config/config");

const normalizeUser = (user) => {
  if (!user) return user;
  const role = typeof user.role === "string" ? user.role.toUpperCase() : user.role;
  return { ...user, role };
};

const normalizeAuthResponse = (payload) => {
  if (!payload?.data?.user) {
    return payload;
  }

  return {
    ...payload,
    data: {
      ...payload.data,
      user: normalizeUser(payload.data.user),
    },
  };
};

const sendAuthServiceError = (res, error, fallbackMessage) => {
  if (error.response) {
    return res.status(error.response.status).json(error.response.data);
  }

  return res.status(503).json({
    success: false,
    error: { message: fallbackMessage },
  });
};

const proxyRegisterCustomer = async (req, res) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/register/customer`, req.body);
    return res.status(response.status).json(normalizeAuthResponse(response.data));
  } catch (error) {
    return sendAuthServiceError(res, error, "Auth service unavailable");
  }
};

const proxyLoginByPath = async (path, body) => {
  const response = await axios.post(`${AUTH_SERVICE_URL}${path}`, body);
  return response.data;
};

const proxyLogin = async (req, res) => {
  try {
    const customerPayload = await proxyLoginByPath("/auth/login/customer", req.body);
    return res.status(200).json(normalizeAuthResponse(customerPayload));
  } catch (customerError) {
    if (customerError.response?.status && customerError.response.status !== 401) {
      return sendAuthServiceError(res, customerError, "Auth service unavailable");
    }

    try {
      const adminPayload = await proxyLoginByPath("/auth/login/admin", req.body);
      return res.status(200).json(normalizeAuthResponse(adminPayload));
    } catch (adminError) {
      return sendAuthServiceError(res, adminError, "Auth service unavailable");
    }
  }
};

const proxyValidate = async (req, res) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/auth/validate`, {
      headers: {
        Authorization: req.headers.authorization || req.headers.Authorization || "",
      },
    });

    return res.status(response.status).json(normalizeAuthResponse(response.data));
  } catch (error) {
    return sendAuthServiceError(res, error, "Auth service unavailable");
  }
};

module.exports = {
  proxyLogin,
  proxyRegisterCustomer,
  proxyValidate,
};