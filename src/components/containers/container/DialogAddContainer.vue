<template>
    <v-dialog max-width="1000" scrollable>
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-plus" color="success"></v-btn>
        </template>
        <v-card title="创建容器">
            <v-card-text>
                <v-form ref="form" v-model="card.valid">
                    <v-select v-model="card.image" label="选择镜像" :items="card.images"
                        @click="refreshImages()"></v-select>
                    <v-text-field clearable v-model="card.name" label="容器名" placeholder="请输入容器名" />
                    <v-text-field clearable v-model="card.command" label="启动命令" placeholder="请输入启动命令" />
                    <v-switch v-model="card.autoRemove" color="warning" label="自动删除"></v-switch>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn block color="primary" :disabled="!card.image || !card.valid" @click="createContainer">启动</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import API from '@/assets/app/api';
import { reactive } from 'vue';


const emits = defineEmits(['click:confirm'])

var card = reactive({
    image: null,
    name: null,
    command: null,
    autoRemove: false,

    valid: false,
    images: [],
})


async function createContainer() {
    emits("click:confirm", {
        image: card.image,
        name: card.name,
        command: card.command,
        autoRemove: card.autoRemove,
    })
}

async function refreshImages() {
    card.images = []
    let images = await API.docker.images()
    for (let i in images) {
        let image = images[i]
        if (image.tags.length == 0) {
            card.images.push(image.id)
        } else {
            for (let j in image.tags) {
                card.images.push(image.tags[j])
            }
        }
    }
}

refreshImages()
</script>