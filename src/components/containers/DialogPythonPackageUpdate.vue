<template>
    <v-dialog max-width="500" scrollable>
        <v-card :title="props.package.name" :subtitle="`当前版本: ${package.version}`">
            <v-card-text>
                <v-select density="comfortable" hide-details v-model="card.selected" :items="card.versions"
                    :loading="card.loading">
                    <template v-slot:prepend>选择版本</template>
                </v-select>
            </v-card-text>
            <v-card-actions>
                <v-btn block color="primary" :disabled="!card.selected || card.selected == props.package.version" @click="update">更新</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { reactive, ref, watch, onUpdated, watchEffect, computed } from 'vue';
import API from '@/assets/app/api';
import notify from '@/assets/app/notify';
// var display = ref(false)

const props = defineProps({
    package: { type: Object, required: true, },
    versions: { type: Array, required: true },
})

var card = reactive({
    versions: [],
    loading: false,
    selected: null,
})
const emits = defineEmits(['updated'])

async function refreshVersions() {
    card.versions = [];
    console.debug('refresh versions')
    card.loading = true;
    try {
        card.versions = (await API.pip.get_versions(props.package.name)).versions
    } catch (e) {
        console.error(e);
        notify.error("获取版本失败")
        return;
    } finally {
        card.loading = false;
    }
    for (let i = 0; i < card.versions.length; i++) {
        if (card.selected == card.versions[i]) {
            return
        }
    }
    card.selected = card.versions[0]
    console.debug('set default selected', card.selected)
}

async function update() {
    console.log('update package', card.selected)
    let name = `${props.package.name}==${card.selected}`
    try {
        notify.info(`开始安装 ${name}`)
        await API.pip.install(`${name}`)
    } catch (e) {
        notify.error(`${name} 安装失败`)
        return
    }
    notify.success(`${name} 安装成功`)
    emits("updated", props.package.name)
}

watchEffect(
    () => {
        card.selected = null;
        card.versions = [];
        if (!props.package || !props.package.name) {
            return
        }
        refreshVersions()
    }
)

</script>