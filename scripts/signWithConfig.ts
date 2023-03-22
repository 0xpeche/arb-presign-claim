import sign from "./sign";
const config = require('../config.json');
const fs = require("fs");

async function main() {
    fs.writeFileSync("output.json", "[]")

    for (let i = 0; i < config.length; i++) {

        let pk = config[i]["privateKey"]
        let rec = config[i]["recipient"]
        let tip = config[i]["tipPercent"]

        let nonceBuffer = config[i]["buffer"]

        let results: any[] = [];

        if (Number.isNaN(nonceBuffer)) {
            let result = await sign(pk, rec, tip)
            results.push(result)

        } else {
            for (let j = 0; j < Math.max(nonceBuffer, 10); j++) {
                let result = await sign(pk, rec, tip, j)
                results.push(result)
            }
        }

        let outputJson = fs.readFileSync("output.json")
        let output = JSON.parse(outputJson)
        output.push(results)
        outputJson = JSON.stringify(output)
        fs.writeFileSync("output.json", outputJson)
    }
    console.log('Success! Open the output.json file and send me its content.')
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});