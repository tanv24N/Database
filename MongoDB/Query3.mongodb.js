use('project2');

db.executives.aggregate([
    {
      $unwind: "$terms" // Expand the terms array
    },
    {
      $match: {
        "terms.type": "prez", // Only consider presidential terms
        "terms.party": "no party" // Filter for presidents with no party affiliation
      }
    },
    {
      $group: {
        _id: "$id.icpsr_prez", // Group by unique president identifier
        fullName: { 
          $first: { 
            $concat: ["$name.first", "", { $ifNull: ["$name.middle", ""] }, " ", "$name.last"] 
          } 
        }
      }
    },
    {
      $group: {
        _id: null, // Group all results to get the count
        count: { $sum: 1 }, // Count the number of presidents
        presidents: { $push: "$fullName" } // Collect all names in an array
      }
    },
    {
      $project: {
        _id: 0,
        count: 1,
        presidents: 1
      }
    }
  ]);