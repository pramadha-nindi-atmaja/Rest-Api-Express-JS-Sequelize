const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
const port = 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// Pengaturan Sequelize
const sequelize = new Sequelize("rest_api_digramuml", "username", "password", {
  host: "localhost",
  dialect: "mysql", // atau bisa juga 'sqlite', 'postgres', dll.
});

// Model Sequelize
const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: false,
  }
);

// Rute untuk mendapatkan semua user
app.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rute untuk membuat user baru
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    const newUser = await User.create({ name, email });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sinkronisasi database dan mulai server
sequelize
  .sync()
  .then(() => {
    console.log("Database berhasil disinkronisasi.");
    app.listen(port, () => {
      console.log(`Server berjalan di http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Gagal menyinkronisasi database:", error.message);
  });