use('project2');

use('project2');

db.legislators.aggregate([
  {
    $unwind: "$terms" // Expand the terms array
  },
  {
    $group: {
      _id: "$id.bioguide", // Group by the unique legislator identifier
      firstName: { $first: "$name.first" },
      middleName: { $first: "$name.middle" },
      lastName: { $first: "$name.last" },
      servedInHouse: {
        $addToSet: {
          $cond: [{ $eq: ["$terms.type", "rep"] }, true, false]
        }
      },
      servedInSenate: {
        $addToSet: {
          $cond: [{ $eq: ["$terms.type", "sen"] }, true, false]
        }
      }
    }
  },
  {
    $match: {
      // Check if the legislator served in both House and Senate
      servedInHouse: { $in: [true] },
      servedInSenate: { $in: [true] }
    }
  },
  {
    $project: {
      _id: 0,
      fullName: {
        $concat: [
          "$firstName",
          " ",
          { $ifNull: ["$middleName", ""] },
          " ",
          "$lastName"
        ]
      }
    }
  }
]).toArray();
  