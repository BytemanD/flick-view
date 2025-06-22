<template>
    <v-row>
        <v-col cols="4">
            <v-text-field v-model="table.search" placeholder="搜索包" flat variant="outlined" class="mb-4"
                prepend-inner-icon="mdi-magnify" />
        </v-col>
        <v-col>
            <v-toolbar flat density='comfortable'>
                <dialog-add-package :progress="addPackageDialog.progress" @click:confirm="addPackage" />
                <dialog-pip-config></dialog-pip-config>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="fetchPackages()">刷新</v-btn>
                <v-btn color="grey" @click="() => { }">检查更新...</v-btn>
            </v-toolbar>
        </v-col>
        <v-col cols="12">
            <v-data-table density="comfortable" :loading="table.loading" :headers="table.headers" items-per-page="10"
                :items="table.packages" :search="table.search">
                <template v-slot:item.actions="{ item }">
                    <v-btn color="info" size='small' variant='text' @click="showPackageDetail(item)">元数据</v-btn>
                    <v-btn color="warning" size='small' variant='text' @click="updatePackage(item)">更新</v-btn>
                    <v-btn color="red" size='small' variant='text' @click="uninstallConfirm(item)">卸载</v-btn>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
    <dialog-python-package v-model="detailDialog.display" :package="detailDialog.package" />
    <dialog-delete-comfirm hide-btn v-model="uninstallDialog.display" title="确定卸载包?" :text="uninstallDialog.text"
        @click:comfirm="() => uninstall()" />
    <dialog-python-package-update v-model="dialogUpdate.display" :package="dialogUpdate.package"
        :versions="dialogUpdate.versions" @updated="fetchPackages">
    </dialog-python-package-update>
</template>

<script setup>
import { reactive } from 'vue';
import API from '@/assets/app/api';
import notify from '@/assets/app/notify';


var table = reactive({
    loading: false,
    search: '',
    headers: [
        { title: '名称', value: 'name' },
        { title: '版本', value: 'version' },
        { title: '描述', value: 'sumary' },
        { title: '操作', value: 'actions' },
    ],
    packages: [],
});
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

async function updatePackages(name) {
    let packages = (await API.pip.packages({ name: name }))
    if (packages.length == 0) {
        return;
    }
    for (let i = 0; i < table.packages.length; i++) {
        if (table.packages[i].name != name) {
            continue
        }
        table.packages[i].version = packages[0].version
        table.packages[i].sumary = packages[0].sumary
        table.packages[i].metadata = packages[0].metadata
        break;
    }
}

async function fetchPackages(name = null) {
    if (name) {
        updatePackages(name)
        return;
    }
    table.loading = true
    try {
        table.packages = await API.pip.packages(name)
    } catch (e) {
        console.error(e)
        notify.error("获取已安装的包失败")
    } finally {
        table.loading = false
    }
}

function uninstallConfirm(item) {
    uninstallDialog.text = item.name
    uninstallDialog.display = true
}
async function uninstall() {
    let name = uninstallDialog.text;
    notify.info(`开始卸载 ${name}...`)
    try {
        await API.pip.uninstall(name)
        notify.success(`${name} 卸载完成...`)
        for (let i = 0; i < table.packages.length; i++) {
            if (table.packages[i].name === name) {
                table.packages.splice(i, 1)
                break
            }
        }
    } catch (e) {
        console.error(e)
        notify.error(`卸载 ${name} 失败: ${e.message}`)
    }
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
    notify.info(`开始安装 ${packages.length} 个包...`);
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
        notify.success(`安装成功 ${success.length} 个包`);
        fetchPackages()
    } else if (success.length > 0) {
        notify.warning(`安装成功 ${success.length} 个包;\n安装失败 ${failed.length} 个包`);
        fetchPackages()
    } else {
        notify.error(`安装失败 ${failed.length} 个包`);
    }
}

fetchPackages()

</script>
