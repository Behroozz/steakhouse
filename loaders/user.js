const User = require('../database/models/user')

module.exports.batchUsers = async (userIds) => {
  console.log('keys====', userIds)
  const users = await User.find({ _id: { $in: userIds }})
  return userIds.map(userId => users.find(user => user.id === userId))
  // Database will return ids in different order [1, 2, 3]=> [user2, user1, user3]
  // For Dataloader it should be correct order
}