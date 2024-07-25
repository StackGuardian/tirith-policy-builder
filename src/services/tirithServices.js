import axios from "axios"

class TirithServices {
  constructor(apiEnpoint = "https://testapi.qa.stackguardian.io/api/v1") {
    this.apiEnpoint = apiEnpoint
  }
  async getCloudResources(tirithProvider, cloudProvider) {
    try {
      let res = await axios.get(`${this.apiEnpoint}/tirith/${tirithProvider}/${cloudProvider}`, {
        // headers: this.headers(this.getToken())
      })
      return { data: res.data }
    } catch (error) {
      return { error: this.getErrorMessage(error) }
    }
  }

  async getResourceAttributes(tirithProvider, cloudProvider, resourceName) {
    try {
      let res = await axios.get(`${this.apiEnpoint}/tirith/${tirithProvider}/${cloudProvider}/${resourceName}.json`, {
        // headers: this.headers(this.getToken())
      })
      return { data: res.data }
    } catch (error) {
      return { error: this.getErrorMessage(error) }
    }
  }
}

export default new TirithServices()
