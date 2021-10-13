class AuthApi {
  constructor() {
    this.client = axios.create();
    this.token = undefined;
    this.rr = 'lolol';

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
        return data.message;
      }
      return false;
    } catch (err) {
      console.log(`Error ${err.name}: ${err.message}`);
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
      console.log(`Error ${err.name}: ${err.message}`);
    }
  }

  getCookieToken() {
    const matches = document.cookie.match(new RegExp(
      `(?:^|; )${'token'.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`,
    ));
    this.token = matches ? decodeURIComponent(matches[1]) : undefined;
  }
}

const authClient = new AuthApi();
export { authClient };
