<template>
    <v-row>
        <v-col lg="6" sm="12" md="4">
            <v-card>
                <v-card-text>
                    <v-table density="compact">
                        <tbody>
                            <tr>
                                <th>系统</th>
                                <td>{{ node.platform.system }}</td>
                            </tr>
                            <tr>
                                <th>发行版本</th>
                                <td>{{ node.platform.release }}</td>
                            </tr>
                            <tr>
                                <th>版本</th>
                                <td>{{ node.platform.version }}</td>
                            </tr>
                            <tr>
                                <th>处理器</th>
                                <td>{{ node.platform.processor }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col lg="2" sm="6" md="4">
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
        <v-col lg="2" sm="6" md="4">
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
        <v-col lg="2" sm="6" md="4">
            <v-card title="磁盘">
                <v-card-text class="text-center">
                    <v-tooltip location="left">
                        <template v-slot:activator="{ props }">
                            <v-progress-circular v-bind="props" :model-value="node.disk.percent" color="info" size="124"
                                width="62"></v-progress-circular>
                        </template>
                        总数: {{ humanSize(node.disk.total) }}<br />
                        已用: {{ humanSize(node.disk.used) }}<br />
                        可用: {{ humanSize(node.disk.free) }}<br />
                    </v-tooltip>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup>
import { reactive } from 'vue';
import API from '@/assets/app/api';
import { humanSize } from '@/assets/app/urils';

var node = reactive({
    platform: {},
    cpu: {},
    memory: {},
    disk: {},
});

async function refreshPlatform() {
    node.platform = await API.node.platform()
}
async function refreshCPU() {
    node.cpu = await API.node.cpu()
}
async function refreshMemory() {
    node.memory = await API.node.memory()
}
async function refreshDisk() {
    node.disk = await API.node.disk()
}

refreshPlatform()
refreshCPU()
refreshMemory()
refreshDisk()

</script>