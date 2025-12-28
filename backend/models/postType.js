const mongoose = require('mongoose')

const postTypeSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    time: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})

module.exports = postType = mongoose.model('posttype', postTypeSchema)
