// Using MongoDB native, so this defines the user collection structure (no schema enforcement, but for reference)
const userSchema = {
  name: String,
  email: String,
  password: String, // Hashed
  role: String, // 'user' or 'admin'
  createdAt: Date
};

module.exports = { userSchema };