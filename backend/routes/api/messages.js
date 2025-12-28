const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Post = require("../../models/Posts");
const { check, validationResult } = require("express-validator");
const uploadImageTos3Bucket = require("../../upload/upload");
const sendNotifications = require("../../middleware/notifications");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const upload = require("../../middleware/localStorage");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const {sendFirebaseNotifications }= require("../../middleware/notifications");
const Notification = require("../../models/Notification");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
AWS.config.update({ region: "us-east-2" });
const Message = require("../../models/Message")
//reel-reaction video part
const chatMessage = require("../../models/chatMessage")


router.get("/reelgroup-reaction/:id", async (req, res) => {
  try {
    const data = await chatMessage.findOne({ _id: req.params.id }).select("video reelVideo");
    // return res.send({ data: data })
    if (!data) {
      return res.send({ msg: "No Data Found!" })
    }
    // return res.send({ data: data })
    const uniqueFileName = `output_${req.params.id}_${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, uniqueFileName);
    let imagePath = path.join(__dirname, "reeltalk.png");


    const s3 = new AWS.S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
      },
    });

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(data.video)
        .input(data.reelVideo)
        .input(imagePath)
        .complexFilter([
          '[0:v]scale=350:300[vid1];[1:v]scale=350:300[vid2];[vid1][vid2]vstack=2[stacked]', // Scale and stack videos
          '[2:v]scale=70:65[overlay]',
          '[stacked][overlay]overlay=W-w-10:H-h-10[outv]'
        ])
        .outputOptions('-map', '[outv]')
        .outputOptions('-c:v', 'libx264')
        .output(outputPath)
        .on('end', async function () {


          console.log('Video uploaded to S3');
          resolve(outputPath);
        })
        .on('error', function (err) {
          reject(err);
          console.error('Error: ' + err.message);
        })
        .run();
    });


    const s3Key = `reelreaction_${Date.now()}.mp4`;
    // Upload the video to S3
    const uploadParams = {
      Bucket: 'reelmails',
      Key: s3Key, // The name you want to give to the video in S3
      Body: fs.createReadStream(outputPath),
      ACL: 'public-read',
      ContentType: 'video/mp4'
    };

    const uploadResponse = await s3.upload(uploadParams).promise().then((res) => {
      fs.unlink(outputPath, (err) => {
        if (err) {
          console.error('Error deleting temporary file:', err);
        } else {
          console.log('Temporary file deleted');
        }
      });
    });;
    console.log("Video stored to s3 bucket")
    // Construct the S3 URL
    const s3Url = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;

    console.log("URL.......", s3Url)
  

       const data2 = await chatMessage.updateOne(
      { _id: data._id },
      { reel_reaction: s3Url }
    );
        const data3 = await chatMessage.findOne({ _id: req.params.id }).select("reel_reaction");
  //  fs.unlink(outputPath, (err) => {
     // if (err) {
       // console.error('Error deleting temporary file:', err);
     // } else {
      //  console.log('Temporary file deleted');
    //  }
   // });


    return res.status(200).json({ msg: "completed.." ,data: data3 })

  } catch (error) {
    console.log(error, "errr");
    res.status(500).send('Internal server error');
  }
});



router.get("/reel-reaction/:id",auth,  async (req, res) => {
  try {
    const data = await Message.findOne({ _id: req.params.id }).select("video reelVideo");
//  return res.send({data:data, id:req.params.id})


        if (!data) {
      return res.status(404).send({ msg: "No Data Found!" })
    }


    const uniqueFileName = `output_${req.params.id}_${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, uniqueFileName);
    let imagePath = path.join(__dirname, "reeltalk.png");


    const s3 = new AWS.S3({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
      },
    });

     await new Promise((resolve, reject) => {
      ffmpeg()
        .input(data.video)
        .input(data.reelVideo)
        .input(imagePath)
        .complexFilter([
          '[0:v]scale=350:300[vid1];[1:v]scale=350:300[vid2];[vid1][vid2]vstack=2[stacked]', // Scale and stack videos
          '[2:v]scale=70:65[overlay]',
          '[stacked][overlay]overlay=W-w-10:H-h-10[outv]'
        ])
        .outputOptions('-map', '[outv]')
        .outputOptions('-c:v', 'libx264')
        .output(outputPath)
        .on('end', async function () {


          console.log('Video uploaded to S3');
          resolve(outputPath);
  
        })
        .on('error', function (err) {
          reject(err);
          console.error('Error: ' + err.message);
        })
     .run();
        
    });


    const s3Key = `reelreaction_${Date.now()}.mp4`;
    // Upload the video to S3
    const uploadParams = {
      Bucket: 'reelmails',
      Key: s3Key, // The name you want to give to the video in S3
      Body: fs.createReadStream(outputPath),
      ACL: 'public-read',
      ContentType: 'video/mp4'
    };

     const uploadResponse = await s3.upload(uploadParams).promise().then((res) =>{
      fs.unlink(outputPath, (err) => {
        if (err) {
          console.error('Error deleting temporary file:', err);
        } else {
          console.log('Temporary file deleted');
        }
      });
    });;
    console.log("Video stored to s3 bucket")
    // Construct the S3 URL
    const s3Url = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;

    console.log("URL.......", s3Url)
    // const msg = new Message({
    //   reel_reaction: s3Url
    // })

      const data2 = await Message.updateOne(
      { _id: data._id },
      { reel_reaction: s3Url }
    );
                  const data3 = await Message.findOne({ _id: req.params.id }).select("reel_reaction");

    


       // fs.unlinkSync(outputPath, (err) => {
     // if (err) {
      // console.error('Error deleting temporary file:', err);
     // } else {
       // console.log('Temporary file deleted');
   //  }
  // });    

    return res.status(200).json({ msg: "completed..", data: data3 })

  } catch (error) {
    console.log(error, "errr");
    res.status(500).send('Internal server error', error);
  }
});




router.get("/:id", auth, async (req, res) => {
  try {
    var messages = await Message.find({ roomId: req.params.id })
      .sort({ date: -1 })
      .populate("reciever")
      .populate("sender").populate({
        path: 'post',
        populate: {
          path: 'postCategory',
          model: 'posttype'
        }
      }) ;

    var newMessages = messages.map((val) => {
      return {
        _id: val._id,
        user: val.sender,
         post: val.post,
         reciver: val.reciever,
        createdAt: val.date,
        text: val.message,
        image: val.image ? val.image : undefined,
        video: val.video ? val.video : val?.replyVideo? val.replyVideo :  undefined,
        reelVideo: val.reelVideo ? val.reelVideo : undefined,
        reel: val.reel,
        messageType: val.messageType,
        isReelCompleted: val.isReelCompleted,
        reaction:val?.reaction,
        messageType:val?.messageType,
        post :val?.post,
        // replyVideo:val?.replyVideo? val.replyVideo : null,
      };
    });

    const transformedUsers = newMessages.map((user) => {
      return {
        user: {
          _id: user.user._id,
          name: user.user.username,
          avatar: `${user.user.media}`,
        },
  post: user.post,
        reciever: {
          _id: user?.reciver?._id,
          name:user?.reciver?.username,
          avatar:user?.reciver?.media
        },
        createdAt: user.createdAt,
        text: user.text,
        _id: user._id,
        image: user.image ? `${user.image}` : null,
        video: user.video ? `${user.video}` : null,
        reelVideo: user.reelVideo ? `${user.reelVideo}` : null,
        reel: user.reel,
        messageType: user.messageType,
        isReelCompleted: user.isReelCompleted,
        reaction:user?.reaction,
        messageType:user?.messageType,
        post :user?.post,
        // replyVideo: user?.replyVideo? user.replyVideo : null,
      };
    });

    return res.json({ transformedUsers, status: 200 });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/", auth, async (req, res) => {
  console.log("sendmesssage")
  const { roomId, user,post,  reciver, text, reel, image, video, isReelCompleted } = req.body;
  try {
    const newMessage = await new Message({
      roomId: roomId,
      sender: user,
   post: post,
      reciever: reciver,
      image: image ? image : null,
      video: video ? video : null,
      message: text,
      reel: reel ? reel : false,
      isReelCompleted: isReelCompleted ? isReelCompleted : false,
    });
    const recUser = await User.findById(reciver);
    const sendingUser = await User.findById(user);
    const message = await newMessage.save();
    if (recUser.fcmToken) {
     await  sendFirebaseNotifications(
        `${sendingUser.firstName} Sent You A Post`,
        recUser.fcmToken,
        JSON.stringify(sendingUser),
        "chat"
      );
    }
    console.log("heyyy")
    if(reel) {
      let user = await User.findById(req.user.id).select("-password");
      user.subscriptionType.reelCoin = user.subscriptionType.reelCoin - 0.25
      await user.save() 
      console.log("innnn")
      var userNotification = new Notification({
        message: `${sendingUser?.username || sender?.firstName} sent a new reel`,
        roomId: roomId,
        user: recUser._id,
        textMessage:message?._id,
        type: "message"
      })
      await userNotification.save()   
    }

    return res.json({ newMessage, status: 200 });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/reelmessage", auth, async (req, res) => {
  const {
    roomId,
    user,
    reciver,
    text,
    reel,
    image,
    isReelCompleted,
    reelVideo,
    video,
  } = req.body;
  try {
    const newMessage = await new Message({
      roomId: roomId,
      sender: user,
      reciever: reciver,
      image: image ? image : null,
      video: video ? video : null,
      reelVideo: reelVideo ? reelVideo : null,
      message: text,
      reel: reel ? reel : false,
      isReelCompleted: isReelCompleted ? isReelCompleted : false,
    });
    const recUser = await User.findById(reciver);
    const sendingUser = await User.findById(user);

    const message = await newMessage.save();
    if (recUser.fcmToken) {
      await sendFirebaseNotifications(
        `${sendingUser.firstName} Sent You A Post`,
        recUser.fcmToken,
        JSON.stringify(sendingUser),
        "chat"
      );
       var userNotification = new Notification({
         message: `${sendingUser?.username || sender?.firstName} recorded a reel reaction on your reelmail`,
         roomId: roomId,
         user: recUser._id,
         type: "message",
         textMessage:message._id
      //   message:message?._id
       })
       await userNotification.save()  
    }

    return res.json({ newMessage, status: 200 });
  } catch (err) {
    console.log(err, "Err");
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
