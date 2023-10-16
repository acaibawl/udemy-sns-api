const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateIdenticon = require("../utils/generateIdenticon");
require("dotenv").config();

const prisma = new PrismaClient;


// 新規ユーザー登録API
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const defaultIconImage = generateIdenticon(email);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      profile: {
        create: {
          bio: "はじめまして",
          profileImageUrl: defaultIconImage
        }
      }
    },
    include: {
      profile: true
    }
  });

  return res.json({ user });
});

// ユーザーログインAPI
router.post("/login", async(req, res) => {
  console.log("ユーザーログインAPIです");
  const { email, password } = req.body;

  console.log(email, password);

  const user = await prisma.user.findFirst({ where: { email: email } });
  // const user = prisma.user.findMany();
  console.log(user);
  if (!user.password) {
    return res.status(401).json({ error: "そのユーザは存在しません。" });
  }

  console.log("ユーザを見つけました");
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "そのパスワードは間違っています"});
  }

  console.log("process.env.SECRET_KEY", process.env.SECRET_KEY);

  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });

  return res.json({ token });
});

module.exports = router;
