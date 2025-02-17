const { RESTDataSource } = require('apollo-datasource-rest')

// REST API DataSource
class LaunchAPI extends RESTDataSource {
  constructor () {
    super()
    this.baseURL = 'https://api.spacexdata.com/v2/'
  }
  
  async getAllLaunches () {
    const response = await this.get('launches')
    return Array.isArray(response)
      ? response.map(launch => this.launchReducer(launch))
      : []
  }
  
  // to transform the data into that shape
  launchReducer (launch) {
    return {
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
    }
  }
  
  getLaunchesByIds({ launchIds }) {
    return Promise.all(
      launchIds.map(launchId => this.getLaunchById({ launchId })),
    );
  }
  
  async getLaunchById({ launchId }) {
    const response = await this.get('launches', { flight_number: launchId });
    return this.launchReducer(response[0]);
  }
}

module.exports = LaunchAPI