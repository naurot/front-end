<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let ftQuant= 0;
    let nftQuant = 0;

    function handleSubmit() {
        const formData = {
            ftQuant, nftQuant
        };
        dispatch('submit', formData);
    }

    function handleCancel() {
        dispatch('cancel');
    }
</script>

<div class="modal">
    <div class="modal-content">
        <h2>Buy Token</h2>
        <form on:submit|preventDefault={handleSubmit}>
            <label for="ftQuant"> FT Quant:
            <input type="number" id="ftQuant" min="0" max="1000" size="4" bind:value={ftQuant} required></label>

            <label for="nftQuant">NFT Quant:
            <input type="number" id="nftQuant" min="0" max="1000" size="4" bind:value={nftQuant} required></label>

            <div class="buttons">
                <button type="button" on:click={handleCancel}>Cancel</button>
                <button type="submit">Submit</button>
            </div>
        </form>
    </div>
</div>

<style>
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-content {
        background-color: #fff;
        padding: 20px;
        border-radius: 5px;
    }

    label {
        display: block;
        margin-bottom: 5px;
    }

    input {
        margin-bottom: 10px;
    }

    .buttons {
        display: flex;
        justify-content: space-between;
    }

    button {
        padding: 8px 16px;
        font-size: 16px;
        cursor: pointer;
    }
</style>
