import { useToast } from 'vue-toastification'

 class Notify {
    constructor(){
        this.position = 'bottom-right';
        this.driver = useToast({
            position: this.position,
            transition: "Vue-Toastification__bounce", maxToasts: 10, newestOnTop: false
        });
        this.infoTimtout = 1000 * 2;
        this.successTimtout = 1000 * 2;
    }
    success(msg, detail){
        this.driver.success(msg + '\n' + (detail ? detail : ''), {timeout: this.successTimtout})
    }
    info(msg, detail){
        this.driver.info(msg + '\n' + (detail ? detail : ''), {timeout: this.infoTimtout})
    }
    error(msg, detail){
        this.driver.error(msg + '\n' + (detail ? detail : ''))
    }
    warning(msg, detail){
        this.driver.warning(msg + '\n' + (detail ? detail : ''))
    }
    warn(msg, detail){
        this.warning(msg + '\n' + (detail ? detail : ''))
    }
}

export default new Notify()
