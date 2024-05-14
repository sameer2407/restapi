const http = require("http");
const fs = require("fs");
const querystring = require("querystring");

const port = 8001;
const users = require("./MOCK_DATA.json");

const server = http.createServer((req, res) => {
  const { url, method } = req;

  if (url === "/api/users" && method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  } else if (url.startsWith("/api/users/") && method === "GET") {
    const id = Number(url.split("/")[3]);
    const user = users.find((user) => user.id === id);
    if (user) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
    }
  } else if (url.startsWith("/api/users/") && method === "PATCH") {
    const id = Number(url.split("/")[3]);
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    console.log(body);
    req.on("end", () => {
      const updatedFields = querystring.parse(body);
      const userIndex = users.findIndex((user) => user.id === id);
      if (userIndex !== -1) {
        Object.assign(users[userIndex], updatedFields);
        fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (error) => {
          if (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal Server Error" }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "UPDATED", id: id }));
          }
        });
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User not found" }));
      }
    });
  } else if (url.startsWith("/api/users/") && method === "DELETE") {
    const id = Number(url.split("/")[3]);
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
      users.splice(index, 1);
      fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (error) => {
        if (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal Server Error" }));
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "DELETED", id: id }));
        }
      });
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
    }
  } else if (url === "/api/users" && method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const parsedData = querystring.parse(body);
      const newUserId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
      const newUser = { id: newUserId, ...parsedData };
      users.push(newUser);
      fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (error) => {
        if (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal Server Error" }));
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "DONE", id: newUserId }));
        }
      });
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route not found" }));
  }
});

server.listen(port, () => console.log(`Server running on port ${port}`));
