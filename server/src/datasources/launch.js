const { RESTDataSource } = require('apollo-datasource-rest');

// The RESTDataSource class automatically caches responses from REST resources with no additional setup.
// We call this feature partial query caching.
// It enables you to take advantage of the caching logic that the REST API already exposes.
class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.spacexdata.com/v2/';
  }

  async getAllLaunches() {
    // The call to this.get('launches') sends a GET request to https://api.spacexdata.com/v2/launches and stores the array of returned launches in response.
    const response = await this.get('launches');
    return Array.isArray(response)
      ? // We use this.launchReducer to transform each returned launch into the format expected by our schema.
        response.map((launch) => this.launchReducer(launch))
      : // If there are no launches, an empty array is returned.
        [];
  }

  // fetching an individual launch by its ID.
  async getLaunchById({ launchId }) {
    // It takes a launch's flight number and returns the data for the associated launch
    const response = await this.get('launches', { flight_number: launchId });
    return this.launchReducer(response[0]);
  }

  // returns the result of multiple calls to getLaunchById
  getLaunchesByIds({ launchIds }) {
    return Promise.all(
      launchIds.map((launchId) => this.getLaunchById({ launchId }))
    );
  }

  // transforms launch data from the REST API into `Launch` object type in our schema.
  launchReducer(launch) {
    return {
      // Notice that launchReducer doesn't set a value for the `isBooked` field in our schema. 
      // That's because the Space-X API doesn't know which trips a user has booked! 
      // That field will be populated by our other data source, which connects to a SQLite database.
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch,
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
    };
  }
}

module.exports = LaunchAPI;
