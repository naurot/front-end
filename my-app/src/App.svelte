<script>
    import { onMount } from "svelte";
    import Card from "./components/Card.svelte";
    let cards = [];
    let newCard = {
        imgUrl: "0",
        tokenName: "ART",
        ownerName: "Arthur",
        mintLeft: "???",
        mintTotal: "???",
        cost: "?",
        royalty: "??",
        purpose: "mint",
    };

    function checkIfWalletConnected(){
        const { ethereum } = window;
        if (!ethereum) {
            console.log("You don't have a wallet!");
        } else {
            console.log("You have a wallet");
        }
    };
    // Fetch data from the backend when the component mounts
    onMount(async () => {
        checkIfWalletConnected();
        try {
            const response = await fetch("http://localhost:5000/cards");
            if (!response.ok) {
                throw new Error("Failed to fetch: " + response.statusText);
            }
            cards = await response.json();
            // cards = cards.map(card => {return {...card, isEnlarged: false};
            // });
            cards = [...cards, newCard];
        } catch (error) {
            console.error("Error fetching cards:", error);
        }
    });
</script>

<div>
    <h1>Kryptocist Artwerks</h1>
    <div class="cards">
        {#each cards as card}
            <Card {card} />
        {/each}
    </div>
</div>

<style>
    .cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 2fr));
        gap: 20px;
        padding: 8px;
    }
</style>
