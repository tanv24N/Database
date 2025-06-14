use('project2');

db.executives.aggregate([
  {
    $unwind: "$terms" // Expand the terms array
  },
  {
    $match: {
      "terms.type": "viceprez", // Filter for vice presidents
      "terms.how": "appointment" // Filter for appointed vice presidents
    }
  },
  {
    $project: {
      _id: 0,
      fullName: {
        $concat: [
          "$name.first", " ",{ $ifNull: ["$name.middle", ""] }," ", "$name.last"
        ]
      }
    }
  }
]).toArray();
