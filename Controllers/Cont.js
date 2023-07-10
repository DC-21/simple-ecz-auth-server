const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");

exports.signup = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Please provide email and password" });
      }

      // Validate email format
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        password: hashedPassword,
      });

      res.status(201).json("User signed up successfully");
    } catch (error) {
      res.status(500).json("Email already in use: " + error.message);
    }
  };

  exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Please provide email and password" });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        console.log("Invalid email or password");
        return res.status(401).json({ message: "User not Found" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        console.log("Invalid password");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, Math.random().toString(16));
      console.log("Login successful");
      return res.status(200).json({ message: "Login successful", token: token });
    } catch (error) {
      console.log("Error:", error);
      return res.status(500).json({ message: "An error occurred signing in" });
    }
  };

  exports.deleteUser = async (req, res) => {
    try {
      // Find the user by email
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Please provide email and password" });
      }

      // If the user is not found, return an error
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Compare the provided password with the user's actual password
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      // If the password doesn't match, return an error
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Password does not match" });
      }
      // If the password matches, proceed with deleting the user
      await user.destroy();

      // Respond with a success message or status
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error Deleting user" + error.message });
    }
  };

  exports.updatePassword = async (req, res) => {
    try {
      const { email, currentPassword, newPassword } = req.body;

      if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "Please provide all fields" });
      }

      // Find the user by email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Compare the provided current password with the user's actual password
      const isPasswordMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Invalid current password" });
      }

      // Check if the new password is the same as the current password
      const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
      if (isNewPasswordSame) {
        return res
          .status(400)
          .json({
            message: "New password must be different from the current password",
          });
      }

      // Update the user's password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating password" });
    }
  };

  exports.forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ message: "Please provide email and password" });
      }

      // Find the user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      // Generate a reset token (using UUID)
      const resetToken = uuidv4();

      // Calculate the reset token's expiration date (e.g., one hour from now)
      const resetTokenExpiration = new Date(Date.now() + 3600000);

      // Save the reset token and its expiration date in the user's record (e.g., in the database)
      user.resetToken = resetToken;
      user.resetTokenExpiration = resetTokenExpiration;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "tamanigabriel0@gmail.com",
          pass: "troimachiavelli1576",
        },
      });

      await transporter.sendMail(
        {
          from: "tamanigabriel0@gmail.com",
          to: email,
          subject: "Password reset",
          text: `To reset your password, please click the following link: http://example.com/reset-password/${resetToken}`,
        },
        (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
          } else {
            console.log("Email sent:", info.response);
          }
        }
      );

      return res
        .status(200)
        .json({ message: "Password reset email sent successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({
          message: "An error occurred while sending the password reset email",
        });
    }
  };

  exports.resetPassword = async (req, res) => {
    try {
      const { resetToken, newPassword } = req.body;

      // Retrieve the user based on the reset token (e.g., from the database)
      const user = await User.findOne({ resetToken });

      // Check if the reset token is valid and not expired
      if (!user || !user.resetTokenExpiration < Date.now()) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      // Generate a hashed password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password with the new hashed password
      user.password = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpiration = null;
      await user.save();
      return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      return res.status(500).json({ message: 'An error occurred while resetting the password' });
    }
  };