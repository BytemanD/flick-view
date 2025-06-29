<template>
    <v-row>
        <v-col lg="6" md="6" sm="12">
            <v-card>
                <v-card-text>
                    <list-key-value :object="node.info"></list-key-value>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col lg="2" md="2" sm="6">
            <v-card title="CPU">
                <v-card-text class="text-center">
                    <v-tooltip location="left">
                        <template v-slot:activator="{ props }">
                            <v-progress-circular v-bind="props" :model-value="node.cpu.percent" color="info" size="124"
                                width="62"></v-progress-circular>
                        </template>
                        物理核数: {{ node.cpu.count }} <br />
                        逻辑核数: {{ node.cpu.count_logical }}
                    </v-tooltip>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col lg="2" md="2" sm="6">
            <v-card title="内存">
                <v-card-text class="text-center">
                    <v-tooltip location="left">
                        <template v-slot:activator="{ props }">
                            <v-progress-circular v-bind="props" :model-value="node.memory.percent" color="info"
                                size="124" width="62"></v-progress-circular>
                        </template>
                        总数: {{ humanSize(node.memory.total) }}<br />
                        已用: {{ humanSize(node.memory.used) }}<br />
                        可用: {{ humanSize(node.memory.available) }}<br />
                    </v-tooltip>
                </v-card-text>
            </v-card>
        </v-col>
        <v-divider></v-divider>
        <v-col lg="12" md="12" sm="12">
            <h3>分区</h3>
            <v-switch density="compact" v-model="cardPartitions.allDevice" hide-details color="info"
                @change="refresPartitions()" label="全部设备"></v-switch>
        </v-col>
        <v-col lg="3" md="4" sm="6" v-for="(part, i) in cardPartitions.items_view">
            <v-card :title="part._mountpoint" variant="outlined" color="info">
                <template v-slot:append>
                    <v-chip label color="info">{{ part._fstype }}</v-chip>
                </template>
                <v-divider></v-divider>
                <v-card-text>
                    <list-key-value :object="part"></list-key-value>
                </v-card-text>
            </v-card>
        </v-col>
        <!-- <v-col lg="6" md="12" sm="12">
            <v-card title="分区">
                <template v-slot:append>
                    <v-switch density="compact" v-model="cardPartitions.allDevice" hide-details color="info"
                        @change="refresPartitions()" label="全部设备"></v-switch>
                </template>
                <v-card-text>
                    <v-data-table hide-default-footer density="compact" :headers="cardPartitions.headers"
                        :items="cardPartitions.items" :loading="cardPartitions.loading">
                        <template v-slot:item.usage="{ item }">
                            <v-tooltip location="left">
                                <template v-slot:activator="{ props }">
                                    <v-progress-linear v-bind="props" :model-value="item.usage.percent" color="info"
                                        height="12"></v-progress-linear>
                                </template>
                                总数: {{ humanSize(item.usage.total) }}<br />
                                已用: {{ humanSize(item.usage.used) }}<br />
                                可用: {{ humanSize(item.usage.free) }}<br />
                            </v-tooltip>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-col> -->
        <v-divider></v-divider>
        <v-col lg="12" md="12" sm="12">
            <h3>网卡设备</h3>
            <!-- <v-card title="网卡设备">
                <v-card-text> -->
            <v-data-table hide-default-footer density="compact" :headers="cardNetInterfaces.headers"
                :items="cardNetInterfaces.items" :loading="cardNetInterfaces.loading">
                <template v-slot:item.addresses="{ item }">
                    <template v-for="addr in item.addresses">
                        <v-chip size="small" density="compact">{{ addr }}</v-chip><br>
                    </template>
                </template>
                <template v-slot:item.bytes_sent="{ item }">
                    {{ humanSize(item.bytes_sent) }}
                </template>
                <template v-slot:item.bytes_recv="{ item }">
                    {{ humanSize(item.bytes_recv) }}
                </template>
                <template v-slot:item.packets_sent="{ item }">
                    {{ humanSize(item.packets_sent) }}
                </template>
                <template v-slot:item.packets_recv="{ item }">
                    {{ humanSize(item.packets_recv) }}
                </template>
            </v-data-table>
            <!-- </v-card-text>
            </v-card> -->
        </v-col>
    </v-row>
</template>

<script setup>
import { reactive } from 'vue';
import API from '@/assets/app/api';
import { humanSize } from '@/assets/app/urils';

var node = reactive({
    platform: {},
    info: {},
    cpu: {},
    memory: {},
});
var cardPartitions = reactive({
    headers: [
        { title: '设备', value: 'device' },
        { title: '挂载点', value: 'mountpoint' },
        { title: '文件系统', value: 'fstype' },
        { title: '容量', value: 'usage' },
    ],
    items: [],
    items_view: {},
    allDevice: false,
    loading: false
});
var cardNetInterfaces = reactive({
    headers: [
        { title: '名称', value: 'name' },
        { title: 'MAC地址', value: 'mac_address' },
        { title: 'IP地址', value: 'addresses' },
        { title: '发送字节数', value: 'bytes_sent' },
        { title: '接收字节数', value: 'bytes_recv' },
        { title: '发送包数', value: 'packets_sent' },
        { title: '接收包数', value: 'packets_recv' },
    ],
    items: [],
    loading: false
});
async function refreshPlatform() {
    node.platform = await API.node.platform()
    node.info = {
        '系统': node.platform.name ? `${node.platform.name} ${node.platform.dist_version}` : node.platform.system,
        '发行版本': node.platform.release,
        '版本': node.platform.version,
        '处理器': node.platform.processor,
    }
}
async function refreshCPU() {
    node.cpu = await API.node.cpu()
}
async function refreshMemory() {
    node.memory = await API.node.memory()
}
async function refresPartitions() {
    cardPartitions.loading = true;
    try {
        cardPartitions.items = await API.node.partitions({ all_device: cardPartitions.allDevice })
        cardPartitions.items_view = []
        for(let index in cardPartitions.items) {
            let part = cardPartitions.items[index]
            console.info(part)
            cardPartitions.items_view.push({
                '_mountpoint': part.mountpoint,
                '_fstype': part.fstype,
                '设备': part.device,
                '总容量': humanSize(part.usage.total),
                '已使用': humanSize(part.usage.used),
                '可用': humanSize(part.usage.free),
            })
        }
    } catch (e) {
        console.error("get partitions failed", e)
    } finally {
        cardPartitions.loading = false;
    }
}
async function refresNetInterfaces() {
    cardNetInterfaces.loading = true;
    try {
        cardNetInterfaces.items = await API.node.net_interfaces()
    } catch (e) {
        console.error("get net interfacs failed", e)
    } finally {
        cardNetInterfaces.loading = false;
    }
}
refreshPlatform()
refreshCPU()
refreshMemory()
refresPartitions()
refresNetInterfaces()

</script>