const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['group', 'direct'],
      required: true,
    },
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House',
      required: true,
      index: true,
    },
    participantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
  },
  { timestamps: true }
);

// Compound index to quickly find group conversations by house
conversationSchema.index({ houseId: 1, type: 1 });
// Compound index to locate direct conversations between specific participants in a house
conversationSchema.index({ houseId: 1, type: 1, participantIds: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
