<template>
    <v-tabs v-model="tab.value" bg-color="primary">
        <v-tab value="overview" @click="saveTab">概览</v-tab>
        <v-tab value="container" @click="saveTab">容器</v-tab>
        <v-tab value="image" @click="saveTab">镜像</v-tab>
        <v-tab value="volume" @click="saveTab">卷</v-tab>
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
            <v-data-table :loading="tableContainers.loading" :headers="tableContainers.headers" items-per-page="10"
                :items="tableContainers.items" :search="tableContainers.search">
                <template v-slot:item.size="{ item }">
                    {{ humanSize(item.size) }}
                </template>
                <template v-slot:top>
                    <v-row class="mt-1">
                        <v-col cols="4">
                            <v-text-field v-model="tableContainers.search" placeholder="搜索" flat variant="outlined"
                                class="mb-4" prepend-inner-icon="mdi-magnify" />
                        </v-col>
                        <v-col class='ma-0'>
                            <v-toolbar>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" @click="tableContainers.refresh()">刷新</v-btn>
                            </v-toolbar>
                        </v-col>
                    </v-row>
                </template>
                <template v-slot:item.tags="{ item }">
                    <template v-for="(tag, index) in item.tags" density='compact' class='ma-1'>
                        <v-chip density='compact' class='mt-1'> {{ tag }} </v-chip> <br />
                    </template>
                </template>
                <template v-slot:item.status="{ item }">
                    <v-chip v-if="['running', 'active'].indexOf(item.status) >= 0" color="success">
                        {{ item.status }}</v-chip>
                    <v-chip v-else color="red">{{ item.status }}</v-chip>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn color="info" size='small' variant='text' @click="() => { }">元数据</v-btn>
                    <v-btn v-if="['exited', 'stopped'].indexOf(item.status) >= 0" color="success" size='small'
                        variant='text' @click="tableContainers.startContainer(item)">启动</v-btn>
                    <v-btn v-else-if="['running', 'active'].indexOf(item.status) >= 0" color="warning" size='small'
                        variant='text' @click="tableContainers.stopContainer(item)">停止</v-btn>
                    <v-btn color="red" size='small' variant='text' @click="() => { }">删除</v-btn>
                </template>
            </v-data-table>
        </v-tabs-window-item>
        <v-tabs-window-item value="image">
            <!-- 镜像 -->
            <v-data-table density="compact" :loading="tableImages.loading" :headers="tableImages.headers"
                items-per-page="10" :items="tableImages.items" :search="tableImages.search">
                <template v-slot:top>
                    <v-row class="mt-1">
                        <v-col cols="4">
                            <v-text-field v-model="tableImages.search" placeholder="搜索" flat variant="outlined"
                                class="mb-4" prepend-inner-icon="mdi-magnify" />
                        </v-col>
                        <v-col class='ma-0'>
                            <v-toolbar>
                                <v-btn color="warning" @click="tableImages.pruneImages()">清理</v-btn>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" @click="tableImages.refresh()">刷新</v-btn>
                            </v-toolbar>
                        </v-col>
                    </v-row>
                </template>

                <template v-slot:item.size="{ item }">
                    {{ humanSize(item.size) }}
                </template>
                <template v-slot:item.tags="{ item }">
                    <template v-for="tag in item.tags" density='compact' class='ma-1'>
                        <v-chip density='compact' class='mt-1' closable @click:close="tableImages.removeTag(tag)">
                            {{ tag }} </v-chip> <br />
                    </template>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn color="info" size='small' variant='text' @click="() => { }">元数据</v-btn>
                    <v-btn color="red" size='small' variant='text' @click="tableImages.removeImage(item.id)">删除</v-btn>
                </template>
            </v-data-table>
        </v-tabs-window-item>

        <v-tabs-window-item value="volume">
            <!-- 卷 -->
            <v-data-table :loading="tableVolumes.loading" :headers="tableVolumes.headers" items-per-page="10"
                :items="tableVolumes.items" :search="tableVolumes.search">
                <template v-slot:top>
                    <v-row class="mt-1">
                        <v-col cols="4">
                            <v-text-field v-model="tableVolumes.search" placeholder="搜索" flat variant="outlined"
                                class="mb-4" prepend-inner-icon="mdi-magnify" />
                        </v-col>
                        <v-col class='ma-0'>
                            <v-toolbar>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" @click="tableVolumes.refresh()">刷新</v-btn>
                            </v-toolbar>
                        </v-col>
                    </v-row>
                </template>
                <template v-slot:item.labels="{ item }">
                    <template v-for="(value, key) in item.labels || []" density='compact' class='ma-1'>
                        <v-chip density='compact' class='mt-1'> {{ key }}={{ value }} </v-chip> <br />
                    </template>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn color="info" size='small' variant='text' @click="() => { }">元数据</v-btn>
                    <v-btn color="red" size='small' variant='text' @click="tableVolumes.removeVolume(item)">删除</v-btn>
                </template>
            </v-data-table>
        </v-tabs-window-item>
    </v-tabs-window>

</template>

<script setup>
import { reactive } from 'vue';
import API from '@/assets/app/api';
import { ContainerDataTable, ImageDataTable, VolumeDataTable } from '@/assets/app/table';
import notify from '@/assets/app/notify';
import SES from '@/assets/app/sse';
import { humanSize } from '@/assets/app/utils';

var tab = reactive({ value: 'container' })

var tableImages = reactive(new ImageDataTable());
var tableContainers = reactive(new ContainerDataTable());
var tableVolumes = reactive(new VolumeDataTable());

var system = reactive({
    loading: false,
    search: '',
    info: {},
});

function saveTab() {
    localStorage.setItem('dockerTabValue', tab.value)
}

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


SES.subscribe('started container', (data) => {
    // notify.success(data.name, data.detail)
    tableContainers.updateItem(data.item);
})
SES.subscribe('stopped container', (data) => {
    // notify.success(data.name, data.detail)
    tableContainers.updateItem(data.item);
})

// 初始化tab
let dockerTabValue = localStorage.getItem('dockerTabValue')
if (dockerTabValue) {
    tab.value = dockerTabValue;
}

refreshSystem()
tableContainers.refresh()
tableImages.refresh()
tableVolumes.refresh()

</script>
