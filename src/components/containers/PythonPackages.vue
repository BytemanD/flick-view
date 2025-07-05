<template>
    <v-data-table :loading="table.loading" :headers="table.headers" items-per-page="15" :items="table.items"
        :search="table.search">
        <template v-slot:top>
            <v-row>
                <v-col cols="4">
                    <v-text-field v-model="table.search" placeholder="搜索包" flat variant="outlined" class="mb-4"
                        prepend-inner-icon="mdi-magnify" />
                </v-col>
                <v-col>
                    <v-toolbar>
                        <dialog-add-package :progress="addPackageDialog.progress" @click:confirm="addPackage" />
                        <dialog-pip-config></dialog-pip-config>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="table.refresh()">刷新</v-btn>
                        <v-btn color="grey" @click="() => { }">检查更新...</v-btn>
                    </v-toolbar>
                </v-col>
            </v-row>
        </template>
        <template v-slot:item.actions="{ item }">
            <v-btn color="info" size='small' variant='text' @click="showPackageDetail(item)">元数据</v-btn>
            <v-btn color="warning" size='small' variant='text' @click="updatePackage(item)">更新</v-btn>
            <v-btn color="red" size='small' variant='text' @click="uninstallConfirm(item)">卸载</v-btn>
        </template>

    </v-data-table>
    <dialog-python-package v-model="detailDialog.display" :package="detailDialog.package" />
    <dialog-delete-comfirm hide-btn v-model="uninstallDialog.display" title="确定卸载包?" :text="uninstallDialog.text"
        @click:comfirm="() => uninstall()" />
    <dialog-python-package-update v-model="dialogUpdate.display" :package="dialogUpdate.package"
        :versions="dialogUpdate.versions">
    </dialog-python-package-update>
</template>

<script setup>
import { reactive } from 'vue';
import API from '@/assets/app/api';
import notify from '@/assets/app/notify';
import SES from '@/assets/app/sse';
import { PyPackageDataTable } from '@/assets/app/table';


var table = reactive(new PyPackageDataTable());

var detailDialog = reactive({
    display: false,
    package: {},
});
var dialogUpdate = reactive({
    display: false,
    package: {},
    versions: [],
});
var uninstallDialog = reactive({
    display: false,
    text: '',
})
var addPackageDialog = reactive({
    display: false,
    progress: 0,
})


function uninstallConfirm(item) {
    uninstallDialog.text = item.name
    uninstallDialog.display = true
}
async function uninstall() {
    let name = uninstallDialog.text;
    table.uninstallPackage(name)
}

function showPackageDetail(item) {
    detailDialog.display = true
    detailDialog.package = item || {}
}
async function updatePackage(item) {
    dialogUpdate.display = true
    dialogUpdate.package = item || {}
    // try {
    //     dialogUpdate.versions = (await API.pip.get_versions(item.name)).versions
    // } catch (e) {
    //     console.error("get package versions failed", e)
    // }
}

async function addPackage(packages, options = {}) {
    addPackageDialog.progress = 0;
    let success = [];
    let failed = [];
    for (let i = 0; i < packages.length; i++) {
        let name = packages[i];
        try {
            console.log(options)
            await API.pip.install(name, options)
            success.push(name)
        } catch (e) {
            failed.push(name)
            console.error(e);
        } finally {
            addPackageDialog.progress += 1;
        }
    }
    if (failed.length <= 0) {
        notify.success(`开始安装 ${success.length} 个包`);
    } else if (success.length > 0) {
        notify.warning(`开始安装 ${success.length} 个包;\n失败 ${failed.length} 个包`);
    } else {
        notify.error(`安装失败 ${failed.length} 个包`);
    }
}


SES.subscribe('installed package', (data) => {
    notify.success(data.name, data.detail)
    let newItem = data.item;
    table.items.push(newItem)
})
SES.subscribe('updated package', (data) => {
    notify.success(data.name, data.detail)
    let newItem = data.item;
    for (let i in table.items) {
        let item = table.items[i];
        if (item.name && item.name == newItem.name) {
            Object.assign(table.items[i], newItem);
            break
        }
    }
})
SES.subscribe('uninstalled package', (data) => {
    notify.success(data.name, data.detail)
    table.removeItem({'name': data.detail})
})
table.refresh()

</script>
