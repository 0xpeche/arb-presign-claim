import sign from "./sign";
const config = require('../config.json');

async function main() {
    for (let i = 0; i < config.length; i++) {

        let pk = config[i]["privateKey"]
        let rec = config[i]["recipient"]
        let tip = config[i]["tipPercent"]
        
        let nonceBuffer = config[i]["buffer"]

        if (Number.isNaN(nonceBuffer)) {
            sign(pk, rec, tip)
        } else {
            for (let j = 0; j < Math.max(nonceBuffer, 10); j++) {
                sign(pk, rec, tip, j)
            }
        }

    }
    console.log('Success! Open the output.json file and send me its content.')
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});