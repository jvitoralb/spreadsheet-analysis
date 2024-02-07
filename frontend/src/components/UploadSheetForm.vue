<template>
    <form id="upload-sheet-form" enctype="multipart/form-data" class="center-col-form" ref="uploadFileForm" @submit="handleSubmit($event)">
        <input id="file-input" type="file" name="file" class="form-control dark-border" ref="loadedFile" @change="trackFile" required/>
        
        <button id="submit-btn" type="submit" class="btn btn-outline-success">
            Enviar
        </button>
    </form>
</template>

<script>
export default {
    data() {
        return {
            file: null,
        }
    },
    methods: {
        trackFile(e) {
            this.$emit('input-warning', {
                status: true,
            });

            const acceptedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
            let loadedFile = e.target.files[0];

            if (acceptedTypes.includes(loadedFile.type)) {
                this.file = loadedFile;
            } else {
                this.clearFileForm();
                this.$emit('input-warning', {
                    status: true,
                    message: 'Tipo de arquivo inválido!',
                });
            }
        },
        clearFileForm() {
            this.file = null;
            this.$refs.uploadFileForm.reset();
            this.$refs.loadedFile.value = null;
        },
        async handleSubmit(e) {
            e.preventDefault();

            if (!this.file) return;

            try {
                let formData = new FormData();
                formData.append('file', this.file);

                const req = await fetch('http://localhost:3000/sheets/upload', {
                    method: 'POST',
                    body: formData,
                });
                const data = await req.json();

                this.$emit('api-data', {
                    cr: data.crByYear,
                    mrr: data.mrrByYear,
                });

                this.$route.meta.sheetsDataStatus = 'success';

                this.$router.push({
                    path: '/sheets/data',
                    name: 'data',
                });
            } catch(e) {
                console.error(e);
                this.$emit('input-warning', {
                    status: true,
                    message: 'Algo deu errado! Por favor, tente novamente mais tarde.',
                });
            }
        },
    }
}
</script>
