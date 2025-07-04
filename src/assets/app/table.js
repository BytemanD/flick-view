import notify from '@/assets/app/notify';
import API from '@/assets/app/api';


class DataTable {
    constructor(resource, headers) {
        this.resource = resource,
            this.headers = headers;
        this.loading = false;
        this.search = '';
        this.items = {}
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

    async fetch() {
        throw Error('fetch is not implemented')
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