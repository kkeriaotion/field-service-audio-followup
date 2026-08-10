import assert from "node:assert/strict";
import { decideFollowUp } from "./field-service-followup.ts";

const decision = decideFollowUp({
  id: "WO-test",
  audioTranscript: "Customer reports an urgent leak.",
  photoNotes: ["Leak visible beside the valve"],
  dispatchStatus: "assigned",
});

assert.deepEqual(decision, {
  nextStatus: "en_route",
  followUp: "Dispatch the technician and confirm arrival.",
});
console.log("business decision test passed");
