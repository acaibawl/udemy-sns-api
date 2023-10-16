const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isAuthenticated = require("../middlewares/isAuthenticated");
require("dotenv").config();

const prisma = new PrismaClient;

router.get("/find", isAuthenticated, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }});

    if (!user) {
      res.status(404).json({ message: "ユーザーが見つかりませんでした。 "});
    }

    res.status(200).json({user: {id: user.id, email: user.email, username: user.username, }})
  } catch (err) {
    res.statusCode(500).json({ message: err.message });
  }
});

router.get("/profile/:userId", async (req, res) => {
  const {userId} = req.params;

  try {
    // const profile = await prisma.profile.findUnique({
    //   where: { userId: parseInt(userId) },
    //   include: {
    //     user: {
    //       include: {
    //         profile: true,
    //       }
    //     }
    //   }
    // })

    const profile = await prisma.profile.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: true
      }
    })

    if (!profile) {
      return res
        .status(404)
        .json({ message: "プロフィールが見つかりませんでした。"});
    }

    res.status(200).json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
})

module.exports = router;