<template>
    <section id="upload-sheet-section" class="py-3">
        <h4 id="upload-sheet-section-header">Selecione uma planilha</h4>

        <p class="mb-2 fst-italic">
            Somente arquivos <span class="fw-bolder">.xlsx</span> e <span class="fw-bolder">.csv</span>
        </p>

        <span v-if="inputWarning" class="warning">{{ warningMessage }}</span>

        <UploadSheetForm v-on:input-warning="handleInputWarning" v-on:api-data="handleApiData"></UploadSheetForm>
    </section>
</template>

<script>
import UploadSheetForm from '@/components/UploadSheetForm.vue';
import { useStore } from 'vuex';

export default {
    setup() {
        return {
            store: useStore(),
        }
    },
    data() {
        return {
            inputWarning: false,
            warningMessage: '',
        }
    },
    methods: {
        handleInputWarning({ status, message }) {
            this.inputWarning = status;
            this.warningMessage = message || '';
        },
        handleApiData({ cr, mrr }) {
            this.store.dispatch('setCrByYear', cr);
            this.store.dispatch('setMrrByYear', mrr);
        },
    },
    components: {
        UploadSheetForm
    }
}
</script>
