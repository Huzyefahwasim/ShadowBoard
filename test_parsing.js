const transcript = "**CMO (Chief Marketing Officer)**\nTo drive viral growth, I suggest we create engaging short-form videos showcasing our AI capabilities and share them on social media platforms. We can also collaborate with influencers in the AI niche to amplify our reach. The key is to create a buzz around our brand and make it trendy.\n\n**CFO (Chief Financial Officer)**\nHold on, let's not overspend on marketing. We need to ensure our burn rate is under control. I recommend allocating a specific budget for marketing and closely monitoring our ROI. We should focus on cost-effective strategies that provide a clear return on investment.\n\n**POLICY PILOT**\nBefore we proceed with any marketing strategy, we need to ensure compliance with the EU AI ACT 2026. Specifically, we must avoid untargeted scraping of facial images and clearly label any AI-generated content, including deepfakes or AI text. \n\n## Tasks and Risk Assessment";

console.log("Transcript length:", transcript.length);

// Current Regex patterns from parser.ts
const cmoRegex = /\*\*(?:CMO|Chief Marketing).*?\*\*[\s\S]*?([\s\S]*?)(?=\*\*(?:CFO|Chief Financial|POLICY)|$)/i;
const cfoRegex = /\*\*(?:CFO|Chief Financial).*?\*\*[\s\S]*?([\s\S]*?)(?=\*\*(?:CMO|Chief Marketing|POLICY)|$)/i;
const policyRegex = /\*\*(?:POLICY|Risk|Compliance).*?\*\*[\s\S]*?([\s\S]*?)(?=\*\*(?:CMO|CFO|## Tasks)|$)/i;

const cmoMatch = transcript.match(cmoRegex);
const cfoMatch = transcript.match(cfoRegex);
const policyMatch = transcript.match(policyRegex);

console.log("\n--- CMO Match ---");
if (cmoMatch) {
    console.log("Matched!", cmoMatch[1].trim());
} else {
    console.log("FAILED to match CMO");
}

console.log("\n--- CFO Match ---");
if (cfoMatch) {
    console.log("Matched!", cfoMatch[1].trim());
} else {
    console.log("FAILED to match CFO");
}

console.log("\n--- Policy Match ---");
if (policyMatch) {
    console.log("Matched!", policyMatch[1].trim());
} else {
    console.log("FAILED to match Policy");
}
