const express = require("express");
const router = express.Router();
const postType = require("../../models/postType");
const auth = require("../../middleware/auth");


router.get("/getType", async (req, res) => {
    try {
        const data = await postType.find().sort({ _id: -1 });
        if (!data) return res.status(400).send({ success: true, msg: "No data available" })

        res.status(200).json({ success: true, msg: "post data", data: data })
    } catch (error) {
        res.status(500).send({ success: false, msg: "Internal server error", error })
    }
})


router.post("/add", async (req, res) => {
    try {
        const { type, time } = req.body

        const find = await postType.findOne({ type: type });

        if (find) return res.status(400).json({ success: false, msg: " Type is already there " })

        const createdtype = await postType.create({
            type: type,
            time: time
        })

        res.status(200).json({
            success: true, msg: "Type Created Successfully", data: createdtype
        })


    } catch (error) {
        res.status(500).send({ msg: "Internal server error", error })
    }
})




module.exports = router;
