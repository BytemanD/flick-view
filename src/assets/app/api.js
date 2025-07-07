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
            console.error('post error', e);
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
class Auth extends Restfulclient {
    constructor() {
        super('/auth');
    }
    async login() {
        return await this.post('login', {});
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
    async partitions(filters = {}) {
        return (await this.get('partitions', filters)).partitions;
    }
    async net_interfaces() {
        return (await this.get('net_interfaces')).net_interfaces;
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
    async updatePackage(name, version, { noDeps = false, force = false} = {}) {
        let data = { version: version, noDeps: noDeps, force: force }
        return await this.put(`packages/${name}`, data);
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
        return await this.put('config', { key: key, value: value });
    }
}
class Docker extends Restfulclient {
    constructor() {
        super('/docker');
    }
    async system() {
        return (await this.get('system')).system;
    }
    async images() {
        return (await this.get('images')).images;
    }
    async removeTag(tag) {
        await this.post(`images/actions`, {removeTag: {tag: tag}});
    }
    async removeImage(id) {
        await this.delete(`images/${id}`);
    }
    async pruneImages() {
        await this.delete('images');
    }
    async containers(filters = {}) {
        return (await this.get('containers', filters)).containers;
    }
    async startContainer(idOrName) {
        await this.put(`containers/${idOrName}`, { 'status': 'acitve' });
    }
    async stopContainer(idOrName) {
        await this.put(`containers/${idOrName}`, { 'status': 'stop' });
    }
    async pauseContainer(idOrName) {
        await this.put(`containers/${idOrName}`, { 'status': 'pause' });
    }
    async unpauseContainer(idOrName) {
        await this.put(`containers/${idOrName}`, { 'status': 'unpause' });
    }
    async rmContainer(idOrName) {
        await this.delete(`containers/${idOrName}`);
    }
    async volumes() {
        return (await this.get('volumes')).volumes;
    }
    async removeVolume(name) {
        await this.delete(`volumes/${name}`);
    }
}

export class FlickAPI {
    constructor() {
        this.node = new Node();
        this.pip = new Pip();
        this.docker = new Docker();
        this.auth = new Auth()
    }
}


axios.defaults.baseURL = import.meta.env.VITE_BACKEND_BASE_URl || '';
axios.defaults.withCredentials = true;
console.log(`backend base url is: '${axios.defaults.baseURL}'`,)
Restfulclient.prototype.getHeaders = function () {
    return {};
}
const API = new FlickAPI();

export default API;
