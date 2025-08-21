<template>
    <v-row>
        <v-col cols="3">
            <v-list>
                <v-list-item v-for="(req, index) in page.requests" :key="index" item-props>
                    <template v-slot:prepend>
                        <span class="mr-4">{{ req.method }}</span>
                    </template>
                    <v-list-item-title>{{ req.url }}</v-list-item-title>
                    <template v-slot:append>
                        <v-btn icon="mdi-trash-can" color="red" @click="deleteRequest(req)" variant="plain"></v-btn>
                        <v-btn icon="mdi-arrow-right-thick" color="info" @click="loadRequest(req)"
                            variant="plain"></v-btn>
                    </template>
                </v-list-item>
            </v-list>
        </v-col>
        <v-divider vertical></v-divider>
        <v-col>
            <v-text-field clearable v-model="page.request.url" placeholder="请输入请求数据">
                <template v-slot:prepend>
                    <v-select hide-details min-width="140" :items="page.methods" v-model="page.request.method">
                    </v-select>
                </template>
                <template v-slot:append>
                    <v-btn color="primary" size="large" @click="sendRequest" :disabled="!page.request.url">发送</v-btn>
                </template>
            </v-text-field>
            <v-textarea rows="6" v-model="page.request.body" placeholder="请求体数据" hide-details>
            </v-textarea>
            <v-progress-linear class="my-2" color="warning" :indeterminate="page.sending"></v-progress-linear>
            <div>
                <template v-if="!page.response">
                    <v-chip class='ml-1' label> 状态: - -</v-chip>
                    <v-chip class='ml-1' label> 耗时: - </v-chip>
                    <v-chip class='ml-1' label> 大小: - </v-chip>
                </template>
                <template v-else>
                    <v-chip class='ml-1' label v-if="page.response.status_code >= 400" color="red">
                        状态: {{ page.response.status_code || '-' }} {{ page.response.reason || '-' }}
                    </v-chip>
                    <v-chip class='ml-1' label v-else color="success">
                        状态: {{ page.response.status_code || '-' }} {{ page.response.reason || '-' }}
                    </v-chip>
                    <v-chip class='ml-1' label color="info"> 耗时: {{ page.response.elapsed || '-' }} </v-chip>
                    <v-chip class='ml-1' label>
                        大小: {{ page.response.headers && page.response.headers['content-length'] || '-' }}
                    </v-chip>
                </template>
            </div>
            <br>
            <v-textarea rows="10" v-model="page.response.body" placeholder="请求体数据"></v-textarea>
        </v-col>
    </v-row>

</template>

<script setup>
import { reactive, ref } from 'vue';
import API from '@/assets/app/api';
import notify from '@/assets/app/notify';


var page = reactive({
    requests: [],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    request: {
        method: 'GET',
        url: '',
        headers: {},
        body: '',
    },
    response: {},
    sending: false,
});

async function refreshRequests() {
    page.requests = await API.webrequest.list()
}
async function deleteRequest(item) {
    await API.webrequest.delete(item.id)
    await refreshRequests()
}
function loadRequest(item) {
    page.request = {
        method: item.method,
        url: item.url,
        headers: item.headers || {},
        body: item.body || '',
    };
    page.response = item.response || {};
}
async function sendRequest() {
    if (!page.request.url || page.request.url == '') {
        notify.warning('请输入请求地址')
        return
    }
    page.response = {}
    try {
        page.sending = true
        let resquest = await API.webrequest.send(
            page.request.method,
            page.request.url,
            page.request.body,
            {
                headers: page.request.headers || {},
            },
        )
        page.response = resquest.response
    } catch (error) {
        notify.error('请求失败', error || '未知错误');
        return
    } finally {
        page.sending = false;
    }
    refreshRequests()
}
refreshRequests()
</script>