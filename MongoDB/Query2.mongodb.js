use('project2');

db.legislators.aggregate([
  {
    $unwind: "$terms" // Expand the terms array
  },
  {
    $match: {
      "terms.party": { $ne: null } // Exclude documents with null party
    }
  },
  {
    $group: {
      _id: {
        normalizedParty: { $toLower: "$terms.party" } // Normalize the party field to lowercase
      }
    }
  },
  {
    $project: {
      _id: 0,
      party: { $concat: [{ $toUpper: { $substr: ["$_id.normalizedParty", 0, 1] } }, { $substr: ["$_id.normalizedParty", 1, -1] }] } // Capitalize the first letter of the party name
    }
  },
  {
    $sort: {
      party: 1 // Sort the result alphabetically by party name
    }
  }
]).toArray();
