class AuthApi {
  constructor() {
    this.client = axios.create();
    this.token = undefined;

    this.client.interceptors.request.use((config) => {
      if (!this.token) {
        return config;
      }

      const newConfig = {
        headers: {},
        ...config,
      };
      newConfig.headers.Authorization = `Bearer ${this.token}`;
      return newConfig;
    }, (err) => Promise.reject(err));
  }

  async login(formData) {
    try {
      const { data } = await this.client.post('/auth/login', formData);
      if (data.token) {
        this.token = `${(data.token).toString()}`;
        return data;
      }
      return false;
    } catch (err) {
      console.log(err.response.data);
    }
  }

  async registration(formData) {
    try {
      const response = await this.client.post('/auth/registration', formData);
      const data = await response.data;
      if (data.token) {
        this.token = `${data.token}`;
        return data.message;
      }
      return false;
    } catch (err) {
      console.log(err.response.data);
    }
  }

  getCookieToken(tokenName) {
    try{
      const allCookies = document.cookie.split(';');
    let cookiesObj = {};
    allCookies.forEach((elem,i) => {
      const curr = elem.split('=');
      cookiesObj[curr[0].trim()] = curr[1].trim();
    })
    this.token = cookiesObj[tokenName];
    }catch(err){
      console.log(err);
    }
    
  }
}

const authClient = new AuthApi();
export { authClient };
