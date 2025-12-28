const app = require("./app");

const server = app.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Connected To Socket.Io");
  // console.log(socket.client.conn.server.clientsCount,'DAAA')

  socket.on("getUsers", () => {});
  socket.on("setup", (userData) => {
    console.log("Sett", userData);
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (roomId) => {
    socket.join(roomId);
    console.log("User Joined Room", roomId);
  });

  socket.on("new message", async (newMessageRec) => {
    console.log(newMessageRec, "newwwmee");
    socket
      .in(newMessageRec.reciver._id)
      .emit("message recieved", newMessageRec);
    const newMessage = await new Message({
      roomId: newMessageRec.roomId,
      sender: newMessageRec.user._id,
      reciever: newMessageRec.reciver._id,
      message: newMessageRec.text,
    });
    await newMessage.save();
    const sendingUser = await User.findById(newMessageRec.user._id);
    if (newMessageRec.reciver.fcmToken) {
      sendFirebaseNotifications(
        `${newMessageRec.user.name} Sent You A Message`,
        newMessageRec.reciver.fcmToken,
        JSON.stringify(sendingUser),
        "chat"
      );
    }
  });

  // latest socket [GROUP]
  const rooms = {};

  socket.on("joinroom", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room ${roomId}`);

    // If the room doesn't exist in the rooms object, create it
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    socket.emit("message", rooms[roomId]);
    //  Send previous messages to the newly joined user

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
  // Handle incoming chat messages
  socket.on("chat message", async (data) => {
    // console.log("Received message:", data);
    // console.log(rooms, "heee");

    const {
      roomId,
      text,
      user,
      createdAt,
      receiver,
      image,
      type,
      video,
      reel,
      reelVideo,
      isReelCompleted,
    } = data;
    // const{_id , name , avatar} = user

    // Save the message to the room's message history
    if (rooms[roomId]) {
      rooms[roomId].push({
        roomId,
        user,
        text,
        createdAt,
        receiver,
        image,
        type,
        video,
        reel,
        reelVideo,
        isReelCompleted,
      }); // Include sender's information
    } else {
      rooms[roomId] = [
        {
          roomId,
          createdAt,
          user,
          text,
          receiver,
          image,
          type,
          video,
          reel,
          reelVideo,
          isReelCompleted,
        },
      ];
    }
    console.log(rooms, "roomId", roomId, "message", text);
    let responseMessage = text ? text : image || video;
    // Broadcast the message to all clients in the room
    io.to(roomId).emit("chat message", {
      roomId,
      createdAt,
      user,
      receiver,
      text,
      image,
      video,
      type,
      reel,
      reelVideo,
      isReelCompleted,
    });
    const userchatroom = await chatroom.findById({ _id: roomId });
    const sender = await findUserByIdentifier(user?._id);
    // deduct .25 for video share
    if(reel && sender.subscriptionType.reelCoin > 0.25 ){
      sender.subscriptionType.reelCoin = sender.subscriptionType.reelCoin - 0.25
      await sender.save()
    }
    if (userchatroom) {
      userchatroom.text = text ? text : image || video;
      userchatroom.type = type ? type : null;
      await userchatroom.save();
      // if reel than means it reelmail
      const newMessage = new chatMessage({
        roomId: roomId,
        user: user._id,
        image: image ? image : null,
        video: video ? video : null,
        text: text ? text : null,
        type: type || null,
        reel: reel ? reel : false,
        isReelCompleted: isReelCompleted ? isReelCompleted : false,
        reelVideo: reelVideo ? reelVideo : false,
      });
      await newMessage.save();

      const allmembers = [userchatroom.admin , ...userchatroom.members]
      console.log(allmembers ,"allmembers")
      const filteredMembers = allmembers.filter(member => member.toString() !== sender?._id.toString());
      const membersToken = await getUsersToken(filteredMembers)
      console.log(filteredMembers ,"filteredM", membersToken , sender?._id.toString())

      for (let index = 0; index < membersToken.length; index++) {
        const {id:memberId , token} = membersToken[index]; 
        console.log("final")
        await sendFirebaseNotifications(
         `${sender?.username || sender?.firstName} Sent a new message in ${userchatroom?.groupName} Group`,
          token,
          JSON.stringify(userchatroom),
          userchatroom.isGroup ? "group" : "chat"
           )
        if(reel && memberId.toString() !==user?._id.toString()){
          var userNotification = new Notification({
            message: `${sender?.username || sender?.firstName} sent new reel in ${userchatroom?.groupName} Group`,
            chatroom: roomId,
            user: memberId,
            type: "group",
            otherUser:sender?._id
          })
          await userNotification.save()             
        }
      }
    }
  });
});
