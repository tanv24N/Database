use('project2');

db.executives.aggregate([
  { $unwind: "$terms" },
  { $match: { "terms.type": "viceprez" } },
  //Field to calculate the duration of each term
  {
    $addFields: {
      termDuration: {
        $subtract: [
          { $dateFromString: { dateString: "$terms.end" } },
          { $dateFromString: { dateString: "$terms.start" } }
        ]
      }
    }
  },
  // Group by unique identifier and calculate total duration
  {
    $group: {
      _id: { $ifNull: ["$id.icpsr", "$id.bioguide"] },
      fullName: {
        $first: {
          $concat: [
            "$name.first",
            " ",
            { $ifNull: ["$name.middle", "" ] },
            " ",
            "$name.last"
          ]
        }
      },
      totalDuration: { $sum: "$termDuration" }
    }
  },
  // Project the final result with duration converted to years
  {
    $project: {
      _id: 0,
      fullName: 1,
      totalDurationInYears: {
        $divide: ["$totalDuration", 31536000000] // Convert milliseconds to years
      }
    }
  }
]).toArray();
