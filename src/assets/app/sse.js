import { reactive } from "vue"
import _ from 'lodash'
import axios from "axios";
// import VueCookies from 'vue-cookies';
import notify from "./notify";

const COOKIE_SESSOIN_ID = 'gfsessionid';

class ServerEvents {
    constructor() {
        this.id = _.uniqueId('sse-')
        this.connection = null;
        this.subscription = {}
        this.session_id = null;
    }
    listen(session_id) {
        this.session_id = session_id;
        if (!session_id) {
            throw Error("SSE start faild because session id is null")
        }
        let sseUrl = `${axios.defaults.baseURL}/sse?session_id=${session_id}`
        console.debug("SSE", "connect to", sseUrl)
        if (this.connection) {
            this.connection.close()
            this.connection = null
        }
        this.connection = new EventSource(sseUrl, { withCredentials: true })
        let self = this;
        this.connection.onmessage = function (event) {
            let data = JSON.parse(event.data);
            console.debug('receive message event, data:', data)
            let eventName = data.name;

            let handler = self.subscription[eventName];
            if (handler) {
                // 处理订阅的事件
                handler(data)
            } else {
                self.defaultMessageHandler(data)
            }
        }
    }
    defaultMessageHandler(data) {
        if (!data) {
            console.warn('message data is empty: event:', event)
            return
        }
        switch (data.level) {
            case 'success':
                notify.success(data.name, data.detail)
                break;
            case 'error':
                notify.error(data.name, data.detail)
                break;
            case 'warning':
                notify.warning(data.name, data.detail)
                break;
            default:
                notify.info(data.name, data.detail)
                break;
        }
    }
    subscribe(eventName, handler) {
        // 订阅的事件
        this.subscription[eventName] = handler
    }
    close() {
        if (this.connection) {
            console.info("SSE", "close connection")
            this.connection.close()
            this.connection = null;
        }
    }
}

const SES = reactive(new ServerEvents());
export default SES;

