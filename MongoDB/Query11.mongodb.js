use('project2');

db.executives.aggregate([
  // Unwind the terms array
  { $unwind: "$terms" },
  // Filter only presidential terms
  { $match: { "terms.type": "prez" } },
  // Normalize party names
  {
    $addFields: {
      normalizedParty: {
        $cond: {
          if: { $or: [{ $eq: ["$terms.party", "Democrat"] }, { $eq: ["$terms.party", "Democratic"] }] },
          then: "Democratic",
          else: "$terms.party"
        }
      }
    }
  },
  // Calculate duration for each presidential term
  {
    $addFields: {
      termDuration: {
        $divide: [
          { $subtract: [{ $dateFromString: { dateString: "$terms.end" } }, { $dateFromString: { dateString: "$terms.start" } }] },
          1000 * 60 * 60 * 24 * 365 // Convert milliseconds to years
        ]
      }
    }
  },
  // Group by normalized party
  {
    $group: {
      _id: "$normalizedParty",
      totalPresidentialTerms: { $sum: 1 }, // Count the number of terms
      totalYears: { $sum: "$termDuration" }, // Sum all term durations
    }
  },
  // Calculate the average term duration
  {
    $addFields: {
      averageDuration: { $divide: ["$totalYears", "$totalPresidentialTerms"] }
    }
  },
  // Project the final result
  {
    $project: {
      _id: 0,
      party: "$_id",
      totalPresidentialTerms: 1,
      totalYears: { $round: ["$totalYears", 2] }, // Round to 2 decimal places
      averageDuration: { $round: ["$averageDuration", 2] } // Round to 2 decimal places
    }
  },
  // Sort by party name
  { $sort: { party: 1 } }
]).toArray();