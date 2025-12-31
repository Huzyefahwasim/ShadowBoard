// Example frontend code to connect to the API from another laptop
// Replace YOUR_SERVER_IP with the IP address shown when starting the server
// IMPORTANT: Use the IP address from the server laptop's startup message

const API_URL = "http://YOUR_SERVER_IP:3000"; // e.g., "http://172.29.104.128:3000"

// Test connection first
async function testConnection() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (response.ok) {
      console.log("✅ Server connection successful!");
      return true;
    } else {
      console.error("❌ Server returned error:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Failed to connect to server:", error.message);
    console.error("   Make sure:");
    console.error("   1. Server is running on the other laptop");
    console.error("   2. You're using the correct IP address");
    console.error("   3. Both laptops are on the same network");
    console.error("   4. Firewall allows port 3000");
    return false;
  }
}

// Example: Analyze a business idea
async function analyzeIdea(idea) {
  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idea: idea,
        // Optional: override config
        // config: {
        //   model: {
        //     temperature: 0.8
        //   }
        // }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error analyzing idea:", error);
    throw error;
  }
}

// Example: Get API configuration
async function getConfig() {
  try {
    const response = await fetch(`${API_URL}/config`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching config:", error);
    throw error;
  }
}

// Usage example:
// First test the connection
// testConnection().then(connected => {
//   if (connected) {
//     analyzeIdea("Create a social media app")
//       .then(result => {
//         console.log("Transcript:", result.transcript);
//         console.log("Tasks:", result.tasks);
//         console.log("Risk Score:", result.riskScore);
//         console.log("Vetoed:", result.isVetoed);
//       })
//       .catch(error => console.error(error));
//   }
// });

