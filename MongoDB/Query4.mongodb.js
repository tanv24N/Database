use('project2');

db.legislators.aggregate([
    {
      $match: {
        "bio.gender": "F" // Filter for female legislators
      }
    },
    {
      $unwind: "$terms" // Expand the terms array to process each term individually
    },
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
    {
      $group: {
        _id: "$id.bioguide", // Group by unique legislator
        fullName: {
          $first: {
            $concat: ["$name.first", " ", { $ifNull: ["$name.middle", "" ] }, " ", "$name.last"]
          }
        },
        totalDuration: { $sum: "$termDuration" } // Sum all term durations
      }
    },
    {
      $sort: {
        totalDuration: -1 // Sort by total duration in descending order
      }
    },
    {
      $limit: 1 // Select the longest-serving legislator
    },
    {
      $project: {
        _id: 0,
        fullName: 1,
        totalDurationInYears: {
          $divide: ["$totalDuration", 1000 * 60 * 60 * 24 * 365] // Convert duration from milliseconds to years
        }
      }
    }
  ]);
  