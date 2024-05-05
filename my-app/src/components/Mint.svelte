<script>
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let ownerName = "";
    let tokenName = "";
    let royalty = "";
    let price = "";
    let ftQuant = "";
    let nftQuant = "";
    let picURL = "";

    function handleSubmit() {
        const formData = {
            ownerName,
            tokenName,
            royalty,
            price,
            ftQuant,
            nftQuant,
            picURL,
        };
        dispatch("submit", formData);
    }

    function handleCancel() {
        dispatch("cancel");
    }
</script>

<div class="modal">
    <div class="modal-content">
        <h2>Mint Token</h2>
        <form on:submit|preventDefault={handleSubmit}>
            <label for="ownerName">Owner's Name:
            <input type="text" id="ownerName" bind:value={ownerName} /></label>
            <label for="tokenName">Token Name:
            <input type="text" id="tokenName" bind:value={tokenName} required /></label>
            <label for="royalty">Royalty:
            <input type="number" id="royalty" min="0" max="20" bind:value={royalty} required /></label>
            <label for="price">Price:
            <input type="number" id="price" min="1" max="10" bind:value={price} required /></label>
            <label for="ftQuant">FT Quant:
            <input type="number" id="ftQuant" min="0" max="1000"  bind:value={ftQuant} required /></label>
            <label for="nftQuant">NFT Quant:
            <input type="number" id="nftQuant" min="0" max="1000" bind:value={nftQuant} required /></label>
            <label for="picURL">Picture:
            <input type="file" id="picURL" accept="image/jpeg, image/png" bind:value={picURL} required /></label>

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
