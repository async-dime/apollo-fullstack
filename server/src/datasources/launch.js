const { RESTDataSource } = require('apollo-datasource-rest');

// The RESTDataSource class automatically caches responses from REST resources with no additional setup. 
// We call this feature partial query caching. 
// It enables you to take advantage of the caching logic that the REST API already exposes.
class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api/spacexdata.com/v2/';
  }
}

module.exports = LaunchAPI;
