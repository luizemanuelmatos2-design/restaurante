
<script setup lang="ts">
import { computed, ref } from 'vue'

type Dish = { name: string; price: string; description: string; category: string; image: string }

const categories = ['Todos', 'Entradas', 'Pratos principais', 'Sobremesas']
const selectedCategory = ref('Todos')
const dishes: Dish[] = [
	{ name: 'Salada da estação', price: 'R$ 28', description: 'Folhas, legumes grelhados, castanhas e vinagrete de ervas.', category: 'Entradas', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85' },
	{ name: 'Pão de milho', price: 'R$ 22', description: 'Assado na brasa, manteiga de garrafa e melado da casa.', category: 'Entradas', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85' },
	{ name: 'Carne na brasa', price: 'R$ 62', description: 'Corte do dia, purê de mandioca e vinagrete de pimenta.', category: 'Pratos principais', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85' },
	{ name: 'Peixe do litoral', price: 'R$ 58', description: 'Pesca sustentável, arroz cremoso e molho de tucupi.', category: 'Pratos principais', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85' },
	{ name: 'Doce de leite queimado', price: 'R$ 24', description: 'Crocante de castanha e sorvete de queijo meia cura.', category: 'Sobremesas', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85' },
	{ name: 'Chocolate e café', price: 'R$ 26', description: 'Creme intenso, farofa de café e flor de sal.', category: 'Sobremesas', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85' },
]
const filteredDishes = computed(() => selectedCategory.value === 'Todos' ? dishes : dishes.filter((dish) => dish.category === selectedCategory.value))
</script>


<template>
<section id="cardapio" class="section-white"><div class="container"><p class="eyebrow">Produtos e serviços</p><h2>O cardápio da casa.</h2><p class="body-copy intro">Escolha uma categoria para conhecer os pratos preparados diariamente pela nossa cozinha.</p><div class="filters"><button v-for="category in categories" :key="category" :class="{ active: selectedCategory === category }" @click="selectedCategory = category">{{ category }}</button></div><div class="dish-grid"><article v-for="dish in filteredDishes" :key="dish.name" class="dish"><img :src="dish.image" :alt="dish.name" /><div class="dish-info"><div><h3>{{ dish.name }}</h3><strong>{{ dish.price }}</strong></div><p>{{ dish.description }}</p></div></article></div></div></section>




</template>