use('project2');

db.executives.aggregate([
        {
          $unwind: "$terms"
        },
        {
          $match: {
            "terms.type": "prez"
          }
        },
        {
          $lookup: {
            from: "legislators",// Name of the legislators collection
            let: {
              prezId: "$id.bioguide"
            },
            pipeline: [
              {
                $unwind: "$terms"
              },
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $ne: ["$terms.type", null]
                      },
                      {
                        $or: [
                          {
                            $eq: ["$terms.type", "rep"]
                          },
                          {
                            $eq: ["$terms.type", "sen"]
                          }
                        ]
                      },
                      // Check for Congress roles
                      {
                        $eq: [
                          "$id.bioguide",
                          "$$prezId"
                        ]
                      } // Match bioguide ID with the president
                    ]
                  }
                }
              }
            ],
            as: "congressRoles"
          }
        },
        {
          $match: {
            congressRoles: {
              $size: 0
            } // No match in Congress roles
          }
        },
        {
          $group: {
            _id: {
              id: {
                $ifNull: [
                  "$id.icpsr_prez",
                  "$id.opensecrets"
                ]
              } // Use icpsr_prez if available, otherwise opensecrets
            },
            fullName: {
              $first: {
                $concat: [
                  "$name.first",
                  " ",
                  {
                    $ifNull: ["$name.middle", ""]
                  },
                  " ",
                  "$name.last"
                ]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            fullName: 1
          }
        }
  ]).toArray();