const User = require('../../models/userdb');
async function fetchUserDetails(req, res) {
  try {
    const Users = await User.find({});
    return res.render('adminCustomers', {
      Users: Users
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
}
async function blockUser(req, res) {
  try {
    console.log(req.body);
    // Update the user's isBlocked field to true
    await User.findOneAndUpdate({
      'email': req.body.email
    }, {
      'isBlocked': true
    });
    return res.status(200).json({
      message: 'User blocked successfully'
    });
  } catch (error) {
    console.error('Error blocking the user:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
async function unblockUser(req, res) {
  try {
    // Update the user's isBlocked field to false
    await User.findOneAndUpdate({
      'email': req.body.email
    }, {
      'isBlocked': false
    });
    return res.status(200).json({
      message: 'User unblocked successfully'
    });
  } catch (error) {
    console.error('Error unblocking the user:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
module.exports = {
  blockUser: blockUser,
  unblockUser: unblockUser,
  fetchUserDetails: fetchUserDetails
};