import notify from '@/assets/app/notify';
import API from '@/assets/app/api';


class DataTable {
    constructor(resource, headers) {
        this.resource = resource,
            this.headers = headers;
        this.loading = false;
        this.search = '';
        this.items = []
    }

    async refresh() {
        this.loading = true;
        try {
            this.items = await this.fetch()
        } catch (e) {
            console.error("刷新失败", e)
            notify.error("刷新失败")
        } finally {
            this.loading = false;
        }
    }
    updateItem(updatedItem) {
        for (let i in this.items) {
            let item = this.items[i];
            if (item.id && item.id == updatedItem.id) {
                Object.assign(this.items[i], updatedItem);
                break
            }
            if (item.name && item.name == updatedItem.name) {
                Object.assign(this.items[i], updatedItem);
                break
            }
        }
    }
    removeItem(item) {
        for (let i in this.items) {
            if (item.id && item.id == this.items[i].id) {
                this.items.splice(i, 1)
                break
            }
            if (item.name && item.name == this.items[i].name) {
                this.items.splice(i, 1)
                break
            }
        }
    }
    async fetch() {
        throw Error('fetch is not implemented')
    }
}
export class PyPackageDataTable extends DataTable {
    constructor() {
        super(
            '包',
            [
                { title: '名称', value: 'name' },
                { title: '版本', value: 'version' },
                { title: '描述', value: 'sumary' },
                { title: '操作', value: 'actions' },
            ])
    }
    async fetch() {
        return await API.pip.packages()
    }
    async uninstallPackage(name) {
        try {
            notify.info(`开始卸载 ${name}...`)
            await API.pip.uninstall(name)
        } catch (e) {
            console.error(e)
            notify.error(`卸载 ${name} 失败: ${e.message}`)
        }
    }

}
export class ContainerDataTable extends DataTable {
    constructor() {
        super(
            '容器',
            [
                { title: 'ID', value: 'short_id' },
                { title: '名称', value: 'name' },
                { title: '镜像', value: 'image' },
                { title: '命令', value: 'command' },
                { title: '自动删除', value: 'autoRemove' },
                { title: '状态', value: 'status' },
                { title: '操作', value: 'actions' },
            ])
    }
    async fetch() {
        return await API.docker.containers({ all_status: true })
    }
    async startContainer(item) {
        notify.info(`启动容器 ${item.name}`)
        try {
            await API.docker.startContainer(item.name)
        } catch (e) {
            console.error(e)
            notify.error("启动失败")
            return
        }
    }
    async stopContainer(item) {
        notify.info(`关闭容器 ${item.name}`)
        try {
            await API.docker.stopContainer(item.name)
        } catch (e) {
            console.error(e)
            notify.error("关闭失败")
            return
        }
    }
    async rmContainer(item, force = false) {
        notify.info(`删除容器 ${item.name}`)
        try {
            await API.docker.rmContainer(item.id || item.name, force)
            notify.success("删除成功")
            this.removeItem(item)
        } catch (e) {
            console.error(e)
            notify.error("删除失败")
            return
        }
    }
    async createContainer(image, { name = null, command = null, authRemove = false } = {}) {
        notify.info(`创建容器`)
        try {
            await API.docker.createContainer(image,
                { name: name, command: command, authRemove: authRemove }
            )
        } catch (e) {
            console.error(e)
            notify.error("创建失败")
            throw e
        }
        this.refresh()
    }
}
export class ImageDataTable extends DataTable {
    constructor() {
        super(
            '镜像',
            [
                { title: 'ID', value: 'short_id', },
                { title: '标签', value: 'tags' },
                { title: '大小', value: 'size' },
                { title: '操作', value: 'actions' },
            ])
    }
    async fetch() {
        return await API.docker.images({ all_status: true })
    }
    async removeTag(id, tag) {
        try {
            let image = await API.docker.removeImageTag(id, tag)
            if (!image) {
                this.removeItem({ id: id })
            } else {
                this.updateItem(image)
            }
        } catch (e) {
            notify.error(`标签 ${tag} 删除失败`)
            return
        }
    }
    async addTag(id, tag) {
        try {
            let image = await API.docker.addImageTag(id, tag)
            this.updateItem(image)
        } catch (e) {
            notify.error(`标签 ${tag} 添加失败`)
            return
        }
    }
    async removeImage(id) {
        try {
            await API.docker.removeImage(id)
            this.removeItem({ id: id })
        } catch (e) {
            notify.error('删除失败', '')
        }
    }
    async pruneImages() {
        notify.info("清理镜像 ...")
        await API.docker.pruneImages()
        this.refresh()
    }
}
export class VolumeDataTable extends DataTable {
    constructor() {
        super(
            '卷',
            [
                { title: 'ID', value: 'short_id' },
                { title: '驱动', value: 'driver' },
                { title: '标签', value: 'labels' },
                // { title: '挂载点', value: 'mountpoint', width: '20px'   },
                { title: '创建时间', value: 'created_at' },
                { title: '操作', value: 'actions' },
            ])
    }
    async fetch() {
        return await API.docker.volumes({ all_status: true })
    }

    async removeVolume(item) {
        notify.info(`删除卷 ${item.short_id}`)
        try {
            await API.docker.removeVolume(item.name)
        } catch (e) {
            console.error(e)
            notify.error(`卷 ${item.short_id} 删除失败`)
            return
        }
        for (let i in this.items) {
            if (this.items[i].name != item.name) {
                continue
            }
            this.items.splice(i, 1);
            break
        }
    }
}