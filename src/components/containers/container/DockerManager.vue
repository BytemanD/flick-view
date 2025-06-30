<template>
    <v-tabs v-model="tab.value" bg-color="primary">
        <v-tab value="overview">概览</v-tab>
        <v-tab value="container">容器</v-tab>
        <v-tab value="image">镜像</v-tab>
        <v-tab value="volume">卷</v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab.value">
        <v-tabs-window-item value="overview">
            <v-row>
                <v-col lg="4" md="6" sm="12">
                    <v-card elevation="2" class="ma-1">
                        <v-card-text>
                            <list-key-value :object="system.info"></list-key-value>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="container">
            <!-- 容器 -->
            <v-row class="mt-1">
                <v-col cols="4">
                    <v-text-field v-model="tableContainers.search" placeholder="搜索" flat variant="outlined" class="mb-4"
                        prepend-inner-icon="mdi-magnify" />
                </v-col>
                <v-col class='ma-0'>
                    <v-toolbar density='compact'>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="refreshContainers()">刷新</v-btn>
                    </v-toolbar>
                </v-col>
            </v-row>
            <v-data-table density="compact" :loading="tableContainers.loading" :headers="tableContainers.headers"
                items-per-page="10" :items="tableContainers.items" :search="tableContainers.search">
                <template v-slot:item.size="{ item }">
                    {{ humanSize(item.size) }}
                </template>
                <template v-slot:item.tags="{ item }">
                    <template v-for="(tag, index) in item.tags" density='compact' class='ma-1'>
                        <v-chip density='compact' class='mt-1'> {{ tag }} </v-chip> <br />
                    </template>
                </template>
                <template v-slot:item.status="{ item }">
                    <v-chip v-if="['running', 'active'].indexOf(item.status) >= 0" color="success">{{ item.status }}</v-chip>
                    <v-chip v-else color="red">{{ item.status }}</v-chip>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn color="info" size='small' variant='text' @click="() => { }">元数据</v-btn>
                    <v-btn color="success" size='small' variant='text' @click="startContainer(item)">启动</v-btn>
                    <v-btn color="warning" size='small' variant='text' @click="stopContainer(item)">停止</v-btn>
                    <v-btn color="red" size='small' variant='text' @click="() => { }">删除</v-btn>
                </template>
            </v-data-table>
        </v-tabs-window-item>
        <v-tabs-window-item value="image">
            <!-- 镜像 -->
            <v-row class="mt-1">
                <v-col cols="4">
                    <v-text-field v-model="table.search" placeholder="搜索" flat variant="outlined" class="mb-4"
                        prepend-inner-icon="mdi-magnify" />
                </v-col>
                <v-col class='ma-0'>
                    <v-toolbar flat density='comfortable'>
                        <v-btn color="warning" @click="pruneImages()">清理</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="refresh()">刷新</v-btn>
                    </v-toolbar>
                </v-col>
            </v-row>
            <v-data-table density="compact" :loading="table.loading" :headers="table.headers" items-per-page="10"
                :items="table.items" :search="table.search">
                <template v-slot:item.size="{ item }">
                    {{ humanSize(item.size) }}
                </template>
                <template v-slot:item.tags="{ item }">
                    <template v-for="tag in item.tags" density='compact' class='ma-1'>
                        <v-chip density='compact' class='mt-1'> {{ tag }} </v-chip> <br />
                    </template>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn color="info" size='small' variant='text' @click="() => { }">元数据</v-btn>
                    <v-btn color="red" size='small' variant='text' @click="() => { }">删除</v-btn>
                </template>
            </v-data-table>
        </v-tabs-window-item>

        <v-tabs-window-item value="volume">
            <!-- 卷 -->
            <v-row class="mt-1">
                <v-col cols="4">
                    <v-text-field v-model="tableVolumes.search" placeholder="搜索" flat variant="outlined" class="mb-4"
                        prepend-inner-icon="mdi-magnify" />
                </v-col>
                <v-col class='ma-0'>
                    <v-toolbar density='compact'>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="refreshVolumes()">刷新</v-btn>
                    </v-toolbar>
                </v-col>
            </v-row>
            <v-data-table density="compact" :loading="tableVolumes.loading" :headers="tableVolumes.headers"
                items-per-page="10" :items="tableVolumes.items" :search="tableVolumes.search">
                <template v-slot:item.labels="{ item }">
                    <template v-for="(value, key) in item.labels || []" density='compact' class='ma-1'>
                        <v-chip density='compact' class='mt-1'> {{ key }}={{ value }} </v-chip> <br />
                    </template>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn color="info" size='small' variant='text' @click="() => { }">元数据</v-btn>
                    <v-btn color="red" size='small' variant='text' @click="removeVolume(item)">删除</v-btn>
                </template>
            </v-data-table>
        </v-tabs-window-item>
    </v-tabs-window>

</template>

<script setup>
import { reactive } from 'vue';
import API from '@/assets/app/api';
import notify from '@/assets/app/notify';
import { humanSize } from '@/assets/app/urils';

var table = reactive({
    loading: false,
    search: '',
    headers: [
        { title: 'ID', value: 'short_id', },
        { title: '标签', value: 'tags' },
        { title: '大小', value: 'size' },
        { title: '操作', value: 'actions' },
    ],
    items: [],
});
var tableContainers = reactive({
    loading: false,
    search: '',
    headers: [
        { title: 'ID', value: 'short_id' },
        { title: '名称', value: 'name' },
        { title: '镜像', value: 'image' },
        { title: '状态', value: 'status' },
        { title: '操作', value: 'actions' },
    ],
    items: [],
});
var tableVolumes = reactive({
    loading: false,
    search: '',
    headers: [
        { title: 'ID', value: 'short_id' },
        { title: '驱动', value: 'driver' },
        { title: '标签', value: 'labels' },
        // { title: '挂载点', value: 'mountpoint', width: '20px'   },
        { title: '创建时间', value: 'created_at' },
        { title: '操作', value: 'actions' },
    ],
    items: [],
});
var system = reactive({
    loading: false,
    search: '',
    info: {},
});

var tab = reactive({
    value: 'overview'
})

async function refreshSystem() {
    system.loading = true
    try {
        system.info = await API.docker.system()
    } catch (e) {
        console.error(e)
        notify.error("获取系统信息失败")
    } finally {
        system.loading = false
    }
}
async function refresh(name) {
    table.loading = true
    try {
        table.items = await API.docker.images()
    } catch (e) {
        console.error(e)
        notify.error("获取镜像失败")
    } finally {
        table.loading = false
    }
}
async function pruneImages() {
    notify.info("清理镜像 ...")
    await API.docker.pruneImages()
    refresh()
}
async function refreshContainers() {
    tableContainers.loading = true
    try {
        tableContainers.items = await API.docker.containers({ all_status: true })
    } catch (e) {
        console.error(e)
        notify.error("获取容器失败")
    } finally {
        tableContainers.loading = false
    }
}
async function startContainer(item) {
    notify.info(`启动容器 ${item.name}`)
    try {
        await API.docker.startContainer(item.name)
    } catch (e) {
        console.error(e)
        notify.error("启动失败")
        return
    }
    refreshContainers()
}
async function stopContainer(item) {
    notify.info(`关闭容器 ${item.name}`)
    try {
        await API.docker.stopContainer(item.name)
    } catch (e) {
        console.error(e)
        notify.error("关闭失败")
        return
    }
    refreshContainers()
}
async function refreshVolumes() {
    tableVolumes.loading = true
    try {
        tableVolumes.items = await API.docker.volumes()
    } catch (e) {
        console.error(e)
        notify.error("获取卷失败")
    } finally {
        tableVolumes.loading = false
    }
}
async function removeVolume(item) {
    notify.info(`删除卷 ${item.short_id}`)
    try {
        await API.docker.removeVolume(item.name)
    } catch (e) {
        console.error(e)
        notify.error(`卷 ${item.short_id} 删除失败`)
        return
    }
    for (let i in tableVolumes.items) {
        if (tableVolumes.items[i].name != item.name) {
            continue
        }
        tableVolumes.items.splice(i, 1);
        break
    }
}

refreshSystem()
refresh()
refreshContainers()
refreshVolumes()

</script>
