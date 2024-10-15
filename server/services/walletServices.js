const Wallet = require('../models/wallet');
const { ObjectId } = require('mongodb');


async function calculateWalletSum(userId) {
    try {
        if (typeof userId === 'string') {
            userId = new ObjectId(userId);
        }
        
        const walletSumResult = await Wallet.aggregate([{
                $match: {
                    user_id: userId
                },
            },
            {
                $group: {
                    _id: "$user_id",
                    totalWalletAmount: {
                        $sum: '$walletAmount'
                    },
                },
            },
        ]);

        if (walletSumResult.length > 0) {
            const totalWalletAmount = walletSumResult[0].totalWalletAmount;
            console.log(`Total Wallet Amount for user ${userId}: ${totalWalletAmount}`);
            return totalWalletAmount;
        } else {
            console.log(`No wallet records found for user ${userId}`);
            return 0; // or any default value if there are no wallet records
        }
    } catch (error) {
        console.error('Error calculating wallet sum:', error);
        throw error;
    }
}


module.exports = {
    calculateWalletSum: calculateWalletSum
}