<script setup lang="ts">
import { reactive, ref } from 'vue'

const reservationSent = ref(false)
const isSubmitting = ref(false)
const feedbackMessage = ref('')
const feedbackError = ref(false)
const form = reactive({
	nome: '',
	email: '',
	telefone: '',
	data: '',
	horario: '',
	pessoas: 2,
	observacoes: '',
})

const now = new Date()
const minDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

async function submitReservation() {
	isSubmitting.value = true
	feedbackMessage.value = ''
	feedbackError.value = false
	reservationSent.value = false

	try {
		const response = await fetch('http://localhost:3000/api/reservas', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(form),
		})
		const result = await response.json()
		if (!response.ok) throw new Error(result.erro || 'Não foi possível enviar sua reserva.')

		reservationSent.value = true
		feedbackMessage.value = 'Solicitação enviada. Nossa equipe confirmará sua reserva.'
		form.nome = ''
		form.email = ''
		form.telefone = ''
		form.data = ''
		form.horario = ''
		form.pessoas = 2
		form.observacoes = ''
	} catch (error) {
		feedbackError.value = true
		feedbackMessage.value = error instanceof Error ? error.message : 'Não foi possível conectar ao servidor. Tente novamente.'
	} finally {
		isSubmitting.value = false
    }
}





</script>



<template>
<main>

<section id="reservas" class="section-reserva"><div class="container two-columns feedback-grid"><div><p class="eyebrow light">Contato e reservas</p><h2>Seu lugar está à mesa.</h2><p class="lead light-text">Atendemos de terça a domingo, das 12h às 23h. Preencha o formulário e nossa equipe confirmará sua reserva.</p></div><form @submit.prevent="submitReservation"><div class="form-row"><label>Nome<input v-model.trim="form.nome" name="nome" autocomplete="name" required placeholder="Seu nome" /></label><label>E-mail<input v-model.trim="form.email" name="email" autocomplete="email" required type="email" placeholder="voce@email.com" /></label></div><div class="form-row"><label>Telefone<input v-model.trim="form.telefone" name="telefone" autocomplete="tel" required type="tel" placeholder="(11) 99999-9999" /></label><label>Data<input v-model="form.data" name="data" required type="date" :min="minDate" /></label></div><div class="form-row"><label>Horário<input v-model="form.horario" name="horario" required type="time" min="12:00" max="22:30" step="1800" /></label><label>Quantidade de pessoas<input v-model.number="form.pessoas" name="pessoas" required type="number" min="1" max="30" /></label></div><label>Observações<textarea v-model.trim="form.observacoes" name="observacoes" placeholder="Alergias, acessibilidade ou outra preferência (opcional)"></textarea></label><p v-if="feedbackMessage" class="reservation-feedback" :class="{ error: feedbackError, success: reservationSent }" role="status" aria-live="polite">{{ feedbackMessage }}</p><button class="button gold" type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Enviando...' : 'Solicitar reserva →' }}</button></form></div></section>

</main>
</template>