const { Router } = require("express");

const Response = require("../utils/ApiResponse");
const prisma = require("../prisma");
const { gameBot } = require("../game-bot");

const router = Router();

module.exports = router;