<script setup lang="ts">
import { ref } from 'vue'
const menuOpen = ref(false)
</script>
<template>
    <header>
		<div class="container nav">
			<RouterLink class="brand" to="/" aria-label="Mesa e Brasa, voltar ao início">
				<span class="logo-mark" aria-hidden="true">M&amp;B</span>
				<span class="brand-name">Mesa <span>&amp;</span> Brasa</span>
			</RouterLink>
			<button class="menu-button" aria-label="Abrir menu" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">☰</button>
			<nav id="main-nav" :class="{ open: menuOpen }" @click="menuOpen = false">
				<RouterLink to="/">Sobre</RouterLink>
				<RouterLink to="/cardapio">Cardápio</RouterLink>
				<RouterLink to="/galeria">Galeria</RouterLink>
				<RouterLink to="/feedback">Feedback</RouterLink>
				<RouterLink class="nav-button" to="/reservas">Reservar mesa</RouterLink>
			</nav>
		</div>
	</header>
</template>
