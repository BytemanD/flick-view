import axios from 'axios';



class Restfulclient {
    constructor(baseUrl, async = false) {
        this.async = async;
        this.baseUrl = baseUrl;
    }
    getHeaders() {
        return null;
    }
    _parseToQueryString(filters) {
        if (!filters) { return '' }
        let queryParams = [];
        for (var key in filters) {
            if (Array.isArray(filters[key])) {
                LOG.debug(`filters: ${filters[key]}`)
                filters[key].forEach(value => {
                    queryParams.push(`${key}=${value}`)
                })
            } else {
                queryParams.push(`${key}=${filters[key]}`)
            }
        }
        return queryParams.join('&');
    }
    async waitDeleted() {

    }
    _getErrorMsg(response) {
        let errorData = response ? response.data : {};
        if (errorData.badRequest && errorData.badRequest.message) {
            return errorData.badRequest.message
        } else {
            return JSON.stringify(errorData)
        }
    }
    async get(url = null, filters = {}) {
        let reqUrl = this.baseUrl;
        if (url) {
            if (url.startsWith('/')) {
                reqUrl = url;
            } else {
                reqUrl = `${this.baseUrl}/${url}`;
            }
        }
        let queryString = this._parseToQueryString(filters);
        if (queryString) { reqUrl += `?${queryString}` }
        let resp = await axios.get(reqUrl, { headers: this.getHeaders() });
        return resp.data
    }
    async delete(id) {
        let resp = await axios.delete(
            `${this.baseUrl}/${id}`, { headers: this.getHeaders() });
        return resp.data
    }
    async doPost(body, url = null) {
        try {
            let reqUrl = this.baseUrl;
            if (url) {
                if (url.startsWith('/')) {
                    reqUrl = url;
                } else {
                    reqUrl = `${this.baseUrl}/${url}`;
                }
            }
            let resp = await axios.post(
                reqUrl, body, { headers: this.getHeaders() });
            return resp
        } catch (e) {
            console.error(this._getErrorMsg(e.response));
            throw Error(this._getErrorMsg(e.response))
        }
    }
    async post(url, body) {
        let resp = await this.doPost(body, url)
        return resp.data
    }
    async put(id, body) {
        let resp = await axios.put(`${this.baseUrl}/${id}`, body, { headers: this.getHeaders() });
        return resp.data
    }
    async show(id, filters = null) {
        let url = filters ? `${id}?${this._parseToQueryString(filters)}` : id;
        let data = await this.get(`${url}`, { headers: this.getHeaders() });
        return data
    }
    async list(filXters = {}) {
        let queryString = this._parseToQueryString(filters);
        let url = this.baseUrl;
        if (queryString) { url += `?${queryString}` }
        let resp = await axios.get(`${url}`, { headers: this.getHeaders() });
        return resp.data;
    }
    async patch(id, body, headers = {}) {
        let config = { headers: this.getHeaders() };
        for (let key in headers) {
            config.headers[key] = headers[key];
        }
        let resp = await axios.patch(`${this.baseUrl}/${id}`, body, config);
        return resp.data
    }
    async postAction(id, action, data) {
        let body = {};
        body[action] = data;
        return (await axios.post(
            `${this.baseUrl}/${id}/action`, body, { headers: this.getHeaders() })).data;
    }

    async listActive() {
        return (await this.list({ status: 'active' }))
    }
}

class Node extends Restfulclient {
    constructor() {
        super('/node');
    }
    async platform() {
        return (await this.get('info')).info;
    }
    async cpu() {
        return (await this.get('cpu')).cpu;
    }
    async memory() {
        return (await this.get('memory')).memory;
    }
    async disk() {
        return (await this.get('disk')).disk;
    }

}

class Pip extends Restfulclient {
    constructor() {
        super('/pip');
    }
    async version() {
        return (await this.get('version')).version;
    }
    async packages(filters = {}) {
        return (await this.get('packages', filters)).packages;
    }
    async uninstall(name) {
        return await this.delete(`packages/${name}`);
    }
    async install(name, { noDeps = false, force = false, upgrade = false } = {}) {
        let data = { name: name, noDeps: noDeps, force: force, upgrade: upgrade }
        return await this.post('packages', data);
    }
    async get_versions(name) {
        return await this.get(`packages/${name}/versions`);
    }
    async get_repos() {
        return (await this.get('repos')).repos;
    }
    async get_config() {
        return (await this.get('config')).config;
    }
    async set_config(key, value) {
        return await this.post('config', { key: key, value: value });
    }
}
class Docker extends Restfulclient {
    constructor() {
        super('/docker');
    }
    async images() {
        return (await this.get('images')).images;
    }
}

export class FlickAPI {
    constructor() {
        this.node = new Node();
        this.pip = new Pip();
        this.docker = new Docker();
    }
}


axios.defaults.baseURL = import.meta.env.VITE_BACKEND_BASE_URl || '';
console.log(`backend base url is: '${axios.defaults.baseURL}'`,)
Restfulclient.prototype.getHeaders = function () {
    return {};
}
const API = new FlickAPI();

export default API;
