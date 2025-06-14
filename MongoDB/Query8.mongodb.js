use('project2');

db.executives.aggregate([
  {
    $unwind: "$terms" // Expand the terms array
  },
  {
    $addFields: {
      normalizedParty: {
        $switch: {
          branches: [
            { case: { $in: ["$terms.party", ["Democrat", "Democratic"]] }, then: "Democratic" }
          ],
          default: "$terms.party" // Keep the original party if no normalization is needed
        }
      }
    }
  },
  {
    $group: {
      _id: { party: "$normalizedParty", type: "$terms.type" }, // Group by normalized party and term type
      count: { $sum: 1 } // Count the terms
    }
  },
  {
    $group: {
      _id: "$_id.party", // Group by party
      presidentTerms: {
        $sum: {
          $cond: [{ $eq: ["$_id.type", "prez"] }, "$count", 0] // Sum terms for presidents
        }
      },
      vicePresidentTerms: {
        $sum: {
          $cond: [{ $eq: ["$_id.type", "viceprez"] }, "$count", 0] // Sum terms for vice presidents
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      party: "$_id", // Include normalized party name
      presidentTerms: 1,
      vicePresidentTerms: 1
    }
  },
  {
    $sort: { party: 1 } // Sort alphabetically by party
  }
]).toArray();