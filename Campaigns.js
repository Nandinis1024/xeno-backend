const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    audience : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Communication',
    },
}, { timestamps: true }
);

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = Campaign;