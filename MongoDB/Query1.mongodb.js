use('project2');


db.executives.aggregate([
    {
      $unwind: "$terms" // Expand the terms array
    },
    {
      $match: {
        "terms.type": "prez" // Filter only presidential terms
      }
    },
    {
      $group: {
        _id: {
          id: { $ifNull: ["$id.icpsr_prez", "$id.opensecrets"] } // Use icpsr_prez if available, otherwise opensecrets
        },
        fullName: { 
          $first: { 
            $concat: ["$name.first", " ", { $ifNull: ["$name.middle", ""] }, " ", "$name.last"] 
          } 
        },
        party: { $first: "$terms.party" } // Select one party from the terms
      }
    },
    {
      $project: {
        _id: 0,
        fullName: 1,
        party: 1
      }
    }
  ]).toArray();