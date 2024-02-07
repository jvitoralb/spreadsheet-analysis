<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
    <header id="header">
        <nav id="nav-bar">
            <RouterLink to="/">Início</RouterLink>
            <RouterLink to="/sheets">Analisar Planilhas</RouterLink>
        </nav>
    </header>

    <main id="main">
        <RouterView />
    </main>
</template>
