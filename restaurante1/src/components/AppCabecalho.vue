<script setup lang="ts">
import { ref } from 'vue'
const menuOpen = ref(false)
</script>
<template>
    <header>
		<div class="container nav">
			<a class="brand" href="#inicio" aria-label="Mesa e Brasa, voltar ao início">
				<span class="logo-mark" aria-hidden="true">M&amp;B</span>
				<span class="brand-name">Mesa <span>&amp;</span> Brasa</span>
			</a>
			<button class="menu-button" aria-label="Abrir menu" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">☰</button>
			<nav id="main-nav" :class="{ open: menuOpen }" @click="menuOpen = false">
				<a href="#sobre">Sobre</a>
				<a href="#cardapio">Cardápio</a>
				<a href="#galeria">Galeria</a>
				<a href="#feedback">Feedback</a>
				<a class="nav-button" href="#reservas">Reservar mesa</a>
			</nav>
		</div>
	</header>
</template>
