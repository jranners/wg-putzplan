import { getCleaningStatistics } from "./src/actions/statistics.js";

async function test() {
    try {
        const stats = await getCleaningStatistics();
        console.log("Statistics:", JSON.stringify(stats, null, 2));
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
