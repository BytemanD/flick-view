import { useToast } from 'vue-toastification'

 class Notify {
    constructor(){
        this.position = 'bottom-right';
        this.driver = useToast({
            position: this.position,
            transition: "Vue-Toastification__bounce", maxToasts: 10, newestOnTop: false
        });
        this.infoTimtout = 1000 * 3;
        this.successTimtout = 1000 * 3;
    }
    success(msg, timeout=null){
        this.driver.success(msg, {timeout: timeout || this.successTimtout})
    }
    info(msg){
        this.driver.info(msg, {timeout: this.infoTimtout})
    }
    error(msg){
        this.driver.error(msg, )
    }
    warning(msg){
        this.driver.warning(msg)
    }
    warn(msg){
        this.warning(msg)
    }
}

export default new Notify()
