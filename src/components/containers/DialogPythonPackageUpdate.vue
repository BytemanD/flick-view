<template>
    <v-dialog max-width="500" scrollable>
        <v-card :title="props.package.name" :subtitle="`当前版本: ${package.version}`">
            <v-card-text>
                <v-select density="comfortable" v-model="card.selected" :items="card.versions"
                    :loading="card.loading" :error="card.error != ''" :messages="card.error">
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
import { reactive, watchEffect } from 'vue';
import API from '@/assets/app/api';
import notify from '@/assets/app/notify';

const props = defineProps({
    package: { type: Object, required: true, },
    versions: { type: Array, required: true },
})

var card = reactive({
    versions: [],
    loading: false,
    selected: null,
    error: '',
})

async function refreshVersions() {
    card.error = ''
    card.versions = [];
    console.debug('refresh versions')
    card.loading = true;
    try {
        card.versions = (await API.pip.get_versions(props.package.name)).versions
    } catch (e) {
        console.error(e);
        card.error = "获取版本失败"
        return;
    } finally {
        card.loading = false;
    }
    if (card.error != '') {
        return
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
    console.log('update package', props.package.name, card.selected)
    try {
        notify.info(`开始更新 ${props.package.name}: ${props.package.version} -> ${card.selected}`)
        await API.pip.updatePackage(props.package.name, card.selected)
    } catch (e) {
        notify.error(`${props.package} 更新失败`)
        return
    }
}

watchEffect(
    () => {
        card.selected = null;
        card.versions = [];
        card.error = '';
        if (!props.package || !props.package.name) {
            return
        }
        refreshVersions()
    }
)

</script>