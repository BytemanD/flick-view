<template>
    <v-dialog max-width="600" v-model="display" scrollable>
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="primary" variant="text">Pip配置</v-btn>
        </template>
        <v-card title="Pip配置">
            <v-card-text>
                <v-textarea readonly variant="outlined" v-model="card.text" rows="8" placeholder="配置为空" />
                <h4>更新配置</h4>
                <v-spacer class="my-4"></v-spacer>
                <v-select hide-details density="compact" :items="card.repoItems" v-model="card.repoSelected">
                    <template v-slot:prepend>选择源</template>
                    <template v-slot:append>
                        <v-btn block variant="text" color="warning"
                         :disabled="!card.repoSelected || card.repoSelected == card.currentRepoName"
                            @click="setRepo">更新</v-btn>
                    </template>
                </v-select>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { reactive, ref, watchEffect } from 'vue';
import API from '@/assets/app/api';
import notify from '@/assets/app/notify';

var display = ref(false)

const emits = defineEmits(['update:modelValue', 'click:confirm'])

var card = reactive({
    text: '',
    repos: [],
    repoSelected: null,
    repoItems: [],
    selectedRepo: null,
    currentRepo: null,
    currentRepoName: null,
})
async function refreshRepos() {
    card.repos = await API.pip.get_repos()
    card.repoItems = Object.keys(card.repos)
    if (card.repoItems.length <= 0 || !card.text || card.text == ""){
        return
    }
    let lines = card.text.split("\n")
    for (let index = 0; index < lines.length; index++) {
        let line = lines[index];
        let values = line.split('=')
        if (values.length >= 2 && values[0] == 'global.index-url') {
            card.currentRepo = values[1].replace(/'|"/g, '');
            break;
        }
    }
    console.log('xxxxxxxxxx', card.currentRepo)
    if (! card.currentRepo) {
        return
    }
    for (let index = 0; index < card.repoItems.length; index++) {
        let repo = card.repos[card.repoItems[index]];
        console.log('111111111', repo, card.currentRepo)
        if (repo == card.currentRepo) {
            card.currentRepoName = card.repoItems[index];
            card.repoSelected = card.repoItems[index];
            return
        }
    }
    card.repoSelected = card.repoItems[0];
}
async function refreshConfig() {
    card.text = await API.pip.get_config()
}

async function setRepo() {
    let repo = card.repos[card.repoSelected];
    if (!repo) {
        return
    }
    notify.info('开始更新')
    await API.pip.set_config('global.index-url', repo)
    notify.success('更新成功')
    refreshConfig()
}


watchEffect(
    () => {
        console.log(display)
        refreshConfig().then(() => {
            refreshRepos()
        })
    }
)
</script>