<template>
    <v-tooltip location="bottom" text="切换明暗主题">
        <template v-slot:activator="{ props }">
            <v-btn icon v-on:click="changeTheme()" v-bind="props">
                <v-icon v-if="theme.global.current.value.dark" icon="mdi-weather-night"></v-icon>
                <v-icon v-else icon="mdi-weather-sunny"></v-icon>
            </v-btn>
        </template>

    </v-tooltip>
</template>

<script setup>
import { useTheme } from 'vuetify'

const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';

const theme = useTheme()

function changeTheme() {
    theme.global.name.value = theme.global.current.value.dark ? THEME_LIGHT : THEME_DARK;
    localStorage.setItem('theme', theme.global.name.value);
}

function initTheme() {
    let savedTheme = localStorage.getItem('theme')
    if (savedTheme && (savedTheme == THEME_DARK || savedTheme == THEME_LIGHT)) {
        theme.global.name.value = savedTheme;
    }
}

initTheme()

</script>