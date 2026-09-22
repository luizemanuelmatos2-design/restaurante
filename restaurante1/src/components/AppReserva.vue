<script setup lang="ts">
import { ref } from 'vue'

const reservationSent = ref(false)

function submitReservation() {
	reservationSent.value = true
}





</script>



<template>
<main>

<section id="reservas" class="section-reserva"><div class="container two-columns feedback-grid"><div><p class="eyebrow light">Contato e reservas</p><h2>Seu lugar está à<br />mesa.</h2><p class="lead light-text">Atendemos de terça a domingo, das 12h às 23h. Preencha o formulário e nossa equipe confirmará sua reserva.</p></div><form @submit.prevent="submitReservation"><div class="form-row"><label>Nome<input required placeholder="Seu nome" /></label><label>E-mail<input required type="email" placeholder="voce@email.com" /></label></div><div class="form-row"><label>Data<input required type="date" /></label><label>Pessoas<input required type="number" min="1" value="2" /></label></div><label>Observações<textarea placeholder="Alguma preferência? (opcional)"></textarea></label><button class="button gold" type="submit">{{ reservationSent ? 'Solicitação enviada ✓' : 'Solicitar reserva →' }}</button></form></div></section>

</main>
</template>