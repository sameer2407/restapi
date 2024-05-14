const express = require("express");
const users = require("./MOCK_DATA.json");
const fs = require("fs");
const app = express();

const port = 8001;

app.use(express.urlencoded({ extended: false }));

app.get("/api/users", (req, res) => {
  return res.json(users);
});

app
  .route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);

    const user = users.find((user) => {
      return user.id === id;
    });
    return res.json(user);
  })
  .patch((req, res) => {
    const id = Number(req.params.id);
    const updatedFields = req.body;

    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex !== -1) {
      Object.assign(users[userIndex], updatedFields);

      fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (error, data) => {
        if (error) {
          return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.json({ status: "UPDATED", id: id });
      });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  })
  .delete((req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
      users.splice(index, 1);

      fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (error, data) => {
        if (error) {
          return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.json({ status: "DELETED", id: id });
      });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  });

app.post("/api/users", (req, res) => {
  const body = req.body;

  const newUserId = users.length > 0 ? users[users.length - 1].id + 1 : 1;

  users.push({ id: newUserId, ...body });

  fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (error, data) => {
    if (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.json({ status: "DONE", id: newUserId });
  });
});

app.listen(port, () => console.log("Server started"));
