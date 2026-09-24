<script setup lang="ts">
import { ref } from 'vue'

const feedbackSent = ref(false)
const feedback = ref({ name: '', note: '', comment: '' })

function submitFeedback(event: Event) {
	const form = event.target as HTMLFormElement
	const data = new FormData(form)
	feedback.value = {
		name: String(data.get('name') || 'Cliente da casa'),
		note: String(data.get('note') || ''),
		comment: String(data.get('comment') || ''),
	}
	feedbackSent.value = true
	form.reset()
}
</script>


<template>
<main>
<section id="feedback" class="section-feedback"><div class="container feedback-layout"><div class="feedback-intro"><p class="eyebrow light">A voz dos clientes</p><h2>Conte como foi sua experiência.</h2><p class="body-copy light-text">Sua opinião ajuda nossa equipe a cuidar ainda melhor de cada detalhe, do primeiro prato ao último café.</p><blockquote>“A comida tem sabor de casa, mas com uma apresentação impecável.”<cite>Marina, cliente da casa</cite></blockquote></div><div class="feedback-panel"><form @submit.prevent="submitFeedback"><div class="form-row"><label>Nome<input name="name" required placeholder="Seu nome" /></label><label>Nota<select name="note" required><option value="">Escolha uma nota</option><option>5 - Excelente</option><option>4 - Muito bom</option><option>3 - Bom</option></select></label></div><label>Seu comentário<textarea name="comment" required placeholder="O que você achou da experiência?"></textarea></label><button class="button gold" type="submit">Enviar feedback →</button></form><div v-if="feedbackSent" class="feedback-result"><p class="feedback-success" role="status">Obrigado por compartilhar sua experiência. Seu feedback foi enviado!</p><article class="submitted-feedback"><p class="eyebrow">Seu feedback</p><div class="submitted-rating">{{ feedback.note }}</div><p>“{{ feedback.comment }}”</p><strong>{{ feedback.name }}</strong></article></div></div></div></section>

</main>
</template>