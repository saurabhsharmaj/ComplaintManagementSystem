const router = require('express').Router();
const jwt = require("jsonwebtoken");
let User = require('../models/user.model');

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});


router.route('/add').post((req, res) => {
  const username = req.body.username;

  const newUser = new User({username});

  newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});


// Middleware to verify JWT and set req.userId
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  jwt.verify(token, "your_jwt_secret", (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.userId = decoded.userId;
    next();
  });
}
// Function to check if user is official
async function isOfficial(userId) {
  const user = await User.findById(userId);
  return user && user.type === "official";
}

// Verify token and return official status
router.get("/verifyToken", verifyToken, async (req, res) => {
  const official = await isOfficial(req.userId);
  res.json({ isOfficial: official });
});
module.exports = router;