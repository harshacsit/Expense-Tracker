const jwt = require("jsonwebtoken");

const secret = "my-super-secret-key";

const user = {
    id: 123,
    email: "user@example.com"
};

const token = jwt.sign(
    user,
    secret,
    { expiresIn: "1h" }
);

console.log("JWT Token:");
console.log(token);