const testScenarios = [
  {
    name: "Scenario 1: Create new primary contact",
    request: {
      email: "doc@zamazon.com",
      phoneNumber: "+1234567890",
    },
    description: "First contact - should create a new primary contact",
  },
  {
    name: "Scenario 2: Same email, different phone",
    request: {
      email: "doc@zamazon.com",
      phoneNumber: "+0987654321",
    },
    description: "Should create secondary contact linked to existing primary",
  },
  {
    name: "Scenario 3: Different email, same phone as first",
    request: {
      email: "doctor@zamazon.com",
      phoneNumber: "+1234567890",
    },
    description: "Should create secondary contact and link all contacts",
  },
  {
    name: "Scenario 4: New contact with no overlap",
    request: {
      email: "john@zamazon.com",
      phoneNumber: "+1111111111",
    },
    description: "Should create a new separate primary contact",
  },
  {
    name: "Scenario 5: Only email provided",
    request: {
      email: "jane@zamazon.com",
    },
    description: "Should create new primary contact with only email",
  },
  {
    name: "Scenario 6: Only phone provided",
    request: {
      phoneNumber: "+2222222222",
    },
    description: "Should create new primary contact with only phone",
  },
  {
    name: "Scenario 7: Exact match test",
    request: {
      email: "doc@zamazon.com",
      phoneNumber: "+1234567890",
    },
    description: "Should return existing contact without creating new one",
  },
];

async function runTest(scenario) {
  console.log(`\n ${scenario.name}`);
  console.log(`${scenario.description}`);
  console.log(` Request:`, JSON.stringify(scenario.request, null, 2));

  try {
    const response = await fetch("http://localhost:3000/api/identify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scenario.request),
    });

    const result = await response.json();
    console.log(` Response:`, JSON.stringify(result, null, 2));
    console.log(` Status: ${response.status}`);
  } catch (error) {
    console.log(` Error:`, error.message);
  }
}

async function runAllTests() {
  for (const scenario of testScenarios) {
    await runTest(scenario);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
}

// Run tests if this file is executed directly
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { testScenarios, runTest, runAllTests };
