<template>
    <v-row>
        <v-col cols="4">
            <v-text-field v-model="table.search" placeholder="搜索" flat variant="outlined" class="mb-4"
                prepend-inner-icon="mdi-magnify" />
        </v-col>
        <v-col class='ma-0'>
            <v-toolbar flat density='comfortable'>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="refresh()">刷新</v-btn>
            </v-toolbar>
        </v-col>
    </v-row>
    <v-data-table density="comfortable" :loading="table.loading" :headers="table.headers" items-per-page="10"
        :items="table.packages" :search="table.search">
        <template v-slot:item.size="{ item }">
            {{ humanSize(item.size) }}
        </template>
        <template v-slot:item.tags="{ item }">
            <template v-for="(tag, index) in item.tags" density='compact' class='ma-1'>
                <v-chip density='compact' class='mt-1'> {{ tag }} </v-chip> <br/>
            </template>
        </template>
        <template v-slot:item.actions="{ item }">
            <v-btn color="info" size='small' variant='text' @click="()=>{}">元数据</v-btn>
            <v-btn color="warning" size='small' variant='text' @click="()=>{}">更新</v-btn>
            <v-btn color="red" size='small' variant='text' @click="()=>{}">删除</v-btn>
        </template>
    </v-data-table>
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
        { title: 'ID', value: 'short_id' },
        { title: '标签', value: 'tags' },
        { title: '大小', value: 'size' },
        { title: '操作', value: 'actions' },
    ],
    images: [],
});

async function refresh(name) {
    table.loading = true
    try {
        table.packages = await API.docker.images()
    } catch (e) {
        console.error(e)
        notify.error("获取镜像失败")
    } finally {
        table.loading = false
    }
}


refresh()

</script>
