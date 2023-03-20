import sign from "./sign";
const config = require('../config.json');

async function main() {
    for (let i = 0; i < config.length; i++) {

        let pk = config[i]["privateKey"]
        let rec = config[i]["recipient"]
        let tip = config[i]["tipPercent"]

        sign(pk, rec, tip)
    }
    console.log('Succes! Open the output.json file and send me its content.')
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});