const express = require("express");
const connectDB = require("./config/db");
const fileUpload = require("express-fileupload");
const path = require("path");
const {sendFirebaseNotifications }= require("./middleware/notifications");
require("dotenv/config");

var cors = require("cors");
const Message = require("./models/Message");
const User = require("./models/User");
const { mailConnected } = require("./service/nodemailer");
const auth = require("./middleware/auth");
const chatroom = require("./models/chatroom");
const chatMessage = require("./models/chatMessage");
const URL = require("./models/Url");
const { getUsersToken} = require("./utils/notifications");
const { findUserByIdentifier } = require("./utils/helpers");
const Notification = require("./models/Notification");

const app = express();

connectDB();
mailConnected();


const PORT = process.env.PORT || 5000;

// app.use(fileUpload())

app.use(
  fileUpload({
    useTempFiles: true,
    limits: {
      fileSize: 50 * 1024 * 1024,
    },
  })
);

app.use(
  express.json({
    extended: false,
    limit: "50mb",
  })
);
app.use(cors());
app.use("media/image", express.static("image"));
app.use("media/video", express.static("image"));

app.get("/", async (req, res) => {
  res.json({message:"Reel Tok Running successfully-pipelinedones"});
});

app.get("/:username", async (req, res) => {
  const username = req.params.username;
  const entry = await URL.findOneAndUpdate(
    {
      username,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );

  if(!entry?.redirectURL){
     return res.json({message:"server error"})
  }
  return res.redirect(entry.redirectURL);
});

app.get("/media/image/:name", (req, res) => {
  res.sendFile(path.join(__dirname, `./media/image/${req.params.name}`));
});

app.get("/media/video/:name", (req, res) => {
  res.sendFile(path.join(__dirname, `./media/video/${req.params.name}`));
});

app.get("/media/thumbnail/:name", (req, res) => {
  res.sendFile(path.join(__dirname, `./media/thumbnail/${req.params.name}`));
});

app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/user", require("./routes/api/user"));
app.use("/api/reel", require("./routes/api/reel"));
app.use("/api/messages", require("./routes/api/messages"));
app.use("/api/notifications", require("./routes/api/notifications"));
app.use("/api/subscription", require("./routes/api/subscription"));
app.use("/api/chats", require("./routes/api/chats"));
app.use("/api/groups", auth, require("./routes/api/group"));
app.use("/api/chatmessages", auth, require("./routes/api/chatMessage"));
app.use("/api/blogs", require("./routes/api/blogs"));
app.use("/api/url", require("./routes/api/url"));

// posttype
app.use("/api/type", require("./routes/api/posttype"))
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found in reelTok Backends" });
});

module.exports = app;
